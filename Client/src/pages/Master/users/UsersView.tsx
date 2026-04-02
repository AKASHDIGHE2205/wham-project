import { Search, User } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import DataLoading from "../../../components/DataLoading";
import { MEDIA_URL } from "../../../constant/Baseurl";
import { getUserFromStorage } from "../../../helper/cryptoUser";
import CustomPagination from "../../../helper/CustomPagination";
import { activeUser, getAllUsers } from "../../../services/master/masterApi";
import UserEdit from "./UserEdit";

export interface Users {
  user_id: number;
  full_name: string;
  phone: string;
  email: string;
  role: string;
  photo: string;
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
  const [showView, setShowView] = useState(false);
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
  const user = getUserFromStorage();

  const handleDeactivateUser = async (Data: Users) => {
    const body = {
      user_id: Data?.user_id || "",
      full_name: Data?.full_name || "",
      phone: Data?.phone || "",
      email: Data?.email || "",
      role: Data?.role || "",
      is_verified: Data?.is_verified === "A" ? "I" : "A",
      isorganizer: Data?.isorganizer || "",
      u_by: user?.id || 0
    }
    const response = await activeUser(body);
    if (response) {
      toast.success(response?.message || "User has been successfully updated!");
      fetchData();
    }
  }

  const handleView = (item: Users) => {
    setShowView(true);
    setSelectedUser(item);
  }

