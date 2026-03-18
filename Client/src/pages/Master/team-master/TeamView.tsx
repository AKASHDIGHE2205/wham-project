/* eslint-disable @typescript-eslint/no-explicit-any */
import { Plus, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import DataLoading from '../../../components/DataLoading';
import CustomPagination from '../../../helper/CustomPagination';
import { getAllTeams, updateTeam } from '../../../services/master/masterApi';
import EditTeam from './EditTeam';
import NewTeam from './NewTeam';

interface Teams {
  id: number;
  name: string;
  manager_name: string;
  manager_id: number;
  description: string;
  status: string;
}

const TeamView = () => {
  const [showCreate, setShowCreat] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showView, setShowView] = useState(false);
  const [data, setData] = useState<Teams[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState({});

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getAllTeams({
        search,
        page: currentPage,
        limit: itemsPerPage
      });

      setData(response.teams || []);
      setTotalItems(response.total || 0);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 500);

    return () => clearTimeout(timer);
  }, [search, currentPage, itemsPerPage]);

  const handleCreate = () => {
    setShowCreat(true);
  }

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleEdit = (data: Teams) => {
    setSelectedTeam(data);
    setShowEdit(true);
  }
  const handleView = (data : Teams)=> {
    setSelectedTeam(data);
    setShowView(true);
  }

  const handleDeactivate = async (data: Teams) => {
    const body = {
      id: data?.id,
      name: data?.name,
      managerId: data?.manager_id,
      description: data?.description,
      status: data?.status === "A" ? "I" : "A"
    }
    const response = await updateTeam(body);
    if (response) {
      fetchData();
    }
  }

  return (
    <>
      <div className="min-h-screen bg-linear-to-br from-purple-50 via-blue-50 to-indigo-50 p-2 sm:p-6 border border-indigo-300 m-1 rounded-md">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-indigo-600">Team List</h1>
            </div>
          </div>

          {/* Search and Filter Section */}
          <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-2 mb-4">
            <div className="flex flex-col gap-4 justify-between">
              {/* Search Input - 30% width on large screens */}
              <div className="w-full lg:w-[30%] relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search teams..."
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
                <div className="shrink-0">
                  <button
                    className="inline-flex items-center justify-center px-4 py-2 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 text-white font-medium rounded-lg hover:shadow-lg transition-all duration-200 shadow-sm cursor-pointer text-sm whitespace-nowrap"
                    onClick={handleCreate}
                  >
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Add Team
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Teams Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[400px]">
                <thead className="bg-linear-to-r from-purple-50 to-indigo-50">
                  <tr>
                    <th className="px-2 py-3 text-center  text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-2 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-2 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Team Lead
                    </th>
                    <th className="px-2 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden">
                      Description
                    </th>
                    <th className="px-2 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-2 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="text-center py-4 text-gray-500">
                        <DataLoading />
                      </td>
                    </tr>
                  ) : data?.length > 0 ? (
                    data?.map((item) => (
                      <tr key={item?.id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-2 py-2 text-center whitespace-nowrap text-sm text-gray-900">{item?.id}</td>
                        <td className="px-2 py-2 text-left whitespace-nowrap text-sm text-gray-900">{item?.name}</td>
                        <td className="px-2 py-2 text-left whitespace-nowrap text-sm text-gray-900">{item?.manager_name}</td>
                        <td className="px-2 py-2 text-left text-sm text-gray-900 hidden">{item?.description}</td>
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
                            <button
                              type="button"
                              className="inline-flex items-center p-1.5 text-sm font-medium text-gray-900 bg-green-50 rounded-lg hover:bg-green-200 transition-all duration-200 cursor-pointer"
                              onClick={() => handleView(item)}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" color="green" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye-icon lucide-eye"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" /><circle cx="12" cy="12" r="3" /></svg>
                            </button>
                            <button
                              onClick={() => handleEdit(item)}
                              className="inline-flex items-center p-1.5 text-sm font-medium text-gray-900 bg-blue-50 rounded-lg hover:bg-blue-200 transition-all duration-200 cursor-pointer"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" color="#0047B3" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil-line-icon lucide-pencil-line"><path d="M13 21h8" /><path d="m15 5 4 4" /><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" /></svg>
                            </button>
                            <button
                              type="button"
                              className="inline-flex items-center p-1.5 text-sm font-medium text-gray-900 bg-red-50 rounded-lg hover:bg-red-200 transition-all duration-200 cursor-pointer"
                              onClick={() => handleDeactivate(item)}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" color="red" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-ban-icon lucide-ban"><circle cx="12" cy="12" r="10" /><path d="M4.929 4.929 19.07 19.071" /></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center py-4 text-indigo-600">
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
      {showCreate && (
        <NewTeam
          show={showCreate}
          setShow={setShowCreat}
          fetchData={fetchData}
        />
      )}
      {showEdit && (
        <EditTeam
          show={showEdit}
          setShow={setShowEdit}
          data={selectedTeam}
          fetchData={fetchData}
          isEdit={true}
        />
      )}
      {showView && (
        <EditTeam
          show={showView}
          setShow={setShowView}
          data={selectedTeam}
          fetchData={fetchData}
          isEdit={false}
        />
      )}
    </>
  );
};

export default TeamView;