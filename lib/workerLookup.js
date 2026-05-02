import pool from '@/lib/db';
import { normalizeWhatsappForLookup } from '@/lib/whatsappNormalize';

/**
 * Finds a worker row matching stored WhatsApp variants.
 * @returns {{ id: number, name: string, whatsapp: string | null } | null}
 */
export async function findWorkerByWhatsappInput(whatsappRaw) {
  const digits = String(whatsappRaw || '').replace(/\D/g, '');
  if (digits.length < 10) return null;

  const canon = normalizeWhatsappForLookup(whatsappRaw);

  const [rows] = await pool.query('SELECT id, name, whatsapp FROM workers');
  for (const r of rows) {
    const c = normalizeWhatsappForLookup(r.whatsapp || '');
    if (c === canon || (c && canon && c.slice(-10) === canon.slice(-10))) {
      return { id: r.id, name: r.name || '', whatsapp: r.whatsapp };
    }
  }
  return null;
}
