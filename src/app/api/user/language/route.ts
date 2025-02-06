import { NextResponse } from 'next/server';
import { updateUserLanguage } from '@/app/lib/db';

export async function POST(request: Request) {
  try {
    const { userId, language } = await request.json();

    if (!userId || !language) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const user = await updateUserLanguage(userId, language);
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error updating language:', error);
    return NextResponse.json(
      { error: 'Failed to update language' },
      { status: 500 }
    );
  }
}
