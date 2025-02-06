import { NextResponse } from 'next/server';
import { clearAuthCookie } from '@/app/lib/auth-utils';

export async function POST() {
  try {
    return clearAuthCookie();
  } catch (error) {
    console.error('Logout error:', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