  return (
    <div className="min-h-screen bg-white border border-indigo-300 m-1 rounded-md p-2 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-indigo-600">Users List</h1>
          </div>
        </div>

        {/* Stats Cards Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {/* Total Users Card */}
          <div className="bg-linear-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">Total Users</p>
                  <p className="text-3xl font-bold text-blue-900">{totalItems}</p>
                </div>
                <div className="p-3 bg-blue-200 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-users text-blue-700">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Active Users Card */}
          <div className="bg-linear-to-br from-green-50 to-green-100 rounded-lg border border-green-200 shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-2">Active Users</p>
                  <p className="text-3xl font-bold text-green-900">{activeCount}</p>
                </div>
                <div className="p-3 bg-green-200 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user-check text-green-700">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <polyline points="16 11 18 13 22 9" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Inactive Users Card */}
          <div className="bg-linear-to-br from-red-50 to-red-100 rounded-lg border border-red-200 shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-2">Inactive Users</p>
                  <p className="text-3xl font-bold text-red-900">{inactiveCount}</p>
                </div>
                <div className="p-3 bg-red-200 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user-x text-red-700">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <line x1="17" y1="8" x2="22" y2="13" />
                    <line x1="22" y1="8" x2="17" y2="13" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-4 mb-4">
          <div className="flex flex-col gap-4 justify-between">
            {/* Search Input - 30% width on large screens */}
            <div className="w-full lg:w-[30%] relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search users..."
                className="block w-full pl-9 sm:pl-10 pr-3 py-2 sm:py-2 border border-gray-300 rounded-lg focus:ring-0 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200 text-sm sm:text-base"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-indigo-600 cursor-pointer font-bold"
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
                    className="w-full pl-3 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:ring-indigo-500 focus:border-indigo-500 outline-none appearance-none bg-white cursor-pointer text-sm sm:text-base"
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

        {/* Desktop Table View - hidden on mobile */}
        <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead className="bg-linear-to-r from-purple-50 to-indigo-50">
                <tr>
                  <th className="px-2 py-3 text-center text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Sr. No.
                  </th>
                  <th className="px-2 py-3 text-center text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Profile
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Contact No.
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Email
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
                    <td colSpan={8} className="text-center py-4">
                      <DataLoading />
                    </td>
                  </tr>
                ) : data?.length > 0 ? (
                  data?.map((item, index) => (
                    <tr key={item?.user_id} className="hover:bg-indigo-50 transition-colors duration-150">
                      <td className="px-2 py-2 text-center whitespace-nowrap text-sm text-black">{index + 1}</td>
                      <td className="px-2 py-2 text-center whitespace-nowrap text-sm text-black">
                        {item?.photo ? (
                          <img
                            src={`${MEDIA_URL}${item?.photo}`}
                            alt="User"
                            className="w-12 h-12 object-cover mx-auto rounded-lg"
                          />
                        ) : (
                          <div className="w-12 h-12 mx-auto flex items-center justify-center rounded-lg bg-[#e1dcff]">
                            <User className="w-6 h-6 text-[#4829f7]" />
                          </div>
                        )}
                      </td>
                      <td className="px-2 py-2 text-left text-sm text-black">
                        <div className="flex flex-col gap-1 items-start">
                          <span className="font-medium">{item?.full_name}</span>
                          <span className="text-xs py-0.5 px-2 bg-gray-100 rounded-full">
                            ID: {item?.user_id}
                          </span>
                        </div>
                      </td>
                      <td className="px-2 py-2 text-left text-sm text-black">
                        <a href={`tel:${item?.phone}`} className="text-blue-600 hover:text-blue-800 hover:underline">
                          {item?.phone}
                        </a>
                      </td>
                      <td className="px-2 py-2 text-left text-sm text-black">
                        <a href={`mailto:${item?.email}`} className="text-blue-600 hover:text-blue-800 hover:underline break-all">
                          {item?.email}
                        </a>
                      </td>
                      <td className="px-2 py-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                          item?.is_verified === 'A' 
                            ? "bg-green-100 text-green-800 border-green-200" 
                            : "bg-red-100 text-red-800 border-red-200"
                        }`}>
                          {item?.is_verified === "A" ? "Active" : "In-active"}
                        </span>
                      </td>
                      <td className="px-2 py-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                          item?.isorganizer === 'Y' 
                            ? "bg-green-100 text-green-800 border-green-200" 
                            : "bg-red-100 text-red-800 border-red-200"
                        }`}>
                          {item?.isorganizer === "Y" ? "Yes" : "No"}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-left whitespace-nowrap">
                        <div className="flex justify-center items-center gap-1">
                          <button
                            type="button"
                            className="inline-flex items-center p-1.5 text-sm font-medium text-gray-900 bg-green-50 rounded-lg hover:bg-green-200 transition-all duration-200 cursor-pointer"
                            onClick={() => handleView(item)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" color="green" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye-icon lucide-eye"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" /><circle cx="12" cy="12" r="3" /></svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEdit(item)}
                            className="inline-flex items-center p-1.5 text-sm font-medium text-gray-900 bg-blue-50 rounded-lg hover:bg-blue-200 transition-all duration-200 cursor-pointer"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" color="#0047B3" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil-line-icon lucide-pencil-line"><path d="M13 21h8" /><path d="m15 5 4 4" /><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" /></svg>
                          </button>
                          <button
                            type="button"
                            className="inline-flex items-center p-1.5 text-sm font-medium text-gray-900 bg-red-50 rounded-lg hover:bg-red-200 transition-all duration-200 cursor-pointer"
                            onClick={() => handleDeactivateUser(item)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" color="red" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-ban-icon lucide-ban"><circle cx="12" cy="12" r="10" /><path d="M4.929 4.929 19.07 19.071" /></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="text-center py-4 text-indigo-600">
                      No Records Found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Card View - visible only on mobile */}
        <div className="block md:hidden">
          {loading ? (
            <div className="flex justify-center py-8">
              <DataLoading />
            </div>
          ) : data?.length > 0 ? (
            <div className="space-y-3">
              {data?.map((item) => (
                <div key={item?.user_id} className="bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  {/* Main Content Row */}
                  <div className="p-3">
                    <div className="flex items-start gap-3">
                      {/* Profile Image */}
                      <div className="shrink-0">
                        {item?.photo ? (
                          <img
                            src={`${MEDIA_URL}${item?.photo}`}
                            alt="User"
                            className="w-14 h-14 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-14 h-14 flex items-center justify-center rounded-lg bg-[#e1dcff]">
                            <User className="w-7 h-7 text-[#4829f7]" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold text-gray-900 text-sm">{item?.full_name}</h3>
                            <p className="text-xs text-gray-500 mt-0.5">ID: {item?.user_id}</p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${
                              item?.is_verified === "A"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}>
                              {item?.is_verified === "A" ? "Active" : "Inactive"}
                            </span>
                            <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${
                              item?.isorganizer === "Y"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}>
                              {item?.isorganizer === "Y" ? "Organizer" : "Not Organizer"}
                            </span>
                          </div>
                        </div>

                        {/* Phone */}
                        <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                          <svg className="w-3 h-3 shrink-0 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <a href={`tel:${item?.phone}`} className="text-blue-600 hover:underline truncate">
                            {item?.phone}
                          </a>
                        </p>

                        {/* Email */}
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <svg className="w-3 h-3 shrink-0 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <a href={`mailto:${item?.email}`} className="text-blue-600 hover:underline truncate">
                            {item?.email}
                          </a>
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons - Compact */}
                    <div className="flex items-center justify-end gap-1 mt-3 pt-2 border-t border-gray-50">
                      <button
                        type="button"
                        onClick={() => handleView(item)}
                        className="inline-flex items-center p-1.5 text-sm font-medium text-gray-900 bg-green-50 rounded-lg hover:bg-green-200 transition-all duration-200 cursor-pointer"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" color="green" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye-icon lucide-eye"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" /><circle cx="12" cy="12" r="3" /></svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEdit(item)}
                        className="inline-flex items-center p-1.5 text-sm font-medium text-gray-900 bg-blue-50 rounded-lg hover:bg-blue-200 transition-all duration-200 cursor-pointer"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" color="#0047B3" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil-line-icon lucide-pencil-line"><path d="M13 21h8" /><path d="m15 5 4 4" /><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" /></svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeactivateUser(item)}
                        className="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title={item?.is_verified === "A" ? "Deactivate" : "Activate"}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M4.929 4.929 19.07 19.071" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-indigo-600 bg-white rounded-lg border border-gray-100">
              No Records Found
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="mt-2">
          <CustomPagination
            itemPerPage={itemsPerPage}
            totalItems={totalItems}
            handlePageChange={handlePageChange}
            currentPage={currentPage}
          />
        </div>
      </div>
      {showEdit && (<UserEdit Data={selectedUser} show={showEdit} setShow={setShowEdit} fetchData={fetchData} isEdit={true} />)}
      {showView && (<UserEdit Data={selectedUser} show={showView} setShow={setShowView} fetchData={fetchData} isEdit={false} />)}
    </div>
  )
}
export default UsersView