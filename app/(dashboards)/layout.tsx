'use client';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LogOut, Home, Loader2, Building2, Key, Heart } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
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

  const navLinks = [
    { name: 'Feed', href: '/listings', icon: Home },
    { name: 'Projects', href: '/projects', icon: Building2 },
    { name: 'Rentals', href: '/rentals', icon: Key },
    { name: 'Saved', href: '/favourites', icon: Heart },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
      <nav className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-md sticky top-0 z-50 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="max-w-7xl mx-auto px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          
          <Link href="/listings" className="flex items-center gap-3 group shrink-0">
            <div className="bg-cyan-500/10 p-2 rounded-lg border border-cyan-500/30 group-hover:border-cyan-400 transition-colors">
              <Home className="text-cyan-400 w-5 h-5" />
            </div>
            <span className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 tracking-wide">
              Ivy Nexus
            </span>
          </Link>

          {/* SaaS Navigation Menu */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto justify-start md:justify-center">
            {navLinks.map((link) => {
              const Icon = link.icon;
              // Check if the current URL matches the link to highlight it
              const isActive = pathname.startsWith(link.href); 
              
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-semibold ${
                    isActive 
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' 
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900 border border-transparent'
                  }`}
                >
                  <Icon size={16} className={isActive ? 'text-cyan-400' : 'text-gray-500'} />
                  {link.name}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="hidden lg:block text-sm text-gray-400 bg-gray-900 px-4 py-1.5 rounded-full border border-gray-800">
              {user?.email}
            </div>
            <button 
              onClick={logout} 
              className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 px-4 py-2 rounded-lg transition-all"
            >
              <LogOut size={16} /> <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </nav>
      <main className="flex-1">{children}</main>
    </div>
  );
}