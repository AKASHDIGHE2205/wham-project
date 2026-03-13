import { BookUserIcon, CalendarDays, GraduationCap, Home, Layers3, LayoutDashboard, ListChecks, LogOutIcon, MessageCircleQuestionIcon, School, Settings, University, User, UserCheck, Users, UsersRound, Workflow } from "lucide-react";
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
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

const Navbar = () => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleDropdownToggle = (item: string) => {
    setActiveDropdown(activeDropdown === item ? null : item);
  };

  const handleMobileLinkClick = () => {
    setIsMobileMenuOpen(false);
    setActiveDropdown(null);
  };

  const closeAllMenus = () => {
    setActiveDropdown(null);
    setIsMobileMenuOpen(false);
  };

  const user = getUserFromStorage();

  // Helper function to check role access
  const hasAccess = (allowedRoles?: string[]): boolean => {
    if (!allowedRoles || allowedRoles.length === 0) return true;
    return allowedRoles.some(role => user?.role === role);
  };

  const navItems: NavItem[] = [
    {
      type: 'link',
      label: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
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
    // {
    //   type: 'link',
    //   label: 'Library',
    //   path: '/library',
    //   icon: BookOpen,
    //   roles: ['Master', 'Admin', 'Manager', 'User']
    // },
    // {
    //   type: 'dropdown',
    //   label: 'Reports & Analytics',
    //   icon: BarChart3,
    //   key: 'Reports',
    //   roles: ['Master', 'Admin', 'Manager'],
    //   items: [
    //     {
    //       label: 'Report 1',
    //       path: '/report/report1',
    //       icon: FileText,
    //       roles: ['Master', 'Admin']
    //     },
    //     {
    //       label: 'Report 2',
    //       path: '/report/report2',
    //       icon: FileBarChart2,
    //       roles: ['Master', 'Manager']
    //     }
    //   ]
    // },
    // {
    //   type: 'dropdown',
    //   label: 'Help',
    //   icon: LifeBuoy,
    //   key: 'Help',
    //   roles: ['Master', 'Admin', 'Manager', 'User'],
    //   items: [
    //     { label: 'Help', path: '/help/faq', icon: LifeBuoy, roles: ['Master', 'Admin'] },
    //     { label: 'FAQs', path: '/help/help', icon: HelpCircle, roles: ['Master', 'Admin'] },
    //     { label: 'Contact Manager', path: '/help/contact', icon: Contact, roles: ['Master', 'Admin'] }
    //   ]
    // }
  ];

  // Filter main items based on user role
  const getVisibleItems = (): NavItem[] => {
    return navItems.filter(item => hasAccess(item.roles));
  };

  const renderDesktopNav = () => {
    return getVisibleItems().map((item) => {
      if (item?.type === 'link') {
        return (
          <div key={item?.label} className="border-b border-gray-100">
            <NavLink
              to={item?.path}
              className={({ isActive }) =>
                `flex items-center text-sm space-x-1 px-1 py-1 transition-colors duration-200
                ${isActive ? 'bg-orange-100 text-orange-600' : 'text-gray-700 hover:bg-purple-50 hover:text-purple-600'}`
              }
            >
              <item.icon size={16} />
              <span>{item?.label}</span>
            </NavLink>
          </div>
        );
      }

      if (item?.type === 'dropdown') {
        // Filter sub-items based on role
        const visibleSubItems = item.items.filter(subItem => hasAccess(subItem.roles));

        // Don't render dropdown if no sub-items are visible
        if (visibleSubItems.length === 0) return null;

        return (
          <div key={item?.label} className="relative">
            <button
              onClick={() => handleDropdownToggle(item?.key)}
              className={`flex items-center text-sm px-1 py-2 gap-1 rounded-lg transition-all duration-200 cursor-pointer 
                ${activeDropdown === item?.key
                  ? 'bg-orange-50 text-orange-600 border border-orange-200'
                  : 'text-gray-700 hover:bg-purple-50 hover:text-purple-600'
                }`}
            >
              <item.icon size={16} />
              <span>{item?.label}</span>
              <svg
                className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === item?.key ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {activeDropdown === item?.key && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50">
                {visibleSubItems.map((subItem) => (
                  <NavLink
                    key={subItem?.path}
                    to={subItem?.path}
                    className={({ isActive }) =>
                      `flex items-center text-sm space-x-3 px-2 py-2 transition-colors duration-200 border-b border-gray-100 last:border-b-0
                      ${isActive ? 'bg-orange-100 text-orange-600 font-medium' : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600'}`
                    }
                    onClick={closeAllMenus}
                  >
                    <subItem.icon size={16} />
                    <span>{subItem?.label}</span>
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        );
      }
      return null;
    });
  };

  const renderMobileNav = () => {
    return getVisibleItems().map((item) => {
      if (item?.type === 'link') {
        return (
          <div key={item?.label} className="border-b border-gray-100 pb-2">
            <NavLink
              to={item?.path}
              className={({ isActive }) =>
                `flex items-center text-sm space-x-3 px-2 py-1 gap-2 transition-colors duration-200
              ${isActive ? 'bg-orange-100 text-orange-600' : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600'}`
              }
              onClick={handleMobileLinkClick}
            >
              <span className='font-medium flex justify-center items-center gap-2'>
                <item.icon size={16} />
                {item?.label}
              </span>
            </NavLink>
          </div>
        );
      }

      if (item?.type === 'dropdown') {
        // Filter sub-items based on role
        const visibleSubItems = item.items.filter(subItem => hasAccess(subItem.roles));

        // Don't render dropdown if no sub-items are visible
        if (visibleSubItems.length === 0) return null;

        const mobileKey = `mobile-${item?.key}`;
        return (
          <div key={item?.label} className="border-b border-gray-100 pb-2">
            <button
              onClick={() => handleDropdownToggle(mobileKey)}
              className={`flex justify-between w-full items-center space-x-1 px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer 
                ${activeDropdown === mobileKey
                  ? 'bg-orange-50 text-orange-600 border border-orange-200'
                  : 'text-gray-700 hover:bg-purple-50 hover:text-purple-600'
                }`}
            >
              <div className='flex justify-center items-center gap-2'>
                <item.icon size={16} />
                {item?.label}
              </div>
              <svg
                className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === mobileKey ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {activeDropdown === mobileKey && (
              <div className="mt-2 ml-4 space-y-1">
                {visibleSubItems.map((subItem) => (
                  <NavLink
                    key={subItem?.path}
                    to={subItem?.path}
                    className={({ isActive }) =>
                      `flex items-center text-sm space-x-3 pl-6 px-2 py-3 border-b border-gray-200 gap-2 transition-colors duration-200 last:border-b-0
                      ${isActive ? 'bg-orange-100 text-orange-600' : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600'}`
                    }
                    onClick={handleMobileLinkClick}
                  >
                    <subItem.icon size={16} />
                    {subItem?.label}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        );
      }
      return null;
    });
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-full mx-auto px-2 sm:px-4 lg:px-6">
        {/* Dashboard Menu */}
        <div className="flex justify-between flex-row items-center h-16">

          {/* Logo */}
          <div className="shrink-0 items-center block sm:hidden">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-linear-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <span className="text-xl font-bold bg-linear-to-r from-orange-600 to-purple-600 bg-clip-text text-transparent">
                EventTracker
              </span>
            </Link>
          </div>

          {/* Desktop Navigation - Middle */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Home Desktop (hidden) */}
            <div className="border-b border-gray-100 hidden">
              <NavLink
                to={'/'}
                className={({ isActive }) =>
                  `flex items-center text-sm space-x-3 px-2 py-1 gap-2 transition-colors duration-200
                  ${isActive
                    ? 'bg-orange-100 text-orange-600'
                    : 'text-gray-700 hover:bg-purple-50 hover:text-purple-600'}`
                }
              >
                <Home size={16} />
                <span>Home</span>
              </NavLink>
            </div>

            {/* Dynamic Desktop Navigation */}
            {renderDesktopNav()}
          </div>

          {/* User Profile - Right */}
          <div className="flex flex-row items-center space-x-1">

            {/* Desktop User Menu */}
            <div className="relative hidden md:block">
              <button
                onClick={() => handleDropdownToggle("user")}
                className="flex items-center gap-1 px-1 py-1 rounded-full hover:bg-purple-50 transition cursor-pointer text-gray-700 hover:text-purple-600"
              >
                {/* Avatar */}
                <div>
                  {user?.photo && !imgError ? (
                    <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-md">
                      <img
                        src={`${MEDIA_URL}${user?.photo}`}
                        alt={user?.photo || "User"}
                        className=" rounded-full"
                        onError={() => setImgError(true)}
                      />
                    </div>
                  ) : (
                    <div className="bg-linear-to-r from-indigo-600 to-purple-600 w-10 h-10 rounded-full flex items-center justify-center shadow-md">
                      <User className="text-white" />
                    </div>
                  )}
                </div>
                {/* Arrow */}
                <svg
                  className={`w-4 h-4 transition-transform ${activeDropdown === "user" ? "rotate-180" : ""
                    }`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path d="M19 9l-7 7-7-7" strokeWidth="2" />
                </svg>
              </button>

              {/* User Dropdown */}
              {activeDropdown === "user" && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                  <NavLink
                    to="/auth/profile"
                    className="flex items-center gap-2 px-4 py-2 hover:bg-orange-50"
                    onClick={() => setActiveDropdown(null)}
                  >
                    <User size={16} /> Profile
                  </NavLink>

                  <Link
                    to="/auth/log-out"
                    className="flex items-center gap-2 px-4 py-2 hover:bg-orange-50"
                    onClick={() => setActiveDropdown(null)}
                  >
                    <LogOutIcon size={16} /> Logout
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-purple-50 transition-colors duration-200 text-gray-600 hover:text-purple-600"
            >
              {!isMobileMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#EC5800" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-grip-icon lucide-grip"><circle cx="12" cy="5" r="1" /><circle cx="19" cy="5" r="1" /><circle cx="5" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /><circle cx="12" cy="19" r="1" /><circle cx="19" cy="19" r="1" /><circle cx="5" cy="19" r="1" /></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#EC5800" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x-icon lucide-x"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 py-4 bg-white relative z-50">
            {/* Navigation Items with Scroll */}
            <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
              {/* Home Mobile */}
              <div className="border-b border-gray-100 pb-2">
                <NavLink
                  to={'/'}
                  className={({ isActive }) =>
                    `flex items-center text-sm space-x-3 px-2 py-1 gap-2 transition-colors duration-200
                    ${isActive
                      ? 'bg-orange-100 text-orange-600'
                      : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600'}`
                  }
                  onClick={handleMobileLinkClick}
                >
                  <span className='font-medium flex justify-center items-center gap-2'>
                    <Home size={16} />
                    Home
                  </span>
                </NavLink>
              </div>

              {/* Dynamic Mobile Navigation */}
              {renderMobileNav()}
            </div>

            {/* Mobile User Menu - Fixed at bottom */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <button
                onClick={() =>
                  setActiveDropdown(
                    activeDropdown === "mobile-user" ? null : "mobile-user"
                  )
                }
                className="w-full flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-colors duration-200"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-12 h-12 bg-linear-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                    {user?.photo && !imgError ? (
                      <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-md">
                        <img
                          src={`${MEDIA_URL}${user?.photo}`}
                          alt={user?.photo || "User"}
                          className=" rounded-full"
                          onError={() => setImgError(true)}
                        />
                      </div>
                    ) : (
                      <div className="bg-linear-to-r from-indigo-600 to-purple-600 w-10 h-10 rounded-full flex items-center justify-center shadow-md">
                        <User className="text-white" />
                      </div>
                    )}
                  </div>
                  <span className="font-medium text-orange-600">
                    Welcome, {user?.firstName} {user?.lastName}!
                  </span>
                </div>

                <svg
                  className={`w-4 h-4 transition-transform duration-200 
                            ${activeDropdown === "mobile-user" ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {activeDropdown === "mobile-user" && (
                <div className="mt-3 ml-4 space-y-1">
                  <div className="px-4 py-2" hidden>
                    <p className="text-sm font-semibold text-gray-900">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-gray-500">
                      Logged in using <span className="text-orange-500">{user?.email}</span>
                    </p>
                  </div>

                  <NavLink
                    to="/auth/profile"
                    className={({ isActive }) =>
                      `flex items-center text-sm space-x-3 px-2 py-2 gap-2 transition-colors duration-200
                      ${isActive
                        ? 'bg-orange-100 text-orange-600'
                        : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600'}`
                    }
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setActiveDropdown(null);
                    }}
                  >
                    <User size={16} />
                    Profile
                  </NavLink>
                  <Link
                    to="/auth/log-out"
                    className="flex items-center text-sm space-x-3 px-2 py-2 gap-2 transition-colors duration-200 text-gray-600 hover:bg-orange-50 hover:text-orange-600 rounded-lg"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setActiveDropdown(null);
                    }}
                  >
                    <LogOutIcon size={16} />
                    Logout
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {activeDropdown && !isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={closeAllMenus}
        />
      )}

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-blue-200/30 backdrop-blur-sm z-40"
          style={{ top: '64px' }}
          onClick={closeAllMenus}
        />
      )}
    </nav>
  );
};

export default Navbar;