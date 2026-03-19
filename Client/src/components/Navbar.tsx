import { Grip, LogOutIcon, User, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MEDIA_URL } from "../constant/Baseurl";
import { getUserFromStorage } from "../helper/cryptoUser";

interface NavbarProps {
  onMobileMenuToggle?: () => void;
  isMobileMenuOpen?: boolean;
}

const Navbar = ({ onMobileMenuToggle, isMobileMenuOpen }: NavbarProps) => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);

  const user = getUserFromStorage();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".nav-dropdown-container")) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const renderUserMenu = () => {
    const isOpen = activeDropdown === "user";

    return (
      <div className="relative nav-dropdown-container">
        <button
          onClick={() => setActiveDropdown(isOpen ? null : "user")}
          aria-expanded={isOpen}
          className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
        >
          {user?.photo && !imgError ? (
            <img
              src={`${MEDIA_URL}${user.photo}`}
              alt={user.firstName || "User"}
              className="w-12 h-12 rounded-full object-cover border border-slate-200"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-linear-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white text-sm font-semibold shadow-sm">
              {user?.firstName?.[0] || ""}
              {user?.lastName?.[0] || ""}
              {!user?.firstName && !user?.lastName && (
                <User className="w-4 h-4" />
              )}
            </div>
          )}
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
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
                  {user?.role === 'User' ? 'Student' : user?.role}
                </div>
              </div>

              <div className="py-1">
                <Link
                  to="/auth/log-out"
                  onClick={() => setActiveDropdown(null)}
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

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16">
          {/* Logo - visible only on small/mobile and md */}
          <div className="flex items-center shrink-0 lg:hidden">
            <Link
              to="/"
              className="flex items-center gap-2 group focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg"
            >
              <div className="w-8 h-8 bg-linear-to-tr from-indigo-600 to-violet-600 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow transition-all">
                <span className="text-white font-bold text-sm">W</span>
              </div>
              <span className="text-xl font-bold bg-linear-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                WHam SAP
              </span>
            </Link>
          </div>

          {/* Spacer for pushing right-side items */}
          <div className="flex-1" />

          {/* Desktop / tablet user menu */}
          <div className="hidden md:flex items-center">
            {renderUserMenu()}
          </div>

          {/* Mobile / md toggle button */}
          <div className="flex lg:hidden items-center md:ml-3">
            <button
              onClick={onMobileMenuToggle}
              className="p-2 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="block w-6 h-6 text-[#3822ff]" aria-hidden="true"/>
              ) : (
                <Grip className="block w-6 h-6 text-[#3822ff]" aria-hidden="true"/>
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;