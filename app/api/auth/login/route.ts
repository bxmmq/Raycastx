import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { login, hashPassword } from '@/lib/auth';


export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน' }, { status: 400 });
    }

    // Find user
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = userResult.rows[0];
    
    if (!user) {
      return NextResponse.json({ error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' }, { status: 401 });
    }

    // Compare password
    const inputHash = await hashPassword(password);
    const passwordMatch = inputHash === user.password;
    if (!passwordMatch) {
      return NextResponse.json({ error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' }, { status: 401 });
    }

    // Auto-promote owner to admin if needed
    if (user.email === 'worapon25472004@gmail.com' && user.role !== 'admin') {
      await pool.query("UPDATE users SET role = 'admin' WHERE email = $1", [user.email]);
      user.role = 'admin';
    }

    // Create session
    await login({ id: user.id, email: user.email, role: user.role || 'user' });

    return NextResponse.json({ message: 'เข้าสู่ระบบสำเร็จ' });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' }, { status: 500 });
  }
}
