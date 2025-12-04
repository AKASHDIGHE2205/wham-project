import { Plus, Search } from "lucide-react"
import { useEffect, useState } from "react";
import { getAllTasks } from "../../../services/master/masterApi";
import CustomPagination from "../../../helper/CustomPagination";
import AddTask from "./AddTask";
import UpdateTask from "./UpdateTask";

export interface Task {
  id: number;
  task_name: string;
  task_desc: string;
  status: string;
  step_id: number;
  step_name: string;
}

const TaskView = () => {
  const [data, setData] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getAllTasks();
      setData(response.tasks || []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {

    fetchData();
  }, [])

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  }

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  }

  const filteredItems = data.filter((item: Task) => {
    return item.task_name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);

  const handleEdit = (item: Task) => {
    setSelectedTask(item);
    setShowUpdate(true);
  }

  return (
    <div className="min-h-screen bg-white p-2 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-orange-600">Tasks Master</h1>
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
                placeholder="Search tasks by name..."
                className="block w-full pl-9 sm:pl-10 pr-3 py-2 sm:py-2 border border-gray-300 rounded-lg focus:ring-0 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all duration-200 text-sm sm:text-base"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>

            {/* Controls Container */}
            <div className="w-full flex justify-between items-center gap-4">
              {/* Items Per Page */}
              <div className="flex-1 max-w-[200px]">
                <div className="relative">
                  <select
                    name="itemsPerPage"
                    className="w-full pl-3 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:ring-orange-500 focus:border-orange-500 outline-none appearance-none bg-white cursor-pointer text-sm sm:text-base"
                    value={itemsPerPage}
                    onChange={handleItemsPerPageChange}
                    required
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
                  className="inline-flex items-center justify-center px-4 py-2 bg-linear-to-r from-orange-500 to-purple-600 text-white font-medium rounded-lg hover:shadow-lg transition-all duration-200 shadow-sm cursor-pointer text-sm sm:text-base whitespace-nowrap"
                  onClick={() => setShowAdd(true)}
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Add Task
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tasks Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-200 text-center">
              <thead className="bg-linear-to-r from-purple-50 to-orange-50">
                <tr>
                  <th className="px-3 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-3 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-3 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Step Name
                  </th>
                  <th className="px-3 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider hidden sm:table-cell">
                    Description
                  </th>
                  <th className="px-3 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-3 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-gray-500">
                      <div className="flex justify-center items-center text-orange-600 gap-2">
                        <div className="animate-spin h-6 w-6 border-4 border-orange-600 border-t-transparent rounded-full"></div>
                        <span>Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : currentItems.length > 0 ? (
                  currentItems.map((task: Task) => (
                    <tr key={task.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{task.id}</td>
                      <td className="px-3 py-3 text-sm text-gray-900">{task.task_name}</td>
                      <td className="px-3 py-3 text-sm text-gray-900">{task.step_name}</td>
                      <td className="px-3 py-3 text-sm text-gray-900 hidden sm:table-cell">
                        {task.task_desc}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${task.status === 'active' ? 'bg-green-100 text-green-800' :
                          task.status === 'inactive' ? 'bg-red-100 text-red-800' :
                            task.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                          }`}>
                          {task.status}
                        </span>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleEdit(task)}
                          className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-orange-600 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-all duration-200 cursor-pointer"
                        >
                          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-6 text-orange-600">
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
            data={filteredItems}
            handlePageChange={handlePageChange}
            currentPage={currentPage}
          />
        </div>

      </div>
      {showAdd && (
        <AddTask
          show={showAdd}
          setShow={setShowAdd}
          fetchData={fetchData}
        />
      )}
      {showUpdate && (
        <UpdateTask
          show={showUpdate}
          setShow={setShowUpdate}
          Data={selectedTask}
          fetchData={fetchData}
        />
      )}
    </div>
  )
}

export default TaskView;