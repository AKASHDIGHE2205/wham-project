import { BookUserIcon, CalendarDays, ChartNoAxesCombined, ChevronDown, GraduationCap, Grip, Home, Layers3, ListChecks, LogOutIcon, MessageCircleQuestionIcon, School, Settings, University, User, UserCheck, Users, UsersRound, Workflow, X } from "lucide-react";
import { AnimatePresence, motion } from 'motion/react';
import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { MEDIA_URL } from "../constant/Baseurl";
import { getUserFromStorage } from '../helper/cryptoUser';

interface NavLinkItem {
  type: 'link';
  label: string;
  path: string;
  icon: React.ElementType;
  roles: string[];
}

interface NavDropdownItem {
  type: 'dropdown';
  label: string;
  icon: React.ElementType;
  key: string;
  roles: string[];
  items: Array<{
    label: string;
    path: string;
    icon: React.ElementType;
    roles?: string[];
  }>;
}

type NavItem = NavLinkItem | NavDropdownItem;

const navItems: NavItem[] = [
  {
    type: 'link',
    label: 'Home',
    path: '/',
    icon: Home,
    roles: ['Master', 'Admin', 'Manager', 'User']
  },
  {
    type: 'link',
    label: 'Dashboard',
    path: '/dashboard',
    icon: ChartNoAxesCombined,
    roles: ['Master', 'Admin', 'Manager', 'User']
  },
  {
    type: 'dropdown',
    label: 'University Management',
    icon: GraduationCap,
    key: 'University',
    roles: ['Master', 'Manager'],
    items: [
      { label: 'University', path: '/master/view-universities', icon: University, roles: ['Master', 'Manager'] },
      { label: 'College', path: '/master/view-colleges', icon: School, roles: ['Master', 'Manager'] },
      { label: 'Department', path: '/master/view-departments', icon: Layers3, roles: ['Master', 'Manager'] }
    ]
  },
  {
    type: 'dropdown',
    label: 'Master',
    icon: Settings,
    key: 'Master',
    roles: ['Master', 'Admin', 'Manager'],
    items: [
      { label: 'Users', path: '/master/users-view', icon: Users, roles: ['Master', 'Admin', 'Manager'] },
      { label: 'Member', path: '/master/view-members', icon: UserCheck, roles: ['Master', 'Admin', 'Manager'] },
      { label: 'Team', path: '/master/team-view', icon: UsersRound, roles: ['Master', 'Admin', 'Manager'] },
      { label: 'Steps', path: '/master/view-steps', icon: Workflow, roles: ['Master', 'Admin', 'Manager'] },
      { label: 'Tasks', path: '/master/view-tasks', icon: ListChecks, roles: ['Master', 'Admin', 'Manager'] },
      { label: 'Faq', path: '/master/view-faq', icon: MessageCircleQuestionIcon, roles: ['Master', 'Admin', 'Manager'] }
    ]
  },
  {
    type: 'link',
    label: 'Calendar',
    path: '/calender',
    icon: CalendarDays,
    roles: ['Master', 'Admin', 'Manager', 'User']
  },
  {
    type: 'dropdown',
    label: 'Trainings',
    icon: GraduationCap,
    key: 'Training',
    roles: ['Master', 'Admin', 'Manager', 'User'],
    items: [
      { label: 'Training Management', path: '/trainings/manage', icon: Settings, roles: ['Master', 'Admin', 'Manager'] },
      { label: 'My Trainings', path: '/my-trainings', icon: BookUserIcon, roles: ['Master', 'Admin', 'Manager', 'User'] },
    ]
  },
];

