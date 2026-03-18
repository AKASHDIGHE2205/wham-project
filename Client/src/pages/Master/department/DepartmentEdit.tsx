import { useEffect, useState, type FC } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { handleSelectCollege } from "../../../feature/masterSlice";
import { updateDepartment } from "../../../services/master/masterApi";
import type { RootState } from "../../../store/store";
import SelectCollege from "./SelectCollege";

export interface Department {
  dept_id: number;
  clg_id: number;
  clg_name: string;
  dept_name: string;
  student_strength: number;
  status: string;
}

export interface DepartmentResponse {
  departments: Department[];
  total: number;
}

interface DepartmentEditProps {
  show: boolean;
  setShow: (show: boolean) => void;
  departmentData: Department | null;
  fetchData: () => void;
  isEdit?: boolean;
}

const DepartmentEdit: FC<DepartmentEditProps> = ({ show, setShow, departmentData, fetchData, isEdit }) => {
  const [inputs, setInputs] = useState({
    dept_id: departmentData?.dept_id || 0,
    dept_name: departmentData?.dept_name || '',
    student_strength: departmentData?.student_strength || 0,
    status: departmentData?.status || ''
  });
  const [loading, setLoading] = useState(false);
  const [showCollegeModal, setShowCollegeModal] = useState(false);
  const dispatch = useDispatch();
  const { clg_id, clg_name } = useSelector((state: RootState) => state.master);

  useEffect(() => {
    dispatch(handleSelectCollege({ id: departmentData?.clg_id || 0, name: departmentData?.clg_name || "" }))
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setInputs({ ...inputs, [name]: value });
  };

  if (!show) return null;

  const handleClose = () => {
    setShow(false);
    fetchData();
    dispatch(handleSelectCollege({ id: 0, name: "" }))
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!inputs.dept_name || !inputs.status) {
      toast.error("Please fill in all required fields");
      setLoading(false);
      return;
    }

    const body = {
      clg_id: clg_id || 0,
      dept_id: inputs.dept_id,
      dept_name: inputs.dept_name,
      student_strength: inputs.student_strength,
      status: inputs.status
    };

    const response = await updateDepartment(body);
    if (response) {
      setLoading(false);
      handleClose();
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-indigo-100/20 backdrop-blur-xs flex items-center justify-center p-4 z-50">
        <div
          className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-linear-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                {isEdit ? 'Update' : 'View'} Department
              </h3>
            </div>
            <button
              type="button"
              className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer p-2 hover:bg-gray-100 rounded-lg"
              onClick={handleClose}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Modal Form */}
          <form className="p-6 space-y-6" onSubmit={handleSubmit}>
            {/* Department Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department Name <span className="text-red-600">*</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                  </svg>
                </div>
                <input
                  type="text"
                  name="dept_name"
                  value={inputs.dept_name}
                  onChange={handleInputChange}
                  disabled={!isEdit}
                  placeholder="Enter department name"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200 disabled:cursor-not-allowed"
                  required
                />
              </div>
            </div>

            {/* College Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                College <span className="text-red-600">*</span>
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1 group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={clg_name}
                    disabled={!isEdit}
                    placeholder="Select college"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                    readOnly
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowCollegeModal(true)}
                  disabled={!isEdit}
                  className="px-4 py-2 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 text-white font-medium rounded-lg hover:shadow-lg transition-all duration-200 cursor-pointer whitespace-nowrap disabled:cursor-not-allowed"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 5h.01" /><path d="M3 12h.01" /><path d="M3 19h.01" /><path d="M8 5h13" /><path d="M8 12h13" /><path d="M8 19h13" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Student Strength */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Student Strength
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <input
                  type="number"
                  name="student_strength"
                  value={inputs.student_strength}
                  onChange={handleInputChange}
                  disabled={!isEdit}
                  placeholder="Enter student strength"
                  min="0"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Status Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status <span className="text-red-600">*</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <select
                  name="status"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:ring-indigo-500 focus:border-indigo-500 outline-none appearance-none bg-white cursor-pointer disabled:cursor-not-allowed"
                  required
                  value={inputs.status}
                  onChange={handleInputChange}
                  disabled={!isEdit}
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

            {/* Modal Footer */}
            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-0 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer transition-all duration-200"
                onClick={handleClose}
              >
                Cancel
              </button>
              {isEdit && (
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 text-sm font-medium text-white bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 border border-transparent rounded-lg hover:shadow-lg focus:outline-none focus:ring-0 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer transition-all duration-200 flex items-center gap-2"
                >
                  {loading ? 'Updating...' : 'Update'}
                </button>
              )}

            </div>
          </form>
        </div>
      </div>

      {/* College Search Modal */}
      <SelectCollege
        show={showCollegeModal}
        setShow={setShowCollegeModal}
      />
    </>
  );
};

export default DepartmentEdit;