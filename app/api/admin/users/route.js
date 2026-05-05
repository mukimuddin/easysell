import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifySession } from '@/lib/session';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'node:crypto';
import { emitEvent } from '@/lib/socket';
import { ensureAdminBlockedColumn } from '@/lib/adminBlocked';
import { bumpAdminAuthVersion } from '@/lib/adminAuthVersion';

export async function GET() {
  const token = (await cookies()).get('adminToken')?.value;
  const session = await verifySession(token);
  
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [rows] = await pool.query('SELECT id, username, role FROM admin_users ORDER BY id ASC');
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching admins:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  const token = (await cookies()).get('adminToken')?.value;
  const session = await verifySession(token);
  
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { username, password, role } = await request.json();
    
    if (!username || !password || !role) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Manual ID increment since some DBs lack AUTO_INCREMENT support on MODIFY
    const [maxIdRows] = await pool.query('SELECT MAX(id) as maxId FROM admin_users');
    const newId = (maxIdRows[0].maxId || 0) + 1;

    const [result] = await pool.execute(
      'INSERT INTO admin_users (id, username, password, role) VALUES (?, ?, ?, ?)',
      [newId, username, hashedPassword, role]
    );

    return NextResponse.json({ success: true, id: newId });

  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ error: 'Username already exists' }, { status: 400 });
    }
    console.error('Error creating admin:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request) {
  const token = (await cookies()).get('adminToken')?.value;
  const session = await verifySession(token);
  
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    if (parseInt(id) === session.userId) {
      return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 });
    }

    // Orphan their data so a new user with reused ID doesn't inherit it
    await pool.execute('UPDATE channels SET created_by = NULL WHERE created_by = ?', [id]);
    await pool.execute('UPDATE workers SET created_by = NULL WHERE created_by = ?', [id]);

    await pool.execute('DELETE FROM admin_users WHERE id = ?', [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting admin:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request) {
  const token = (await cookies()).get('adminToken')?.value;
  const session = await verifySession(token);

  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, is_blocked } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    const targetId = typeof id === 'number' && Number.isInteger(id) ? id : parseInt(String(id), 10);
    if (!Number.isInteger(targetId) || targetId < 1) {
      return NextResponse.json({ error: 'Invalid user id' }, { status: 400 });
    }

    if (typeof is_blocked === 'boolean') {
      await ensureAdminBlockedColumn();
      if (targetId === session.userId) {
        return NextResponse.json({ error: 'You cannot block your own account' }, { status: 400 });
      }

      const [users] = await pool.query(
        'SELECT id, role FROM admin_users WHERE id = ? LIMIT 1',
        [targetId]
      );
      if (users.length === 0) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      if (users[0].role !== 'employee') {
        return NextResponse.json({ error: 'Only staff (employee) accounts can be blocked' }, { status: 400 });
      }

      await pool.execute('UPDATE admin_users SET is_blocked = ? WHERE id = ?', [
        is_blocked ? 1 : 0,
        targetId,
      ]);

      if (is_blocked) {
        emitEvent('staff-blocked', { userId: targetId });
      } else {
        emitEvent('staff-unblocked', { userId: targetId });
      }

      return NextResponse.json({ success: true, is_blocked });
    }

    const { newPassword, generate, username: newUsernameField } = body;

    const [usersPwd] = await pool.query(
      'SELECT id, role, username FROM admin_users WHERE id = ? LIMIT 1',
      [targetId]
    );
    if (usersPwd.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    if (usersPwd[0].role !== 'employee') {
      return NextResponse.json({ error: 'Only employee accounts can be managed here' }, { status: 400 });
    }

    const currentUsername = usersPwd[0].username != null ? String(usersPwd[0].username) : '';

    let usernameChanged = false;
    let updatedUsername = currentUsername;

    if (newUsernameField !== undefined && newUsernameField !== null) {
      const nu = String(newUsernameField).trim();
      if (nu.length === 0) {
        return NextResponse.json({ error: 'Username cannot be empty' }, { status: 400 });
      }
      if (nu.length < 2) {
        return NextResponse.json({ error: 'Username must be at least 2 characters' }, { status: 400 });
      }
      if (nu !== currentUsername.trim()) {
        const [dup] = await pool.query(
          'SELECT id FROM admin_users WHERE username = ? AND id != ? LIMIT 1',
          [nu, targetId]
        );
        if (dup.length > 0) {
          return NextResponse.json({ error: 'This username is already taken' }, { status: 400 });
        }
        const [unameUpd] = await pool.execute('UPDATE admin_users SET username = ? WHERE id = ?', [
          nu,
          targetId,
        ]);
        if (unameUpd.affectedRows !== 1) {
          return NextResponse.json({ error: 'Could not update username' }, { status: 404 });
        }
        usernameChanged = true;
        updatedUsername = nu;
      }
    }

    const shouldGenerate = generate === true;
    const manualPwd = String(newPassword ?? '').trim();
    const wantsPasswordChange = shouldGenerate || manualPwd.length > 0;

    let plainPassword = null;
    if (wantsPasswordChange) {
      plainPassword = shouldGenerate ? randomBytes(6).toString('base64url') : manualPwd;
      if (plainPassword.length < 6) {
        return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
      }
      const hashedPassword = await bcrypt.hash(plainPassword, 10);
      const [pwdUpd] = await pool.execute('UPDATE admin_users SET password = ? WHERE id = ?', [
        hashedPassword,
        targetId,
      ]);
      if (pwdUpd.affectedRows !== 1) {
        return NextResponse.json({ error: 'Could not update password for this user' }, { status: 404 });
      }
    }

    if (!usernameChanged && !wantsPasswordChange) {
      return NextResponse.json(
        { error: 'Provide a new username, a new password, or enable auto-generate' },
        { status: 400 }
      );
    }

    await bumpAdminAuthVersion(targetId);
    emitEvent('staff-session-invalidate', { userId: targetId });

    return NextResponse.json({
      success: true,
      ...(plainPassword != null ? { generatedPassword: plainPassword } : {}),
      ...(usernameChanged ? { username: updatedUsername } : {}),
    });
  } catch (error) {
    console.error('Error updating user password:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
