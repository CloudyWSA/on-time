'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';

type Step = 'account' | 'schedule';

interface WorkSchedule {
  entryTime: string;
  lunchStart: string;
  lunchEnd: string;
  exitTime: string;
}

export default function Register() {
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<Step>('account');
  const [accountData, setAccountData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
  });
  const [scheduleData, setScheduleData] = useState<WorkSchedule>({
    entryTime: '09:00',
    lunchStart: '12:00',
    lunchEnd: '13:00',
    exitTime: '18:00',
  });

  const handleAccountSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (accountData.password !== accountData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setCurrentStep('schedule');
  };

  const handleScheduleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Register user
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: accountData.email,
          firstName: accountData.firstName,
          lastName: accountData.lastName,
          password: accountData.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Registration failed');
      }

      // Set work schedule
      const scheduleResponse = await fetch('/api/work-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: result.user.id,
          ...scheduleData,
        }),
      });

      const scheduleResult = await scheduleResponse.json();

      if (!scheduleResponse.ok) {
        throw new Error(scheduleResult.error || 'Failed to set work schedule');
      }

      // Login user
      login({ ...result.user, workSchedule: scheduleResult });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (currentStep === 'schedule') {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Set Your Work Schedule
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              This will be used to calculate your timebank
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleScheduleSubmit}>
            <div className="rounded-md shadow-sm space-y-4">
              <div>
                <label htmlFor="entryTime" className="block text-sm font-medium text-gray-700">
                  Work Start Time
                </label>
                <input
                  id="entryTime"
                  name="entryTime"
                  type="time"
                  required
                  value={scheduleData.entryTime}
                  onChange={(e) => setScheduleData({ ...scheduleData, entryTime: e.target.value })}
                  className="mt-1 appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-black focus:border-black focus:z-10 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="lunchStart" className="block text-sm font-medium text-gray-700">
                  Lunch Start Time
                </label>
                <input
                  id="lunchStart"
                  name="lunchStart"
                  type="time"
                  required
                  value={scheduleData.lunchStart}
                  onChange={(e) => setScheduleData({ ...scheduleData, lunchStart: e.target.value })}
                  className="mt-1 appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-black focus:border-black focus:z-10 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="lunchEnd" className="block text-sm font-medium text-gray-700">
                  Lunch End Time
                </label>
                <input
                  id="lunchEnd"
                  name="lunchEnd"
                  type="time"
                  required
                  value={scheduleData.lunchEnd}
                  onChange={(e) => setScheduleData({ ...scheduleData, lunchEnd: e.target.value })}
                  className="mt-1 appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-black focus:border-black focus:z-10 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="exitTime" className="block text-sm font-medium text-gray-700">
                  Work End Time
                </label>
                <input
                  id="exitTime"
                  name="exitTime"
                  type="time"
                  required
                  value={scheduleData.exitTime}
                  onChange={(e) => setScheduleData({ ...scheduleData, exitTime: e.target.value })}
                  className="mt-1 appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-black focus:border-black focus:z-10 sm:text-sm"
                />
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setCurrentStep('account')}
                className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating account...' : 'Complete Registration'}
              </button>
            </div>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleAccountSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="sr-only">
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  value={accountData.firstName}
                  onChange={(e) => setAccountData({ ...accountData, firstName: e.target.value })}
                  className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-black focus:border-black focus:z-10 sm:text-sm"
                  placeholder="First Name"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="sr-only">
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  value={accountData.lastName}
                  onChange={(e) => setAccountData({ ...accountData, lastName: e.target.value })}
                  className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-black focus:border-black focus:z-10 sm:text-sm"
                  placeholder="Last Name"
                />
              </div>
            </div>
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={accountData.email}
                onChange={(e) => setAccountData({ ...accountData, email: e.target.value })}
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-black focus:border-black focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={accountData.password}
                onChange={(e) => setAccountData({ ...accountData, password: e.target.value })}
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-black focus:border-black focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="sr-only">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={accountData.confirmPassword}
                onChange={(e) => setAccountData({ ...accountData, confirmPassword: e.target.value })}
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-black focus:border-black focus:z-10 sm:text-sm"
                placeholder="Confirm Password"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
            >
              Next
            </button>
          </div>

          <div className="text-center">
            <Link 
              href="/login"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Already have an account? Sign in
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
