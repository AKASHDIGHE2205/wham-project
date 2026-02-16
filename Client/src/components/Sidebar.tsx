import { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';
import { getAllSidebarMembers } from '../services/master/masterApi';
import { getUserFromStorage } from '../helper/cryptoUser';
// import { useNavigate } from 'react-router-dom';

export interface Team {
  id: number;
  name: string;
}

export interface Member {
  mem_id: number;
  mem_name: string;
  mobile: string;
  email: string;
  birth_date: string;
  address: string;
  designation: 'Admin' | 'User';
  isorganizer: 'Y' | 'N';
  status: 'A' | 'I';
  teams: Team[];
  total_events: number;
  completed_events: number;
  pending_events: number;
}

const Sidebar = () => {
  const [data, setData] = useState<Member[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")
  const formatDate = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}/${m}/${d}`;
  };

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const [fromDate] = useState(formatDate(firstDayOfMonth));
  const [toDate] = useState(formatDate(tomorrow));
  // const navigate = useNavigate();
  const fetchData = async () => {
    setLoading(true)
    const body = {
      from_date: fromDate,
      to_date: toDate,
      role: user?.role || "User",
      userId: user?.id || 0
    }
    try {
      const response = await getAllSidebarMembers(body);
      if (response && response.members) {
        setData(response?.members || [])
      } else {
        setData([])
      }
    } catch (error) {
      console.error('Error fetching members:', error);
      setData([])
    } finally {
      setLoading(false)
    }
    // navigate("/");
  }

  useEffect(() => {
    fetchData();
  }, []);

  const formatName = (name: string) => {
    if (!name) return '';
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };

  const filteredData = data.filter((item: Member) =>
    item.mem_name?.toLowerCase()?.includes(search.toLowerCase())
  )

  const clearSearch = () => {
    setSearch("");
  }
  const user = getUserFromStorage();

  return (
    <div className="bg-white shadow-lg h-screen sticky top-0 w-80 transition-all duration-300 flex flex-col">
      {(user?.role === 'Master' || user?.role === 'Admin' || user?.role === 'Manager' || user?.role === 'User') ? (
        <>
          {/* Header */}
          <div
            className="flex items-center justify-between p-4 border-b border-gray-100 cursor-pointer"
            title='Click to refresh data'
            onClick={fetchData}
          >
            <a className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-linear-to-br from-orange-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <span className="text-xl font-bold bg-linear-to-br from-orange-600 to-purple-600 bg-clip-text text-transparent">
                EventTracker
              </span>
            </a>
          </div>

          {/* Search Section */}
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-transparent transition-all duration-300 text-sm"
                placeholder="Search members by name..."
              />
              {search && (
                <button
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  title="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Members List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="text-center py-12">
                <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading team members...</p>
              </div>
            ) : filteredData.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
                  <Search className="w-full h-full" />
                </div>
                <p className="text-orange-600 mb-2">
                  {search ? 'No members found' : 'No members available'}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3 p-4">
                {filteredData.map((member: Member) => {
                  const firstName = formatName(member?.mem_name?.split(' ')[0] || '');
                  const lastName = formatName(member?.mem_name?.split(' ').slice(1).join(' ') || '');
                  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`;
                  const progressPercentage = member?.total_events > 0
                    ? Math.round(((member?.completed_events || 0) / member.total_events) * 100)
                    : 0;

                  return (
                    <div
                      key={`${member?.mem_id} - ${member?.mem_name}`}
                      className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-all duration-300 hover:border-purple-300 group"
                    >
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className="w-10 h-10 bg-linear-to-br from-orange-500 to-purple-600 rounded-full flex items-center justify-center shadow-md shrink-0">
                          <span className="text-white font-bold text-sm">
                            {initials}
                          </span>
                        </div>

                        {/* Member Info - Compact Layout */}
                        <div className="flex-1 min-w-0">
                          {/* Name */}
                          <h4 className="text-sm font-semibold text-gray-800 truncate mb-1">
                            {member?.mem_name}
                          </h4>

                          {/* Stats in single line */}
                          <div className="flex items-center gap-1 mb-2">
                            <div className="flex items-center p-1 bg-gray-100">
                              <span className="text-xs text-black">Total :</span>
                              <span className="text-xs font-bold text-black">
                                {member?.total_events || 0}
                              </span>
                            </div>
                            <div className="flex items-center p-1 bg-green-100">
                              <span className="text-xs text-green-700">Complete:</span>
                              <span className="text-xs font-bold text-green-700">
                                {member?.completed_events || 0}
                              </span>
                            </div>
                            <div className="flex items-center p-1 bg-yellow-100">
                              <span className="text-xs text-yellow-700">Pending:</span>
                              <span className="text-xs font-bold text-yellow-700">
                                {member?.pending_events || 0}
                              </span>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>Progress</span>
                              <span>{progressPercentage}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div
                                className="bg-orange-500 h-1.5 rounded-full"
                                style={{ width: `${progressPercentage}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 bg-linear-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user-lock-icon lucide-user-lock"><circle cx="10" cy="7" r="4" /><path d="M10.3 15H7a4 4 0 0 0-4 4v2" /><path d="M15 15.5V14a2 2 0 0 1 4 0v1.5" /><rect width="8" height="5" x="13" y="16" rx=".899" /></svg>
          </div>

          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Access Restricted
          </h3>

          <p className="text-red-600 text-sm mb-4 max-w-xs">
            You don't have permission to view team members. Please contact your administrator for access.
          </p>

        </div>
      )}
    </div>
  );
};

export default Sidebar;