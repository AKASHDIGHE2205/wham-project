/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import CryptoJS from "crypto-js";
import { User } from "lucide-react";
import { secretKey } from '../constant/Baseurl';

const Navbar = () => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    {
      label: 'Master',
      dropdown: [
        { name: 'Calendar', icon: '📅', path: "/calender" },
        { name: 'Team', icon: '👥', path: "/master/team-view" },
        { name: 'Member', icon: '👥', path: "/master/view-members" },
      ]
    },
    {
      label: 'Transaction',
      dropdown: [
        // { name: 'Sales', icon: '💰', path: "/" },
        // { name: 'Purchases', icon: '🛒', path: "/" },
      ]
    },
    {
      label: 'Reports',
      dropdown: [
        // { name: 'Calender1', icon: '📊', path: '/' },
        // { name: 'Calender2', icon: '📦', path: '/' }
      ]
    }
  ];

  const userMenu = [
    { name: 'Profile', icon: '👤', path: '/auth/profile' },
    { name: 'Logout', icon: '🚪', path: '/log-out' }
  ];

  const handleDropdownToggle = (item: any) => {
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

  const decryptUser = (encrypted: string | null) => {
    if (!encrypted) return null;
    try {
      const bytes = CryptoJS.AES.decrypt(encrypted, secretKey);
      return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    } catch (error) {
      console.error("Decryption failed", error);
      return null;
    }
  };
  const encryptedUser = localStorage.getItem("user");
  const user = decryptUser(encryptedUser);

  return (
    <nav className="bg-white shadow-lg border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <div className="shrink-0  items-center block sm:hidden">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-linear-to-r from-orange-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm">L</span>
              </div>
              <span className="text-xl font-bold bg-linear-to-r from-orange-600 to-purple-600 bg-clip-text text-transparent">
                Logo
              </span>
            </Link>
          </div>

          {/* Desktop Navigation - Middle */}
          <div className="hidden md:flex items-center space-x-4">
            {navItems.map((item) => (
              <div key={item.label} className="relative">
                {/* Main Nav Label */}
                <button
                  onClick={() => handleDropdownToggle(item.label)}
                  className={`flex items-center space-x-1 px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer ${activeDropdown === item.label
                    ? 'bg-orange-50 text-orange-600 border border-orange-200'
                    : 'text-gray-700 hover:bg-purple-50 hover:text-purple-600'
                    }`}
                >
                  <span>{item.label}</span>
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === item.label ? 'rotate-180' : ''
                      }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {activeDropdown === item.label && (
                  <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                    {item.dropdown.map((subItem) => (
                      <Link
                        key={subItem.name}
                        to={subItem.path}
                        className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors duration-200 group"
                        onClick={closeAllMenus}
                      >
                        <span className="text-lg">{subItem.icon}</span>
                        <span className="font-medium group-hover:translate-x-1 transition-transform duration-200">
                          {subItem.name}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* User Profile - Right */}
          <div className="flex items-center space-x-4">

            {/* Desktop User Menu */}
            <div className="hidden md:block relative">
              <button
                onClick={() => handleDropdownToggle('user')}
                className="flex items-center space-x-2 p-1 rounded-full hover:bg-purple-50 transition-colors duration-200"
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
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-orange-600">{user?.firstName} {' '} {user?.lastName}</p>
                    <p className="text-sm text-blue-600 hover:text-blue-700 ">{user?.email}</p>
                  </div>
                  {userMenu.map((item) => (
                    <Link
                      key={item.name}
                      to={item.path}
                      className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors duration-200 group"
                      onClick={closeAllMenus}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span className="font-medium group-hover:translate-x-1 transition-transform duration-200">
                        {item.name}
                      </span>
                    </Link>
                  ))}
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
            {/* Navigation Items */}
            <div className="space-y-2">
              {navItems.map((item) => (
                <div key={item.label} className="border-b border-gray-100 pb-2">
                  <button
                    onClick={() => handleDropdownToggle(`mobile-${item.label}`)}
                    className="flex items-center justify-between w-full px-4 py-3 text-left text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-colors duration-200"
                  >
                    <span className="font-medium">{item.label}</span>
                    <svg
                      className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === `mobile-${item.label}` ? 'rotate-180' : ''
                        }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {activeDropdown === `mobile-${item.label}` && (
                    <div className="mt-2 ml-4 space-y-1">
                      {item.dropdown.map((subItem, index) => (
                        <Link
                          key={index}
                          to={subItem.path}
                          className="flex items-center space-x-3 px-4 py-2 text-gray-600 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors duration-200 "//block
                          onClick={handleMobileLinkClick}
                        >
                          <span>{subItem.icon}</span>
                          <span>{subItem.name}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Mobile User Menu */}
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

              {/* ✅ Expandable User Menu on Mobile */}
              {activeDropdown === "mobile-user" && (
                <div className="mt-3 ml-4 space-y-1">
                  {/* ✅ Show user details */}
                  <div className="px-4 py-2">
                    <p className="text-sm font-semibold text-gray-900">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                  </div>

                  {/* ✅ List Items */}
                  {userMenu.map((menu, i) => (
                    <Link
                      key={i}
                      to={menu.path}
                      className="flex items-center space-x-3 px-4 py-2 text-gray-600 hover:bg-orange-50 hover:text-orange-600 rounded-lg"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setActiveDropdown(null);
                      }}
                    >
                      <span>{menu.icon}</span>
                      <span>{menu.name}</span>
                    </Link>
                  ))}
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