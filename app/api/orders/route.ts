import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { email, duration_days } = await req.json();

    if (!email || !duration_days) {
      return NextResponse.json({ error: 'Email and duration are required' }, { status: 400 });
    }

    // Check for existing active orders with the same email
    const activeOrder = db.prepare(`
      SELECT id FROM orders 
      WHERE email = ? AND status = 'active'
      LIMIT 1
    `).get(email);

    if (activeOrder) {
      return NextResponse.json(
        { error: 'อีเมลนี้มีการสั่งซื้อที่กำลังใช้งานอยู่แล้ว กรุณาติดต่อ Admin หากต้องการความช่วยเหลือ' },
        { status: 409 }
      );
    }

    // Check for existing pending orders
    const pendingOrder = db.prepare(`
      SELECT id FROM orders 
      WHERE email = ? AND status = 'pending'
      LIMIT 1
    `).get(email) as any;

    if (pendingOrder) {
      // Update the existing pending order with the new duration
      db.prepare(`
        UPDATE orders 
        SET duration_days = ?, created_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(duration_days, pendingOrder.id);
      
      return NextResponse.json({ success: true, updated: true });
    }

    // Insert order into database
    const insert = db.prepare(`
      INSERT INTO orders (email, duration_days, status) 
      VALUES (?, ?, 'pending')
    `);
    
    insert.run(email, duration_days);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Order Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

