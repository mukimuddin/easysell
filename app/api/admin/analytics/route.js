import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifySession } from '@/lib/session';
import { cookies } from 'next/headers';

export async function GET() {
  const token = (await cookies()).get('adminToken')?.value;
  const session = await verifySession(token);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 1. Summary Stats
    const [summary] = await pool.query(`
      SELECT 
        COUNT(*) as total_channels,
        SUM(CASE WHEN is_sold = 1 THEN 1 ELSE 0 END) as sold_count,
        SUM(CASE WHEN is_sold = 0 THEN 1 ELSE 0 END) as active_count,
        SUM(CAST(sell_price AS DECIMAL(10,2))) as total_revenue,
        SUM(CAST(worker_cost AS DECIMAL(10,2))) as total_cost
      FROM channels
    `);

    const stats = summary[0];
    stats.total_profit = (stats.total_revenue || 0) - (stats.total_cost || 0);

    // 2. Best Workers (By total sub_count of active channels)
    const [bestWorkers] = await pool.query(`
      SELECT w.id, w.name, SUM(u.sub_count) as total_subs, COUNT(c.id) as channel_count
      FROM workers w
      JOIN channels c ON w.id = c.worker_id
      LEFT JOIN (
          SELECT * FROM daily_updates WHERE id IN (SELECT MAX(id) FROM daily_updates GROUP BY channel_id)
      ) u ON c.id = u.channel_id
      WHERE c.is_sold = 0
      GROUP BY w.id
      ORDER BY total_subs DESC
      LIMIT 5
    `);

    // 3. Best Channels (Top active channels by subs)
    const [bestChannels] = await pool.query(`
      SELECT c.id, c.channel_name, c.channel_link, u.sub_count, u.status, w.name as worker_name
      FROM channels c
      LEFT JOIN workers w ON c.worker_id = w.id
      LEFT JOIN (
          SELECT * FROM daily_updates WHERE id IN (SELECT MAX(id) FROM daily_updates GROUP BY channel_id)
      ) u ON c.id = u.channel_id
      WHERE c.is_sold = 0
      ORDER BY u.sub_count DESC
      LIMIT 10
    `);

    // 4. Old Channels (Inventory Aging - Oldest active)
    const [oldChannels] = await pool.query(`
      SELECT c.id, c.channel_name, c.open_date, u.sub_count, w.name as worker_name,
             DATEDIFF(CURRENT_DATE, c.open_date) as days_old
      FROM channels c
      LEFT JOIN workers w ON c.worker_id = w.id
      LEFT JOIN (
          SELECT * FROM daily_updates WHERE id IN (SELECT MAX(id) FROM daily_updates GROUP BY channel_id)
      ) u ON c.id = u.channel_id
      WHERE c.is_sold = 0 AND c.open_date IS NOT NULL
      ORDER BY c.open_date ASC
      LIMIT 10
    `);

    return NextResponse.json({
      summary: stats,
      bestWorkers,
      bestChannels,
      oldChannels
    });
  } catch (error) {
    console.error('Analytics Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
