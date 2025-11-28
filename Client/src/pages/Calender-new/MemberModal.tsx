/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, type FC } from "react";
import { getAllMembers, getActiveTeams } from "../../services/calender/calenderApi";
import toast from "react-hot-toast";
import type { Team } from "./NewEventModal";

interface Props {
  show: boolean;
  setShow: (show: boolean) => void;
  setSelectedMembers: any;
  setSelectedTeams: any;
  selectedMembers: any[];
  selectedTeams: any[];
}

interface Member {
  mem_id: number;
  first_name: string;
  middle_name: string;
  last_name: string;
  mobile: number;
  email: string;
}

interface SelectedItem {
  id: number;
  type: 'member' | 'team';
  name: string;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
}

const MemberModal: FC<Props> = ({ show, setShow, setSelectedMembers, setSelectedTeams, selectedMembers, selectedTeams }) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState("");
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [activeTab, setActiveTab] = useState<'teams' | 'members'>('teams');

  useEffect(() => {
    if (!show) return;

    const fetchMembers = async () => {
      try {
        const response = await getAllMembers();
        setMembers(response.Members || []);
      } catch {
        toast.error("Failed to load members");
      }
    };

    const fetchTeams = async () => {
      try {
        const response = await getActiveTeams();
        setTeams(response.Teams || []);
      } catch (error) {
        console.error('Error fetching teams:', error);
        toast.error('Failed to load teams');
      }
    };

    fetchMembers();
    fetchTeams();
  }, [show]);

  // Initialize selected items when modal opens
  useEffect(() => {
    if (show) {
      const memberItems: SelectedItem[] = selectedMembers?.map(member => ({
        id: member.id,
        type: 'member',
        name: `${member.first_name} ${member.middle_name ? member.middle_name + ' ' : ''}${member.last_name}`.trim(),
        first_name: member.first_name,
        middle_name: member.middle_name,
        last_name: member.last_name
      }));

      const teamItems: SelectedItem[] = selectedTeams?.map(team => ({
        id: team.id,
        type: 'team',
        name: team.name
      }));

      setSelectedItems([...memberItems, ...teamItems]);
    }
  }, [show, selectedMembers, selectedTeams]);

  if (!show) return null;

  const handleClose = () => {
    setShow(false);
    setSearch("");
  };

  const toggleSelection = (item: SelectedItem) => {
    setSelectedItems((prev) => {
      const exists = prev.find(p => p.id === item?.id && p.type === item?.type);
      if (exists) {
        return prev.filter(p => !(p.id === item?.id && p.type === item?.type));
      } else {
        return [...prev, item];
      }
    });
  };

  const isSelected = (id: number, type: 'member' | 'team') => {
    return selectedItems?.some(item => item?.id === id && item?.type === type);
  };

  const handleConfirm = () => {
    // Separate members and teams from selected items
    const selectedMembersData = selectedItems?.filter(item => item?.type === 'member')?.map(item => ({
      id: item?.id,
      first_name: item?.first_name || '',
      middle_name: item?.middle_name || '',
      last_name: item?.last_name || ''
    }));

    const selectedTeamsData = selectedItems?.filter(item => item?.type === 'team')?.map(item => ({
      id: item?.id,
      name: item?.name
    }));

    setSelectedMembers(selectedMembersData);
    setSelectedTeams(selectedTeamsData);

    const membersCount = selectedMembersData.length;
    const teamsCount = selectedTeamsData.length;

    toast.success(`Selected ${teamsCount} team(s) and ${membersCount} member(s)`);
    handleClose();
  };

  const filteredMembers = members.filter((m) =>
    `${m.mem_id} ${m.first_name} ${m.middle_name} ${m.last_name}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const filteredTeams = teams.filter((team) =>
    `${team.id} ${team.name}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const getFullName = (member: Member) => {
    return `${member.first_name} ${member.middle_name ? member.middle_name + ' ' : ''}${member.last_name}`.trim();
  };

  return (
    <div className="fixed inset-0 bg-orange-100/10 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div
        className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-linear-to-r from-purple-50 to-orange-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-linear-to-br from-orange-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Select Teams & Members</h3>
              <p className="text-sm text-gray-600 mt-1">Choose teams or individual members for your event</p>
            </div>
          </div>
          <button
            className="flex items-center justify-center w-10 h-10 hover:bg-gray-100 text-gray-700 transition-all duration-200 hover:scale-105 hover:shadow-lg cursor-pointer"
            onClick={handleClose}
            title="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Selected Items Preview */}
        {selectedItems?.length > 0 && (
          <div className="bg-linear-to-r from-orange-50 to-purple-50 border-b border-orange-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 bg-linear-to-br from-orange-500 to-purple-600 text-white text-sm font-bold rounded-full shadow-sm">
                  {selectedItems?.length}
                </span>
                <span className="text-sm font-semibold text-orange-800">Selected Items</span>
              </div>
              <button
                onClick={() => setSelectedItems([])}
                className="text-xs text-red-600 hover:text-red-800 font-medium flex items-center gap-1 transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear All
              </button>
            </div>

            <div className="flex flex-wrap gap-2 max-h-32 overflow-auto pr-2">
              {selectedItems?.map((item) => (
                <div
                  key={`${item?.type}-${item?.id}`}
                  className={`border rounded-full px-3 py-2 shadow-sm flex items-center gap-2 group hover:shadow-md transition-all duration-200 ${item?.type === 'team'
                    ? 'bg-blue-100 border-blue-200 text-blue-800'
                    : 'bg-orange-100 border-orange-200 text-orange-800'
                    }`}
                >
                  <span className="text-sm font-medium">
                    {item?.type === 'team' ? '👥' : '👤'} {item?.name}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSelection(item);
                    }}
                    className={`p-0.5 rounded-full transition-colors ${item?.type === 'team'
                      ? 'text-blue-600 hover:text-blue-800 hover:bg-blue-200'
                      : 'text-orange-600 hover:text-orange-800 hover:bg-orange-200'
                      }`}
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>

                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search and Tabs */}
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex flex-col space-y-4">
            {/* Tabs */}
            <div className="flex space-x-1">
              <button
                onClick={() => setActiveTab('teams')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer ${activeTab === 'teams'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
              >
                Teams ({filteredTeams?.length})
              </button>
              <button
                onClick={() => setActiveTab('members')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer ${activeTab === 'members'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
              >
                Members ({filteredMembers?.length})
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="search"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all duration-200"
                placeholder={`Search ${activeTab}...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          {/* Teams Section */}
          {activeTab === 'teams' && (
            <div>
              <div className="bg-gray-50 px-6 py-3 sticky top-0 z-10">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Teams ({filteredTeams?.length})
                </h3>
              </div>
              {filteredTeams?.length > 0 ? (
                <div className="max-h-96 overflow-auto">
                  <table className="w-full">
                    <thead className="bg-blue-100 sticky top-0 z-5">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Select
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Team Name
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredTeams?.map((item) => (
                        <tr
                          key={`team-${item?.id}`}
                          className={`hover:bg-gray-50 cursor-pointer transition-colors duration-150 ${isSelected(item?.id, 'team')
                            ? "bg-blue-50 border-l-4 border-l-blue-500"
                            : ""
                            }`}
                          onClick={() => toggleSelection({
                            id: item?.id,
                            type: 'team',
                            name: item?.name
                          })}
                        >
                          <td className="px-4 py-2">
                            <input
                              type="checkbox"
                              checked={isSelected(item?.id, 'team')}
                              onClick={(e) => e.stopPropagation()}
                              onChange={() => toggleSelection({
                                id: item?.id,
                                type: 'team',
                                name: item?.name
                              })}
                              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 transition-colors duration-200"
                            />
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {item?.id}
                          </td>
                          <td className="px-4 py-2">
                            <div className="flex items-center space-x-3">
                              <span className="text-sm font-medium text-gray-900">
                                {item?.name}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 px-6">
                  <div className="text-gray-500 text-center">
                    <p className="font-medium mb-1">No teams found</p>
                    <p className="text-sm">
                      {search ? "Try adjusting your search terms" : "No teams available"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Members Section */}
          {activeTab === 'members' && (
            <div>
              <div className="bg-gray-50 px-6 py-3 sticky top-0 z-10">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                  <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  Members ({filteredMembers?.length})
                </h3>
              </div>
              {filteredMembers?.length > 0 ? (
                <div className="max-h-96 overflow-auto">
                  <table className="w-full">
                    <thead className="bg-orange-100 sticky top-0 z-5">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Select
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Name
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredMembers?.map((item) => (
                        <tr
                          key={`member-${item?.mem_id}`}
                          className={`hover:bg-gray-50 cursor-pointer transition-colors duration-150 ${isSelected(item?.mem_id, 'member')
                            ? "bg-orange-50 border-l-4 border-l-orange-500"
                            : ""
                            }`}
                          onClick={() => toggleSelection({
                            id: item?.mem_id,
                            type: 'member',
                            name: getFullName(item),
                            first_name: item?.first_name,
                            middle_name: item?.middle_name,
                            last_name: item?.last_name
                          })}
                        >
                          <td className="px-4 py-2">
                            <input
                              type="checkbox"
                              checked={isSelected(item?.mem_id, 'member')}
                              onClick={(e) => e.stopPropagation()}
                              onChange={() => toggleSelection({
                                id: item?.mem_id,
                                type: 'member',
                                name: getFullName(item),
                                first_name: item?.first_name,
                                middle_name: item?.middle_name,
                                last_name: item?.last_name
                              })}
                              className="h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500 transition-colors duration-200"
                            />
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {item?.mem_id}
                          </td>
                          <td className="px-4 py-2">
                            <div className="flex items-center space-x-3">
                              <span className="text-sm font-medium text-gray-900">
                                {getFullName(item)}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 px-6">
                  <div className="text-gray-500 text-center">
                    <p className="font-medium mb-1">No members found</p>
                    <p className="text-sm">
                      {search ? "Try adjusting your search terms" : "No members available"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end items-center p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={selectedItems?.length === 0}
              className="px-6 py-3 text-sm font-medium text-white bg-linear-to-r from-orange-500 to-purple-600 rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm flex items-center gap-2 cursor-pointer"
            >
              Confirm ({selectedItems?.length}) Selection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberModal;