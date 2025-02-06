'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import Sidebar from '../components/Sidebar';

interface WorkSchedule {
  entry_time: string;
  lunch_start: string | null;
  lunch_end: string | null;
  exit_time: string;
}

export default function Settings() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { t } = useLanguage();
  const { theme } = useTheme();
  const [workSchedule, setWorkSchedule] = useState<WorkSchedule>({
    entry_time: '09:00',
    lunch_start: '12:00',
    lunch_end: '13:00',
    exit_time: '18:00',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Fetch work schedule as soon as we have a user
  useEffect(() => {
    if (!user) {
      if (!loading) {
        router.push('/login');
      }
      return;
    }

    const fetchSchedule = async () => {
      try {
        const res = await fetch('/api/work-schedule');
        const response = await res.json();
        
        if (response.data) {
          setWorkSchedule({
            entry_time: response.data.entryTime,
            lunch_start: response.data.lunchStart,
            lunch_end: response.data.lunchEnd,
            exit_time: response.data.exitTime,
          });
        }
      } catch (error) {
        console.error('Failed to fetch work schedule:', error);
        setMessage({ type: 'error', text: t('settings.loadError') });
      }
    };

    fetchSchedule();
  }, [user, loading, router, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch('/api/work-schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entryTime: workSchedule.entry_time,
          lunchStart: workSchedule.lunch_start,
          lunchEnd: workSchedule.lunch_end,
          exitTime: workSchedule.exit_time,
        }),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: t('settings.saveSuccess') });
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      console.error('Failed to save work schedule:', error);
      setMessage({ type: 'error', text: t('settings.saveError') });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Sidebar userName={user?.name} userId={user?.id} />
      
      <main className="flex-1 p-8 ml-20">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white transition-colors duration-200">
            {t('settings.title')}
          </h1>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 transition-colors duration-200">
            <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white transition-colors duration-200">
              {t('settings.workSchedule')}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('settings.entryTime')}
                  </label>
                  <input
                    type="time"
                    value={workSchedule.entry_time}
                    onChange={(e) => setWorkSchedule(prev => ({ ...prev, entry_time: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('settings.exitTime')}
                  </label>
                  <input
                    type="time"
                    value={workSchedule.exit_time}
                    onChange={(e) => setWorkSchedule(prev => ({ ...prev, exit_time: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('settings.lunchStart')}
                  </label>
                  <input
                    type="time"
                    value={workSchedule.lunch_start || ''}
                    onChange={(e) => setWorkSchedule(prev => ({ ...prev, lunch_start: e.target.value || null }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('settings.lunchEnd')}
                  </label>
                  <input
                    type="time"
                    value={workSchedule.lunch_end || ''}
                    onChange={(e) => setWorkSchedule(prev => ({ ...prev, lunch_end: e.target.value || null }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                  />
                </div>
              </div>

              {message.text && (
                <div className={`p-4 rounded-lg ${message.type === 'error' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100' : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100'} transition-colors duration-200`}>
                  {message.text}
                </div>
              )}

              <button
                type="submit"
                disabled={isSaving}
                className={`w-full py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isSaving ? t('common.saving') : t('common.save')}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
