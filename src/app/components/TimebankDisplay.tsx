'use client';

import { useLanguage } from '../contexts/LanguageContext';

interface TimebankDisplayProps {
  hours: number;
  minutes: number;
}

export default function TimebankDisplay({ hours, minutes }: TimebankDisplayProps) {
  const { t } = useLanguage();
  const isPositive = hours >= 0 && minutes >= 0;

  // Format the timebank string
  const formatTimebank = () => {
    const hourStr = Math.abs(hours).toString().padStart(2, '0');
    const minStr = Math.abs(minutes).toString().padStart(2, '0');
    return `${isPositive ? '+' : '-'}${hourStr}:${minStr}`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-sm text-center transition-colors duration-200">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
        {t('dashboard.timebank')}
      </h2>
      <p className={`text-5xl font-bold mb-4 ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
        {formatTimebank()}
      </p>
      <p className="text-gray-600 dark:text-gray-300">
        {isPositive ? t('timeEntry.extraHours') : t('timeEntry.missingHours')}
      </p>
      <div className={`h-1 w-24 mx-auto mt-4 ${isPositive ? 'bg-emerald-600 dark:bg-emerald-400' : 'bg-red-600 dark:bg-red-400'}`} />
    </div>
  );
}
