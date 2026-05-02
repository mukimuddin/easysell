/** Hostnames accepted as genuine YouTube. */

const YT_SUFFIXES = ['youtube.com', 'youtube-nocookie.com'];

export function normalizeUrlForPaste(raw) {
  const s = String(raw || '').trim();
  if (!s) return { ok: false, error: 'লিঙ্ক খালি।' };
  if (/^javascript:/i.test(s) || /^data:/i.test(s)) {
    return { ok: false, error: 'অচল লিঙ্ক।' };
  }
  const withScheme = /^https?:\/\//i.test(s) ? s : `https://${s}`;
  let parsed;
  try {
    parsed = new URL(withScheme);
  } catch {
    return { ok: false, error: 'বৈধ URL ফরম্যাট নয়।' };
  }

  let host = parsed.hostname.toLowerCase();
  if (host.startsWith('www.')) host = host.slice(4);
  if (host.startsWith('m.') && (YT_SUFFIXES.some((x) => host.endsWith(x)) || host === 'm.youtube.com')) {
    host = host.slice(2).replace(/^www\./, '');
  }

  const hostOk =
    host === 'youtu.be' ||
    YT_SUFFIXES.some((suf) => host === suf || host.endsWith(`.${suf}`));

  if (!hostOk) {
    return { ok: false, error: 'শুধু YouTube ডোমেইনের চ্যানেল লিঙ্ক দিন।' };
  }

  let pathname = parsed.pathname || '';
  if (pathname.length > 1 && pathname.endsWith('/')) pathname = pathname.slice(0, -1);
  const pathnameLower = pathname.toLowerCase();

  if (host.endsWith('youtu.be')) {
    const id = pathname.startsWith('/') ? pathname.slice(1) : pathname;
    if (!id || id.includes('/') || id.length < 3) {
      return { ok: false, error: 'সম্পূর্ণ ইউটিউব চ্যানেল লিঙ্ক দিন।' };
    }
    const keys = new Set([`short:${decodeURIComponent(id).toLowerCase()}`]);
    const canonUrl = `${parsed.protocol}//${parsed.host}${parsed.pathname}`;
    return { ok: true, canonUrl: canonUrl.replace(/\/$/, ''), hostname: host, keys, pathname };
  }

  if (pathnameLower.startsWith('/watch') || pathnameLower.startsWith('/embed') || pathnameLower.startsWith('/shorts/')) {
    return { ok: false, error: 'ভিডিও/শর্ট লিঙ্ক নয়—চ্যানেল URL দিন (/channel/, /@handle, ইত্যাদি).' };
  }

  const chanMatch =
    pathnameLower.startsWith('/channel/') ||
    pathnameLower.startsWith('/c/') ||
    pathnameLower.startsWith('/user/') ||
    pathnameLower.startsWith('/@');

  if (!chanMatch) {
    return { ok: false, error: 'চ্যানেলের সরাসরি লিঙ্ক দিন (যেমন youtube.com/channel/… বা /@handle).' };
  }

  const parsedForKeys = new URL(parsed.href);
  const keys = channelDedupKeySet(parsedForKeys, host);

  const canonHost = parsed.host;
  let canonPath = parsed.pathname.replace(/\/$/, '');
  const canonUrl = `${parsed.protocol}//${canonHost}${canonPath}`;

  return { ok: true, canonUrl, hostname: host, keys, pathname: pathnameLower };
}

/**
 * Stable keys shared by alternative URLs pointing at the same YouTube identity.
 * @param {URL} parsed
 * @param {string} normalizedHostWithoutWwwLower
 */
export function channelDedupKeySet(parsed, normalizedHostWithoutWwwLower) {
  let pathname = (parsed.pathname || '').replace(/\/$/, '').toLowerCase();

  /** @type {Set<string>} */
  const keys = new Set();
  keys.add(`${normalizedHostWithoutWwwLower}${pathname}`);

  const segments = pathname.split('/').filter(Boolean);
  const first = segments[0] || '';

  if (first === 'channel') {
    const id = segments[1] ? decodeURIComponent(segments[1]).toLowerCase() : '';
    if (id) keys.add(`cid:${id}`);
  }
  if (first === 'c') {
    const slug = segments[1] ? decodeURIComponent(segments[1]).toLowerCase() : '';
    if (slug) keys.add(`cslug:${slug}`);
  }
  if (first === 'user') {
    const slug = segments[1] ? decodeURIComponent(segments[1]).toLowerCase() : '';
    if (slug) keys.add(`usr:${slug}`);
  }
  if (first?.startsWith('@')) {
    const h = decodeURIComponent(first.slice(1)).toLowerCase();
    if (h) keys.add(`@:${h}`);
  }

  return keys;
}

export function linkKeySetsIntersect(a, b) {
  if (!a || !b?.size) return false;
  for (const x of a) {
    if (b.has(x)) return true;
  }
  return false;
}
