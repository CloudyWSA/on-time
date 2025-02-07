'use client';

import Link from 'next/link';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { FiSun, FiMoon } from 'react-icons/fi';
import { useState, useEffect } from 'react';

interface SidebarProps {
  userName?: {
    firstName: string;
    lastName: string;
  };
  userId?: string;
}

export default function Sidebar({ userName, userId }: SidebarProps) {
  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <aside className="fixed left-0 top-0 h-full w-20 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col items-center py-6 transition-colors duration-200">
        {/* Loading state */}
      </aside>
    );
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-20 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col items-center py-6 transition-colors duration-200">
      {userName && (
        <div className="mb-8">
          <div className="w-10 h-10 bg-gray-900 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {userName.firstName[0]}
              {userName.lastName[0]}
            </span>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col items-center space-y-6">
        <Link
          href="/dashboard"
          className="p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
          title={t('sidebar.dashboard')}
        >
          <svg className="w-6 h-6 text-gray-700 dark:text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </Link>

        <Link
          href="/settings"
          className="p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
          title={t('sidebar.settings')}
        >
          <svg className="w-6 h-6 text-gray-700 dark:text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </Link>
      </div>

      <div className="flex flex-col items-center space-y-4">
        <button
          onClick={() => setLanguage(language === 'en' ? 'pt' : 'en')}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
          title={t('common.currentLanguage')}
        >
          <span className="text-gray-700 dark:text-gray-200 text-sm font-medium">
            {language.toUpperCase()}
          </span>
        </button>

        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
          title={t('common.toggleTheme')}
        >
          {theme === 'light' ? (
            <FiSun className="text-gray-700 dark:text-gray-200 w-5 h-5" />
          ) : (
            <FiMoon className="text-gray-700 dark:text-gray-200 w-5 h-5" />
          )}
        </button>
      </div>
    </aside>
  );
}
