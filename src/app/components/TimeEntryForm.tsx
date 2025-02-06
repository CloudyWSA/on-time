'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { calculateDailyTimebank } from '../lib/timeCalculations';

interface TimeEntry {
  entry_time: string | null;
  lunch_start: string | null;
  lunch_end: string | null;
  exit_time: string | null;
  date?: string;
}

interface WorkSchedule {
  entry_time: string;
  lunch_start: string | null;
  lunch_end: string | null;
  exit_time: string;
}

interface TimeEntryFormProps {
  selectedDate: Date | null;
  onSubmit: (entry: TimeEntry) => void;
  onCancel: () => void;
  existingEntry?: TimeEntry | null;
}

export default function TimeEntryForm({ selectedDate, onSubmit, onCancel, existingEntry }: TimeEntryFormProps) {
  const { t } = useLanguage();
  const [entryTime, setEntryTime] = useState('');
  const [lunchStart, setLunchStart] = useState('');
  const [lunchEnd, setLunchEnd] = useState('');
  const [exitTime, setExitTime] = useState('');
  const [currentTimebank, setCurrentTimebank] = useState<string>('+00:00');
  const [isPositive, setIsPositive] = useState(true);

  // Load existing entry data if available
  useEffect(() => {
    if (existingEntry) {
      setEntryTime(existingEntry.entry_time || '');
      setLunchStart(existingEntry.lunch_start || '');
      setLunchEnd(existingEntry.lunch_end || '');
      setExitTime(existingEntry.exit_time || '');
    }
  }, [existingEntry]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) return;

    const entry: TimeEntry = {
      entry_time: entryTime || null,
      lunch_start: lunchStart || null,
      lunch_end: lunchEnd || null,
      exit_time: exitTime || null,
      date: selectedDate.toISOString().split('T')[0],
    };

    onSubmit(entry);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 transition-colors duration-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {existingEntry ? t('timeEntry.editEntry') : t('timeEntry.newEntry')}
        </h2>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          ×
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('timeEntry.entryTime')}
            </label>
            <input
              type="time"
              value={entryTime}
              onChange={(e) => setEntryTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('timeEntry.exitTime')}
            </label>
            <input
              type="time"
              value={exitTime}
              onChange={(e) => setExitTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('timeEntry.lunchStart')}
            </label>
            <input
              type="time"
              value={lunchStart}
              onChange={(e) => setLunchStart(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('timeEntry.lunchEnd')}
            </label>
            <input
              type="time"
              value={lunchEnd}
              onChange={(e) => setLunchEnd(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
          >
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200"
          >
            {existingEntry ? t('common.update') : t('common.save')}
          </button>
        </div>
      </form>
    </div>
  );
}
