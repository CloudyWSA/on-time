import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json(
      { error: 'User ID is required' },
      { status: 400 }
    );
  }

  try {
    const entries = await prisma.timeEntry.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json({ entries });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch time entries' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { userId, date, entryTime, lunchStart, lunchEnd, exitTime } = await request.json();

    if (!userId || !date || !entryTime || !lunchStart || !lunchEnd || !exitTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const entry = await prisma.timeEntry.upsert({
      where: {
        userId_date: {
          userId,
          date,
        },
      },
      update: {
        entryTime,
        lunchStart,
        lunchEnd,
        exitTime,
      },
      create: {
        userId,
        date,
        entryTime,
        lunchStart,
        lunchEnd,
        exitTime,
      },
    });

    return NextResponse.json({ entry });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to save time entry' },
      { status: 500 }
    );
  }
}
