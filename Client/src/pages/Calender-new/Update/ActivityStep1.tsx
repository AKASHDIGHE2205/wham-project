import { ChevronDown, List, MapPin, MapPinPlusIcon, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import CollegeModal from "../../../components/CollegeModal";
import DeptModal from "../../../components/DeptModal";
import GoogleLocation from "../../../components/GoogleLocation";
import { getUserFromStorage } from "../../../helper/cryptoUser";
import { getActiveCompaign, getActiveOccasions, } from "../../../services/calender/calenderApi";
import type { College, Compaign, Department, Occasions, SelectedLocation } from "../../../types/activity.types";

interface ActivityStep1Props {
  formData: any;
  updateFormData: (data: any) => void;
  onNext: () => void;
  isEdit: boolean;
}

export const ActivityStep1: React.FC<ActivityStep1Props> = ({ formData, updateFormData, onNext, isEdit }) => {
  const [occasions, setOccasions] = useState<Occasions[]>([]);
  const [compaigns, setCompaigns] = useState<Compaign[]>([]);
  const [showCollege, setShowCollege] = useState(false);
  const [showDepartment, setShowDepartment] = useState(false);
  const [collegeSearchTerm, setCollegeSearchTerm] = useState("");
  const [departmentSearchTerm, setDepartmentSearchTerm] = useState("");
  const [showMap, setShowMap] = useState(false);
  const [locationSearchTerm, setLocationSearchTerm] = useState("");
  const user = getUserFromStorage();

  useEffect(() => {
    const fetchOccasions = async () => {
      const response = await getActiveOccasions();
      if (response) {
        setOccasions(response?.Occasions || []);
      }
    };
    const fetchCompaign = async () => {
      const response = await getActiveCompaign();
      if (response) {
        setCompaigns(response?.Compaigns || []);
      }
    };
    fetchOccasions();
    fetchCompaign();
  }, []);

  const handleSelectColleges = (colleges: College[]) => {
    updateFormData({ selectedColleges: colleges });
  };

  const handleSelectDepartments = (departments: Department[]) => {
    updateFormData({ selectedDepartments: departments });
  };

  const removeCollege = (collegeId: number) => {
    updateFormData({
      selectedColleges: formData?.selectedColleges.filter((c: College) => c.clg_id !== collegeId)
    });
  };

  const removeDepartment = (deptId: number) => {
    updateFormData({
      selectedDepartments: formData?.selectedDepartments.filter((d: Department) => d.dept_id !== deptId)
    });
  };

  const filteredSelectedColleges = formData?.selectedColleges.filter((college: College) =>
    college.clg_name.toLowerCase().includes(collegeSearchTerm.toLowerCase()),
  );

  const filteredSelectedDepartments = formData?.selectedDepartments.filter((department: Department) =>
    department.dept_name.toLowerCase().includes(departmentSearchTerm.toLowerCase()),
  );

  const removeSelectedLocation = (id: number) => {
    updateFormData({
      selectedLocations: formData?.selectedLocations.filter((location: SelectedLocation) => location?.id !== id)
    });
  };

  const handleAddLocation = (location: { lat: number; lng: number; address: string; city: string; state: string; pin: string; }) => {
    const newLocation = {
      id: Date.now(),
      ...location,
    };
    updateFormData({
      selectedLocations: [...formData?.selectedLocations, newLocation]
    });
    setShowMap(false);
  };

  const filteredSelectedLocations = formData?.selectedLocations?.filter(
    (location: SelectedLocation) =>
      location?.address.toLowerCase().includes(locationSearchTerm.toLowerCase()) ||
      location?.city.toLowerCase().includes(locationSearchTerm.toLowerCase()) ||
      location?.state.toLowerCase().includes(locationSearchTerm.toLowerCase()),
  );

  const formatLocationDisplay = (location: SelectedLocation) => {
    const parts = [];
    if (location?.address) parts.push(location?.address);
    if (location?.city) parts.push(location?.city);
    if (location?.state) parts.push(location?.state);
    if (location?.pin) parts.push(location?.pin);
    return parts.join(", ");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    updateFormData({ [name]: name === 'occasion' || name === 'campaign' ? Number(value) : value });
  };

  const getStatusClasses = (status: string) => {
    switch (status) {
      case "P":
        return "bg-yellow-50 border-yellow-400 text-yellow-700";
      case "A":
        return "bg-green-50 border-green-400 text-green-700";
      case "R":
        return "bg-red-50 border-red-400 text-red-700";
      case "C":
        return "bg-blue-50 border-blue-400 text-blue-700";
      default:
        return "bg-gray-50 border-gray-300 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-4">
          {/*Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Title of Activity <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData?.title}
              onChange={handleChange}
              required
              disabled={isEdit}
              placeholder="Enter activity title"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:cursor-not-allowed"
            />
          </div>

          {/*Occasion */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Occasion <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                name="occasion"
                value={formData?.occasion || ''}
                onChange={handleChange}
                required
                disabled={isEdit}
                className="w-full px-3 py-2 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-1 focus:ring-purple-500 bg-white disabled:cursor-not-allowed"
              >
                <option value="" disabled>Select occasion</option>
                {occasions?.map((item) => (
                  <option key={item?.occ_id} value={item?.occ_id}>
                    {item?.occ_name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/*Status */}
          {(user?.role === 'Master' || user?.role === 'Manager') && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Status <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <select
                  name="status"
                  value={formData?.status || ""}
                  onChange={handleChange}
                  required
                  className={`w-full px-3 py-2 border rounded-md appearance-none focus:outline-none focus:ring-1 focus:ring-purple-500 ${getStatusClasses(formData?.status)}`}
                >
                  <option value="" disabled>
                    Select Status
                  </option>
                  <option value="P">Pending</option>
                  <option value="A">Approved</option>
                  <option value="R">Rejected</option>
                  <option value="C">Completed</option>
                </select>

                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          )}
          {/*Compaign */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Campaign <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                name="campaign"
                value={formData?.campaign || ''}
                onChange={handleChange}
                required
                disabled={isEdit}
                className="w-full px-3 py-2 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-1 focus:ring-purple-500 bg-white disabled:cursor-not-allowed"
              >
                <option value="" disabled>Select Campaign</option>
                {compaigns?.map((item) => (
                  <option key={item?.comp_id} value={item?.comp_id}>
                    {item?.comp_name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Locations Section */}
          <div className="border border-gray-200 rounded-lg overflow-hidden p-2">
            <div>
              <label className="flex items-center text-sm font-semibold text-gray-700 mb-1">
                <MapPin size={16} color="green" className="mr-1" />
                Location <span className="text-red-500">*</span>
              </label>

              {/* Location Search and Selection */}
              <div className="flex w-full mb-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Search locations..."
                    value={locationSearchTerm}
                    onChange={(e) => setLocationSearchTerm(e.target.value)}
                    disabled={isEdit}
                    className="w-full px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:cursor-not-allowed"
                  />
                  {locationSearchTerm && (
                    <button
                      onClick={() => setLocationSearchTerm("")}
                      disabled={isEdit}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <button
                  onClick={() => setShowMap(true)}
                  disabled={isEdit}
                  className="px-3 py-2 border border-l-0 border-gray-300 rounded-r-md flex items-center justify-center cursor-pointer bg-purple-50 hover:bg-purple-100 disabled:cursor-not-allowed"
                >
                  <MapPinPlusIcon size={20} className="text-purple-600" />
                </button>
              </div>

              {/* Selected Locations Display */}
              {formData?.selectedLocations.length > 0 && (
                <div className="mb-3 max-h-40 overflow-y-auto border border-gray-200 rounded-md bg-yellow-100 p-2">
                  {filteredSelectedLocations.length > 0 ? (
                    <div className="space-y-2">
                      {filteredSelectedLocations.map((location: SelectedLocation) => (
                        <div
                          key={location?.id}
                          className="flex items-start justify-between bg-white px-3 py-2 rounded-md border border-gray-200"
                        >
                          <div className="flex-1 pr-2">
                            <p className="text-sm text-gray-700">
                              {formatLocationDisplay(location)}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Lat: {location?.lat.toFixed(6)}, Lng:{" "}
                              {location?.lng.toFixed(6)}
                            </p>
                          </div>
                          <button
                            onClick={() => removeSelectedLocation(location?.id)}
                            disabled={isEdit}
                            className="text-gray-400 hover:text-red-500 transition-colors shrink-0 disabled:cursor-not-allowed"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-2">
                      No locations match your search
                    </p>
                  )}
                </div>
              )}

              {formData?.selectedLocations.length === 0 && (
                <p className="text-xs text-gray-600">
                  Click the{" "}
                  <MapPinPlusIcon size={14} className="inline text-purple-600" />{" "}
                  button to add locations.
                </p>
              )}

              {/* Quick Stats */}
              {formData?.selectedLocations.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2 text-xs text-gray-600">
                  <span className="px-2 py-1 bg-gray-100 rounded-full">
                    Total: {formData?.selectedLocations.length} location(s)
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {formData?.occasion === 1 && (
              <div>
                {/* Colleges Section */}
                <div className="border border-gray-200 rounded-lg overflow-hidden p-2">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      College{" "}
                      {formData?.selectedColleges.length > 0 &&
                        `(${formData?.selectedColleges.length} selected)`}
                    </label>

                    {/* College Search and Selection */}
                    <div className="flex w-full mb-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          placeholder="Search colleges..."
                          value={collegeSearchTerm}
                          onChange={(e) => setCollegeSearchTerm(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-purple-500"
                        />
                        {collegeSearchTerm && (
                          <button
                            onClick={() => setCollegeSearchTerm("")}
                            disabled={isEdit}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <button
                        onClick={() => setShowCollege(true)}
                        disabled={isEdit}
                        className="px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-purple-50 flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
                      >
                        <List size={24} className="text-purple-600" />
                      </button>
                    </div>

                    {/* Selected Colleges Display */}
                    {formData?.selectedColleges.length > 0 && (
                      <div className="mb-3 max-h-32 overflow-y-auto border border-gray-200 rounded-md bg-green-100 p-2">
                        {filteredSelectedColleges.length > 0 ? (
                          <div className="space-y-2">
                            {filteredSelectedColleges.map((college: College) => (
                              <div
                                key={college.clg_id}
                                className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md"
                              >
                                <span className="text-sm text-gray-700">
                                  {college.clg_name}
                                </span>
                                <button
                                  onClick={() => removeCollege(college.clg_id)}
                                  disabled={isEdit}
                                  className="text-gray-400 hover:text-red-500 transition-colors disabled:cursor-not-allowed"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 text-center py-2">
                            No colleges match your search
                          </p>
                        )}
                      </div>
                    )}

                    {formData?.selectedColleges.length === 0 && (
                      <p className="text-xs text-gray-600">
                        Click the{" "}
                        <List size={14} className="inline text-purple-600" /> button
                        to add colleges.
                      </p>
                    )}
                  </div>
                </div>

                {/* Departments Section */}
                <div className="border border-gray-200 rounded-lg overflow-hidden p-2">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Department{" "}
                      {formData?.selectedDepartments.length > 0 &&
                        `(${formData?.selectedDepartments.length} selected)`}
                    </label>

                    {/* Department Search and Selection */}
                    <div className="flex w-full mb-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          placeholder="Search departments..."
                          value={departmentSearchTerm}
                          onChange={(e) => setDepartmentSearchTerm(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-purple-500"
                        />
                        {departmentSearchTerm && (
                          <button
                            onClick={() => setDepartmentSearchTerm("")}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <button
                        onClick={() => setShowDepartment(true)}
                        disabled={isEdit}
                        className="px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-purple-50 flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
                      >
                        <List size={24} className="text-purple-600" />
                      </button>
                    </div>

                    {/* Selected Departments Display */}
                    {formData?.selectedDepartments.length > 0 && (
                      <div className="mb-3 max-h-32 overflow-y-auto border border-gray-200 rounded-md bg-blue-100 p-2">
                        {filteredSelectedDepartments.length > 0 ? (
                          <div className="space-y-2">
                            {filteredSelectedDepartments.map((department: Department) => (
                              <div
                                key={department.dept_id}
                                className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md"
                              >
                                <span className="text-sm text-gray-700">
                                  {department.dept_name}
                                </span>
                                <button
                                  onClick={() => removeDepartment(department.dept_id)}
                                  disabled={isEdit}
                                  className="text-gray-400 hover:text-red-500 transition-colors disabled:cursor-not-allowed"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 text-center py-2">
                            No departments match your search
                          </p>
                        )}
                      </div>
                    )}

                    {formData?.selectedDepartments.length === 0 && (
                      <p className="text-xs text-gray-600">
                        Click the{" "}
                        <List size={14} className="inline text-purple-600" /> button
                        to add Departments.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-gray-100 flex justify-end">
        <button
          onClick={onNext}
          className="px-8 py-2 bg-linear-to-r from-[#5441ff] to-[#4531ff] text-white font-semibold rounded-md transition-colors cursor-pointer"
        >
          Next
        </button>
      </div>

      {showCollege && (
        <CollegeModal
          show={showCollege}
          setShow={setShowCollege}
          onSelectColleges={handleSelectColleges}
          selectedColleges={formData?.selectedColleges}
        />
      )}
      {showDepartment && (
        <DeptModal
          show={showDepartment}
          setShow={setShowDepartment}
          onSelectDepartments={handleSelectDepartments}
          selectedDepartments={formData?.selectedDepartments}
        />
      )}
      {showMap && (
        <GoogleLocation
          isShow={showMap}
          setIsShow={setShowMap}
          onLocationSelect={handleAddLocation}
        />
      )}
    </div>
  );
};