/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, type FC } from "react";
import { useDispatch } from "react-redux";
import { handleSelectStep } from "../feature/masterSlice";
import { getActiveSteps } from "../services/dashboard/DashboardApi";

interface Props {
  show: boolean;
  setShow: (show: boolean) => void;
}
interface Steps {
  id: number;
  step_name: string;
  step_desc: string;
  status: string;
}
const StepModal: FC<Props> = ({ show, setShow }) => {
  const [data, setData] = useState<Steps[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const response = await getActiveSteps();
      setData(response?.steps || [])
      setLoading(false);
    }
    fetchData();
  }, [])
  const filteredData = data?.filter((item: Steps) =>
    item?.id?.toString()?.toLowerCase()?.includes(search?.toString()?.toLowerCase()) ||
    item?.step_name?.toLowerCase().includes(search?.toLowerCase())
  )

  if (!show) return null;
  const handleClose = () => {
    dispatch(handleSelectStep({ id: 0, name: "" }))
    setShow(false);

  }

  const handleSelect = (item: any) => {
    dispatch(handleSelectStep({ id: item?.id, name: item?.step_name }))
    setShow(false)
  }

  return (
    <div className="fixed inset-0 bg-orange-100/20 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-linear-to-br from-orange-500 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">
              Select Step
            </h3>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer p-1 sm:p-2 hover:bg-gray-100 rounded-lg"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search Input */}
        <div className="p-3 sm:p-4">
          <input
            type="text"
            placeholder="Type here to search..."
            onChange={(e: any) => setSearch(e.target.value)}
            className="w-full px-3 py-2 sm:py-2 border border-gray-300 rounded-lg focus:ring-0 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all duration-200 text-sm sm:text-base" />
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-linear-to-r from-purple-50 to-orange-50">
              <tr>
                <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={3} className="text-center py-6 text-gray-500">
                    <div className="flex justify-center items-center text-orange-600 gap-2">
                      <div className="animate-spin h-5 w-5 sm:h-6 sm:w-6 border-4 border-orange-600 border-t-transparent rounded-full"></div>
                      <span className="text-sm sm:text-base">Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredData?.length > 0 ? (
                filteredData?.map((step: Steps) => (
                  <tr key={step?.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-3 py-1 text-center text-sm text-gray-900">{step?.id}</td>
                    <td className="px-3 py-1 text-left text-sm text-gray-900">{step?.step_name}</td>
                    <td className="px-3 py-1 text-left">
                      <button
                        type="button"
                        className="inline-flex items-center px-3 py-1.5 text-xs sm:text-sm font-medium text-orange-600 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-all duration-200 cursor-pointer"
                        onClick={() => handleSelect(step)}
                      >
                        Select
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="text-center py-6 text-orange-600 text-sm sm:text-base">
                    No active stpe Found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end space-x-3 p-4 border-t border-gray-200">
          <button
            type="button"
            className="px-4 py-2 sm:px-6 sm:py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-0 focus:ring-offset-2 focus:ring-orange-500 cursor-pointer transition-all duration-200"
            onClick={handleClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div >
  )
}

export default StepModal
