import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { email, duration_days } = await req.json();

    if (!email || !duration_days) {
      return NextResponse.json({ error: 'Email and duration are required' }, { status: 400 });
    }

    // MOCK: If DB is unreachable or mocked, we will bypass the order checks
    const isMockPool = !process.env.DATABASE_URL || process.env.DATABASE_URL.includes('internal');

    if (isMockPool) {
      console.log(`--- ℹ️ Mocking Order for: ${email} (${duration_days} days) ---`);
      return NextResponse.json({ success: true, mock: true });
    }

    // Check for existing active orders with the same email
    const activeOrderResult = await pool.query(`
      SELECT id FROM orders 
      WHERE email = $1 AND status = 'active'
      LIMIT 1
    `, [email]);
    
    const activeOrder = activeOrderResult.rows[0];

    if (activeOrder) {
      return NextResponse.json(
        { error: 'อีเมลนี้มีการสั่งซื้อที่กำลังใช้งานอยู่แล้ว กรุณาติดต่อ Admin หากต้องการความช่วยเหลือ' },
        { status: 409 }
      );
    }

    // Check for existing pending orders
    const pendingOrderResult = await pool.query(`
      SELECT id FROM orders 
      WHERE email = $1 AND status = 'pending'
      LIMIT 1
    `, [email]);
    
    const pendingOrder = pendingOrderResult.rows[0];

    if (pendingOrder) {
      // Update the existing pending order with the new duration
      await pool.query(`
        UPDATE orders 
        SET duration_days = $1, created_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `, [duration_days, pendingOrder.id]);
      
      return NextResponse.json({ success: true, updated: true });
    }

    // Insert order into database
    await pool.query(`
      INSERT INTO orders (email, duration_days, status) 
      VALUES ($1, $2, 'pending')
    `, [email, duration_days]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Order Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

