import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function PUT(req: Request) {
  try {
    const { pricing } = await req.json();

    if (!pricing || typeof pricing !== 'object') {
      return NextResponse.json({ error: 'Invalid pricing data' }, { status: 400 });
    }

    const stmt = db.prepare(`
      INSERT OR REPLACE INTO settings (key, value) 
      VALUES ('pricing', ?)
    `);
    
    stmt.run(JSON.stringify(pricing));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Pricing Update Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
