import { Link } from 'react-router-dom';

const Sidebar = () => {

  return (
    <div className="bg-white shadow-lg border-r border-gray-100 h-screen sticky top-0 w-64 transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-linear-to-br from-orange-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-sm">L</span>
          </div>
          <span className="text-xl font-bold bg-linear-to-br from-orange-600 to-purple-600 bg-clip-text text-transparent">
            Logo
          </span>
        </Link>
      </div>

      {/* Status Indicator */}
      <div className="p-6 bg-white rounded-lg border border-gray-200 hidden">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Status Indicators</h2>
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-700">Pending</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-700">Approved</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-700">Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-700">Rejected</span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Sidebar;