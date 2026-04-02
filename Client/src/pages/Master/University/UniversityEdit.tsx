import type React from "react";
import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import GoogleLocation from "../../../components/GoogleLocation";
import { MEDIA_URL } from "../../../constant/Baseurl";
import { getUniversityDetails, updateUniversity } from "../../../services/master/masterApi";
import type { SelectedLocation } from "./UniversityAdd";

const UniversityEdit = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isEdit = searchParams.get('isEdit');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [selectedLocations, setSelectedLocations] = useState<SelectedLocation[]>([]);
  const [showLocation, setShowLocation] = useState(false);
  const [inputs, setInputs] = useState({
    name: "",
    status: "",
  });
  const [photo, setPhoto] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getUniversityDetails(Number(id));
        setInputs({
          name: response.name || "",
          status: response.status || "",
        });
        if (response.photo) {
          setPhoto(response.photo);
        }
        setSelectedLocations([{
          id: 1,
          lat: parseFloat(response.lat),
          lng: parseFloat(response.lng),
          address: response.address
        }]);

      } catch (error) {
        console.error("Error fetching university details:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setInputs(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddLocation = (location: { lat: number; lng: number; address: string }) => {
    const newLocation: SelectedLocation = {
      id: Date.now(),
      ...location
    };
    setSelectedLocations(prev => [...prev, newLocation]);
    setShowLocation(false);
  };

  const handleCancel = () => {
    setInputs({
      name: "",
      status: "",
    });
    setSelectedLocations([]);
    navigate("/master/view-universities")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = {
      id: id,
      name: inputs.name,
      status: inputs.status,
      locations: JSON.stringify(selectedLocations)
    }
    const response = await updateUniversity(body);
    if (response) {
      handleCancel();
    }
  };

  const removeSelectedLocation = (id: number) => {
    setSelectedLocations(prev => prev.filter(loc => loc.id !== id));
  };

  const handleLocation = () => {
    setSelectedLocations([]);
    setShowLocation(true);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-indigo-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mx-auto"></div>
          <p className="mt-4 text-lg font-medium text-gray-600">Loading university details...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Header Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-2 mb-2 transform hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center space-x-4">
              <div className="bg-linear-to-r from-indigo-600 to-purple-600 p-4 rounded-2xl shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Edit University
                </h1>
                <p className="text-gray-500 mt-1">Update university information and details</p>
              </div>
            </div>
          </div>

          {/* Main Form Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <form onSubmit={handleSubmit}>

              {/* Form Body */}
              <div className="p-8 space-y-8">
                {/* Photo Section */}
                <div className="flex items-center space-x-8">
                  <div className="shrink-0">
                    <div className="relative">
                      {photo ? (
                        <img
                          className="h-28 w-28 object-cover rounded-xl border-4 border-white shadow-lg"
                          src={`${MEDIA_URL}${photo}`}
                          alt={inputs.name || "University preview"}
                        />
                      ) : (
                        <div className="h-28 w-28 rounded-xl bg-linear-to-br from-indigo-100 to-purple-100 border-2 border-dashed border-indigo-300 flex items-center justify-center">
                          <svg className="w-10 h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      <div className="absolute -bottom-2 -right-2 bg-green-400 h-6 w-6 rounded-full border-4 border-white"></div>
                    </div>
                  </div>
                </div>

                {/* Basic Information Grid */}
                <div className="grid grid-cols-1 gap-6">
                  {/* University Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      University Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative rounded-lg shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        name="name"
                        value={inputs.name}
                        onChange={handleInputChange}
                        disabled={isEdit === 'false'}
                        placeholder="Enter university name"
                        className="w-full pl-10 px-4 py-2 border border-gray-300 text-black rounded-lg focus:ring-0 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200 disabled:cursor-not-allowed"
                        required
                      />
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Status <span className="text-red-500">*</span>
                    </label>
                    <div className="relative rounded-lg shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <select
                        name="status"
                        value={inputs.status}
                        onChange={handleInputChange}
                        disabled={isEdit === 'false'}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 text-black rounded-lg focus:ring-0 focus:ring-indigo-500 focus:border-indigo-500 outline-none appearance-none disabled:cursor-not-allowed"
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
                </div>

                {/* Address Section */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Address Information
                    </label>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <div className="relative rounded-lg shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                          <input
                            type="text"
                            className="w-full pl-10 px-4 py-2 border border-gray-300 text-black rounded-lg focus:ring-0 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200"
                            placeholder={selectedLocations.length > 0 ? `${selectedLocations.length} address${selectedLocations.length > 1 ? 'es' : ''} selected` : "No addresses selected"}
                            readOnly
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleLocation}
                        disabled={isEdit === 'false'}
                        className="px-4 py-2 bg-linear-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:ring-4 focus:ring-indigo-300 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 whitespace-nowrap disabled:cursor-not-allowed"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-list-icon lucide-list">
                          <path d="M3 5h.01" /><path d="M3 12h.01" /><path d="M3 19h.01" /><path d="M8 5h13" /><path d="M8 12h13" /><path d="M8 19h13" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Selected Addresses */}
                  {selectedLocations.length > 0 && (
                    <div className="mt-4 bg-linear-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="bg-green-100 rounded-lg p-1.5">
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <span className="text-sm font-semibold text-green-800">
                          Selected Locations ({selectedLocations.length})
                        </span>
                      </div>

                      <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                        {selectedLocations.map((location) => (
                          <div
                            key={location.id}
                            className="flex items-start justify-between p-3 bg-white rounded-lg border border-green-200 shadow-sm hover:shadow-md transition-shadow duration-200"
                          >
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-800">{location.address}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                <span className="inline-block bg-gray-100 rounded px-2 py-0.5">
                                  Lat: {location.lat.toFixed(6)}
                                </span>
                                <span className="inline-block bg-gray-100 rounded px-2 py-0.5 ml-2">
                                  Lng: {location.lng.toFixed(6)}
                                </span>
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeSelectedLocation(location.id)}
                              className="ml-2 p-1.5 text-red-500 hover:text-rd-700 hover:bg-red-50 rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
                              title="Remove location"
                              disabled={isEdit === 'false'}
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Form Actions */}
              <div className="bg-gray-50 px-8 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-4 focus:ring-gray-200 transition-all duration-200 shadow-sm cursor-pointer"
                >
                  Cancel
                </button>
                {(isEdit === "true") &&(
                <button
                  type="submit"
                  className="px-6 py-2.5 text-sm font-medium text-white bg-linear-to-r from-indigo-600 to-purple-600 rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:ring-4 focus:ring-indigo-300 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 cursor-pointer"
                >
                  Update
                </button>
                )}
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
    </>
  )
}

export default UniversityEdit;