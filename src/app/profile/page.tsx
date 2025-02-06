'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface WorkSchedule {
  entryTime: string;
  lunchStart: string;
  lunchEnd: string;
  exitTime: string;
}

interface User {
  name: string;
  email: string;
  workSchedule: WorkSchedule;
}

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [schedule, setSchedule] = useState<WorkSchedule>({
    entryTime: '09:00',
    lunchStart: '12:00',
    lunchEnd: '13:00',
    exitTime: '18:00',
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    if (parsedUser.workSchedule) {
      setSchedule(parsedUser.workSchedule);
    }
  }, [router]);

  const handleScheduleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSchedule({
      ...schedule,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const updatedUser = {
      ...user,
      workSchedule: schedule,
    };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    router.push('/dashboard');
  };

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Profile Settings</h1>
          <p className="text-gray-600 mt-2">Configure your work schedule</p>
        </div>

        <div className="card border-2 border-black">
          <div className="mb-6">
            <h2 className="text-xl font-semibold">Personal Information</h2>
            <div className="mt-4 space-y-2">
              <p><span className="font-medium">Name:</span> {user.name}</p>
              <p><span className="font-medium">Email:</span> {user.email}</p>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-xl font-semibold mb-4">Work Schedule</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="entryTime" className="block text-sm font-medium text-gray-700 mb-1">
                    Expected Entry Time
                  </label>
                  <input
                    type="time"
                    id="entryTime"
                    name="entryTime"
                    value={schedule.entryTime}
                    onChange={handleScheduleChange}
                    className="input w-full"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="lunchStart" className="block text-sm font-medium text-gray-700 mb-1">
                    Expected Lunch Start
                  </label>
                  <input
                    type="time"
                    id="lunchStart"
                    name="lunchStart"
                    value={schedule.lunchStart}
                    onChange={handleScheduleChange}
                    className="input w-full"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="lunchEnd" className="block text-sm font-medium text-gray-700 mb-1">
                    Expected Lunch End
                  </label>
                  <input
                    type="time"
                    id="lunchEnd"
                    name="lunchEnd"
                    value={schedule.lunchEnd}
                    onChange={handleScheduleChange}
                    className="input w-full"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="exitTime" className="block text-sm font-medium text-gray-700 mb-1">
                    Expected Exit Time
                  </label>
                  <input
                    type="time"
                    id="exitTime"
                    name="exitTime"
                    value={schedule.exitTime}
                    onChange={handleScheduleChange}
                    className="input w-full"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button type="submit" className="button">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
