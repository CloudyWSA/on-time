interface TimeEntry {
  entry_time: string | null;
  lunch_start: string | null;
  lunch_end: string | null;
  exit_time: string | null;
}

interface WorkSchedule {
  entry_time: string | null;
  lunch_start: string | null;
  lunch_end: string | null;
  exit_time: string | null;
}

export function timeToMinutes(time: string | null): number {
  if (!time) return 0;
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

export function minutesToTime(minutes: number): string {
  const sign = minutes >= 0 ? '+' : '-';
  const absMinutes = Math.abs(minutes);
  const hours = Math.floor(absMinutes / 60);
  const mins = absMinutes % 60;
  return `${sign}${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

export function calculateDailyTimebank(entry: TimeEntry, schedule: WorkSchedule) {
  // Calculate expected work time
  const expectedEntry = timeToMinutes(schedule.entry_time);
  const expectedLunchStart = timeToMinutes(schedule.lunch_start);
  const expectedLunchEnd = timeToMinutes(schedule.lunch_end);
  const expectedExit = timeToMinutes(schedule.exit_time);
  const expectedWorkMinutes = (expectedExit - expectedEntry) - 
    (expectedLunchEnd ? expectedLunchEnd - expectedLunchStart : 0);

  // Calculate actual work time
  const actualEntry = timeToMinutes(entry.entry_time);
  const actualLunchStart = timeToMinutes(entry.lunch_start);
  const actualLunchEnd = timeToMinutes(entry.lunch_end);
  const actualExit = timeToMinutes(entry.exit_time);
  const actualWorkMinutes = (actualExit - actualEntry) - 
    (actualLunchEnd ? actualLunchEnd - actualLunchStart : 0);

  // Calculate timebank
  const timebankMinutes = actualWorkMinutes - expectedWorkMinutes;
  const timebankFormatted = minutesToTime(timebankMinutes);

  return {
    timebankMinutes,
    timebankFormatted,
  };
}

export function calculateMonthlyTimebank(entries: TimeEntry[], schedule: WorkSchedule) {
  let totalMinutes = 0;

  entries.forEach(entry => {
    const { timebankMinutes } = calculateDailyTimebank(entry, schedule);
    totalMinutes += timebankMinutes;
  });

  return {
    timebankMinutes: totalMinutes,
    timebankFormatted: minutesToTime(totalMinutes),
  };
}
