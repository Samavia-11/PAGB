"use client";
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Menu, X, LayoutGrid, FilePlus2, Files, Archive, LogOut, Search } from 'lucide-react';

export default function AuthorLayout({ children }: { children: React.ReactNode }) {
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
      if (parsed.role !== 'author') {
        router.replace('/login');
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
      <Link href={href} className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${active ? 'bg-green-900/60 text-white' : 'text-green-50 hover:bg-green-900/30'}`}>
        <Icon className="w-4 h-4" />
        <span>{label}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className={`bg-green-800 text-white transition-all duration-200 ${open ? 'w-64' : 'w-16'} hidden md:flex flex-col md:sticky md:top-0 md:h-screen overflow-hidden`}>
        <div className="h-14 flex items-center px-3 border-b border-green-700/60">
          <button onClick={() => setOpen(!open)} className="p-2 rounded hover:bg-green-900/40 mr-2">
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          {open && <span className="font-semibold">PAGB Journal</span>}
        </div>
        <nav className="flex-1 p-3 space-y-1">
          <NavLink href="/Author/dashboard" icon={LayoutGrid} label="Dashboard" />
          <NavLink href="/Author/submit" icon={FilePlus2} label="Submit Article" />
          <NavLink href="/Author/drafts" icon={Files} label="Drafts" />
          <NavLink href="/Author/archive" icon={Archive} label="Archive" />
        </nav>
        <div className="p-3 mt-auto border-t border-green-700/60">
          {user && (
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-green-900/50 flex items-center justify-center font-semibold text-green-50">
                {(user.fullName || user.username || 'A').toString().charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="font-semibold truncate">{user.fullName || user.username}</div>
                <div className="text-[11px] text-green-100/80 capitalize">{user.role || 'author'}</div>
              </div>
            </div>
          )}
          <button onClick={logout} className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm bg-green-900/30 hover:bg-green-900/40 border border-green-700/60">
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 bg-green-800 text-white flex items-center px-3 md:px-5 gap-3 shadow">
          <button onClick={() => setOpen(!open)} className="p-2 rounded hover:bg-green-900/40 md:hidden">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search articles, authors, keywords..."
                className="w-full bg-green-900/40 placeholder-green-100/70 text-white rounded pl-9 pr-3 py-2 text-sm outline-none border border-green-700/60 focus:border-green-400"
              />
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-green-100" />
            </div>
          </div>
          {user && <div className="text-sm hidden md:block">{user.username || user.fullName}</div>}
        </header>

        {/* Content */}
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
