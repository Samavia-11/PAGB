'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import ThemeSelector from '@/components/ThemeSelector';
import { 
  Home, 
  FileText, 
  Archive, 
  PlusCircle, 
  LayoutDashboard, 
  Users, 
  LogOut,
  Menu,
  X,
  Search,
  Bell
} from 'lucide-react';

interface User {
  id: number;
  username: string;
  role: 'author' | 'reviewer' | 'editor' | 'administrator';
  full_name?: string;
}

interface LayoutProps {
  children: React.ReactNode;
  user?: User | null;
}

const Layout = ({ children, user }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      // Clear localStorage
      localStorage.removeItem('auth-token');
      
      // Clear cookies
      document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      
      // Call logout API
      await fetch('/api/auth/logout', { method: 'POST' });
      
      // Force redirect to login
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      // Even if API fails, clear local data and redirect
      window.location.href = '/login';
    }
  };

  const getNavigationItems = () => {
    const baseItems = [
      { name: 'Current Issue', href: '/current-issue', icon: FileText },
      { name: 'Archives', href: '/archives', icon: Archive },
    ];

    if (!user) return baseItems;

    const roleSpecificItems = {
      author: [
        ...baseItems,
        { name: 'Submit Article', href: '/submit-article', icon: PlusCircle },
        { name: 'Dashboard', href: '/dashboard/author', icon: LayoutDashboard },
        { name: 'View Drafts', href: '/drafts', icon: FileText },
        { name: 'Reviewed', href: '/reviewed', icon: FileText },
      ],
      reviewer: [
        ...baseItems,
        { name: 'Dashboard', href: '/dashboard/reviewer', icon: LayoutDashboard },
      ],
      editor: [
        ...baseItems,
        { name: 'Dashboard', href: '/dashboard/editor', icon: LayoutDashboard },
        { name: 'Article Management', href: '/dashboard/editor/article-management', icon: FileText },
      ],
      administrator: [
        ...baseItems,
        { name: 'Dashboard', href: '/dashboard/admin', icon: LayoutDashboard },
        { name: 'Issues', href: '/dashboard/admin/issues', icon: FileText },
        { name: 'User Requests', href: '/dashboard/admin/user-requests', icon: Users },
        { name: 'Authors', href: '/authors', icon: Users },
      ],
    };

    return roleSpecificItems[user.role] || baseItems;
  };

  const navigationItems = getNavigationItems();

  return (
    <div className="min-h-screen bg-[var(--bg-color)] flex transition-colors duration-300">
      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[var(--primary-color)] text-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ width: '16rem' }}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-academic-200">
            <Link href="/landingsite" className="flex items-center group">
              <div className="w-8 h-8 bg-[var(--primary-color)] rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="ml-3 text-lg font-semibold text-white group-hover:underline">PAGB Journal</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-md hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            <Link
              href="/"
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                pathname === '/' ? 'bg-white/10 text-white font-semibold' : 'text-white/90 hover:bg-white/10'
              }`}
            >
              <Home className="w-5 h-5 mr-3" />
              Home
            </Link>
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    isActive
                      ? 'bg-white/10 text-white font-semibold'
                      : 'text-white/90 hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User info */}
          {user && (
            <div className="px-4 py-4 border-t border-academic-200">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {user.full_name?.charAt(0) || user.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-white">
                    {user.full_name || user.username}
                  </p>
                  <p className="text-xs text-white/70 capitalize">{user.role}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="mt-4 w-full flex items-center justify-center px-4 py-2 text-sm text-white/90 hover:bg-white/10 hover:text-white rounded-lg transition-colors duration-200"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main content area with offset for sidebar */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        {/* Header */}
        <header className="bg-[var(--primary-color)] text-white shadow-sm border-b border-[var(--primary-color-dark)] z-10 transition-colors duration-300">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md hover:bg-white/10 mr-2"
              >
                <Menu className="w-5 h-5" />
              </button>
              
              {/* Search bar */}
              <div className="hidden md:block">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search articles, authors, keywords..."
                    className="pl-10 pr-4 py-2 w-96 rounded-lg focus:ring-2 focus:ring-[color:var(--primary-color)] focus:border-transparent bg-white text-gray-900 placeholder-gray-500 border border-white/0 shadow-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Theme toggle */}
              <ThemeSelector />
              {/* Login button for unauthenticated users */}
              {!user && (
                <button
                  onClick={() => router.push('/login')}
                  className="px-4 py-2 text-sm font-medium text-white bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                >
                  Login
                </button>
              )}
              {/* Notifications */}
              {user && (
                <button className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg">
                  <Bell className="w-5 h-5" />
                </button>
              )}
              
              {/* User welcome & logout */}
              {user && (
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-white/90 mr-2">{user.full_name || user.username}</span>
                  <button
                    onClick={handleLogout}
                    className="text-xs font-medium text-white hover:underline px-3 py-1 bg-white/20 hover:bg-white/30 rounded"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Page content */}
        <main className="flex-1 overflow-auto bg-academic-50 dark:bg-[var(--bg-color)]">
          <div className="w-full max-w-7xl mx-auto p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
