/**
 * Normalize BD WhatsApp (+880 / 880 / repeated prefix / plain 017…) to canonical 01xxxxxxxxx where possible.
 */
export function normalizeWhatsappForLookup(input) {
  const digits = String(input || '').replace(/\D/g, '');
  if (!digits) return '';

  let d = digits;
  while (d.startsWith('880')) {
    d = d.slice(3);
  }

  if (d.length === 11 && d.startsWith('0')) return d;

  if (d.length === 10 && /^1\d{9}$/.test(d)) return `0${d}`;

  if (d.length > 11) {
    const tail11 = d.slice(-11);
    if (/^01\d{9}$/.test(tail11)) return tail11;
    const tail10 = d.slice(-10);
    if (/^1\d{9}$/.test(tail10)) return `0${tail10}`;
  }

  const ten = digits.slice(-10);
  if (/^1\d{9}$/.test(ten)) return `0${ten}`;

  return digits.slice(-11);
}
