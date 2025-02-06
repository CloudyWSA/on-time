import { NextResponse } from 'next/server';
import { getTokenData } from '@/app/lib/auth-utils';
import { getUserById } from '@/app/lib/db';

export async function GET(request: Request) {
  try {
    const payload = await getTokenData(request);
    if (!payload || !payload.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await getUserById(payload.id);
    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    // Remove sensitive data
    const { password: _, ...userData } = user;

    return NextResponse.json(userData);
  } catch (error) {
    console.error('Error in /api/auth/me:', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
