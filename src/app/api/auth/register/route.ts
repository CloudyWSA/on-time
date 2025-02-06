import { NextResponse } from 'next/server';
import { createUser, getUserByEmail } from '@/app/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { email, firstName, lastName, password } = await request.json();

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if email is already registered
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in database
    const [user] = await createUser(email, firstName, lastName, hashedPassword);
    if (!user) {
      throw new Error('Failed to create user');
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({ user: userWithoutPassword });
  } catch (error: any) {
    console.error('Registration error:', error);
    
    if (error.code === '23505') { // PostgreSQL unique violation error
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}
