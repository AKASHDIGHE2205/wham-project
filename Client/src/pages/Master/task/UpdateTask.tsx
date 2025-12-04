import React, { useEffect, useState, type FC } from "react";
import type { Task } from "./TaskView";
import type { RootState } from "../../../store/store";
import { useDispatch, useSelector } from "react-redux";
import { handleSelectStep } from "../../../feature/masterSlice";
import StepModal from "./StepModal";
import { updateTask } from "../../../services/master/masterApi";

interface Props {
  show: boolean;
  setShow: (show: boolean) => void;
  Data: Task | null
  fetchData: () => void
}

const UpdateTask: FC<Props> = ({ show, setShow, Data, fetchData }) => {
  const [inputs, setInputs] = useState({
    id: Data?.id || 0,
    name: Data?.task_name || "",
    status: Data?.status || "",
    description: Data?.task_desc || ""
  })
  const [loading, setLoading] = useState(false);
  const [showSteps, setShowSteps] = useState(false);
  const dispatch = useDispatch();
  const { step_id, step_name } = useSelector((state: RootState) => state.master)

  useEffect(() => {
    dispatch(handleSelectStep({ id: Data?.id || 0, name: Data?.step_name || "" }))
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setInputs({ ...inputs, [name]: value });
  };

  if (!show) return null;
  const handleClose = () => {
    setInputs({
      id: Data?.id || 0,
      name: Data?.task_name || "",
      status: Data?.status || "",
      description: Data?.task_desc || ""
    });
    dispatch(handleSelectStep({ id: 0, name: "" }))
    fetchData();
    setShow(false);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true)
    const body = {
      taskId: Data?.id || 0,
      taskName: inputs?.name || "",
      description: inputs?.description || "",
      status: inputs?.status || "",
      stepId: step_id || 0
    }
    const response = await updateTask(body);
    if (response) {
      setLoading(true)
      handleClose();
    }
  }
  return (
    <div className="fixed inset-0 bg-orange-100/20 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-linear-to-br from-orange-500 to-purple-600 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              Update Task
            </h3>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer p-2 hover:bg-gray-100 rounded-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Form */}
        <form className="p-6 space-y-6" onSubmit={handleSubmit}>
          {/* Task Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task Name <span className="text-orange-600">*</span>
            </label>

            <input
              type="text"
              name="name"
              value={inputs?.name}
              onChange={handleChange}
              placeholder="Enter task name"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all duration-200"
              required
            />
          </div>

          {/* Manager Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Master Step <span className="text-orange-600">*</span>
            </label>
            <div className="flex gap-2">
              <div className="flex-1">
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all duration-200"
                  placeholder="Select Master Step..."
                  readOnly
                  value={step_name}
                />
              </div>
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-white bg-linear-to-r from-orange-500 to-purple-600 rounded-lg hover:shadow transition duration-300 flex items-center gap-2 cursor-pointer"
                onClick={() => setShowSteps(true)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <line x1="19" x2="19" y1="8" y2="14" />
                  <line x1="22" x2="16" y1="11" y2="11" />
                </svg>
              </button>
            </div>
          </div>

          {/* Status Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status <span className="text-orange-600">*</span>
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <select
                name="status"
                value={inputs?.status}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:ring-orange-500 focus:border-orange-500 outline-none appearance-none bg-white cursor-pointer"
                required
              >
                <option value="">Select status</option>
                <option value="A">Active</option>
                <option value="I">Inactive</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <div className="relative group">
              <div className="absolute top-3 left-3 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </div>
              <textarea
                rows={3}
                name="description"
                value={inputs?.description}
                onChange={handleChange}
                placeholder="Enter task description, goals, or notes..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:ring-orange-500 focus:border-orange-500 outline-none resize-none transition-all duration-200"
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-0 focus:ring-offset-2 focus:ring-orange-500 cursor-pointer transition-all duration-200"
              onClick={handleClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 text-sm font-medium text-white bg-linear-to-r from-orange-500 to-purple-600 border border-transparent rounded-lg hover:shadow-lg focus:outline-none focus:ring-0 focus:ring-offset-2 focus:ring-orange-500 cursor-pointer transition-all duration-200 flex items-center gap-2"
            >
              {loading ? 'Updatting' : 'Update'}
            </button>
          </div>
        </form>
      </div>
      {showSteps && (
        <StepModal
          show={showSteps}
          setShow={setShowSteps}
        />
      )}
    </div>
  )
}

export default UpdateTask
