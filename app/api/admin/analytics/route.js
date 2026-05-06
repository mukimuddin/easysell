import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifySession } from '@/lib/session';
import { cookies } from 'next/headers';

export async function GET(request) {
  const token = (await cookies()).get('adminToken')?.value;
  const session = await verifySession(token);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const employeeUsername = searchParams.get('employeeUsername');
  const days = parseInt(searchParams.get('days') || '30');
  const interval = days - 1;

  const isEmployee = session.role === 'employee';
  const ownerFilter = isEmployee ? 'AND c.created_by = ?' : '';
  const ownerFilterWhere = isEmployee ? 'WHERE c.created_by = ?' : '';
  const ownerParams = isEmployee ? [session.userId] : [];

  // If specific employee detail requested (For Admins)
  if (employeeUsername && !isEmployee) {
    try {
      // Get employee details
      const [empInfo] = await pool.query(`
        SELECT u.id, u.username, ed.full_name, ed.basic_salary, ed.contract_target, ed.joining_date as joined_at
        FROM admin_users u
        JOIN employee_details ed ON u.id = ed.admin_id
        WHERE u.username = ?
      `, [employeeUsername]);

      if (empInfo.length === 0) return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
      const emp = empInfo[0];

      // Daily Trend (Dynamic Range)
      const [dailyTrend] = await pool.query(`
        SELECT 
          d.log_date as date,
          COALESCE(added.count, 0) as added,
          COALESCE(sold.count, 0) as sold
        FROM (
          SELECT DATE_SUB(CURDATE(), INTERVAL (a.a + (10 * b.a) + (100 * c.a)) DAY) as log_date
          FROM (SELECT 0 as a UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) as a
          CROSS JOIN (SELECT 0 as a UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) as b
          CROSS JOIN (SELECT 0 as a UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) as c
        ) d
        LEFT JOIN (
          SELECT DATE(created_at) as log_date, COUNT(*) as count 
          FROM channels WHERE created_by = ? GROUP BY log_date
        ) added ON d.log_date = added.log_date
        LEFT JOIN (
          SELECT DATE(sold_at) as log_date, COUNT(*) as count 
          FROM channels WHERE created_by = ? AND is_sold = 1 GROUP BY log_date
        ) sold ON d.log_date = sold.log_date
        WHERE d.log_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
          AND d.log_date <= CURDATE()
        ORDER BY d.log_date ASC
      `, [emp.id, emp.id, interval]);

      // Velocity, Revenue & Profit
      const [metrics] = await pool.query(`
        SELECT 
          AVG(DATEDIFF(c.sold_at, c.created_at)) as avg_velocity,
          SUM(c.sell_price) as total_revenue,
          SUM(c.sell_price - c.worker_cost) as total_profit,
          SUM(CASE WHEN c.is_sold = 1 THEN 1 ELSE 0 END) as sold_count,
          SUM(CASE WHEN c.is_sold = 1 THEN (ed.basic_salary / ed.contract_target) ELSE 0 END) as total_commission,
          MAX(daily_counts.added_count) as best_day_count
        FROM channels c
        JOIN employee_details ed ON c.created_by = ed.admin_id
        LEFT JOIN (
          SELECT DATE(created_at) as d, COUNT(*) as added_count FROM channels WHERE created_by = ? GROUP BY d
        ) daily_counts ON DATE(c.created_at) = daily_counts.d
        WHERE c.created_by = ?
      `, [emp.id, emp.id]);

      // Consistency (Updates in dynamic range)
      const [consistency] = await pool.query(`
        SELECT COUNT(DISTINCT DATE(update_date)) as update_days
        FROM daily_updates du
        JOIN channels c ON du.channel_id = c.id
        WHERE c.created_by = ? AND du.update_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
      `, [emp.id, days]);

      return NextResponse.json({
        employee: emp,
        dailyTrend,
        metrics: metrics[0],
        consistency: consistency[0].update_days,
        rangeDays: days
      });
    } catch (error) {
      console.error('Detailed Analytics Error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
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

    let employeeDailyActivity = [];
    if (isEmployee) {
      [employeeDailyActivity] = await pool.query(
        `
        SELECT DATE_FORMAT(t.activity_date, '%Y-%m-%d') as activity_date,
               SUM(t.added) as added,
               SUM(t.sold) as sold
        FROM (
          SELECT DATE(c.created_at) as activity_date, COUNT(*) as added, 0 as sold
          FROM channels c
          WHERE c.created_by = ?
          GROUP BY DATE(c.created_at)

          UNION ALL

          SELECT DATE(c.sold_at) as activity_date, 0 as added, COUNT(*) as sold
          FROM channels c
          WHERE c.created_by = ? AND c.is_sold = 1 AND c.sold_at IS NOT NULL
          GROUP BY DATE(c.sold_at)
        ) t
        GROUP BY t.activity_date
        ORDER BY t.activity_date DESC
        `,
        [session.userId, session.userId]
      );
    }

    return NextResponse.json({
      summary: stats,
      staffPerformance,
      bestWorkers,
      bestChannels,
      oldChannels,
      statusDist,
      creationTrend,
      employeeDailyActivity
    });
  } catch (error) {
    console.error('Analytics Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
