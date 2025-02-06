import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  language?: string;
}

// List of paths that don't require authentication
const publicPaths = ['/login', '/register'];

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    checkAuth();
  }, [pathname]);

  const checkAuth = async () => {
    try {
      // Don't check auth on public pages
      if (publicPaths.includes(pathname || '')) {
        setLoading(false);
        return;
      }

      const response = await fetch('/api/auth/me');
      if (!response.ok) {
        throw new Error('Not authenticated');
      }

      const userData = await response.json();
      setUser(userData);
    } catch (error) {
      console.error('Authentication error:', error);
      setUser(null);
      
      // Only redirect to login if we're not already on a public path
      if (!publicPaths.includes(pathname || '')) {
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (userData: User) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Logout failed');
      }

      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return {
    user,
    loading,
    login,
    logout,
    checkAuth,
  };
}
