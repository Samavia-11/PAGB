"use client";
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Menu, X, LayoutGrid, Archive, LogOut, Search, MessageSquare } from 'lucide-react';

export default function ReviewerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [open, setOpen] = useState(true);
  const [search, setSearch] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const u = localStorage.getItem('user');
    if (u) {
      const parsed = JSON.parse(u);
      setUser(parsed);
      if (parsed.role !== 'reviewer') {
        router.replace('/login');
      } else {
      }
    } else {
      router.replace('/login');
    }
  }, [router]);

  if (!mounted) return null;

  const logout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  const NavLink = ({ href, icon: Icon, label }: { href: string; icon: any; label: string }) => {
    const active = pathname === href;
    return (
      <Link href={href} className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${active ? 'bg-[forestgreen]/60 text-white' : 'text-white/80 hover:bg-[forestgreen]/30'}`}>
        <Icon className="w-4 h-4" />
        {open && <span>{label}</span>}
      </Link>
    );
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className={`bg-[forestgreen] text-white transition-all duration-200 ${open ? 'w-64' : 'w-16'} hidden md:flex flex-col md:sticky md:top-0 md:h-screen overflow-hidden`}>
        <div className="h-14 flex items-center px-3 border-b border-[forestgreen]/80">
          <button onClick={() => setOpen(!open)} className="p-2 rounded hover:bg-[forestgreen]/80 mr-2">
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          {open && <span className="font-semibold">PAGB Journal</span>}
        </div>
        <nav className="flex-1 p-3 space-y-1">
          <NavLink href="/reviewer/dashboard" icon={LayoutGrid} label="Dashboard" />
          <NavLink href="/reviewer/archive" icon={Archive} label="Archive" />
          <NavLink href="/reviewer/messages" icon={MessageSquare} label="Messages" />
        </nav>
        <div className="p-3 mt-auto border-t border-[forestgreen]/80">
          {user && (
            <div className={`flex items-center gap-3 mb-3 ${!open && 'justify-center'}`}>
              <div className="w-9 h-9 rounded-full bg-[forestgreen]/70 flex items-center justify-center font-semibold text-white">
                {(user.fullName || user.username || 'R').toString().charAt(0).toUpperCase()}
              </div>
              {open && (
                <div className="min-w-0">
                  <div className="font-semibold truncate">{user.fullName || user.username}</div>
                  <div className="text-[11px] text-white/80 capitalize">{user.role || 'reviewer'}</div>
                </div>
              )}
            </div>
          )}
          <button onClick={logout} className={`w-full flex items-center ${open ? 'justify-start' : 'justify-center'} gap-2 px-3 py-2 rounded-md text-sm bg-[forestgreen]/50 hover:bg-[forestgreen]/60 border border-[forestgreen]/80`}>
            <LogOut className="w-4 h-4" />
            {open && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={() => setOpen(false)}>
          <aside className="bg-[forestgreen] text-white w-64 h-full">
            <div className="h-14 flex items-center px-3 border-b border-[forestgreen]/80">
              <button onClick={() => setOpen(false)} className="p-2 rounded hover:bg-[forestgreen]/80 mr-2">
                <X className="w-5 h-5" />
              </button>
              <span className="font-semibold">PAGB Journal</span>
            </div>
            <nav className="flex-1 p-3 space-y-1">
              <NavLink href="/reviewer/dashboard" icon={LayoutGrid} label="Dashboard" />
              <NavLink href="/reviewer/archive" icon={Archive} label="Archive" />
              <NavLink href="/reviewer/messages" icon={MessageSquare} label="Messages" />
            </nav>
            <div className="p-3 mt-auto border-t border-[forestgreen]/80">
              {user && (
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full bg-[forestgreen]/70 flex items-center justify-center font-semibold text-white">
                    {(user.fullName || user.username || 'R').toString().charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold truncate">{user.fullName || user.username}</div>
                    <div className="text-[11px] text-white/80 capitalize">{user.role || 'reviewer'}</div>
                  </div>
                </div>
              )}
              <button onClick={logout} className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm bg-[forestgreen]/50 hover:bg-[forestgreen]/60 border border-[forestgreen]/80">
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 bg-[forestgreen] text-white flex items-center px-3 md:px-5 gap-3 shadow relative">
          <button onClick={() => setOpen(!open)} className="p-2 rounded hover:bg-[forestgreen]/80 md:hidden">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search articles, authors, keywords..."
                className="w-full bg-[forestgreen]/60 placeholder-white/70 text-white rounded pl-9 pr-3 py-2 text-sm outline-none border border-[forestgreen]/80 focus:border-white/50"
              />
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white" />
            </div>
          </div>
          {user && <div className="text-sm hidden md:block">{user.username || user.fullName}</div>}
        </header>

        {/* Content */}
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
