/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, type FC } from "react";
import { addAttendence } from "../../services/dashboard/DashboardApi";
import { GOOGLE_MAPS_API_KEY } from "../../constant/Baseurl";
import toast from "react-hot-toast";
import type React from "react";

export interface Props {
  show: boolean;
  setShow: (show: boolean) => void;
  Data: any;
  Member: any;
  setSelectedEvent: (event: any) => void;
  fetchAllData: () => void;

}

interface Location {
  lat: number;
  lng: number;
  address: string;
}

interface Inputs {
  time: string;
  media: File | string;
  attenddesc: string;
}

const AttendenceModal: FC<Props> = ({ show, setShow, Data, Member, setSelectedEvent, fetchAllData }) => {
  const [location, setLocation] = useState<Location | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [inputs, setInputs] = useState<Inputs>({
    time: "",
    media: "",
    attenddesc: ""
  });
  const [loading, setLoading] = useState(false);

  const getAddressFromCoordinates = async (lat: number, lng: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();
      if (data?.status === "OK" && data?.results?.length > 0) {
        return data.results[0].formatted_address;
      }
      return "Address not found";
    } catch (error) {
      console.error("Error getting address:", error);
      return "Error fetching address";
    }
  };


  const handlePunchIn = async () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by this browser.");
      return;
    }

    setIsGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const address = await getAddressFromCoordinates(lat, lng);

          const locationData: Location = {
            lat,
            lng,
            address
          };

          setLocation(locationData);
          setIsGettingLocation(false);
        } catch (error) {
          console.error("Error getting location:", error);
          toast.error("Error getting your location. Please try again.");
          setIsGettingLocation(false);
        }
      },
      (error) => {
        console.error("Error getting location:", error);
        let errorMessage = "Error getting your location.";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied. Please allow location access to punch in.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out.";
            break;
        }

        toast.error(errorMessage);
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setInputs(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setInputs(prev => ({
        ...prev,
        media: event.target.files![0],
      }));
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    if (!location || !inputs.media || !inputs.attenddesc) {
      toast.error('Please Select all required fields!');
      return;
    }
    const currentDate = new Date();
    const currentTime = currentDate.toLocaleTimeString();
    const punchDate = currentDate.toISOString().split('T')[0];

    const body = {
      eventId: Data?.event_id || 0,
      eventDate: Data?.event_Date || '',
      stepId: Data?.step_no || 0,
      taskId: Data?.task_id || 0,
      memId: Member?.mem_id || 0,
      media: inputs.media || "",
      attenddesc: inputs.attenddesc || "",
      location: location ? {
        latitude: location?.lat || 0,
        longitude: location?.lng || 0,
        address: location?.address || ""
      } : null
    };

    const formData = new FormData();

    // Convert all values to strings before appending
    formData?.append("eventId", body.eventId.toString());
    formData?.append("Time", currentTime);
    formData?.append("punchDate", punchDate);
    formData?.append("eventDate", body.eventDate.toString());
    formData?.append("userId", body.memId.toString());
    formData?.append("stepId", body.stepId.toString());
    formData?.append("taskId", body.taskId.toString());
    formData?.append("attenddesc", body.attenddesc);
    formData?.append("location", JSON.stringify(body.location));

    // For file, append it directly (it's already a File object)
    if (body.media && typeof body.media !== 'string') {
      formData?.append("media", body.media);
    }

    const response = await addAttendence(formData);
    if (response) {
      handleClose()
    }
  };

  if (!show) return null;

  const handleClose = () => {
    setShow(false);
    setLoading(false);
    setLocation(null);
    setSelectedEvent({});
    fetchAllData();
    setInputs({
      media: "",
      attenddesc: "",
      time: ""
    });
  };

  return (
    <div className="fixed inset-0 bg-orange-100/20 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-linear-to-r from-purple-50 to-orange-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-linear-to-br from-orange-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Attend Event {Data?.title}
              </h3>
            </div>
          </div>
          <button
            className="flex items-center justify-center w-10 h-10 hover:bg-gray-100 text-gray-700 transition-all duration-200 hover:scale-105 hover:shadow-lg cursor-pointer disabled:cursor-not-allowed"
            onClick={handleClose}
            title="Close"
            disabled={isGettingLocation}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Teams List */}
        <div className="flex-1 overflow-auto">
          <form className="p-6 space-y-3" onSubmit={handleSubmit}>

            {/* Location */}
            <div>
              <div className="flex flex-col gap-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Punch In <span className="text-orange-600">*</span>
                </label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={location ? location.address : ""}
                      className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:border-orange-500 outline-none text-orange-600 placeholder:text-orange-600 disabled:cursor-not-allowed"
                      placeholder="Click on Punch In button to Punch..."
                      readOnly
                    />
                    {location && (
                      <p className="text-xs text-gray-500 mt-1 hidden">
                        Coordinates: Lat: {location.lat.toFixed(6)}, Lng: {location.lng.toFixed(6)}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handlePunchIn}
                    disabled={isGettingLocation}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-lg hover:shadow transition duration-300 flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed disabled:bg-green-300"
                  >
                    {isGettingLocation ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Getting Location...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Punch In
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Attendee Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <div className="relative group">
                <div className="absolute top-3 left-3 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                </div>
                <textarea
                  rows={2}
                  name="attenddesc"
                  value={inputs.attenddesc}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:ring-orange-500 focus:border-orange-500 outline-none resize-none transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Media <span className="text-orange-600">*</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-camera-icon lucide-camera">
                    <path d="M13.997 4a2 2 0 0 1 1.76 1.05l.486.9A2 2 0 0 0 18.003 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.997a2 2 0 0 0 1.759-1.048l.489-.904A2 2 0 0 1 10.004 4z" />
                    <circle cx="12" cy="13" r="3" />
                  </svg>
                </div>
                <input
                  type="file"
                  name="media"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  required
                />

              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end items-center pt-4">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isGettingLocation}
                  className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={(loading) || (isGettingLocation)}
                  className="px-6 py-2.5 text-sm font-medium text-white bg-orange-500 border border-orange-500 rounded-lg hover:bg-orange-600 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer disabled:cursor-not-allowed"
                >
                  {loading ? 'Submiting' : 'Submit'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AttendenceModal;