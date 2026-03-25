import { Bell, Calendar, Grip, LogOutIcon, User, X } from "lucide-react";
import moment from "moment";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MEDIA_URL } from "../constant/Baseurl";
import { getUserFromStorage } from "../helper/cryptoUser";
import { getNotifyActivity } from "../services/dashboard/DashboardApi";

interface NavbarProps {
  onMobileMenuToggle?: () => void;
  isMobileMenuOpen?: boolean;
}
export interface Activity {
  id: number;
  date: string;
  title: string;
  occasion_id: number;
  campaign_id: number;
  start_date: string;
  end_date: string;
  vehicle_type: string;
  notes: string;
  status: 'P' | 'A' | 'I';
}

const Navbar = ({ onMobileMenuToggle, isMobileMenuOpen }: NavbarProps) => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);
  const [notification, setNotification] = useState<Activity[]>([]);
  const user = getUserFromStorage();
  const navigate = useNavigate();

  const getNotification = async () => {
    const response = await getNotifyActivity();
    if (response) {
      setNotification(response);
    }
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".nav-dropdown-container")) {
        setActiveDropdown(null);
      }
    };
    getNotification();
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleEventClick = (Data: Activity) => {
    navigate(`/update-activity/${Data?.id}/${Data?.date}`);
    setActiveDropdown('');
  }

  const handleClickNotification = (isOpen: boolean) => {
    setActiveDropdown(isOpen ? null : "notification");
    getNotification();
  }

  const renderNotification = () => {
    const isOpen = activeDropdown === "notification";

    return (
      <div className="relative nav-dropdown-container">
        {/* Bell Button with enhanced styling */}
        <button
          onClick={() => handleClickNotification(isOpen)}
          className={`
          relative p-2.5 rounded-xl 
          transition-all duration-200 ease-in-out
          ${isOpen ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}
          cursor-pointer group`}
        >
          <Bell className="w-5 h-5 transition-transform group-hover:scale-110 text-[#2c07ff]" />

          {/* Enhanced Unread Badge with animation */}
          {notification?.length > 0 && (
            <motion.span
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute -top-1 -right-1 bg-linear-to-r from-red-500 to-rose-500 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-full shadow-sm border-2 border-white"
            >
              {notification?.length > 9 ? '9+' : notification?.length}
            </motion.span>
          )}
        </button>

        {/* Dropdown */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute right-0 mt-3 w-96 bg-white rounded-2xl shadow-2xl ring-1 ring-slate-900/10 overflow-hidden z-50"
            >
              {/* Header with gradient */}
              <div className="px-5 py-4 bg-linear-to-r from-indigo-600 to-indigo-700">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Bell className="w-4 h-4" />
                    Notifications
                  </h3>
                  {notification?.length > 0 && (
                    <span className="text-xs bg-white/20 text-white px-2 py-1 rounded-full backdrop-blur-sm">
                      {notification?.length} Pending
                    </span>
                  )}
                </div>
              </div>

              {/* Notification List with smooth scrolling */}
              <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
                {notification?.length > 0 ? (
                  notification?.map((item, index) => (
                    <motion.div
                      key={item?.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`group relative p-4 cursor-pointer transition-all duration-200 hover:shadow-md
                      ${item?.status === 'P' ? 'bg-amber-50/80 hover:bg-amber-100' : 'hover:bg-slate-50'} `}
                      onClick={() => handleEventClick(item)}
                    >
                      {/* Status indicator dot */}
                      {item?.status === 'P' && (
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-amber-500 rounded-full" />
                      )}

                      <div className="pl-4">
                        <p className={`text-sm font-medium leading-snug ${item?.status === 'P' ? 'text-amber-900' : 'text-slate-800'}`}>
                          {item?.title}
                        </p>

                        <div className="flex items-center gap-3 text-xs">
                          <span className="flex items-center gap-1 text-slate-500">
                            <Calendar size={12} className="stroke-current" />
                            <span>{moment(item?.start_date).format("MMM DD, YYYY")} - {moment(item?.end_date).format("MMM DD, YYYY")}</span>
                          </span>
                        </div>

                        {/* Status badge for pending items */}
                        {item?.status === 'P' && (
                          <span className="absolute right-4 top-4 text-[10px] font-medium text-amber-600 bg-amber-200/50 px-2 py-0.5 rounded-full">
                            Pending
                          </span>
                        )}
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-12 text-center"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                        <Bell className="w-6 h-6 text-slate-400" />
                      </div>
                      <p className="text-sm font-medium text-slate-700">No notifications</p>
                      <p className="text-xs text-slate-500 max-w-[200px]">
                        You're all caught up! Check back later for updates.
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const renderUserMenu = () => {
    const isOpen = activeDropdown === "user";

    return (
      <div className="relative nav-dropdown-container">
        <button
          onClick={() => setActiveDropdown(isOpen ? null : "user")}
          aria-expanded={isOpen}
          className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 cursor-pointer"
        >
          {user?.photo && !imgError ? (
            <img
              src={`${MEDIA_URL}${user.photo}`}
              alt={user.firstName || "User"}
              className="w-11 h-11 rounded-full object-cover border border-slate-200"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-11 h-11 rounded-full bg-linear-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white text-sm font-semibold shadow-sm">
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
      <div className="max-w-7xl mx-auto px-2">
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
          {(user?.role === "Master" || user?.role === "Manager") && (
            <div className=" items-center">
              {renderNotification()}
            </div>
          )}
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
                <X className="block w-6 h-6 text-[#3822ff]" aria-hidden="true" />
              ) : (
                <Grip className="block w-6 h-6 text-[#3822ff]" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;