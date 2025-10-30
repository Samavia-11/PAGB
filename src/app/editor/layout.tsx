"use client";
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Menu, X, LayoutGrid, Edit3, FileCheck, Settings, LogOut, Search, Bell } from 'lucide-react';

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  action_url?: string;
}

export default function EditorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [open, setOpen] = useState(true);
  const [search, setSearch] = useState('');
  const [mounted, setMounted] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    setMounted(true);
    const u = localStorage.getItem('user');
    if (u) {
      const parsed = JSON.parse(u);
      setUser(parsed);
      if (parsed.role !== 'editor') {
        router.replace('/login');
      } else {
        fetchNotifications(parsed.id);
      }
    } else {
      router.replace('/login');
    }
  }, [router]);

  const fetchNotifications = async (userId: number) => {
    try {
      const response = await fetch('/api/notifications', {
        headers: { 'x-user-id': userId.toString() }
      });
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.notifications?.filter((n: Notification) => !n.is_read).length || 0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

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
          <NavLink href="/editor/dashboard" icon={LayoutGrid} label="Dashboard" />
          <NavLink href="/editor/articles" icon={Edit3} label="Edit Articles" />
          <NavLink href="/editor/published" icon={FileCheck} label="Published" />
          <NavLink href="/editor/settings" icon={Settings} label="Settings" />
        </nav>
        <div className="p-3 mt-auto border-t border-green-700/60">
          {user && (
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-green-900/50 flex items-center justify-center font-semibold text-green-50">
                {(user.fullName || user.username || 'E').toString().charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="font-semibold truncate">{user.fullName || user.username}</div>
                <div className="text-[11px] text-green-100/80 capitalize">{user.role || 'editor'}</div>
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
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-green-100 hover:text-white"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
            {user && <div className="text-sm hidden md:block">{user.username || user.fullName}</div>}
          </div>
        </header>

        {/* Notifications Dropdown */}
        {showNotifications && (
          <div className="absolute right-6 top-20 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <p>No notifications</p>
                </div>
              ) : (
                notifications.slice(0, 10).map(notif => (
                  <div
                    key={notif.id}
                    onClick={() => !notif.is_read && markAsRead(notif.id)}
                    className={`p-4 hover:bg-gray-50 cursor-pointer ${!notif.is_read ? 'bg-green-50' : ''}`}
                  >
                    <h4 className="text-sm font-semibold">{notif.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(notif.created_at).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Content */}
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
