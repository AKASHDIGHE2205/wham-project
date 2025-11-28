import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const DefaultLayout = () => {
  return (
    <div className="flex h-screen">
      {/* <!-- Sidebar - Hidden on mobile, compact on desktop --> */}
      <div className="hidden md:block bg-white border-r border-gray-100 h-screen overflow-hidden">
        <Sidebar />
      </div>

      <div className="relative flex flex-1 flex-col overflow-hidden">
        {/* <!-- Header - Always visible --> */}
        <div className="bg-white shadow-md z-10 sticky top-0">
          <Navbar />
        </div>

        {/* <!-- Main Content --> */}
        <main className="flex-1 bg-Linear-to-br from-orange-50 to-blue-50 overflow-auto">
          <div className="h-full w-full p-4">
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