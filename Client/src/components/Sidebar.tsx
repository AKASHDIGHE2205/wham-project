/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { getAllSidebarMembers } from '../services/master/masterApi';

const Sidebar = () => {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await getAllSidebarMembers();
      if (response && response.members) {
        setData(response.members)
      } else {
        setData([])
      }
    } catch (error) {
      console.error('Error fetching members:', error);
      setData([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData();
  }, [])

  const formatName = (name: string) => {
    if (!name) return '';
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };

  return (
    <div className="bg-white shadow-lg border-r border-gray-500 h-screen sticky top-0 w-64 transition-all duration-300 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 cursor-pointer" onClick={fetchData}>
        <a className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-linear-to-br from-orange-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-sm">E</span>
          </div>
          <span className="text-xl font-bold bg-linear-to-br from-orange-600 to-purple-600 bg-clip-text text-transparent">
            EventTracker
          </span>
        </a>
      </div>

      {/* Members List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading team members...</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 p-4">
            {data.map((member: any) => {
              const firstName = formatName(member.mem_name?.split(' ')[0] || '');
              const lastName = formatName(member.mem_name?.split(' ').slice(1).join(' ') || '');
              const fullName = `${firstName} ${lastName}`.trim();
              const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`;

              return (
                <div
                  key={member.mem_id}
                  className="bg-linear-to-br from-white to-gray-50 border border-gray-200 rounded-md p-2 hover:shadow-lg transition-all duration-300 hover:border-purple-300 group"
                >
                  <div className="flex items-center mb-">
                    <div className="w-7 h-7 bg-linear-to-br from-orange-500 to-purple-600 rounded-full flex items-center justify-center mr-3 shadow-md group-hover:scale-105 transition-transform duration-300">
                      <span className="text-white font-bold text-sm">
                        {initials}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-black truncate">
                        {fullName}
                      </h4>
                      <p className="text-xs text-gray-500 truncate">{member.designation}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-600">Teams:</span>
                      <div className="flex flex-wrap gap-1 justify-end">
                        {member.teams.map((team: any) => (
                          <span
                            key={team.id}
                            className="text-[10px] font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded-full"
                          >
                            {team.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;