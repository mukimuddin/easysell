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

  const isEmployee = session.role === 'employee';
  const ownerFilter = isEmployee ? 'AND c.created_by = ?' : '';
  const ownerFilterWhere = isEmployee ? 'WHERE c.created_by = ?' : '';
  const ownerParams = isEmployee ? [session.userId] : [];

  try {
    // 1. Summary Stats
    const [summary] = await pool.query(`
      SELECT 
        COUNT(*) as total_channels,
        SUM(CASE WHEN is_sold = 1 THEN 1 ELSE 0 END) as sold_count,
        SUM(CASE WHEN is_sold = 0 THEN 1 ELSE 0 END) as active_count,
        SUM(CAST(sell_price AS DECIMAL(10,2))) as total_revenue,
        SUM(CAST(worker_cost AS DECIMAL(10,2))) as total_cost
      FROM channels c
      ${ownerFilterWhere}
    `, ownerParams);

    const stats = summary[0];
    
    // Employee Earnings Logic
    if (isEmployee) {
      const [empRows] = await pool.query('SELECT basic_salary, contract_target FROM employee_details WHERE admin_id = ?', [session.userId]);
      const emp = empRows[0] || { basic_salary: 0, contract_target: 0 };
      
      const salary = parseFloat(emp.basic_salary) || 0;
      const target = parseInt(emp.contract_target) || 0;
      const epc = target > 0 ? (salary / target) : 0;
      const earnings_so_far = stats.sold_count * epc;

      stats.total_revenue = 0; // Hide from employee
      stats.total_cost = 0;    // Hide from employee
      stats.total_profit = 0;  // Hide from employee
      stats.contract_target = target;
      stats.basic_salary = salary;
      stats.earnings_per_channel = epc;
      stats.earnings_so_far = earnings_so_far;
    } else {
      // Admin Logic: Deduct employee commissions from profit
      const [commRows] = await pool.query(`
        SELECT SUM(ed.basic_salary / ed.contract_target) as total_comm
        FROM channels c
        JOIN admin_users adm ON c.created_by = adm.id
        JOIN employee_details ed ON adm.id = ed.admin_id
        WHERE c.is_sold = 1 AND adm.role = 'employee' AND ed.contract_target > 0
      `);
      
      const totalComm = parseFloat(commRows[0]?.total_comm) || 0;
      stats.total_profit = (stats.total_revenue || 0) - (stats.total_cost || 0) - totalComm;
      stats.total_commissions = totalComm;
      stats.contract_target = 0;
    }

    // 2. Staff Performance (For Admins)
    let staffPerformance = [];
    if (!isEmployee) {
      [staffPerformance] = await pool.query(`
        SELECT 
          u.username, 
          ed.full_name,
          COUNT(c.id) as total_brought,
          CAST(SUM(CASE WHEN c.is_sold = 1 THEN 1 ELSE 0 END) AS SIGNED) as sold_count,
          CAST(SUM(CASE WHEN c.is_sold = 1 THEN (ed.basic_salary / ed.contract_target) ELSE 0 END) AS DECIMAL(10,2)) as earnings
        FROM admin_users u
        JOIN employee_details ed ON u.id = ed.admin_id
        LEFT JOIN channels c ON u.id = c.created_by
        WHERE u.role = 'employee' AND ed.contract_target > 0
        GROUP BY u.id, u.username, ed.full_name
        HAVING COUNT(c.id) > 0
        ORDER BY total_brought DESC
      `);
    }

    // 3. Best Workers (By total sub_count of active channels)
    const [bestWorkers] = await pool.query(`
      SELECT w.id, w.name, SUM(u.sub_count) as total_subs, COUNT(c.id) as channel_count
      FROM workers w
      JOIN channels c ON w.id = c.worker_id
      LEFT JOIN (
        SELECT d1.* FROM daily_updates d1
        JOIN (SELECT channel_id, MAX(id) as mid FROM daily_updates GROUP BY channel_id) d2
          ON d1.id = d2.mid
      ) u ON c.id = u.channel_id
      WHERE c.is_sold = 0 ${ownerFilter}
      GROUP BY w.id
      ORDER BY total_subs DESC
      LIMIT 5
    `, ownerParams);

    // 4. Best Channels (Top active channels by subs)
    const [bestChannels] = await pool.query(`
      SELECT c.id, c.channel_name, c.channel_link, u.sub_count, u.status, w.name as worker_name
      FROM channels c
      LEFT JOIN workers w ON c.worker_id = w.id
      LEFT JOIN (
        SELECT d1.* FROM daily_updates d1
        JOIN (SELECT channel_id, MAX(id) as mid FROM daily_updates GROUP BY channel_id) d2
          ON d1.id = d2.mid
      ) u ON c.id = u.channel_id
      WHERE c.is_sold = 0 ${ownerFilter}
      ORDER BY u.sub_count DESC
      LIMIT 10
    `, ownerParams);

    // 5. Old Channels (Inventory Aging - Oldest active)
    const [oldChannels] = await pool.query(`
      SELECT c.id, c.channel_name, c.open_date, u.sub_count, w.name as worker_name,
             DATEDIFF(CURRENT_DATE, c.open_date) as days_old
      FROM channels c
      LEFT JOIN workers w ON c.worker_id = w.id
      LEFT JOIN (
        SELECT d1.* FROM daily_updates d1
        JOIN (SELECT channel_id, MAX(id) as mid FROM daily_updates GROUP BY channel_id) d2
          ON d1.id = d2.mid
      ) u ON c.id = u.channel_id
      WHERE c.is_sold = 0 AND c.open_date IS NOT NULL ${ownerFilter}
      ORDER BY c.open_date ASC
      LIMIT 10
    `, ownerParams);

    // 6. Status Distribution (Active only)
    const [statusDist] = await pool.query(`
      SELECT COALESCE(u.status, 'new') as status, COUNT(*) as count 
      FROM channels c
      LEFT JOIN (
        SELECT d1.* FROM daily_updates d1
        JOIN (SELECT channel_id, MAX(id) as mid FROM daily_updates GROUP BY channel_id) d2
          ON d1.id = d2.mid
      ) u ON c.id = u.channel_id
      WHERE c.is_sold = 0 ${ownerFilter}
      GROUP BY status
    `, ownerParams);

    // 7. Creation Trend (Last 12 Months)
    const [creationTrend] = await pool.query(`
      SELECT DATE_FORMAT(c.created_at, '%b %Y') as month, COUNT(*) as count
      FROM channels c
      ${ownerFilterWhere}
      GROUP BY DATE_FORMAT(c.created_at, '%Y-%m'), month
      ORDER BY DATE_FORMAT(c.created_at, '%Y-%m') ASC
      LIMIT 12
    `, ownerParams);

    return NextResponse.json({
      summary: stats,
      staffPerformance,
      bestWorkers,
      bestChannels,
      oldChannels,
      statusDist,
      creationTrend
    });
  } catch (error) {
    console.error('Analytics Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
