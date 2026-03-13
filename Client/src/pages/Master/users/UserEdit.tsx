import React, { useState, type FC } from "react"
import { getUserFromStorage } from "../../../helper/cryptoUser";
import { activeUser } from "../../../services/master/masterApi";
import toast from "react-hot-toast";

interface Props {
  Data: any
  show: boolean;
  setShow: (show: boolean) => void;
  fetchData: () => void
  isEdit?: boolean
}

const UserEdit: FC<Props> = ({ Data, show, setShow, fetchData, isEdit }) => {
  const [inputs, setInputs] = useState({
    user_id: Data?.user_id || "",
    full_name: Data?.full_name || "",
    phone: Data?.phone || "",
    email: Data?.email || "",
    role: Data?.role || "",
    is_verified: Data?.is_verified || "",
    isorganizer: Data?.isorganizer || ""
  });

  const user = getUserFromStorage();
  if (!show) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setInputs({ ...inputs, [name]: value })
  }

  const handleCancel = () => {
    setShow(false);
    setInputs(
      {
        user_id: "",
        full_name: "",
        phone: "",
        email: "",
        role: "",
        is_verified: "",
        isorganizer: ""
      }
    );
    fetchData();
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = {
      user_id: Data?.user_id || "",
      full_name: inputs?.full_name || "",
      phone: inputs?.phone || "",
      email: inputs?.email || "",
      role: inputs?.role || "",
      is_verified: inputs?.is_verified || "",
      isorganizer: inputs?.isorganizer || "",
      u_by: user?.id || 0
    }
    const response = await activeUser(body);
    if (response) {
      toast.success(response?.message || "User has been successfully updated!");
      handleCancel();
    }
  }

  return (
    <div className="fixed inset-0 bg-orange-100/20 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-linear-to-br from-orange-500 to-purple-600 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              {isEdit ? "Update User" : "View User"}
            </h3>
          </div>
          <button
            type="button"
            className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer p-2 hover:bg-gray-100 rounded-lg"
            onClick={handleCancel}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Form */}
        <form className="p-6 space-y-6" onSubmit={handleSubmit}>
          {/* Two Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* User Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User Name
              </label>
              <input
                type="text"
                name="full_name"
                value={inputs.full_name}
                onChange={handleChange}
                placeholder="Enter user name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all duration-200 bg-gray-100 cursor-not-allowed"
                required
                readOnly
              />
            </div>

            {/* User Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User Email
              </label>
              <input
                type="text"
                name="email"
                value={inputs.email}
                onChange={handleChange}
                placeholder="Enter user email"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all duration-200 bg-gray-100 cursor-not-allowed"
                required
                readOnly
              />
            </div>

            {/* User Mobile */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User Mobile
              </label>
              <input
                type="text"
                name="phone"
                value={inputs.phone}
                onChange={handleChange}
                placeholder="Enter user phone"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all duration-200 bg-gray-100 cursor-not-allowed"
                required
                readOnly
              />
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
                  name="is_verified"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:ring-orange-500 focus:border-orange-500 outline-none appearance-none bg-white cursor-pointer disabled:cursor-not-allowed"
                  required
                  value={inputs.is_verified}
                  onChange={handleChange}
                  disabled={!isEdit}
                >
                  <option value="" disabled>Select status</option>
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

            {/* Role Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User Role <span className="text-orange-600">*</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <select
                  name="role"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:ring-orange-500 focus:border-orange-500 outline-none appearance-none bg-white cursor-pointer disabled:cursor-not-allowed"
                  required
                  value={inputs.role}
                  onChange={handleChange}
                  disabled={!isEdit}
                >
                  <option value="" disabled>Select status</option>
                  <option value="User">User</option>
                  <option value="Master">Master</option>
                  <option value="Manager">Manager</option>
                  <option value="Admin">Admin</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* isorganizer Dropdown */}
            <div >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                isorganizer Role <span className="text-orange-600">*</span>
              </label>
              <div className="relative group md:max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <select
                  name="isorganizer"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:ring-orange-500 focus:border-orange-500 outline-none appearance-none bg-white cursor-pointer disabled:cursor-not-allowed"
                  required
                  value={inputs.isorganizer}
                  onChange={handleChange}
                  disabled={!isEdit}
                >
                  <option value="" disabled>Select status</option>
                  <option value="Y">YES</option>
                  <option value="N">NO</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-0 focus:ring-offset-2 focus:ring-orange-500 cursor-pointer transition-all duration-200"
              onClick={handleCancel}
            >
              Cancel
            </button>
            {isEdit && (
              <button
                type="submit"
                className="px-6 py-2 text-sm font-medium text-white bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 border border-transparent rounded-lg hover:shadow-lg focus:outline-none focus:ring-0 focus:ring-offset-2 focus:ring-orange-500 cursor-pointer transition-all duration-200 flex items-center gap-2"
              >
                Update
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

export default UserEdit;