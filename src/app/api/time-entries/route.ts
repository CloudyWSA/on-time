import { NextResponse } from 'next/server';
import { createTimeEntry, getWorkSchedule, getTimeEntriesByMonth } from '@/app/lib/db';
import { calculateDailyTimebank } from '@/app/lib/timeCalculations';
import { getTokenData } from '@/app/lib/auth-utils';

// Helper function to normalize dates safely
function normalizeDate(date: string | Date): string {
  if (!date) return '';
  
  try {
    // If it's already in YYYY-MM-DD format, return as is
    if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }

    // Convert to Date object if it's a string
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Format to YYYY-MM-DD
    return dateObj.toISOString().split('T')[0];
  } catch (error) {
    console.error('Error normalizing date:', error);
    return '';
  }
}

export async function POST(request: Request) {
  try {
    // Get user from token
    const payload = await getTokenData(request);
    if (!payload || !payload.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { date, entry_time, lunch_start, lunch_end, exit_time } = await request.json();

    if (!date || !entry_time || !exit_time) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get user's work schedule
    const schedule = await getWorkSchedule(payload.id);
    if (!schedule) {
      return NextResponse.json({ error: 'Work schedule not found' }, { status: 404 });
    }

    // Normalize the date
    const normalizedDate = normalizeDate(date);
    if (!normalizedDate) {
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
    }

    // Create the time entry
    const entry = await createTimeEntry({
      userId: payload.id,
      date: normalizedDate,
      entry_time,
      lunch_start,
      lunch_end,
      exit_time
    });

    // Calculate timebank for this entry
    const timebank = calculateDailyTimebank(schedule, {
      entry_time,
      lunch_start,
      lunch_end,
      exit_time
    });

    return NextResponse.json({ data: { entry, timebank } });
  } catch (error: any) {
    console.error('Time entry error:', error);
    return NextResponse.json({ error: 'Failed to create time entry' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    // Get user from token
    const payload = await getTokenData(request);
    if (!payload || !payload.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the year and month from query parameters
    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());
    const month = parseInt(searchParams.get('month') || (new Date().getMonth() + 1).toString());

    const entries = await getTimeEntriesByMonth(payload.id, year, month);
    
    // Debug log to check the date format coming from the database
    console.log('Raw entries from database:', entries);
    
    // Normalize dates in the response
    const normalizedEntries = entries.map(entry => ({
      ...entry,
      date: normalizeDate(entry.date)
    }));

    // Debug log to check normalized entries
    console.log('Normalized entries:', normalizedEntries);

    return NextResponse.json({ data: normalizedEntries });
  } catch (error) {
    console.error('Error fetching time entries:', error);
    return NextResponse.json({ error: 'Failed to fetch time entries' }, { status: 500 });
  }
}
