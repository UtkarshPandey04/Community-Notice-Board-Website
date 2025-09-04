import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { LogOut, User, Shield, Menu } from 'lucide-react';
import Sidebar from './Sidebar';

export default function Header() {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { id: '', label: 'Home' },
    { id: 'announcements', label: 'Announcements' },
    { id: 'events', label: 'Events' },
    { id: 'marketplace', label: 'Marketplace' },
    { id: 'contacts', label: 'Contacts' },
    { id: 'posts', label: 'Posts' },
  ];

  if (user?.role === 'admin') {
    navItems.push({ id: 'admin', label: 'Admin' });
  }

  return (
    <header className="bg-white shadow-sm border-b fixed top-0 w-full z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-blue-600">
              <NavLink
                to="/"
                className="hover:text-blue-700 transition-colors"
                aria-label="Community Board Home"
              >
                Community Board
              </NavLink>
            </h1>
          </div>

          <nav className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => (
              <NavLink
                key={item.id}
                to={`/${item.id}`}
                className={({ isActive }) =>
                  `px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {item.label}
                    <span className="sr-only">{isActive ? ' (current page)' : ''}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center space-x-3">
            {user ? (
              <>
                <div className="hidden sm:flex items-center space-x-2 text-sm bg-gray-50 px-3 py-1 rounded-full">
                  {user.role === 'admin' ? (
                    <Shield className="h-4 w-4 text-blue-600" aria-hidden="true" />
                  ) : (
                    <User className="h-4 w-4 text-gray-600" aria-hidden="true" />
                  )}
                  <span className="text-gray-700 font-medium">
                    {user.firstName} {user.lastName}
                  </span>
                  <span className="text-xs text-gray-500 bg-blue-100 px-2 py-0.5 rounded-full">
                    {user.role}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                  className="hidden sm:flex items-center"
                  aria-label="Logout"
                >
                  <LogOut className="h-4 w-4 mr-2" aria-hidden="true" />
                  Logout
                </Button>
              </>
            ) : (
              <div className="flex gap-2">
                <NavLink to="/login">
                  <Button className="hidden sm:flex">Login</Button>
                </NavLink>
                <NavLink to="/signup">
                  <Button className="sm:flex">Sign Up</Button>
                </NavLink>
              </div>
            )}
            <div className="md:hidden">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsSidebarOpen(true)}
                aria-label="Open navigation menu"
                className="h-10 w-10"
              >
                <Menu className="h-5 w-5" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Sidebar isOpen={isSidebarOpen} onOpenChange={setIsSidebarOpen} navItems={navItems} />
    </header>
  );
}