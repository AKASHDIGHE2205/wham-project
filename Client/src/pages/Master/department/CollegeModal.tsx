import { useEffect, useState, type FC } from "react";
import { getActiveColleges } from "../../../services/master/masterApi";
import { Search } from "lucide-react";
import { useDispatch } from "react-redux";
import { handleSelectCollege } from "../../../feature/masterSlice";

interface Props {
  show: boolean;
  setShow: (show: boolean) => void;
}
interface College {
  clg_id: number;
  clg_name: string;
}
const CollegeModal: FC<Props> = ({ show, setShow, }) => {
  const [data, setData] = useState<College[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const dispatch = useDispatch();

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
  }, [])

  const filteredColleges = data?.filter((items) => items?.clg_name.toLowerCase().includes(search.toLowerCase()));

  const handleClose = () => {
    dispatch(handleSelectCollege({ id: 0, name: "" }))
    setShow(false);
  }

  const handleSelect = (data: College) => {
    dispatch(handleSelectCollege({ id: data.clg_id || 0, name: data.clg_name || "" }))
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-orange-100/20 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-linear-to-br from-orange-500 to-purple-600 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Select Member
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Choose a college from the list below
              </p>
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
              placeholder="Search by ID, first name, middle name, or last name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all duration-200"
            />
          </div>
        </div>

        {/* Members List */}
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
          ) : filteredColleges?.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No members found</p>
              <p className="text-gray-400 text-sm mt-1">
                {search ? "Try adjusting your search terms" : "No members available"}
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
                      return (
                        <tr key={college?.clg_id} className="hover:bg-gray-50 transition-colors duration-150">
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
                              className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer text-orange-600 bg-orange-50 border border-orange-200 hover:bg-orange-100"
                            >
                              Select
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
        <div className="flex justify-end items-center p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleClose}
            className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default CollegeModal
