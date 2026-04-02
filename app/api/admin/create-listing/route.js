import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request) {
  try {
    const data = await request.json();
    const { 
      channel_links, 
      whatsapp,
      owner_name
    } = data;

    if (!channel_links || !whatsapp || !owner_name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Split links and filter empty ones
    const links = channel_links.split('\n').map(l => l.trim()).filter(l => l !== '');
    
    if (links.length === 0) {
      return NextResponse.json({ error: 'No valid channel links provided' }, { status: 400 });
    }

    // Standardize WhatsApp number for DB (remove non-digits or just store as is, but prefixing for convenience)
    // We will prefix with 880 if it doesn't have it and starts with a common BD digit (0 or 1)
    let cleanWhatsapp = whatsapp.replace(/[^0-9]/g, '');
    if (cleanWhatsapp.startsWith('0')) {
      cleanWhatsapp = '880' + cleanWhatsapp.substring(1);
    } else if (!cleanWhatsapp.startsWith('880')) {
      cleanWhatsapp = '880' + cleanWhatsapp;
    }

    // Bulk insert using multiple queries for simplicity with mysql2
    const results = [];
    for (const link of links) {
      await pool.execute(
        `INSERT INTO channels (channel_name, channel_link, niche, subscribers, earnings, price, whatsapp, email, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'approved')`,
        [owner_name, link, 'Others', 0, 0, 0, cleanWhatsapp, 'admin@internal']
      );
      results.push(link);
    }

    return NextResponse.json({ success: true, count: results.length }, { status: 201 });
  } catch (error) {
    console.error('Admin Bulk Listing Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
