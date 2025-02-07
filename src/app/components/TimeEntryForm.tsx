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
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Get current time in HH:mm format
  const getCurrentTime = () => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  };

  // Load existing entry data if available
  useEffect(() => {
    if (existingEntry) {
      setEntryTime(existingEntry.entry_time || '');
      setLunchStart(existingEntry.lunch_start || '');
      setLunchEnd(existingEntry.lunch_end || '');
      setExitTime(existingEntry.exit_time || '');
    }
  }, [existingEntry]);

  const validateTimes = () => {
    const newErrors: Record<string, string> = {};
    
    // Convert times to comparable format
    const times = {
      entry: entryTime ? new Date(`1970-01-01T${entryTime}`) : null,
      lunchStart: lunchStart ? new Date(`1970-01-01T${lunchStart}`) : null,
      lunchEnd: lunchEnd ? new Date(`1970-01-01T${lunchEnd}`) : null,
      exit: exitTime ? new Date(`1970-01-01T${exitTime}`) : null
    };

    // Validate chronological order if times are present
    if (times.entry && times.lunchStart && times.entry >= times.lunchStart) {
      newErrors.lunchStart = t('timeEntry.errors.lunchStartAfterEntry');
    }
    if (times.lunchStart && times.lunchEnd && times.lunchStart >= times.lunchEnd) {
      newErrors.lunchEnd = t('timeEntry.errors.lunchEndAfterStart');
    }
    if (times.lunchEnd && times.exit && times.lunchEnd >= times.exit) {
      newErrors.exit = t('timeEntry.errors.exitAfterLunch');
    }
    if (times.entry && times.exit && times.entry >= times.exit) {
      newErrors.exit = t('timeEntry.errors.exitAfterEntry');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) return;

    if (!validateTimes()) {
      return;
    }

    const entry: TimeEntry = {
      entry_time: entryTime || null,
      lunch_start: lunchStart || null,
      lunch_end: lunchEnd || null,
      exit_time: exitTime || null,
      date: selectedDate.toISOString().split('T')[0],
    };

    onSubmit(entry);
  };

  const handleTimeInput = (field: string, value: string) => {
    switch (field) {
      case 'entry':
        setEntryTime(value);
        break;
      case 'lunchStart':
        setLunchStart(value);
        break;
      case 'lunchEnd':
        setLunchEnd(value);
        break;
      case 'exit':
        setExitTime(value);
        break;
    }
    // Clear errors when user makes changes
    setErrors({});
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
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('timeEntry.entryTime')}
            </label>
            <input
              type="time"
              value={entryTime}
              onChange={(e) => handleTimeInput('entry', e.target.value)}
              placeholder={getCurrentTime()}
              className={`w-full px-3 py-2 border ${errors.entry ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200`}
            />
            {errors.entry && <p className="mt-1 text-sm text-red-500">{errors.entry}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('timeEntry.lunchStart')}
            </label>
            <input
              type="time"
              value={lunchStart}
              onChange={(e) => handleTimeInput('lunchStart', e.target.value)}
              placeholder={getCurrentTime()}
              className={`w-full px-3 py-2 border ${errors.lunchStart ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200`}
            />
            {errors.lunchStart && <p className="mt-1 text-sm text-red-500">{errors.lunchStart}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('timeEntry.lunchEnd')}
            </label>
            <input
              type="time"
              value={lunchEnd}
              onChange={(e) => handleTimeInput('lunchEnd', e.target.value)}
              placeholder={getCurrentTime()}
              className={`w-full px-3 py-2 border ${errors.lunchEnd ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200`}
            />
            {errors.lunchEnd && <p className="mt-1 text-sm text-red-500">{errors.lunchEnd}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('timeEntry.exitTime')}
            </label>
            <input
              type="time"
              value={exitTime}
              onChange={(e) => handleTimeInput('exit', e.target.value)}
              placeholder={getCurrentTime()}
              className={`w-full px-3 py-2 border ${errors.exit ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200`}
            />
            {errors.exit && <p className="mt-1 text-sm text-red-500">{errors.exit}</p>}
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
