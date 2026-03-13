import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const secretKey = process.env.AUTH_SECRET || 'fallback-secret-key-for-development-only';
const authSalt = process.env.AUTH_SALT || 'fallback-salt-for-dev';

// Helper to convert string to Uint8Array
const encoder = new TextEncoder();

// Shared hashing function for passwords
export async function hashPassword(password: string) {
  const data = encoder.encode(password + authSalt); // Use authSalt from env
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Function to create a JWT-like token using Web Crypto API
async function createToken(payload: any) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, '');
  const encodedPayload = btoa(JSON.stringify(payload)).replace(/=/g, '');
  
  const dataToSign = `${encodedHeader}.${encodedPayload}`;
  
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secretKey),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(dataToSign)
  );
  
  const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
    
  return `${dataToSign}.${encodedSignature}`;
}

// Function to verify a JWT-like token
export async function verifyToken(token: string) {
  const [header, payload, signature] = token.split('.');
  if (!header || !payload || !signature) return null;
  
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secretKey),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );
  
  const dataToVerify = `${header}.${payload}`;
  const sigBytes = Uint8Array.from(atob(signature.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
  
  const isValid = await crypto.subtle.verify(
    'HMAC',
    key,
    sigBytes,
    encoder.encode(dataToVerify)
  );
  
  if (!isValid) return null;
  
  return JSON.parse(atob(payload));
}

export async function login(user: { id: number; email: string; role: string }) {
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const session = await createToken({ user, exp: Math.floor(expires.getTime() / 1000) });

  (await cookies()).set('session', session, { expires, httpOnly: true });
}

export async function logout() {
  (await cookies()).set('session', '', { expires: new Date(0) });
}

export async function getSession() {
  const session = (await cookies()).get('session')?.value;
  if (!session) return null;
  try {
    return await verifyToken(session);
  } catch (e) {
    return null;
  }
}

export async function updateSession(request: NextRequest) {
  const session = request.cookies.get('session')?.value;
  if (!session) return;

  try {
    const parsed = await verifyToken(session);
    if (!parsed) return;
    
    parsed.exp = Math.floor(Date.now() / 1000) + 24 * 60 * 60;
    const res = NextResponse.next();
    res.cookies.set({
      name: 'session',
      value: await createToken(parsed),
      httpOnly: true,
      expires: new Date(parsed.exp * 1000),
    });
    return res;
  } catch (e) {
    return;
  }
}