const Navbar = () => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const location = useLocation();

  const user = getUserFromStorage();

  const hasAccess = (allowedRoles?: string[]): boolean => {
    if (!allowedRoles || allowedRoles.length === 0) return true;
    return allowedRoles.some(role => user?.role === role);
  };

  const getVisibleItems = (): NavItem[] => {
    return navItems.filter(item => hasAccess(item.roles));
  };

  // Close dropdowns on route change
  useEffect(() => {
    setActiveDropdown(null);
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.nav-dropdown-container')) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const renderDesktopNavItem = (item: NavItem) => {
    if (item.type === 'link') {
      return (
        <NavLink
          key={item.label}
          to={item.path}
          className={({ isActive }) =>
            `flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${isActive
              ? 'bg-slate-100 text-slate-900'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`
          }
        >
          <item.icon className="w-4 h-4" />
          <span>{item.label}</span>
        </NavLink>
      );
    }

    if (item.type === 'dropdown') {
      const visibleItems = item.items.filter(sub => hasAccess(sub.roles));
      if (visibleItems.length === 0) return null;

      const isOpen = activeDropdown === item.key;
      const isActiveChild = visibleItems.some(sub => location.pathname.startsWith(sub.path));

      return (
        <div key={item.label} className="relative nav-dropdown-container">
          <button
            onClick={() => setActiveDropdown(isOpen ? null : item.key)}
            aria-expanded={isOpen}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${isOpen || isActiveChild
              ? 'bg-slate-100 text-slate-900'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
          >
            <item.icon className="w-4 h-4" />
            <span>{item.label}</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            />
          </button>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="absolute left-0 mt-2 w-56 rounded-xl bg-white shadow-lg ring-1 ring-slate-900/5 focus:outline-none z-50 overflow-hidden"
              >
                <div className="py-1">
                  {visibleItems.map((subItem) => (
                    <NavLink
                      key={subItem.path}
                      to={subItem.path}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-2.5 text-sm transition-colors focus:outline-none focus-visible:bg-slate-50 ${isActive
                          ? 'bg-indigo-50 text-indigo-700 font-medium'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`
                      }
                    >
                      <subItem.icon className={`w-4 h-4 ${location.pathname.startsWith(subItem.path) ? 'text-indigo-600' : 'text-slate-400'}`} />
                      {subItem.label}
                    </NavLink>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }
    return null;
  };

  const renderUserMenu = () => {
    const isOpen = activeDropdown === 'user';

    return (
      <div className="relative nav-dropdown-container">
        <button
          onClick={() => setActiveDropdown(isOpen ? null : 'user')}
          aria-expanded={isOpen}
          className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
        >
          {user?.photo && !imgError ? (
            <img
              src={`${MEDIA_URL}${user.photo}`}
              alt={user.firstName || 'User'}
              className="w-12 h-12 rounded-full object-cover border border-slate-200"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-linear-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white text-sm font-semibold shadow-sm">
              {user?.firstName?.[0] || ''}{user?.lastName?.[0] || ''}
              {(!user?.firstName && !user?.lastName) && <User className="w-4 h-4" />}
            </div>
          )}
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="absolute right-0 mt-2 w-64 rounded-xl bg-white shadow-lg ring-1 ring-slate-900/5 focus:outline-none z-50 overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-slate-500 truncate mt-0.5">
                  {user?.email}
                </p>
                <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                  {user?.role}
                </div>
              </div>
              <div className="py-1">
                <NavLink
                  to="/auth/profile"
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2 text-sm transition-colors focus:outline-none focus-visible:bg-slate-50 ${isActive ? 'bg-slate-50 text-indigo-600' : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                    }`
                  }
                >
                  <User className="w-4 h-4 text-slate-400" />
                  Your Profile
                </NavLink>
                <Link
                  to="/auth/log-out"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors focus:outline-none focus-visible:bg-red-50"
                >
                  <LogOutIcon className="w-4 h-4 text-red-500" />
                  Sign out
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const renderMobileNavItem = (item: NavItem) => {
    if (item.type === 'link') {
      return (
        <NavLink
          key={item.label}
          to={item.path}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${isActive
              ? 'bg-indigo-50 text-indigo-700'
              : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
            }`
          }
        >
          <item.icon className="w-5 h-5" />
          {item.label}
        </NavLink>
      );
    }

    if (item.type === 'dropdown') {
      const visibleItems = item.items.filter(sub => hasAccess(sub.roles));
      if (visibleItems.length === 0) return null;

      const isOpen = activeDropdown === `mobile-${item.key}`;

      return (
        <div key={item.label} className="space-y-1">
          <button
            onClick={() => setActiveDropdown(isOpen ? null : `mobile-${item.key}`)}
            aria-expanded={isOpen}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${isOpen
              ? 'bg-slate-50 text-slate-900'
              : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
              }`}
          >
            <div className="flex items-center gap-3">
              <item.icon className="w-5 h-5" />
              {item.label}
            </div>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            />
          </button>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="pl-11 pr-3 py-1 space-y-1">
                  {visibleItems.map(subItem => (
                    <NavLink
                      key={subItem.path}
                      to={subItem.path}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${isActive
                          ? 'bg-indigo-50 text-indigo-700 font-medium'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`
                      }
                    >
                      <subItem.icon className={`w-4 h-4 ${location.pathname.startsWith(subItem.path) ? 'text-indigo-600' : 'text-slate-400'}`} />
                      {subItem.label}
                    </NavLink>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }
    return null;
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center shrink-0 md:hidden">
            <Link
              to="/"
              className="flex items-center gap-2 group focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg"
            >
              <div className="w-8 h-8 bg-linear-to-tr from-indigo-600 to-violet-600 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow transition-all">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <span className="text-xl font-bold bg-linear-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                EventTracker
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-1 lg:space-x-2">
            {getVisibleItems().map(item => renderDesktopNavItem(item))}
          </div>

          {/* User Menu & Mobile Toggle */}
          <div className="flex items-center gap-2">
            <div className="hidden md:block">
              {renderUserMenu()}
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 transition-colors"
              aria-expanded={isMobileMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <X className="block w-6 h-6" aria-hidden="true" />
              ) : (
                <Grip className="block w-6 h-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-slate-100 bg-white overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1 max-h-[calc(100vh-4rem)] overflow-y-auto">
              {getVisibleItems().map(item => renderMobileNavItem(item))}

              {/* Mobile User Section */}
              <div className="pt-4 mt-4 border-t border-slate-100">
                <div className="flex items-center gap-3 px-3 mb-4">
                  {user?.photo && !imgError ? (
                    <img
                      src={`${MEDIA_URL}${user.photo}`}
                      alt={user.firstName || 'User'}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200"
                      onError={() => setImgError(true)}
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-linear-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                      {user?.firstName?.[0] || ''}{user?.lastName?.[0] || ''}
                      {(!user?.firstName && !user?.lastName) && <User className="w-5 h-5" />}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>
                <div className="space-y-1">
                  <NavLink
                    to="/auth/profile"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  >
                    <User className="w-5 h-5 text-slate-400" />
                    Your Profile
                  </NavLink>
                  <Link
                    to="/auth/log-out"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                  >
                    <LogOutIcon className="w-5 h-5 text-red-500" />
                    Sign out
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
