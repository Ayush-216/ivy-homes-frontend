'use client';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LogOut, Home, Loader2 } from 'lucide-react';

export default function ListingsLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!user) router.push('/');
      else setIsChecking(false);
    }
  }, [user, loading, router]);

  if (loading || isChecking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-cyan-500">
        <Loader2 className="w-12 h-12 animate-spin mb-4" />
        <div className="animate-pulse text-xl font-bold tracking-widest uppercase">Authenticating...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
      <nav className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-md sticky top-0 z-50 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">
          <Link href="/listings" className="flex items-center gap-3 group">
            <div className="bg-cyan-500/10 p-2 rounded-lg border border-cyan-500/30 group-hover:border-cyan-400 transition-colors">
              <Home className="text-cyan-400 w-5 h-5" />
            </div>
            <span className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 tracking-wide">
              Ivy Nexus
            </span>
          </Link>
          <div className="flex items-center gap-6">
            <div className="hidden md:block text-sm text-gray-400 bg-gray-900 px-4 py-1.5 rounded-full border border-gray-800">
              {user?.email}
            </div>
            <button 
              onClick={logout} 
              className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 px-4 py-2 rounded-lg transition-all"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </nav>
      <main className="flex-1">{children}</main>
    </div>
  );
}