import { BookUserIcon, CalendarDays, ChartNoAxesCombined, ChevronDown, GraduationCap, ImagesIcon, Layers3, ListChecks, LogOutIcon, MessageCircleQuestionIcon, School, Settings, University, User, UserCheck, Users, UsersRound, Workflow, X } from "lucide-react";
import { AnimatePresence, motion } from 'motion/react';
import React, { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { MEDIA_URL } from "../constant/Baseurl";
import { getUserFromStorage } from "../helper/cryptoUser";

export interface Team {
  id: number;
  name: string;
}

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
    label: 'Dashboard',
    path: '/dashboard',
    icon: ChartNoAxesCombined,
    roles: ['Master', 'Admin', 'Manager', 'User']
  },
  {
    type: 'link',
    label: 'Calendar',
    path: '/calender',
    icon: CalendarDays,
    roles: ['Master', 'Admin', 'Manager', 'User']
  },
  {
    type: 'link',
    label: 'My Profile',
    path: '/auth/profile',
    icon: User,
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
      { label: 'Faq', path: '/master/view-faq', icon: MessageCircleQuestionIcon, roles: ['Master'] }
    ]
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
  {
    type: 'link',
    label: 'Library',
    path: '/library',
    icon: ImagesIcon,
    roles: ['Master', 'Admin', 'Manager', 'User']
  },
];

interface SidebarProps {
  onCloseMobile?: () => void;
}

const Sidebar = ({ onCloseMobile }: SidebarProps) => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
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

  useEffect(() => {
    setActiveDropdown(null);
  }, [location.pathname]);

  const handleLinkClick = () => {
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const renderSidebarNavItem = (item: NavItem) => {
    if (item.type === 'link') {
      return (
        <NavLink
          key={item.label}
          to={item.path}
          onClick={handleLinkClick}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4531ff] ${isActive
              ? 'bg-indigo-50 text-[#1100ff]' : 'text-slate-900 hover:bg-slate-50 hover:text-slate-900'}`}
        >
          <item.icon className={`w-5 h-5 ${location.pathname === item.path ? 'text-[#1900ff]' : 'text-slate-400'}`} />
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
        <div key={item.label} className="space-y-1">
          <button
            onClick={() => setActiveDropdown(isOpen ? null : item.key)}
            aria-expanded={isOpen}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4531ff] ${isOpen || isActiveChild
              ? 'bg-slate-50 text-slate-900' : 'text-slate-900 hover:bg-slate-50 hover:text-slate-900'}`}
          >
            <div className="flex items-center gap-3">
              <item.icon className={`w-5 h-5 ${isActiveChild ? 'text-[#1900ff]' : 'text-slate-400'}`} />
              <span>{item.label}</span>
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
                      onClick={handleLinkClick}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4531ff] ${isActive ? 'bg-indigo-50 text-[#1600e0] font-medium' : 'text-slate-800 hover:bg-slate-50 hover:text-slate-900'}`}
                    >
                      <subItem.icon
                        className={`w-4 h-4 ${location.pathname.startsWith(subItem.path) ? 'text-[#1900ff]' : 'text-slate-900'}`} />
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

  const renderUserProfile = () => {
    return (
      <div className="border-t border-gray-100 pt-4 px-3 mb-22 sm:pb-4">

        {/* Top Row */}
        <div className="flex items-center gap-3">

          {/* Avatar */}
          {user?.photo && !imgError ? (
            <img
              src={`${MEDIA_URL}${user.photo}`}
              alt={user.firstName || 'User'}
              className="w-10 h-10 rounded-full object-cover border border-slate-200"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-linear-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white text-sm font-semibold shadow-sm">
              {user?.firstName?.[0] || ''} {user?.lastName?.[0] || ''}
              {(!user?.firstName && !user?.lastName) && (<User className="w-5 h-5" />)}
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

          {/* Role Badge */}
          <div
            className="shrink-0 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-[#1700e9] uppercase"
          >
            {user?.role === 'User' ? 'Student' : user?.role}
          </div>
        </div>

        <div className="mt-3">
          <Link
            to="/auth/log-out"
            onClick={handleLinkClick}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          >
            <LogOutIcon className="w-5 h-5 text-red-500" />
            Sign out
          </Link>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white shadow-lg h-full w-70 transition-all duration-300 flex flex-col border-r border-gray-200 relative">
      <div className="lg:hidden absolute top-4 right-4">
        <button
          onClick={onCloseMobile}
          className="p-2 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900"
        >
          <X className="w-5 h-5 text-[#3822ff]" />
        </button>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <Link
          to={"/"}
          className="flex items-center space-x-2 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4531ff] rounded-lg"
          onClick={handleLinkClick}
        >
          <div className="w-8 h-8 bg-linear-to-br from-[#5b49ff] to-[#3f2afc] rounded-lg flex items-center justify-center shadow-lg group-hover:shadow transition-all">
            <span className="text-white font-bold text-sm">W</span>
          </div>
          <span className="text-xl font-bold text-gray-900">
            WHam SAP
          </span>
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-4 px-3">
        {user?.role === "Master" || user?.role === "Admin" || user?.role === "Manager" || user?.role === "User" ? (
          <div className="space-y-1">
            {getVisibleItems().map(item => renderSidebarNavItem(item))}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-20 h-20 bg-linear-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-user-lock-icon lucide-user-lock"
              >
                <circle cx="10" cy="7" r="4" />
                <path d="M10.3 15H7a4 4 0 0 0-4 4v2" />
                <path d="M15 15.5V14a2 2 0 0 1 4 0v1.5" />
                <rect width="8" height="5" x="13" y="16" rx=".899" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Access Restricted
            </h3>
            <p className="text-red-600 text-sm mb-4 max-w-xs">
              You don't have permission to view navigation. Please contact your
              administrator for access.
            </p>
          </div>
        )}
      </div>
      {/* User Profile Section */}
      {user && (user?.role === "Master" || user?.role === "Admin" || user?.role === "Manager" || user?.role === "User") && (
        <div className="px-3 pb-4 sm:hidden block border-t border-gray-100">
          {renderUserProfile()}
        </div>
      )}
    </div>
  );
};

export default Sidebar;