import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { ensureAdminBlockedColumn } from '@/lib/adminBlocked';
import { normalizeWhatsappForLookup } from '@/lib/whatsappNormalize';
import { findWorkerByWhatsappInput } from '@/lib/workerLookup';
import { emitEvent } from '@/lib/socket';
import {
  assertBatchChannelUniqueness,
  assertChannelLinkAllowed,
  assertChannelGmailUnique,
  ChannelGuardError,
} from '@/lib/channelSubmitGuards';
import { getNextChannelRegNo, withChannelRegNoLock } from '@/lib/channelRegNo';

const MAX_CHANNELS = 25;

export async function POST(request) {
  const conn = await pool.getConnection();
  try {
    const body = await request.json();
    const { whatsapp, canonical: clientCanon, name, dealerId, channels: channelList } = body;

    const dealer = parseInt(String(dealerId), 10);
    if (!dealer || Number.isNaN(dealer)) {
      return NextResponse.json({ error: 'ডিলার (কর্মী) নির্বাচন করুন।' }, { status: 400 });
    }

    const workerName = String(name || '').trim();
    if (workerName.length < 2) {
      return NextResponse.json({ error: 'ওয়ার্কারের নাম অন্তত ২ অক্ষর হতে হবে।' }, { status: 400 });
    }

    const canon = normalizeWhatsappForLookup(whatsapp || clientCanon);
    if (!/^01\d{9}$/.test(canon)) {
      return NextResponse.json(
        { error: 'সঠিক বাংলাদেশি WhatsApp দিন (+৮৮০ অথবা ০১ দিয়ে শুরু)।' },
        { status: 400 }
      );
    }

    const channels = Array.isArray(channelList) ? channelList : [];
    if (channels.length === 0 || channels.length > MAX_CHANNELS) {
      return NextResponse.json(
        { error: `২–${MAX_CHANNELS}টি চ্যানেল জমা দিতে হবে।` },
        { status: 400 }
      );
    }

    for (const ch of channels) {
      const cn = String(ch.channel_name || '').trim();
      const cl = String(ch.channel_link || '').trim();
      if (!cn || !cl) {
        return NextResponse.json({ error: 'প্রতিটি চ্যানেলের নাম ও লিঙ্ক দিন।' }, { status: 400 });
      }
    }

    assertBatchChannelUniqueness(channels);

    await ensureAdminBlockedColumn();

    const [dealers] = await conn.query(
      `SELECT u.id FROM admin_users u WHERE u.id = ? AND u.role = 'employee' AND COALESCE(u.is_blocked,0) = 0 LIMIT 1`,
      [dealer]
    );
    if (dealers.length === 0) {
      return NextResponse.json({ error: 'নির্বাচিত কর্মী বৈধ নয়।' }, { status: 400 });
    }

    let match = await findWorkerByWhatsappInput(whatsapp || clientCanon);

    await conn.beginTransaction();

    let workerId;
    if (match) {
      workerId = match.id;
      await conn.execute(
        'UPDATE workers SET name = ?, created_by = ? WHERE id = ?',
        [workerName, dealer, workerId]
      );
    } else {
      const [[nextRow]] = await conn.query('SELECT COALESCE(MAX(id), 0) + 1 AS nid FROM workers');
      const newId = Number(nextRow.nid) || 1;

      await conn.execute(
        'INSERT INTO workers (id, name, whatsapp, created_by) VALUES (?, ?, ?, ?)',
        [newId, workerName, canon, dealer]
      );
      workerId = newId;
    }

    const displayWaForChannel = canon;

    await withChannelRegNoLock(conn, async () => {
      for (const ch of channels) {
        const { canonUrl } = await assertChannelLinkAllowed(conn, String(ch.channel_link).trim());
        const gmailVal = ch.gmail ? String(ch.gmail).trim() : '';
        await assertChannelGmailUnique(conn, gmailVal || null);
        const nextReg = await getNextChannelRegNo(conn);

        await conn.execute(
          `INSERT INTO channels (channel_name, channel_link, whatsapp, worker_id, open_date, sell_price, worker_cost, created_by, gmail, password, reg_no)
           VALUES (?, ?, ?, ?, ?, 0, 0, ?, ?, ?, ?)`,
          [
            String(ch.channel_name).trim(),
            canonUrl,
            displayWaForChannel,
            workerId,
            ch.open_date ? String(ch.open_date).trim() || null : null,
            dealer,
            gmailVal || null,
            ch.password ? String(ch.password).trim() || null : null,
            nextReg,
          ]
        );
      }
    });

    await conn.commit();
    emitEvent('channel-updated', { source: 'public-worker-submit' });

    return NextResponse.json({
      success: true,
      workerId,
      channelsAdded: channels.length,
    });
  } catch (e) {
    try {
      await conn.rollback();
    } catch {
      /* no active transaction */
    }
    if (e instanceof ChannelGuardError) {
      return NextResponse.json({ error: e.message }, { status: e.statusCode });
    }
    console.error('public/workers/submit', e);
    return NextResponse.json({ error: 'সাবমিট ব্যর্থ। পরে চেষ্টা করুন।' }, { status: 500 });
  } finally {
    conn.release();
  }
}
