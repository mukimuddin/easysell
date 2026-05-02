import pool from '@/lib/db';
import { ensureEmployeeApplicationTable } from '@/lib/employeeApplications';
import { ensureBuyerTable } from '@/lib/buyers';
import { normalizeWhatsappForLookup } from '@/lib/whatsappNormalize';

export function normalizeAccountEmail(input) {
  return String(input || '').trim().toLowerCase();
}

function phoneCanonEqual(a, b) {
  const ca = normalizeWhatsappForLookup(a || '');
  const cb = normalizeWhatsappForLookup(b || '');
  if (ca && cb && ca === cb) return true;
  const da = String(a || '').replace(/\D/g, '');
  const db = String(b || '').replace(/\D/g, '');
  if (da.length >= 10 && db.length >= 10 && da.slice(-10) === db.slice(-10)) return true;
  return false;
}

/**
 * @returns {Promise<{ kind: string, message: string } | null>}
 */
export async function findEmailConflictAcrossPortal(normalizedEmail, options = {}) {
  const { excludeBuyerId, excludeEmployeeAdminId, excludeApplicationId } = options;
  const em = normalizeAccountEmail(normalizedEmail);
  if (!em || !em.includes('@')) return null;

  await ensureBuyerTable();
  await ensureEmployeeApplicationTable();

  const [buyers] = await pool.query(
    `SELECT id FROM buyer_accounts WHERE LOWER(TRIM(email)) = ? ${excludeBuyerId ? 'AND id <> ?' : ''} LIMIT 1`,
    excludeBuyerId ? [em, excludeBuyerId] : [em]
  );
  if (buyers.length > 0) {
    return { kind: 'buyer', message: 'এই ইমেইলটি ইতিমধ্যে বায়ার অ্যাকাউন্টে ব্যবহৃত।' };
  }

  const [emps] = await pool.query(
    `SELECT u.id FROM admin_users u
     INNER JOIN employee_details ed ON ed.admin_id = u.id
     WHERE u.role = 'employee' AND LOWER(TRIM(ed.email)) = ?
     ${excludeEmployeeAdminId ? 'AND u.id <> ?' : ''}
     LIMIT 1`,
    excludeEmployeeAdminId ? [em, excludeEmployeeAdminId] : [em]
  );
  if (emps.length > 0) {
    return { kind: 'employee', message: 'এই ইমেইলটি ইতিমধ্যে কর্মী প্রোফাইলে আছে।' };
  }

  const [apps] = await pool.query(
    `SELECT id FROM employee_applications WHERE status = 'pending' AND LOWER(TRIM(email)) = ?
     ${excludeApplicationId ? 'AND id <> ?' : ''}
     LIMIT 1`,
    excludeApplicationId ? [em, excludeApplicationId] : [em]
  );
  if (apps.length > 0) {
    return { kind: 'application', message: 'এই ইমেইল দিয়ে ইতিমধ্যে কর্মী আবেদন বিচারাধীন।' };
  }

  return null;
}

/**
 * @returns {Promise<{ kind: string, message: string } | null>}
 */
export async function findPhoneConflictAcrossPortal(phoneRaw, options = {}) {
  const { excludeBuyerId, excludeEmployeeAdminId, excludeApplicationId } = options;
  if (!String(phoneRaw || '').trim()) return null;

  await ensureBuyerTable();
  await ensureEmployeeApplicationTable();

  const [buyers] = await pool.query('SELECT id, phone FROM buyer_accounts');
  for (const b of buyers) {
    if (excludeBuyerId && Number(b.id) === Number(excludeBuyerId)) continue;
    if (phoneCanonEqual(phoneRaw, b.phone)) {
      return { kind: 'buyer', message: 'এই নম্বরটি ইতিমধ্যে বায়ার নিবন্ধনে ব্যবহৃত।' };
    }
  }

  const [emps] = await pool.query(
    `SELECT u.id, ed.phone FROM admin_users u
     INNER JOIN employee_details ed ON ed.admin_id = u.id
     WHERE u.role = 'employee'`
  );
  for (const e of emps) {
    if (excludeEmployeeAdminId && Number(e.id) === Number(excludeEmployeeAdminId)) continue;
    if (phoneCanonEqual(phoneRaw, e.phone)) {
      return { kind: 'employee', message: 'এই নম্বরটি ইতিমধ্যে কর্মী প্রোফাইলে আছে।' };
    }
  }

  const [apps] = await pool.query(
    `SELECT id, phone FROM employee_applications WHERE status = 'pending'`
  );
  for (const a of apps) {
    if (excludeApplicationId && Number(a.id) === Number(excludeApplicationId)) continue;
    if (phoneCanonEqual(phoneRaw, a.phone)) {
      return { kind: 'application', message: 'এই নম্বর দিয়ে ইতিমধ্যে কর্মী আবেদন বিচারাধীন।' };
    }
  }

  return null;
}
