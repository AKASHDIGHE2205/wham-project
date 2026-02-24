import { Search } from "lucide-react"
import DataLoading from "../../../components/DataLoading"
import { useEffect, useState } from "react";
import { getAllUsers } from "../../../services/master/masterApi";
import CustomPagination from "../../../helper/CustomPagination";
import UserEdit from "./UserEdit";

export interface Users {
  user_id: number;
  full_name: string;
  phone: string;
  email: string;
  role: string;
  is_verified: string
  isorganizer: string
}

interface UsersResponse {
  users: Users[];
  total: number;
  active: number;
  inactive: number;
  page: number;
  limit: number;
}

const UsersView = () => {
  const [data, setData] = useState<Users[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [inactiveCount, setInactiveCount] = useState(0);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [selectedUser, setSelectedUser] = useState({});

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getAllUsers({
        search,
        page: currentPage,
        limit: itemsPerPage
      }) as UsersResponse;
      setData(response?.users || []);
      setTotalItems(response?.total || 0);
      setActiveCount(response?.active || 0);
      setInactiveCount(response?.inactive || 0);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 500);
    return () => clearTimeout(timer);
  }, [search, currentPage, itemsPerPage]);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleEdit = (item: Users) => {
    setShowEdit(true);
    setSelectedUser(item);
  }

  return (
    <div className="min-h-screen bg-white border border-orange-300 m-1 rounded-md p-2 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-orange-600">Users Master</h1>
            <p className="text-orange-400 mt-1 sm:mt-2 text-sm sm:text-base">Manage your organization Users.</p>
          </div>
        </div>

        {/* Stats Cards Section - Option 2: Colored Header */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          {/* Total Users Card */}
          <div className="bg-blue-50 rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="h-1 w-full bg-blue-500"></div>
            <div className="p-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">#{totalItems}</p>
                </div>
                <div className="p-2 bg-blue-50 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-users text-blue-600">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
              </div>
              <div className="mt-2 flex items-center text-xs text-gray-500">
                <span>All registered users</span>
              </div>
            </div>
          </div>

          {/* Active Users Card */}
          <div className="bg-green-50 rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="h-1 w-full bg-green-500"></div>
            <div className="p-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1">Active Users</p>
                  <p className="text-2xl font-bold text-green-600">#{activeCount}</p>
                </div>
                <div className="p-2 bg-green-50 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user-check text-green-600">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <polyline points="16 11 18 13 22 9" />
                  </svg>
                </div>
              </div>
              <div className="mt-2 flex items-center text-xs text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span>Currently active</span>
              </div>
            </div>
          </div>

          {/* Inactive Users Card */}
          <div className="bg-red-50 rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="h-1 w-full bg-red-500"></div>
            <div className="p-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1">Inactive Users</p>
                  <p className="text-2xl font-bold text-red-600">#{inactiveCount}</p>
                </div>
                <div className="p-2 bg-red-50 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user-x text-red-600">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <line x1="17" y1="8" x2="22" y2="13" />
                    <line x1="22" y1="8" x2="17" y2="13" />
                  </svg>
                </div>
              </div>
              <div className="mt-2 flex items-center text-xs text-red-600">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                <span>Suspended/inactive</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-4 sm:p-6 mb-4">
          <div className="flex flex-col gap-4 justify-between">
            {/* Search Input - 30% width on large screens */}
            <div className="w-full lg:w-[30%] relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search users..."
                className="block w-full pl-9 sm:pl-10 pr-3 py-2 sm:py-2 border border-gray-300 rounded-lg focus:ring-0 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all duration-200 text-sm sm:text-base"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-orange-600 cursor-pointer font-bold"
                onClick={() => setSearch("")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x-icon lucide-x h-4 w-4 sm:h-5 sm:w-5">
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>

            {/* Controls Container */}
            <div className="w-full flex justify-between items-center gap-4">
              {/* Items Per Page */}
              <div className="flex-1 max-w-[200px]">
                <div className="relative">
                  <select
                    name="itemsPerPage"
                    className="w-full pl-3 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:ring-orange-500 focus:border-orange-500 outline-none appearance-none bg-white cursor-pointer text-sm sm:text-base"
                    required
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  >
                    <option value={5}>5 per page</option>
                    <option value={10}>10 per page</option>
                    <option value={25}>25 per page</option>
                    <option value={50}>50 per page</option>
                    <option value={100}>100 per page</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead className="bg-linear-to-r from-purple-50 to-orange-50">
                <tr>
                  <th className="px-2 py-3 text-center text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Sr. No.
                  </th>
                  {/* <th className="px-2 py-3 text-center text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    User ID
                  </th> */}
                  <th className="px-2 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Contact No.
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Organizer
                  </th>
                  <th className="px-2 py-3 text-center text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-4">
                      <DataLoading />
                    </td>
                  </tr>
                ) : data?.length > 0 ? (
                  data?.map((item, index) => (
                    <tr key={item?.user_id} className="hover:bg-orange-50 transition-colors duration-150">
                      <td className="px-2 py-0.5 text-center whitespace-nowrap text-sm text-black">{index + 1}</td>
                      {/* <td className="px-2 py-0.5 text-center whitespace-nowrap text-sm text-black">{item?.user_id}</td> */}
                      <td className="px-2 py-0.5 text-left whitespace-nowrap text-sm text-black">
                        <div className="flex flex-col gap-1 items-start">
                          <span>{item?.full_name}</span>
                          <div className="self-start">
                            <span className="text-xs py-0.5 px-2 bg-gray-100 rounded-xl font-semibold">
                              <span>User Id : {item?.user_id}</span>
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-0.5 text-left whitespace-nowrap text-sm text-black">
                        {item?.email}
                      </td>
                      <td className="px-2 py-0.5 text-left whitespace-nowrap text-sm text-black">
                        {item?.phone}
                      </td>
                      <td className="px-2 py-0.5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item?.is_verified === 'A' ? 'bg-green-100 text-green-800' : item?.is_verified === 'I' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                          {item?.is_verified === "A" ? "Active" : "In-active"}
                        </span>
                      </td>

                      <td className="px-2 py-0.5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item?.isorganizer === 'Y' ? 'bg-green-100 text-green-800' : item?.isorganizer === 'N' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                          {item?.isorganizer === "Y" ? "Yes" : "No"}
                        </span>
                      </td>

                      <td className="px-3 py-2 text-center whitespace-nowrap">
                        <button
                          onClick={() => handleEdit(item)}
                          className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-orange-600 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-all duration-200 cursor-pointer"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-square-pen">
                            <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-4 text-orange-600">
                      No Records Found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-2">
          <CustomPagination
            itemPerPage={itemsPerPage}
            totalItems={totalItems}
            handlePageChange={handlePageChange}
            currentPage={currentPage}
          />
        </div>

      </div>
      {showEdit && (<UserEdit Data={selectedUser} show={showEdit} setShow={setShowEdit} fetchData={fetchData} />)}
    </div>
  )
}
export default UsersView