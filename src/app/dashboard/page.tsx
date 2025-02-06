'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Calendar from '../components/Calendar';
import TimeEntryForm from '../components/TimeEntryForm';
import TimebankDisplay from '../components/TimebankDisplay';
import Sidebar from '../components/Sidebar';
import { calculateMonthlyTimebank } from '../lib/timeCalculations';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTimeEntryStore } from '../stores/timeEntryStore';

interface WorkSchedule {
  entry_time: string;
  lunch_start: string | null;
  lunch_end: string | null;
  exit_time: string;
}

export default function Dashboard() {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [workSchedule, setWorkSchedule] = useState<WorkSchedule | null>(null);

  // Get time entry state from store
  const { entries, fetchEntries, addEntry, isLoading: entriesLoading } = useTimeEntryStore();

  // Memoize filled dates for better performance
  const filledDates = useMemo(() => {
    return new Set(entries.map(entry => {
      // Convert ISO date to YYYY-MM-DD format
      return entry.date.split('T')[0];
    }));
  }, [entries]);

  // Get the existing entry for the selected date
  const selectedEntry = useMemo(() => {
    if (!selectedDate) return null;
    const dateStr = selectedDate.toISOString().split('T')[0];
    const entry = entries.find(entry => entry.date === dateStr);
    if (entry) {
      console.log('Found existing entry for date:', dateStr, entry);
    }
    return entry;
  }, [selectedDate, entries]);

  // Calculate monthly timebank using memoization
  const monthlyTimebank = useMemo(() => {
    if (workSchedule && entries.length > 0) {
      const { timebankMinutes } = calculateMonthlyTimebank(entries, workSchedule);
      const hours = Math.floor(Math.abs(timebankMinutes) / 60);
      const minutes = Math.abs(timebankMinutes) % 60;
      return { hours, minutes };
    }
    return { hours: 0, minutes: 0 };
  }, [workSchedule, entries]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    // Fetch work schedule
    if (user) {
      fetch('/api/work-schedule')
        .then(res => res.json())
        .then(response => {
          if (response.data) {
            setWorkSchedule({
              entry_time: response.data.entryTime,
              lunch_start: response.data.lunchStart,
              lunch_end: response.data.lunchEnd,
              exit_time: response.data.exitTime
            });
          }
        })
        .catch(error => {
          console.error('Failed to fetch work schedule:', error);
        });

      // Fetch time entries for current month
      const now = new Date();
      fetchEntries(now.getFullYear(), now.getMonth() + 1);
    }
  }, [user, router, loading, fetchEntries]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setShowForm(true);
  };

  const handleTimeEntry = async (entry: {
    entry_time: string | null;
    lunch_start: string | null;
    lunch_end: string | null;
    exit_time: string | null;
  }) => {
    if (!selectedDate || !user) return;

    try {
      const response = await fetch('/api/time-entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: selectedDate.toISOString().split('T')[0],
          entry_time: entry.entry_time,
          lunch_start: entry.lunch_start,
          lunch_end: entry.lunch_end,
          exit_time: entry.exit_time,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save time entry');
      }

      if (result.data.entry) {
        // Add the new entry to the store
        addEntry(result.data.entry);
        setShowForm(false);
      }
    } catch (error) {
      console.error('Failed to save time entry:', error);
      alert('Failed to save time entry. Please try again.');
    }
  };

  if (loading || entriesLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 p-8 ml-20">
          <div className="max-w-6xl mx-auto">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar 
        userName={{
          firstName: user.first_name,
          lastName: user.last_name
        }}
        userId={user.id}
      />
      
      <main className="flex-1 p-8 ml-20 transition-all duration-300">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="w-full">
              <Calendar
                selectedDate={selectedDate}
                onDateSelect={handleDateSelect}
                filledDates={filledDates}
              />
            </div>
            
            <div className="flex-1 space-y-6">
              {workSchedule ? (
                <>
                  <TimebankDisplay
                    hours={monthlyTimebank.hours}
                    minutes={monthlyTimebank.minutes}
                  />
                  {showForm && (
                    <TimeEntryForm
                      selectedDate={selectedDate}
                      onSubmit={handleTimeEntry}
                      onCancel={() => setShowForm(false)}
                      existingEntry={selectedEntry}
                    />
                  )}
                </>
              ) : (
                <div className="bg-yellow-50 dark:bg-yellow-900 p-4 rounded-lg">
                  <p className="text-yellow-800 dark:text-yellow-200">
                    {t('timeEntry.setSchedule')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
