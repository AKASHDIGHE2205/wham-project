import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Calendar, CheckSquare, Layers, LogOutIcon, User, Users } from "lucide-react";
import { getUserFromStorage } from '../helper/cryptoUser';

const Navbar = () => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  return (
    <nav className="bg-white shadow-lg border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/*Dashboad Menu */}
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <div className="shrink-0 items-center block sm:hidden">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-linear-to-r from-orange-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <span className="text-xl font-bold bg-linear-to-r from-orange-600 to-purple-600 bg-clip-text text-transparent">
                EventTracker
              </span>
            </Link>
          </div>

          {/* Desktop Navigation - Middle */}
          <div className="hidden md:flex items-center space-x-4">

            {/* Home Mobile */}
            <div className="border-b border-gray-100">
              <Link
                to={'/'}
                className="flex items-center justify-between w-full px-4 py-3 text-left text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-colors duration-200"
              >
                Home
              </Link>
            </div>

            {/* Dashboard Mobile */}
            <div className="border-b border-gray-100">
              <Link
                to={'/dashboard'}
                className="flex items-center justify-between w-full px-4 py-3 text-left text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-colors duration-200"
              >
                Dashboard
              </Link>
            </div>

            {/* Master Dropdown */}
            {(user?.role === 'Master' || user?.role === 'Admin' || user?.role === 'Manager') && (
              <div className="relative">
                <button
                  onClick={() => handleDropdownToggle('Master')}
                  className={`flex items-center space-x-1 px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer ${activeDropdown === 'Master'
                    ? 'bg-orange-50 text-orange-600 border border-orange-200'
                    : 'text-gray-700 hover:bg-purple-50 hover:text-purple-600'
                    }`}
                >
                  Master
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === 'Master' ? 'rotate-180' : ''
                      }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {activeDropdown === 'Master' && (
                  <div className="absolute top-full left-0 mt-2 w-40 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">

                    <NavLink
                      to="/master/team-view"
                      className={({ isActive }) =>
                        `flex items-center space-x-3 px-2 py-1 gap-2 transition-colors duration-200
     ${isActive
                          ? 'bg-orange-100 text-orange-600 font-medium'
                          : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600'}`
                      }
                      onClick={closeAllMenus}
                    >
                      <User size={16} />
                      Team
                    </NavLink>

                    <NavLink
                      to="/master/view-members"
                      className={({ isActive }) =>
                        `flex items-center space-x-3 px-2 py-1 gap-2 transition-colors duration-200
     ${isActive
                          ? 'bg-orange-100 text-orange-600 font-medium'
                          : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600'}`
                      }
                      onClick={closeAllMenus}
                    >
                      <User size={16} />
                      Member
                    </NavLink>

                    <NavLink
                      to="/master/view-steps"
                      className={({ isActive }) =>
                        `flex items-center space-x-3 px-2 py-1 gap-2 transition-colors duration-200
     ${isActive
                          ? 'bg-orange-100 text-orange-600 font-medium'
                          : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600'}`
                      }
                      onClick={closeAllMenus}
                    >
                      <Layers size={16} />
                      Steps
                    </NavLink>

                    <NavLink
                      to="/master/view-tasks"
                      className={({ isActive }) =>
                        `flex items-center space-x-3 px-2 py-1 gap-2 transition-colors duration-200
     ${isActive
                          ? 'bg-orange-100 text-orange-600 font-medium'
                          : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600'}`
                      }
                      onClick={closeAllMenus}
                    >
                      <CheckSquare size={16} />
                      Tasks
                    </NavLink>

                  </div>
                )}
              </div>
            )}

            {/* Calender Mobile */}
            <div className="border-b border-gray-100">
              <Link
                to={'/calender'}
                className="flex items-center justify-between w-full px-4 py-3 text-left text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-colors duration-200"
              >
                Calender
              </Link>
            </div>

            {/* Transaction Dropdown */}
            <div className="relative hidden">
              <button
                onClick={() => handleDropdownToggle('Transaction')}
                className={`flex items-center space-x-1 px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer ${activeDropdown === 'Transaction'
                  ? 'bg-orange-50 text-orange-600 border border-orange-200'
                  : 'text-gray-700 hover:bg-purple-50 hover:text-purple-600'
                  }`}
              >
                Transaction
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === 'Transaction' ? 'rotate-180' : ''
                    }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                {activeDropdown === 'Transaction' && (
                  <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                    <Link
                      to="/calender"
                      className="flex items-center space-x-3 px-2 py-1 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors duration-200 group gap-2"
                      onClick={closeAllMenus}
                    >
                      <Calendar size={16} />
                      Calendar
                    </Link>
                  </div>
                )}
              </button>
            </div>

            {/* Reports Dropdown */}
            <div className="relative ">
              <button
                onClick={() => handleDropdownToggle('Reports')}
                className={`flex items-center space-x-1 px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer ${activeDropdown === 'Reports'
                  ? 'bg-orange-50 text-orange-600 border border-orange-200'
                  : 'text-gray-700 hover:bg-purple-50 hover:text-purple-600'
                  }`}
              >
                Reports
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === 'Reports' ? 'rotate-180' : ''
                    }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                {activeDropdown === 'Reports' && (
                  <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                    <NavLink
                      to="report/report1"
                      className={({ isActive }) =>
                        `flex items-center space-x-3 px-2 py-1 gap-2 transition-colors duration-200
     ${isActive
                          ? 'bg-orange-100 text-orange-600 font-medium'
                          : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600'}`
                      }
                      onClick={closeAllMenus}
                    >
                      <span className="text-lg">📅</span>
                      <span className="font-medium group-hover:translate-x-1 transition-transform duration-200">
                        Report 1
                      </span>
                    </NavLink>
                  </div>
                )}
              </button>

            </div>

          </div>

          {/* User Profile - Right */}
          <div className="flex items-center space-x-4">

            {/* Desktop User Menu */}
            <div className="hidden md:block relative">
              <button
                onClick={() => handleDropdownToggle('user')}
                className="flex items-center space-x-2 p-1 rounded-full hover:bg-purple-50 transition-colors duration-200 cursor-pointer"
              >
                <div className="w-8 h-8 bg-linear-to-r from-orange-400 to-purple-500 rounded-full flex items-center justify-center shadow-md">
                  {user?.firstName ? (
                    <span className="text-white text-sm font-semibold">
                      {(user?.firstName?.[0] || '').toUpperCase()}
                      {(user?.lastName?.[0] || '').toUpperCase()}
                    </span>
                  ) : (
                    <User className="text-white w-4 h-4" />
                  )}
                </div>

                <svg
                  className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${activeDropdown === 'user' ? 'rotate-180' : ''
                    }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* User Dropdown Menu */}
              {activeDropdown === 'user' && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                  <div className="px-4 py-1 border-b border-gray-100">
                    <p className="text-sm font-semibold text-orange-600">{user?.firstName} {' '} {user?.lastName}</p>
                    <p className="text-sm text-gray-600 hover:text-gray-700 ">{user?.email}</p>
                  </div>
                  <Link
                    to="/auth/profile"
                    className="flex items-center space-x-3 px-4 py-2 text-gray-600 hover:bg-orange-50 hover:text-orange-600 rounded-lg gap-2"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setActiveDropdown(null);
                    }}
                  >
                    <User size={16} />
                    Profile
                  </Link>
                  <Link
                    to="/auth/log-out"
                    className="flex items-center space-x-3 px-4 py-2 text-gray-600 hover:bg-orange-50 hover:text-orange-600 rounded-lg gap-2"
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
            <div className="space-y-2 max-h-[70vh] overflow-y-auto">

              {/* Home Mobile */}
              <div className="border-b border-gray-100 pb-2">
                <Link
                  to={'/'}
                  className="flex items-center w-full px-4 py-3 text-left text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded-lg
                  transition-colors duration-200"
                  onClick={handleMobileLinkClick}
                >
                  Home
                </Link>
              </div>

              {/* Dashboard Mobile */}
              <div className="border-b border-gray-100 pb-2">
                <Link
                  to={'/dashboard'}
                  className="flex items-center w-full px-4 py-3 text-left text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded-lg
                  transition-colors duration-200"
                  onClick={handleMobileLinkClick}
                >
                  Dashboard
                </Link>
              </div>

              {/* Master Mobile */}
              {(user?.role === 'Master' || user?.role === 'Admin' || user?.role === 'Manager') && (
                <div className="border-b border-gray-100 pb-2">
                  <button
                    onClick={() => handleDropdownToggle('mobile-Master')}
                    className="flex items-center justify-between w-full px-4 py-3 text-left text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-colors duration-200"
                  >
                    Master
                    <svg
                      className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === 'mobile-Master' ? 'rotate-180' : ''
                        }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {activeDropdown === 'mobile-Master' && (
                    <div className="mt-2 ml-4 space-y-1">
                      <Link
                        to="/master/team-view"
                        className="flex items-center space-x-3 px-4 py-2 text-gray-600 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors duration-200 gap-2"
                        onClick={handleMobileLinkClick}
                      >
                        <Users size={16} />
                        Team
                      </Link>
                      <Link
                        to="/master/view-members"
                        className="flex items-center space-x-3 px-4 py-2 text-gray-600 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors duration-200 gap-2"
                        onClick={handleMobileLinkClick}
                      >
                        <User size={16} />
                        Member
                      </Link>
                      <Link
                        to="/master/view-steps"
                        className="flex items-center space-x-3 px-4 py-2 text-gray-600 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors duration-200 gap-2"
                        onClick={handleMobileLinkClick}
                      >
                        <Layers size={16} />
                        Steps
                      </Link>
                      <Link
                        to="/master/view-tasks"
                        className="flex items-center space-x-3 px-4 py-2 text-gray-600 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors duration-200 gap-2"
                        onClick={handleMobileLinkClick}
                      >
                        <CheckSquare size={16} />
                        Task
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Calender Mobile */}
              <div className="border-b border-gray-100 pb-2">
                <Link
                  to={'/calender'}
                  className="flex items-center w-full px-4 py-3 text-left text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded-lg
                  transition-colors duration-200"
                  onClick={handleMobileLinkClick}
                >
                  Calender
                </Link>
              </div>

              {/* Transaction Mobile */}
              <div className="border-b border-gray-100 pb-2 hidden">
                <button
                  onClick={() => handleDropdownToggle('mobile-Transaction')}
                  className="flex items-center justify-between w-full px-4 py-3 text-left text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-colors duration-200"
                >
                  <span className="font-medium">Transaction</span>
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === 'mobile-Transaction' ? 'rotate-180' : ''
                      }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {activeDropdown === 'mobile-Transaction' && (
                  <div className="mt-2 ml-4 space-y-1">
                    <Link
                      to="/calender"
                      className="flex items-center space-x-3 px-4 py-2 text-gray-600 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors duration-200"
                      onClick={handleMobileLinkClick}
                    >
                      <span>📅</span>
                      <span>Calendar</span>
                    </Link>
                  </div>
                )}
              </div>

              {/* Reports Mobile */}
              <div className="border-b border-gray-100 pb-2 ">
                <button
                  onClick={() => handleDropdownToggle('mobile-Reports')}
                  className="flex items-center justify-between w-full px-4 py-3 text-left text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-colors duration-200"
                >
                  <span className="font-medium">Reports</span>
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === 'mobile-Reports' ? 'rotate-180' : ''
                      }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {activeDropdown === 'mobile-Reports' && (
                  <div className="mt-2 ml-4 space-y-1">
                    <Link
                      to="/report/report1"
                      className="flex items-center space-x-3 px-4 py-2 text-gray-600 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors duration-200"
                      onClick={handleMobileLinkClick}
                    >
                      <span>📅</span>
                      <span>Report 1</span>
                    </Link>
                  </div>
                )}
              </div>
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
                  <div className="w-8 h-8 bg-linear-to-r from-orange-400 to-purple-500 rounded-full flex items-center justify-center shadow-md">
                    {user?.firstName ? (
                      <span className="text-white text-sm font-semibold">
                        {(user?.firstName?.[0] || '').toUpperCase()}
                        {(user?.lastName?.[0] || '').toUpperCase()}
                      </span>
                    ) : (
                      <User className="text-white w-4 h-4" />
                    )}
                  </div>
                  <span className="font-medium text-gray-700">
                    {user?.firstName} {user?.lastName}
                  </span>
                </div>

                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === "mobile-user" ? "rotate-180" : ""
                    }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {activeDropdown === "mobile-user" && (
                <div className="mt-3 ml-4 space-y-1">
                  <div className="px-4 py-2">
                    <p className="text-sm font-semibold text-gray-900">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                  </div>

                  <Link
                    to="/auth/profile"
                    className="flex items-center space-x-3 px-4 py-2 text-gray-600 hover:bg-orange-50 hover:text-orange-600 rounded-lg"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setActiveDropdown(null);
                    }}
                  >
                    <User size={16} />
                    Profile
                  </Link>
                  <Link
                    to="/auth/log-out"
                    className="flex items-center space-x-3 px-4 py-2 text-gray-600 hover:bg-orange-50 hover:text-orange-600 rounded-lg"
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