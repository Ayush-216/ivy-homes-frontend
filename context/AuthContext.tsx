'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/api';

interface User {
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('ivy_user');
    const storedToken = localStorage.getItem('ivy_token');
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const data = await fetchApi('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    const actualToken = data.access_token || data.token;
    const refreshToken = data.refresh_token;
    
    if (!actualToken) throw new Error("No access token returned from server");

    localStorage.setItem('ivy_token', actualToken);
    if (refreshToken) localStorage.setItem('ivy_refresh_token', refreshToken);
    localStorage.setItem('ivy_user', JSON.stringify(data.user));
    
    setUser(data.user);
    router.push('/listings');
  };

  const logout = () => {
    fetchApi('/auth/logout', { method: 'POST' }).catch(console.error);
    localStorage.removeItem('ivy_token');
    localStorage.removeItem('ivy_refresh_token');
    localStorage.removeItem('ivy_user');
    setUser(null);
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};