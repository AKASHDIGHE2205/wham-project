import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import GoogleLocation from "../../../components/GoogleLocation";
import UniversityModal from "../../../components/UniversityModal";
import { handleSelectUniversity } from "../../../feature/masterSlice";
import { getUserFromStorage } from "../../../helper/cryptoUser";
import { addCollege } from "../../../services/master/masterApi";
import type { RootState } from "../../../store/store";
import type { SelectedLocation } from "../University/UniversityAdd";

const CollgeAdd = () => {
  const [inputs, setInputs] = useState({
    name: "",
    status: "",
    count: 0,
  });
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [showLocation, setShowLocation] = useState(false);
  const [showUniversity, setShowUniversity] = useState(false);
  const [selectedLocations, setSelectedLocations] = useState<SelectedLocation[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = getUserFromStorage();
  const { university_id, university_name } = useSelector((state: RootState) => state.master);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setInputs(prev => ({
      ...prev,
      [name]: name === "count" ? (value === "" ? 0 : Number(value)) : value
    }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleCancel = () => {
    setInputs({
      name: "",
      status: "",
      count: 0,
    });
    setSelectedPhoto(null);
    setPhotoPreview(null);
    setSelectedLocations([]);
    dispatch(handleSelectUniversity({ id: 0, name: "" }))
    navigate("/master/view-colleges")
  };

  const handleAddLocation = (location: { lat: number; lng: number; address: string, city: string, state: string, pin: string }) => {
    const newLocation: SelectedLocation = {
      id: Date.now(),
      ...location
    };
    setSelectedLocations(prev => [...prev, newLocation]);
    setShowLocation(false);
  };

  const removeSelectedLocation = (id: number) => {
    setSelectedLocations(prev => prev.filter(location => location.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append("name", inputs?.name || "");
      formData.append("totalStudents", String(inputs?.count ?? 0));
      formData.append("uniId", String(university_id ?? 0));
      formData.append("status", inputs?.status || "");
      formData.append("c_by", user?.id || 0);
      if (selectedPhoto) {
        formData.append("photo", selectedPhoto);
      }
      formData.append("locations", JSON.stringify(selectedLocations));
      for (let pair of formData.entries()) {
        if (pair[0] === 'photo' && pair[1] instanceof File) {
          console.log(pair[0], {
            name: (pair[1] as File).name,
            type: (pair[1] as File).type,
            size: (pair[1] as File).size
          });
        } else {
          console.log(pair[0], pair[1]);
        }
      }
      const response = await addCollege(formData);
      if (response) {
        handleCancel();
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }

  }

  return (
    <>
      <div className="min-h-screen bg-white border border-indigo-300 m-1 rounded-md p-2 sm:p-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 mb-6 transform hover:shadow-md transition-all duration-300">
            <div className="flex items-center space-x-4">
              <div className="bg-linear-to-r from-indigo-500 to-purple-600 p-3 rounded-xl">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-indigo-600">Add New College</h1>
                <p className="text-indigo-500">Create a new College profile</p>
              </div>
            </div>
          </div>

          {/* Form Container */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Photo Upload Section */}
              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-lg font-semibold text-indigo-600 mb-4">College Photo</h2>
                <div className="flex items-center space-x-6">
                  <div className="shrink-0">
                    {photoPreview ? (
                      <img
                        className="h-24 w-24 object-cover rounded-lg border-2 border-indigo-300"
                        src={photoPreview}
                        alt="College preview"
                      />
                    ) : (
                      <div className="h-24 w-24 rounded-lg bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <label className="cursor-pointer">
                    <div className="px-4 py-2 text-sm font-medium text-white bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 rounded-lg hover:shadow-lg transition duration-300 inline-flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      Upload Photo
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handlePhotoChange}
                    />
                  </label>
                </div>
              </div>

              {/* Basic Information Section */}
              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-lg font-semibold text-black mb-4">Basic Information</h2>

                {/* College Name and Student Count in one row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* College Name */}
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      College Name <span className="text-red-600 font-semibold">*</span>
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        name="name"
                        value={inputs.name}
                        onChange={handleChange}
                        placeholder="Enter College name"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 text-black rounded-lg focus:ring-0 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200"
                        required
                      />
                    </div>
                  </div>

                  {/* Student Count */}
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Student count <span className="text-red-600 font-semibold">*</span>
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </div>
                      <input
                        type="number"
                        name="count"
                        value={inputs.count === 0 ? "" : inputs.count}
                        onChange={handleChange}
                        placeholder="Enter Student count"
                        min="0"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 text-black rounded-lg focus:ring-0 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Status and University */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Status <span className="text-red-600 font-semibold">*</span>
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <select
                        name="status"
                        value={inputs.status}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 text-black rounded-lg focus:ring-0 focus:ring-indigo-500 focus:border-indigo-500 outline-none appearance-none bg-white cursor-pointer"
                        required
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

                  {/* University Selection */}
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      University <span className="text-red-600 font-semibold">*</span>
                    </label>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <input
                            type="text"
                            className="w-full px-4 py-2 border border-gray-300 text-indigo-600 rounded-lg focus:ring-0 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200 bg-gray-50"
                            placeholder="Select university..."
                            value={university_name || ''}
                            readOnly
                          />
                        </div>
                        <button
                          type="button"
                          className="px-4 py-2 text-sm font-medium text-white bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 rounded-lg hover:shadow-lg transition duration-300 flex items-center gap-2 cursor-pointer"
                          onClick={() => setShowUniversity(true)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 5h.01" /><path d="M3 12h.01" /><path d="M3 19h.01" /><path d="M8 5h13" /><path d="M8 12h13" /><path d="M8 19h13" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Addresses Section */}
              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-lg font-semibold text-black mb-4">Address Information</h2>

                {/* Address Selection */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    College Addresses
                  </label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <input
                          type="text"
                          className="w-full px-4 py-2 border border-gray-300 text-black rounded-lg focus:ring-0 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200 cursor-pointer bg-gray-50"
                          placeholder={selectedLocations.length === 0 ? "Select addresses..." : `${selectedLocations.length} location(s) selected`}
                          value={selectedLocations.length > 0 ? `${selectedLocations.length} location(s) selected` : ''}
                          readOnly
                        />
                      </div>
                      <button
                        type="button"
                        className="px-4 py-2 text-sm font-medium text-white bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 rounded-lg hover:shadow-lg transition duration-300 flex items-center gap-2 cursor-pointer"
                        onClick={() => setShowLocation(true)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-map-pin-plus-icon lucide-map-pin-plus"><path d="M19.914 11.105A7.298 7.298 0 0 0 20 10a8 8 0 0 0-16 0c0 4.993 5.539 10.193 7.399 11.799a1 1 0 0 0 1.202 0 32 32 0 0 0 .824-.738" /><circle cx="12" cy="10" r="3" /><path d="M16 18h6" /><path d="M19 15v6" /></svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Selected Addresses Preview */}
                {selectedLocations.length > 0 && (
                  <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-200">
                    <div className="flex items-center gap-2 mb-3">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-sm font-medium text-green-800">
                        Selected Locations ({selectedLocations.length})
                      </span>
                    </div>

                    <div className="space-y-2 max-h-32 overflow-auto pr-1">
                      {selectedLocations.map((location) => (
                        <div
                          key={location.id}
                          className="flex items-center justify-between p-3 bg-green-100 text-green-800 rounded-lg border border-green-200"
                        >
                          <div className="flex-1">
                            <p className="text-sm font-medium">{location.address}</p>
                            <p className="text-xs text-green-600">
                              Lat: {location.lat.toFixed(6)}, Lng: {location.lng.toFixed(6)}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeSelectedLocation(location.id)}
                            className="text-green-600 hover:text-green-800 transition-colors cursor-pointer p-1 rounded-full hover:bg-green-200 ml-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end space-x-3 pt-6">
                <button
                  type="button"
                  className="px-6 py-2 text-sm font-medium text-black bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-0 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer transition-all duration-200"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-sm font-medium text-white bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 border border-transparent rounded-lg hover:shadow-lg focus:outline-none focus:ring-0 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </>
                  ) : "Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Location Selection Modal */}
      {showLocation && (
        <GoogleLocation
          isShow={showLocation}
          setIsShow={setShowLocation}
          onLocationSelect={handleAddLocation}
        />
      )}

      {/* University Selection Modal */}
      {showUniversity && (
        <UniversityModal show={showUniversity} setShow={setShowUniversity} />
      )}
    </>
  )
}

export default CollgeAdd
