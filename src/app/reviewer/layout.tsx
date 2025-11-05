"use client";
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Menu, X, LayoutGrid, Archive, LogOut, Search, Bell, MessageSquare } from 'lucide-react';

export default function ReviewerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [open, setOpen] = useState(true);
  const [search, setSearch] = useState('');
  const [mounted, setMounted] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    setMounted(true);
    const u = localStorage.getItem('user');
    if (u) {
      const parsed = JSON.parse(u);
      setUser(parsed);
      if (parsed.role !== 'reviewer') {
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
        setUnreadCount(data.notifications?.filter((n: any) => !n.is_read).length || 0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
      setNotifications(prev => prev.map((n: any) => n.id === id ? { ...n, is_read: true } : n));
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
          
          {/* Notifications */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded hover:bg-[forestgreen]/80 relative"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            
            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                </div>
                <div className="divide-y divide-gray-100">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                      <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No notifications</p>
                    </div>
                  ) : (
                    notifications.slice(0, 10).map((notif: any, index: number) => (
                      <div
                        key={`reviewer-notification-${notif.id}-${index}`}
                        onClick={() => !notif.is_read && markAsRead(notif.id)}
                        className={`p-4 hover:bg-gray-50 cursor-pointer ${!notif.is_read ? 'bg-blue-50' : ''}`}
                      >
                        <h4 className="text-sm font-semibold text-gray-900">{notif.title}</h4>
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
          </div>
          
          {user && <div className="text-sm hidden md:block">{user.username || user.fullName}</div>}
        </header>

        {/* Content */}
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
