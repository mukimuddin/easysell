import pool from '@/lib/db';

let ensuredBlockedColumn = false;

/** Adds is_blocked when missing (legacy DBs without Prisma migrate). */
export async function isAdminUserBlocked(userId) {
  const [rows] = await pool.query(
    'SELECT is_blocked FROM admin_users WHERE id = ? LIMIT 1',
    [userId]
  );
  if (!rows.length) return true;
  return Number(rows[0].is_blocked) === 1;
}
