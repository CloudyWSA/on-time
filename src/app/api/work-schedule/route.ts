import { NextResponse } from 'next/server';
import { updateWorkSchedule, getWorkSchedule } from '@/app/lib/db';
import { getTokenData } from '@/app/lib/auth-utils';

export async function POST(request: Request) {
  try {
    // Get user from token
    const payload = await getTokenData(request);
    if (!payload || !payload.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { entryTime, lunchStart, lunchEnd, exitTime } = await request.json();

    if (!entryTime || !exitTime) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate time format (HH:mm)
    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    if (
      !timeRegex.test(entryTime) ||
      (lunchStart && !timeRegex.test(lunchStart)) ||
      (lunchEnd && !timeRegex.test(lunchEnd)) ||
      !timeRegex.test(exitTime)
    ) {
      return NextResponse.json({ error: 'Invalid time format. Use HH:mm format' }, { status: 400 });
    }

    // Validate time sequence if lunch times are provided
    if (lunchStart && lunchEnd) {
      const times = [
        { name: 'Entry Time', value: entryTime },
        { name: 'Lunch Start', value: lunchStart },
        { name: 'Lunch End', value: lunchEnd },
        { name: 'Exit Time', value: exitTime },
      ];

      for (let i = 0; i < times.length - 1; i++) {
        if (times[i].value >= times[i + 1].value) {
          return NextResponse.json({
            error: `${times[i].name} must be before ${times[i + 1].name}`
          }, { status: 400 });
        }
      }
    } else {
      // If no lunch times, just validate entry and exit times
      if (entryTime >= exitTime) {
        return NextResponse.json({
          error: 'Entry time must be before exit time'
        }, { status: 400 });
      }
    }

    const schedule = await updateWorkSchedule(
      payload.id,
      entryTime,
      lunchStart || null,
      lunchEnd || null,
      exitTime
    );

    return NextResponse.json({
      data: {
        entryTime: schedule.entry_time,
        lunchStart: schedule.lunch_start,
        lunchEnd: schedule.lunch_end,
        exitTime: schedule.exit_time
      }
    });
  } catch (error: any) {
    console.error('Work schedule error:', error);
    return NextResponse.json({
      error: 'Failed to update work schedule'
    }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    // Get user from token
    const payload = await getTokenData(request);
    if (!payload || !payload.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const schedule = await getWorkSchedule(payload.id);
    if (!schedule) {
      return NextResponse.json({ error: 'Work schedule not found' }, { status: 404 });
    }

    return NextResponse.json({
      data: {
        entryTime: schedule.entry_time,
        lunchStart: schedule.lunch_start,
        lunchEnd: schedule.lunch_end,
        exitTime: schedule.exit_time
      }
    });
  } catch (error) {
    console.error('Error fetching work schedule:', error);
    return NextResponse.json({
      error: 'Failed to fetch work schedule'
    }, { status: 500 });
  }
}
