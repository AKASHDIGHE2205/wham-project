import { useState } from "react";
import { Outlet } from "react-router-dom";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const DefaultLayout = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  return (
    <div className="flex h-screen relative">
      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-white/10 backdrop-blur-sm lg:hidden"
          onClick={closeMobileSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar - Desktop: always visible, Mobile: conditional */}
      <div
        className={`fixed lg:static inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out
          ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} lg:block bg-white border-r border-purple-300 h-screen overflow-hidden w-70`}
      >
        <Sidebar onCloseMobile={closeMobileSidebar} />
      </div>

      <div className="relative flex flex-1 flex-col overflow-hidden lg:ml-0">
        {/* Header - Always visible */}
        <div className="bg-white shadow-md z-10 sticky top-0">
          <Navbar
            onMobileMenuToggle={toggleMobileSidebar}
            isMobileMenuOpen={isMobileSidebarOpen}
          />
        </div>

        {/* Main Content */}
        <main className="flex-1 bg-white overflow-auto">
          <div className="h-full w-full">
            <Outlet />
          </div>
        </main>

        <div>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default DefaultLayout;