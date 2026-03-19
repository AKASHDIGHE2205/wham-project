import React, { useState, type FC } from "react";
import toast from "react-hot-toast";
import { getUserFromStorage } from "../../../helper/cryptoUser";
import { activeUser } from "../../../services/master/masterApi";

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
    <>
      {/* Backdrop with blur */}
      <div 
        className="fixed inset-0 bg-indigo-100/30 backdrop-blur-xs z-50 transition-opacity duration-300"
        onClick={handleCancel}
        aria-hidden="true"
      />
      
      {/* Offcanvas/Drawer */}
      <div
        className="fixed inset-y-0 right-0 w-full sm:w-[400px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto"
        style={{
          transform: show ? 'translateX(0)' : 'translateX(100%)',
        }}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={isEdit ? "Edit User" : "View User"}
      >
        <div className="min-h-full flex flex-col">
          {/* Offcanvas Header */}
          <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-linear-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
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
              aria-label="Close drawer"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Offcanvas Content - Vertical Form */}
          <div className="flex-1 p-6">
            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* User Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  User Name <span className="text-indigo-600">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    name="full_name"
                    value={inputs.full_name}
                    onChange={handleChange}
                    placeholder="Enter user name"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-0 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200 bg-gray-50 cursor-not-allowed"
                    required
                    readOnly
                  />
                </div>
              </div>

              {/* User Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  User Email <span className="text-indigo-600">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12H8m12 0a4 4 0 01-4 4H8a4 4 0 01-4-4V8a4 4 0 014-4h8a4 4 0 014 4v4z" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={inputs.email}
                    onChange={handleChange}
                    placeholder="Enter user email"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-0 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200 bg-gray-50 cursor-not-allowed"
                    required
                    readOnly
                  />
                </div>
              </div>

              {/* User Mobile */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  User Mobile <span className="text-indigo-600">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={inputs.phone}
                    onChange={handleChange}
                    placeholder="Enter user phone"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-0 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200 bg-gray-50 cursor-not-allowed"
                    required
                    readOnly
                  />
                </div>
              </div>

              {/* Status Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Status <span className="text-indigo-600">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <select
                    name="is_verified"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-0 focus:ring-indigo-500 focus:border-indigo-500 outline-none appearance-none bg-white cursor-pointer disabled:bg-gray-50 disabled:cursor-not-allowed"
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
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  User Role <span className="text-indigo-600">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <select
                    name="role"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-0 focus:ring-indigo-500 focus:border-indigo-500 outline-none appearance-none bg-white cursor-pointer disabled:bg-gray-50 disabled:cursor-not-allowed"
                    required
                    value={inputs.role}
                    onChange={handleChange}
                    disabled={!isEdit}
                  >
                    <option value="" disabled>Select role</option>
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

              {/* Organizer Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Organizer Role <span className="text-indigo-600">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <select
                    name="isorganizer"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-0 focus:ring-indigo-500 focus:border-indigo-500 outline-none appearance-none bg-white cursor-pointer disabled:bg-gray-50 disabled:cursor-not-allowed"
                    required
                    value={inputs.isorganizer}
                    onChange={handleChange}
                    disabled={!isEdit}
                  >
                    <option value="" disabled>Select organizer status</option>
                    <option value="Y">Yes</option>
                    <option value="N">No</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Offcanvas Footer */}
              <div className="sticky bottom-0 bg-white pt-6 border-t border-gray-200 mt-6">
                <div className="flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-0 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer transition-all duration-200"
                    onClick={handleCancel}
                  >
                    Cancel
                  </button>
                  {isEdit && (
                    <button
                      type="submit"
                      className="px-6 py-2.5 text-sm font-medium text-white bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 border border-transparent rounded-lg hover:shadow-lg focus:outline-none focus:ring-0 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer transition-all duration-200 flex items-center gap-2"
                    >
                      Update User
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}

export default UserEdit;