'use client';

import { useState, useMemo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import TimeEntryForm from './TimeEntryForm';

interface TimeEntry {
  entry_time: string | null;
  lunch_start: string | null;
  lunch_end: string | null;
  exit_time: string | null;
  date?: string;
}

interface CalendarProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  filledDates?: Set<string> | string[];
  onSaveEntry?: (entry: TimeEntry) => void;
  entries?: Record<string, TimeEntry>;
}

export default function Calendar({ 
  selectedDate, 
  onDateSelect, 
  filledDates = new Set(),
  onSaveEntry,
  entries = {} 
}: CalendarProps) {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);

  // Convert filledDates to Set if it's an array
  const filledDatesSet = useMemo(() => {
    if (filledDates instanceof Set) return filledDates;
    return new Set(filledDates);
  }, [filledDates]);

  // Get month names based on language
  const getMonthNames = () => {
    const formatter = new Intl.DateTimeFormat(language === 'pt' ? 'pt-BR' : 'en-US', { month: 'long' });
    return Array.from({ length: 12 }, (_, i) => {
      const date = new Date(2024, i, 1);
      return formatter.format(date);
    });
  };

  // Get weekday names based on language
  const getWeekdayNames = () => {
    const formatter = new Intl.DateTimeFormat(language === 'pt' ? 'pt-BR' : 'en-US', { weekday: 'short' });
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(2024, 0, i + 1); // Use Sunday as first day
      return formatter.format(date);
    });
  };

  const monthNames = getMonthNames();
  const weekDays = getWeekdayNames();

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const handleDateClick = (date: Date) => {
    onDateSelect(date);
    setShowForm(true);
  };

  const handlePrevMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  };

  const handleSaveEntry = (entry: TimeEntry) => {
    if (onSaveEntry) {
      onSaveEntry(entry);
    }
    setShowForm(false);
  };

  const handleCancelEntry = () => {
    setShowForm(false);
  };

  const renderCalendarDays = () => {
    const days = [];
    const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
    const firstDay = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10" />);
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dateString = date.toISOString().split('T')[0];
      const isSelected = selectedDate?.toISOString().split('T')[0] === dateString;
      const isFilled = filledDatesSet.has(dateString);

      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(date)}
          className={`h-10 w-10 rounded-lg flex items-center justify-center transition-all duration-200
            ${isSelected ? 'bg-blue-600 text-white shadow-lg scale-110' : 
              isFilled ? 'bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800' : 
              'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 transition-colors duration-200">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
          >
            ←
          </button>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
          >
            →
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day, index) => (
            <div key={index} className="h-10 flex items-center justify-center text-sm font-medium text-gray-600 dark:text-gray-400">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {renderCalendarDays()}
        </div>
      </div>

      {showForm && selectedDate && (
        <TimeEntryForm
          selectedDate={selectedDate}
          onSubmit={handleSaveEntry}
          onCancel={handleCancelEntry}
          existingEntry={entries[selectedDate.toISOString().split('T')[0]]}
        />
      )}
    </div>
  );
}
