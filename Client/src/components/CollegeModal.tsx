import { Search } from "lucide-react";
import { useEffect, useState, type FC } from "react";
import { getActiveColleges } from "../services/master/masterApi";

interface Props {
  show: boolean;
  setShow: (show: boolean) => void;
  onSelectColleges: (colleges: College[]) => void;
  selectedColleges?: College[];
}

interface College {
  clg_id: number;
  clg_name: string;
}

const CollegeModal: FC<Props> = ({ show, setShow, onSelectColleges, selectedColleges = [] }) => {
  const [data, setData] = useState<College[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [tempSelectedColleges, setTempSelectedColleges] = useState<College[]>(selectedColleges);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const response = await getActiveColleges();
      if (response) {
        setData(response?.data || []);
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Reset temp selection when modal opens
  useEffect(() => {
    if (show) {
      setTempSelectedColleges(selectedColleges);
    }
  }, [show, selectedColleges]);

  const filteredColleges = data?.filter((items) =>
    items?.clg_name.toLowerCase().includes(search.toLowerCase())
  );

  const handleClose = () => {
    setTempSelectedColleges([]);
    setShow(false);
  };

  const handleSelect = (college: College) => {
    setTempSelectedColleges(prev => {
      const isSelected = prev.some(c => c.clg_id === college.clg_id);
      if (isSelected) {
        return prev.filter(c => c.clg_id !== college.clg_id);
      } else {
        return [...prev, college];
      }
    });
  };

  const handleSave = () => {
    onSelectColleges(tempSelectedColleges);
    setShow(false);
  };

  const isCollegeSelected = (collegeId: number) => {
    return tempSelectedColleges?.some(c => c.clg_id === collegeId);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-orange-100/20 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-linear-to-br from-orange-500 to-purple-600 rounded-xl flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-university-icon lucide-university text-white"><path d="M14 21v-3a2 2 0 0 0-4 0v3" /><path d="M18 12h.01" /><path d="M18 16h.01" /><path d="M22 7a1 1 0 0 0-1-1h-2a2 2 0 0 1-1.143-.359L13.143 2.36a2 2 0 0 0-2.286-.001L6.143 5.64A2 2 0 0 1 5 6H3a1 1 0 0 0-1 1v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2z" /><path d="M6 12h.01" /><path d="M6 16h.01" /><circle cx="12" cy="10" r="2" /></svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Select Colleges
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Choose one or more colleges from the list below
              </p>
              {tempSelectedColleges.length > 0 && (
                <p className="text-xs text-orange-600 mt-1">
                  {tempSelectedColleges.length} college(s) selected
                </p>
              )}
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer p-2 hover:bg-gray-100 rounded-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search Section */}
        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all duration-200"
            />
          </div>
        </div>

        {/* Colleges List */}
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
          ) : filteredColleges?.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-sm mt-1">
                {search ? "Try adjusting your search terms" : "No active college found."}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-linear-to-r from-purple-50 to-orange-50">
                    <tr>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredColleges?.map((college) => {
                      const isSelected = isCollegeSelected(college?.clg_id);
                      return (
                        <tr
                          key={college?.clg_id}
                          className={` transition-colors duration-150 ${isSelected ? 'bg-orange-100' : ''
                            }`}
                        >
                          <td className="px-4 py-2 whitespace-nowrap text-center">
                            <span className="text-sm text-gray-900">
                              {college?.clg_id}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-left">
                            <div className="max-w-[300px] wrap-break-words whitespace-normal text-sm text-gray-900">
                              {college?.clg_name}
                            </div>
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-left">
                            <button
                              onClick={() => handleSelect(college)}
                              className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer ${isSelected
                                  ? 'text-red-600 bg-red-50 border border-red-200 hover:bg-red-100'
                                  : 'text-orange-600 bg-orange-50 border border-orange-200 hover:bg-orange-100'
                                }`}
                            >
                              {isSelected ? 'Remove' : 'Select'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Results Count */}
          {!loading && filteredColleges?.length > 0 && (
            <div className="mt-4 text-sm text-gray-500">
              Showing {filteredColleges?.length} of {data?.length} colleges
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end items-center gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleClose}
            className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 text-sm font-medium text-white bg-linear-to-r from-[#4829f7] to-[#3715fa] border border-transparent rounded-lg transition-all duration-200 cursor-pointer"
          >
            Save Selection ({tempSelectedColleges.length})
          </button>
        </div>
      </div>
    </div>
  );
};

export default CollegeModal;