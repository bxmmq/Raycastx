import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function PUT(req: Request) {
  try {
    const { pricing } = await req.json();

    if (!pricing || typeof pricing !== 'object') {
      return NextResponse.json({ error: 'Invalid pricing data' }, { status: 400 });
    }

    await pool.query(`
      INSERT INTO settings (key, value) 
      VALUES ('pricing', $1)
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
    `, [JSON.stringify(pricing)]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Pricing Update Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
