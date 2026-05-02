import { normalizeUrlForPaste, linkKeySetsIntersect } from '@/lib/youtubeChannelUrl';
import { normalizeAccountEmail } from '@/lib/crossRoleIdentity';

export class ChannelGuardError extends Error {
  /** @param {number} statusCode @param {string} message */
  constructor(statusCode, message) {
    super(message);
    this.name = 'ChannelGuardError';
    this.statusCode = statusCode;
  }
}

function guardThrow(statusCode, message) {
  throw new ChannelGuardError(statusCode, message);
}

function normalizeGmail(input) {
  const s = String(input || '').trim();
  if (!s) return '';
  return normalizeAccountEmail(s);
}

/**
 * @param {import('mysql2/promise').Pool | import('mysql2/promise').PoolConnection} db
 * @param {string} linkRaw
 * @param {{ excludeChannelId?: number }} [opts]
 */
export async function assertChannelLinkAllowed(db, linkRaw, opts = {}) {
  const check = normalizeUrlForPaste(linkRaw);
  if (!check.ok) {
    guardThrow(400, check.error || 'Invalid link');
  }

  const newKeys = check.keys;
  const [rows] = await db.query('SELECT id, channel_link FROM channels');
  for (const row of rows) {
    if (opts.excludeChannelId != null && Number(row.id) === Number(opts.excludeChannelId)) continue;
    const existing = normalizeUrlForPaste(row.channel_link);
    if (!existing.ok) continue;
    if (linkKeySetsIntersect(newKeys, existing.keys)) {
      guardThrow(
        409,
        'এই ইউটিউব চ্যানেল লিঙ্ক ইতিমধ্যে সিস্টেমে আছে। পুরনো রেকর্ড ডিলিট না হওয়া পর্যন্ত আবার যোগ করা যাবে না।'
      );
    }
  }

  return { canonUrl: check.canonUrl, keys: newKeys };
}

/**
 * @param {import('mysql2/promise').Pool | import('mysql2/promise').PoolConnection} db
 * @param {string} gmailRaw
 * @param {{ excludeChannelId?: number }} [opts]
 */
export async function assertChannelGmailUnique(db, gmailRaw, opts = {}) {
  const g = normalizeGmail(gmailRaw);
  if (!g) return;

  const [rows] = await db.query(
    `SELECT id FROM channels
     WHERE gmail IS NOT NULL AND TRIM(gmail) <> ''
     AND LOWER(TRIM(gmail)) = ?
     ${opts.excludeChannelId != null ? 'AND id <> ?' : ''}
     LIMIT 1`,
    opts.excludeChannelId != null ? [g, opts.excludeChannelId] : [g]
  );
  if (rows.length > 0) {
    guardThrow(409, 'এই Gmail ক্রেডেনশিয়াল ইতিমধ্যে অন্য চ্যানেলে ব্যবহৃত।');
  }
}

/**
 * Guard duplicate YouTube keys and duplicate Gmail inside one multi-row submit.
 * @param {Array<{ channel_link: string, gmail?: string }>} channels
 */
export function assertBatchChannelUniqueness(channels) {
  const seenKeys = new Set();
  const seenGmails = new Set();

  for (const ch of channels) {
    const linkCheck = normalizeUrlForPaste(String(ch.channel_link || '').trim());
    if (!linkCheck.ok) {
      guardThrow(400, linkCheck.error || 'Invalid link');
    }
    for (const k of linkCheck.keys) {
      if (seenKeys.has(k)) {
        guardThrow(400, 'একই জমায় একাধিক বার একই চ্যানেল লিঙ্ক দেওয়া যাবে না।');
      }
      seenKeys.add(k);
    }

    const g = normalizeGmail(ch.gmail);
    if (g) {
      if (seenGmails.has(g)) {
        guardThrow(400, 'একই জমায় একই Gmail দুই বার ব্যবহার করা যাবে না।');
      }
      seenGmails.add(g);
    }
  }
}
