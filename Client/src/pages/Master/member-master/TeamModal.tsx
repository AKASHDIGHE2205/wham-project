/* eslint-disable @typescript-eslint/no-explicit-any */
import { Search } from "lucide-react";
import { useEffect, useState, type FC } from "react";
import { getActiveTeams } from "../../../services/calender/calenderApi";
import toast from "react-hot-toast";

interface Props {
  show: boolean;
  setShow: (show: boolean) => void;
  setSelectedTeams: any;
  selectedTeams: any[];
}

interface Team {
  id: number;
  name: string;
}

interface SelectedTeam {
  id: number;
  name: string;
}

const TeamModal: FC<Props> = ({ show, setShow, setSelectedTeams, selectedTeams }) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [search, setSearch] = useState("");
  const [selectedItems, setSelectedItems] = useState<SelectedTeam[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const response = await getActiveTeams();
        setTeams(response?.Teams || []);
      } catch (error) {
        console.error('Error fetching teams:', error);
      } finally {
        setLoading(false)
      }
    }
    fetchData();
  }, [show]);

  useEffect(() => {
    if (show) {
      setSelectedItems(selectedTeams?.map(team => ({
        id: team?.id,
        name: team?.name
      })));
    }
  }, [show, selectedTeams]);

  if (!show) return null;

  const handleClose = () => {
    setShow(false);
    setSearch("");
  };

  const toggleSelection = (team: Team) => {
    setSelectedItems((prev) => {
      const exists = prev.find(p => p.id === team?.id);
      if (exists) {
        return prev.filter(p => p.id !== team?.id);
      } else {
        return [...prev, { id: team?.id, name: team?.name }];
      }
    });
  };

  const isSelected = (id: number) => {
    return selectedItems?.some(item => item?.id === id);
  };

  const handleConfirm = () => {
    setSelectedTeams(selectedItems);
    toast.success(`Selected ${selectedItems?.length} team(s)`);
    handleClose();
  };

  const filteredTeams = teams?.filter((team) =>
    team?.id.toString().toLowerCase().includes(search.toString().toLowerCase()) ||
    team?.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-orange-100/20 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-linear-to-r from-purple-50 to-orange-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-linear-to-br from-orange-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Select Teams
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Choose one or multiple teams from the list below
              </p>
            </div>
          </div>
          <button
            className="flex items-center justify-center w-10 h-10 hover:bg-gray-100 text-gray-700 transition-all duration-200 hover:scale-105 hover:shadow-lg cursor-pointer"
            onClick={handleClose}
            title="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Selected Teams Preview */}
        {selectedItems?.length > 0 && (
          <div className="bg-linear-to-r from-orange-50 to-purple-50 border-b border-orange-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 bg-linear-to-br from-orange-500 to-purple-600 text-white text-sm font-bold rounded-full shadow-sm">
                  {selectedItems?.length}
                </span>
                <span className="text-sm font-semibold text-orange-800">Selected Teams</span>
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
              {selectedItems?.map((team) => (
                <div
                  key={`team-${team?.id}`}
                  className="bg-orange-100 border border-orange-200 text-orange-800 rounded-full px-3 py-2 shadow-sm flex items-center gap-2 group hover:shadow-md transition-all duration-200"
                >
                  <span className="text-sm font-medium">
                    👥 {team?.name}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSelection(team);
                    }}
                    className="p-0.5 rounded-full transition-colors text-orange-600 hover:text-orange-800 hover:bg-orange-200"
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

        {/* Search Section */}
        <div className="p-6 border-b border-gray-200 bg-white">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search teams by name or ID..."
              value={search}
              className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all duration-200"
            />
          </div>
        </div>

        {/* Teams List */}
        <div className="flex-1 overflow-auto">
          <div className="bg-gray-50 px-6 py-3 sticky top-0 z-10">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-2">
              <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Teams ({filteredTeams?.length})
            </h3>
          </div>

          {filteredTeams?.length > 0 ? (
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
                      Team Name
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={3} className="py-4 text-center text-gray-500">
                        Loading...
                      </td>
                    </tr>
                  ) : (
                    filteredTeams?.map((team) => (
                      <tr
                        key={team?.id}
                        className={`hover:bg-gray-50 cursor-pointer transition-colors duration-150 ${isSelected(team?.id) ? "bg-orange-50 border-l-4 border-l-orange-500" : ""
                          }`}
                        onClick={() => toggleSelection(team)}
                      >
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={isSelected(team?.id)}
                            onClick={(e) => e.stopPropagation()}
                            onChange={() => toggleSelection(team)}
                            className="h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500 transition-colors duration-200"
                          />
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">{team?.id}</span>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <span className="text-sm font-medium text-gray-900">{team?.name}</span>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>

              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-6">
              <div className="text-gray-500 text-center">
                <p className="font-medium mb-1">No teams found</p>
                <p className="text-sm">
                  {search ? "Try adjusting your search terms" : "No teams available"}
                </p>
              </div>
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

export default TeamModal;