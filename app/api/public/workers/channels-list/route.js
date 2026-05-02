import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { findWorkerByWhatsappInput } from '@/lib/workerLookup';

export async function POST(request) {
  try {
    const { whatsapp } = await request.json();
    const worker = await findWorkerByWhatsappInput(whatsapp || '');

    if (!worker) {
      return NextResponse.json(
        { error: 'এই WhatsApp নম্বরে নিবন্ধিত কোনো স্পেশালিস্ট পাওয়া যায়নি।', found: false },
        { status: 404 }
      );
    }

    const [channels] = await pool.query(
      `SELECT
          c.id,
          c.channel_name,
          c.channel_link,
          DATE_FORMAT(c.open_date, '%Y-%m-%d') AS open_date,
          c.is_sold,
          c.is_selected,
          u.sub_count,
          u.shorts_count,
          u.status AS kpi_status
       FROM channels c
       LEFT JOIN (
         SELECT * FROM daily_updates
         WHERE id IN (SELECT MAX(id) FROM daily_updates GROUP BY channel_id)
       ) u ON c.id = u.channel_id
       WHERE c.worker_id = ?
       ORDER BY c.created_at DESC`,
      [worker.id]
    );

    return NextResponse.json({
      found: true,
      worker: {
        id: worker.id,
        name: worker.name,
        whatsapp: worker.whatsapp,
      },
      channels,
    });
  } catch (e) {
    console.error('public/workers/channels-list', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
