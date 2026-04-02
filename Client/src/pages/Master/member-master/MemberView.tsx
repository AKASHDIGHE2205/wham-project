/* eslint-disable @typescript-eslint/no-explicit-any */
import { Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DataLoading from "../../../components/DataLoading";
import CustomPagination from '../../../helper/CustomPagination';
import { deactivateMember, getAllMembers } from "../../../services/master/masterApi";

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
  designation: string;
  isorganizer: string;
  status: string;
  teams: Team[];
}

const MemberView = () => {
  const [data, setData] = useState<Member[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [loading, setLoading] = useState(true);
  
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getAllMembers({
        search,
        page: currentPage,
        limit: itemsPerPage
      });
      setData(response?.members || []);
      setTotalItems(response?.total || 0);
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

  const handleDisable = async (data: Member) => {
    const body = {
      mem_id: data?.mem_id,
      status: data?.status === "A" ? "I" : "A"
    }
    const response = await deactivateMember(body);
    if (response) {
      fetchData();
    }
  }

    return (
      <div className="min-h-screen bg-white border border-indigo-300 m-1 rounded-md p-2 sm:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-indigo-600">Member List.</h1>
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
                  placeholder="Search member..."
                  className="block w-full pl-9 sm:pl-10 pr-3 py-2 sm:py-2 border border-gray-300 rounded-lg focus:ring-0 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200 text-sm sm:text-base"
                  onChange={(e) => setSearch(e.target.value)}
                  value={search}
                />
                <button className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-indigo-600 cursor-pointer font-bold" onClick={() => setSearch("")}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x-icon lucide-x"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
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
                      onChange={(e: any) => setItemsPerPage(Number(e.target.value))}
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

                {/* Add button */}
                <div className="shrink-0 hidden">
                  <Link
                    to={"/master/add-member"}
                    className="inline-flex items-center justify-center px-4 py-2 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 text-white font-medium rounded-lg hover:shadow-lg transition-all duration-200 shadow-sm cursor-pointer text-sm whitespace-nowrap"
                  >
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Add Member
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Members Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead className="bg-linear-to-r from-purple-50 to-indigo-50">
                  <tr>
                    <th className="px-2 py-3 text-center text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-2 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-2 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Mobile
                    </th>
                    <th className="px-2 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-2 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Address
                    </th>
                    <th className="px-2 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Team Name
                    </th>
                    <th className="px-2 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Status
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
                    data?.map((item) => (
                      <tr key={item?.mem_id} className="hover:bg-indigo-50 transition-colors duration-150">
                        <td className="px-2 py-2 text-center whitespace-nowrap text-sm text-black">{item?.mem_id}</td>
                        <td className="px-2 py-2 text-left whitespace-nowrap text-sm text-black">{item?.mem_name}</td>
                        <td className="px-2 py-2 text-left whitespace-nowrap text-sm text-black">
                          <a href={`tel:${item?.mobile}`} className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer">
                            {item?.mobile}
                          </a>
                        </td>
                        <td className="px-2 py-2 text-left whitespace-nowrap text-sm text-black">
                          <a href={`mailto:${item?.email}`} className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer">
                            {item?.email}
                          </a>
                        </td>
                        <td className="px-2 py-2 text-left text-sm text-black">{item?.address}</td>
                        <td className="px-2 py-2 text-left whitespace-nowrap text-sm text-black">
                          {item?.teams?.map(team => team.name).join(', ') || 'N/A'}
                        </td>
                        <td className="px-2 py-2 text-left whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${item?.status === "A"
                              ? "bg-green-100 text-green-800 border-green-200"
                              : "bg-red-100 text-red-800 border-red-200"
                              }`}
                          >
                            {item?.status === "A" ? "Active" : "In-active"}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-left whitespace-nowrap">
                          <div className="flex justify-center items-center gap-1">
                            <Link
                              to={`/master/edit-member/${item?.mem_id}?isEdit=false`}
                              className="inline-flex items-center p-1.5 text-sm font-medium text-gray-900 bg-green-50 rounded-lg hover:bg-green-200 transition-all duration-200 cursor-pointer"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" color="green" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye-icon lucide-eye"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" /><circle cx="12" cy="12" r="3" /></svg>
                            </Link>
                            <Link
                              to={`/master/edit-member/${item?.mem_id}?isEdit=true`}
                              className="inline-flex items-center p-1.5 text-sm font-medium text-gray-900 bg-blue-50 rounded-lg hover:bg-blue-200 transition-all duration-200 cursor-pointer"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" color="#0047B3" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil-line-icon lucide-pencil-line"><path d="M13 21h8" /><path d="m15 5 4 4" /><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" /></svg>
                            </Link>
                            <button
                              type="button"
                              onClick={() => handleDisable(item)}
                              className="inline-flex items-center p-1.5 text-sm font-medium text-gray-900 bg-red-50 rounded-lg hover:bg-red-200 transition-all duration-200 cursor-pointer"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" color="red" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-ban-icon lucide-ban"><circle cx="12" cy="12" r="10" /><path d="M4.929 4.929 19.07 19.071" /></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center py-4 text-indigo-600">
                        No Records Found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
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
      </div>
    )
  }

  export default MemberView