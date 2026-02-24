import { Plus, Search } from "lucide-react"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { getAllUniversities } from "../../../services/master/masterApi";
import CustomPagination from "../../../helper/CustomPagination";
import DataLoading from "../../../components/DataLoading";
import { MEDIA_URL } from "../../../constant/Baseurl";
import ShowMedia from "./ShowMedia";

export interface University {
  id: number;
  name: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
  photo?: string;
  status: "A" | "I";
  c_by: number;
  c_at: string;
}

const UniversityView = () => {
  const [data, setData] = useState<University[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [loading, setLoading] = useState(true);
  const [showImage, setShowImage] = useState(false);
  const [selectedUniversity, setSelectedUniversity] = useState({})

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getAllUniversities({
        search,
        page: currentPage,
        limit: itemsPerPage
      });
      setData(response?.universities || []);
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
  const handleImageShow = (data: University) => {
    setSelectedUniversity(data);
    setShowImage(true);
  }

  return (
    <div className="min-h-screen bg-white border border-orange-300 m-1 rounded-md p-2 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-orange-600">University Master</h1>
            <p className="text-orange-400 mt-1 sm:mt-2 text-sm sm:text-base">Manage universities.</p>
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
                placeholder="Search university..."
                className="block w-full pl-9 sm:pl-10 pr-3 py-2 sm:py-2 border border-gray-300 rounded-lg focus:ring-0 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all duration-200 text-sm sm:text-base"
                onChange={(e) => setSearch(e.target.value)}
                value={search}
              />
              <button className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-orange-600 cursor-pointer font-bold"
                onClick={() => setSearch("")}
              >
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
                    className="w-full pl-3 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:ring-orange-500 focus:border-orange-500 outline-none appearance-none bg-white cursor-pointer text-sm sm:text-base"
                    required
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

              {/* Add button */}
              <div className="shrink-0">
                <Link
                  to={"/master/add-university"}
                  className="inline-flex items-center justify-center px-4 py-2 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 text-white font-medium rounded-lg hover:shadow-lg transition-all duration-200 shadow-sm cursor-pointer text-sm sm:text-base whitespace-nowrap"
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Add University
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* universitys Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead className="bg-linear-to-r from-purple-50 to-orange-50">
                <tr>
                  <th className="px-2 py-3 text-center text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-2 py-3 text-center text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Image
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Address
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
                    <tr key={item?.id} className="hover:bg-orange-50 transition-colors duration-150">
                      <td className="px-2 py-2 text-center whitespace-nowrap text-sm text-black">{item?.id}</td>
                      <td className="px-1 py-1 text-center whitespace-nowrap text-sm text-black cursor-pointer"
                        onClick={() => handleImageShow(item)}
                      >
                        <img
                          src={`${MEDIA_URL}${item?.photo}`}
                          alt="University"
                          className="w-20 h-20 object-cover mx-auto rounded"
                        />
                      </td>
                      <td className="px-4 py-2 text-left">
                        <div className="max-w-[300px] wrap-break-words whitespace-normal text-sm text-gray-900">
                          {item?.name}
                        </div>
                      </td>
                      <td className="px-2 py-2 text-left text-sm text-black min-w-[220px] sm:min-w-0">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm leading-snug">
                            {item?.address}
                          </span>
                          <span className="text-xs text-gray-600">
                            • lat: {item?.lat} • lng: {item?.lng}
                          </span>
                        </div>
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
                        <Link
                          to={`/master/edit-university/${item?.id}`}
                          className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-orange-600 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-all duration-200 cursor-pointer"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-square-pen-icon lucide-square-pen">
                            <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z" />
                          </svg>
                        </Link>
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
      {showImage && (
        <ShowMedia show={showImage} setShow={setShowImage} data={selectedUniversity} />
      )}
    </div>
  )
}

export default UniversityView
