import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import GoogleLocation from "../../../components/GoogleLocation";
import UniversityModal from "../../../components/UniversityModal";
import { MEDIA_URL } from "../../../constant/Baseurl";
import { handleSelectUniversity } from "../../../feature/masterSlice";
import { getCollegeDetails, updateCollege } from "../../../services/master/masterApi";
import type { RootState } from "../../../store/store";
import type { SelectedLocation } from "../University/UniversityAdd";

const CollegeEdit = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isEdit = searchParams.get('isEdit');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [selectedLocations, setSelectedLocations] = useState<SelectedLocation[]>([]);
  const [showLocation, setShowLocation] = useState(false);
  const [showUniversity, setShowUniversity] = useState(false);
  const [inputs, setInputs] = useState({
    name: "",
    status: "",
    count: 0,
  });
  const [photo, setPhoto] = useState<string>("");
  const dispatch = useDispatch();


  const { university_id, university_name } = useSelector((state: RootState) => state.master);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getCollegeDetails(Number(id));
        dispatch(handleSelectUniversity({ id: response?.college?.university_id || 0, name: response?.college?.university_name || "" }))
        setInputs({
          name: response?.college?.clg_name || "",
          status: response?.college?.status || "",
          count: response?.college?.total_students || 0,
        });
        if (response?.college?.clg_photo) {
          setPhoto(response?.college?.clg_photo);
        }
        setSelectedLocations([{
          id: 1,
          lat: parseFloat(response?.college?.lat),
          lng: parseFloat(response?.college?.lng),
          address: response?.college?.clg_address
        }]);

      } catch (error) {
        console.error("Error fetching university details:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

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
      count: 0,
    });
    dispatch(handleSelectUniversity({ id: 0, name: "" }));
    setSelectedLocations([]);
    navigate("/master/view-colleges")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = {
      id: id,
      name: inputs.name,
      status: inputs.status,
      totalStudents: inputs.count,
      locations: JSON.stringify(selectedLocations),
      uniId: university_id || 0
    }
    const response = await updateCollege(body);
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
                <h1 className="text-2xl font-bold text-indigo-600">Update College</h1>
                <p className="text-indigo-500">edit a College profile</p>
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
                  </div>
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
                        onChange={handleInputChange}
                        disabled={isEdit === 'false'}
                        placeholder="Enter College name"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 text-black rounded-lg focus:ring-0 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200 disabled:cursor-not-allowed"
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
                        onChange={handleInputChange}
                        disabled={isEdit === 'false'}
                        placeholder="Enter Student count"
                        min="0"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 text-black rounded-lg focus:ring-0 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200 disabled:cursor-not-allowed"
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
                        onChange={handleInputChange}
                        disabled={isEdit === 'false'}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 text-black rounded-lg focus:ring-0 focus:ring-indigo-500 focus:border-indigo-500 outline-none appearance-none bg-white cursor-pointer disabled:cursor-not-allowed"
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
                          className="px-4 py-2 text-sm font-medium text-white bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 rounded-lg hover:shadow-lg transition duration-300 flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                          onClick={() => setShowUniversity(true)}
                          disabled={isEdit === 'false'}
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
                        className="px-4 py-2 text-sm font-medium text-white bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 rounded-lg hover:shadow-lg transition duration-300 flex items-center gap-2 cursor-pointer  disabled:cursor-not-allowed"
                        onClick={handleLocation}
                        disabled={isEdit === 'false'}
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
                            disabled={isEdit === 'false'}
                            className="text-green-600 hover:text-green-800 transition-colors cursor-pointer p-1 rounded-full hover:bg-green-200 ml-2 disabled:cursor-not-allowed"
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
                {isEdit === 'true' &&(
                <button
                  type="submit"
                  className="px-6 py-2 text-sm font-medium text-white bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 border border-transparent rounded-lg hover:shadow-lg focus:outline-none focus:ring-0 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit
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

      {/* University Selection Modal */}
      {showUniversity && (
        <UniversityModal show={showUniversity} setShow={setShowUniversity} />
      )}
    </>
  )
}

export default CollegeEdit
