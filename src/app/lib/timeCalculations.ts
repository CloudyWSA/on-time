// Convert time string (HH:mm) to minutes since midnight
export function timeToMinutes(time: string | null): number {
  if (!time) return 0;
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

// Convert minutes since midnight to time string (HH:mm)
export function minutesToTime(minutes: number): string {
  const sign = minutes >= 0 ? '+' : '-';
  const absMinutes = Math.abs(minutes);
  const hours = Math.floor(absMinutes / 60);
  const mins = absMinutes % 60;
  return `${sign}${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

interface WorkSchedule {
  entry_time: string;
  lunch_start: string | null;
  lunch_end: string | null;
  exit_time: string;
}

interface TimeEntry {
  entry_time: string | null;
  lunch_start: string | null;
  lunch_end: string | null;
  exit_time: string | null;
}

export function calculateDailyTimebank(
  schedule: WorkSchedule,
  entry: TimeEntry
): { timebankFormatted: string; timebankMinutes: number } {
  // If entry is not complete, return 0
  if (!entry.entry_time || !entry.exit_time) {
    return { timebankFormatted: '+00:00', timebankMinutes: 0 };
  }

  // Convert all times to minutes since midnight
  const scheduleEntry = timeToMinutes(schedule.entry_time);
  const scheduleLunchStart = timeToMinutes(schedule.lunch_start);
  const scheduleLunchEnd = timeToMinutes(schedule.lunch_end);
  const scheduleExit = timeToMinutes(schedule.exit_time);

  const actualEntry = timeToMinutes(entry.entry_time);
  const actualLunchStart = timeToMinutes(entry.lunch_start);
  const actualLunchEnd = timeToMinutes(entry.lunch_end);
  const actualExit = timeToMinutes(entry.exit_time);

  // Calculate expected work duration
  let expectedWorkMinutes = scheduleExit - scheduleEntry;
  if (schedule.lunch_start && schedule.lunch_end) {
    expectedWorkMinutes -= (scheduleLunchEnd - scheduleLunchStart);
  }

  // Calculate actual work duration
  let actualWorkMinutes = actualExit - actualEntry;
  if (entry.lunch_start && entry.lunch_end) {
    actualWorkMinutes -= (actualLunchEnd - actualLunchStart);
  }

  // Calculate timebank
  const timebankMinutes = Math.round(actualWorkMinutes - expectedWorkMinutes);

  return {
    timebankFormatted: minutesToTime(timebankMinutes),
    timebankMinutes
  };
}

export function calculateMonthlyTimebank(
  entries: TimeEntry[],
  schedule: WorkSchedule
): { timebankFormatted: string; timebankMinutes: number } {
  if (!Array.isArray(entries)) {
    console.error('Entries is not an array:', entries);
    return { timebankFormatted: '+00:00', timebankMinutes: 0 };
  }

  const totalMinutes = entries.reduce((acc, entry) => {
    const { timebankMinutes } = calculateDailyTimebank(schedule, entry);
    return acc + timebankMinutes;
  }, 0);

  return {
    timebankFormatted: minutesToTime(totalMinutes),
    timebankMinutes: totalMinutes
  };
}
