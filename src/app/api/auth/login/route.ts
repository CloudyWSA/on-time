import { NextResponse } from 'next/server';
import { createToken, createResponseWithCookie } from '@/app/lib/auth-utils';
import { getUserByEmail } from '@/app/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return new NextResponse('Invalid credentials', { status: 401 });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return new NextResponse('Invalid credentials', { status: 401 });
    }

    // Create JWT token
    const token = await createToken({
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name
    });

    // Remove sensitive data and create response with cookie
    const { password: _, ...userData } = user;
    return createResponseWithCookie(userData, token);
  } catch (error) {
    console.error('Login error:', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
