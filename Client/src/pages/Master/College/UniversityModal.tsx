import { useEffect, useState, type FC } from "react";
import { useDispatch } from "react-redux";
import { getActiveUniversities } from "../../../services/master/masterApi";
import { Search } from "lucide-react";
import { handleSelectUniversity } from "../../../feature/masterSlice";

interface Props {
  show: boolean;
  setShow: (show: boolean) => void;
}

interface University {
  id: number;
  name: string;
}

const UniversityModal: FC<Props> = ({ show, setShow }) => {
  const [search, setSearch] = useState("");
  const [userData, setUserData] = useState<University[] | []>([])
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const response = await getActiveUniversities();
      setLoading(false);
      setUserData(response.Result || [])
    }
    fetchData();
  }, [])

  const filteredUser = userData?.filter((user) =>
    user?.id.toString().toLowerCase().includes(search.toString().toLowerCase()) ||
    user?.name.toLowerCase().includes(search.toLowerCase())
  );

  if (!show) return null;

  const handleClose = () => {
    dispatch(handleSelectUniversity({ id: 0, name: "" }))
    setShow(false);
    setSearch("");
  };

  const handleSelect = (item: any) => {
    dispatch(handleSelectUniversity({ id: item?.id, name: item?.name }))
    setShow(false);
  }


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
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-school-icon lucide-school w-5 h-5 text-white"><path d="M14 21v-3a2 2 0 0 0-4 0v3" /><path d="M18 5v16" />
                <path d="m4 6 7.106-3.79a2 2 0 0 1 1.788 0L20 6" /><path d="m6 11-3.52 2.147a1 1 0 0 0-.48.854V19a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5a1 1 0 0 0-.48-.853L18 11" /><path d="M6 5v16" /><circle cx="12" cy="9" r="2" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Select University
              </h3>

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
          <div className="max-h-96 overflow-auto">
            <table className="w-full">
              <thead className="bg-orange-100 sticky top-0 z-5">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    University Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Action
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
                ) : filteredUser?.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-4 text-center text-gray-500">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  filteredUser?.map((item) => (
                    <tr key={item?.id}>
                      <td className="px-4 py-2 whitespace-nowrap">{item?.id}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{item?.name}</td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <button
                          type="button"
                          className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer text-orange-600 bg-orange-50 border border-orange-200 hover:bg-orange-100"
                          onClick={() => handleSelect(item)}
                        >
                          Select
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>

            </table>
          </div>

        </div>

        {/* Footer */}
        <div className="flex justify-end items-center p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UniversityModal
