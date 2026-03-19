/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, type FC } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import MembersModal from "../../../components/MembersModal";
import { handleSelectMember } from "../../../feature/masterSlice";
import { updateTeam } from "../../../services/master/masterApi";
import type { RootState } from "../../../store/store";

interface Props {
  show: boolean;
  setShow: (show: boolean) => void;
  data: any;
  fetchData: () => void;
  isEdit: boolean;
}

const EditTeam: FC<Props> = ({ show, setShow, data, fetchData, isEdit }) => {
  const [inputs, setInputs] = useState({
    id: 0,
    name: "",
    managerId: 0,
    managerName: "",
    status: "",
    description: ""
  });
  const [showMemModal, setShowMemModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const { mem_id, first_name, middle_name, last_name } = useSelector((state: RootState) => state.master);

  const manager_name = [first_name, middle_name, last_name].filter(Boolean).join(" ");

  useEffect(() => {
    if (show) {
      setInputs({
        id: data?.id || 0,
        name: data?.name || "",
        managerId: mem_id || data?.manager_id || 0,
        managerName: manager_name || data?.manager_name || "",
        status: data?.status || "",
        description: data?.description || ""
      });
    }
  }, [show, mem_id, manager_name, data]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setInputs(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (!show) return null;

  const handleClose = () => {
    setInputs({
      id: 0,
      name: "",
      managerId: 0,
      managerName: "",
      status: "",
      description: ""
    });
    dispatch(handleSelectMember({ id: 0, first_name: '', middle_name: "", last_name: '' }));
    fetchData();
    setShow(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    if (!inputs.name || !inputs.status) {
      toast.error('Please fill all required fields!');
      setLoading(false);
      return;
    }

    const body = {
      id: inputs.id,
      name: inputs.name,
      managerId: inputs.managerId,
      description: inputs.description,
      status: inputs.status
    };
    
    const response = await updateTeam(body);
    if (response) {
      toast.success(response?.message || "Team updated successfully!");
      setLoading(false);
      handleClose();
    }
  };

  return (
    <>
      {/* Backdrop with blur */}
      <div 
        className="fixed inset-0 bg-indigo-100/30 backdrop-blur-xs z-50 transition-opacity duration-300"
        onClick={handleClose}
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
        aria-label={isEdit ? "Edit Team" : "View Team"}
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
                {isEdit ? "Update Team" : "View Team"}
              </h3>
            </div>
            <button
              className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer p-2 hover:bg-gray-100 rounded-lg"
              onClick={handleClose}
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
              {/* Team Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Team Name <span className="text-indigo-600">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={inputs.name}
                    onChange={handleChange}
                    disabled={!isEdit}
                    placeholder="Enter team name"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-0 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed"
                    required
                  />
                </div>
              </div>

              {/* Manager Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Team Manager <span className="text-indigo-600">*</span>
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      value={inputs.managerName}
                      disabled={!isEdit}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                      placeholder="Select team manager..."
                      readOnly
                    />
                  </div>
                  <button
                    type="button"
                    className={`px-4 py-2.5 text-sm font-medium text-white bg-linear-to-r from-indigo-600 to-purple-600 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
                      !isEdit ? 'opacity-50 cursor-not-allowed' : 'hover:from-indigo-700 cursor-pointer'
                    }`}
                    onClick={() => setShowMemModal(true)}
                    disabled={!isEdit}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 5h.01" /><path d="M3 12h.01" /><path d="M3 19h.01" /><path d="M8 5h13" /><path d="M8 12h13" /><path d="M8 19h13" />
                    </svg>
                  </button>
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
                    name="status"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-0 focus:ring-indigo-500 focus:border-indigo-500 outline-none appearance-none bg-white cursor-pointer disabled:bg-gray-50 disabled:cursor-not-allowed"
                    required
                    value={inputs.status}
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

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Description
                </label>
                <div className="relative">
                  <div className="absolute top-3 left-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                  </div>
                  <textarea
                    rows={4}
                    name="description"
                    value={inputs.description}
                    onChange={handleChange}
                    disabled={!isEdit}
                    placeholder="Enter team description, goals, or notes..."
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-0 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Offcanvas Footer */}
              <div className="sticky bottom-0 bg-white pt-6 border-t border-gray-200 mt-6">
                <div className="flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-0 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer transition-all duration-200"
                    onClick={handleClose}
                  >
                    Cancel
                  </button>
                  {isEdit && (
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2.5 text-sm font-medium text-white bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 border border-transparent rounded-lg hover:shadow-lg focus:outline-none focus:ring-0 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Updating...' : 'Update Team'}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Members Modal */}
      {showMemModal && (
        <MembersModal show={showMemModal} setShow={setShowMemModal} />
      )}
    </>
  );
};

export default EditTeam;