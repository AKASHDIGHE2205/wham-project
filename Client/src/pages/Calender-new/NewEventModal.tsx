import { useState, type FC, useEffect } from "react";
import { formatDate } from "../../helper/DateFormate";
import { addEvent } from "../../services/calender/calenderApi";
import toast from "react-hot-toast";
import MemberModal from "./MemberModal";
import GoogleLocation from "./GoogleLocation";
import { getUserFromStorage } from "../../helper/cryptoUser";
// import LocationModal from "./LocationModal";

export interface EventModalProps {
  isShow: boolean;
  setIsShow: (show: boolean) => void;
  selectedDate: Date | null;
  fetchData: () => void;
  isorganizer: "Y" | "N";
}

export interface Team {
  id: number;
  name: string;
  manager_id: number;
  status: string;
}

export interface SelectedMembers {
  id: number;
  first_name: string;
  middle_name: string;
  last_name: string;
}

export interface SelectedTeam {
  id: number;
  name: string;
}

export interface SelectedLocation {
  id: number;
  lat: number;
  lng: number;
  address: string;
}

const EventModal: FC<EventModalProps> = ({ isShow, setIsShow, selectedDate, fetchData, isorganizer }) => {
  const getInitialDates = () => {
    const now = new Date();

    if (selectedDate) {
      // Use selected date but with current time
      const fromDate = new Date(selectedDate);
      fromDate.setHours(now.getHours(), now.getMinutes(), 0, 0);

      const toDate = new Date(fromDate);
      toDate.setHours(toDate.getHours() + 1);

      return {
        fromDate: formatDate(fromDate, 'datetime'),
        toDate: formatDate(toDate, 'datetime')
      };
    } else {
      // No selected date, use current date and time
      const fromDate = new Date(now);
      const toDate = new Date(now);
      toDate.setHours(toDate.getHours() + 1);

      return {
        fromDate: formatDate(fromDate, 'datetime'),
        toDate: formatDate(toDate, 'datetime')
      };
    }
  };

  const handleClose = () => {
    setInputs({
      title: '',
      ...getInitialDates(),
      description: '',
      type: 'event',
    });
    setSelectedMembers([]);
    setSelectedTeams([]);
    setSelectedLocations([]);
    fetchData();
    setIsShow(false);
  };

  const [inputs, setInputs] = useState({
    title: '',
    fromDate: '',
    toDate: '',
    description: '',
    type: 'event',
  });
  const [selectedMembers, setSelectedMembers] = useState<SelectedMembers[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<SelectedTeam[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<SelectedLocation[]>([]);
  const [showMember, setShowMember] = useState(false);
  const [showLocation, setShowLocation] = useState(false);

  useEffect(() => {
    if (isShow) {
      const initialDates = getInitialDates();
      setInputs(prev => ({
        ...prev,
        fromDate: initialDates.fromDate,
        toDate: initialDates.toDate
      }));
    }
  }, [isShow, selectedDate]);

  if (!isShow) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setInputs(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleTypeToggle = (type: 'event' | 'task') => {
    setInputs(prev => ({ ...prev, type }));
  }

  const user = getUserFromStorage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { title, fromDate, toDate, description, type } = inputs;

    if (!title || !fromDate || !toDate) {
      toast.error('Please fill in all required fields.');
      return;
    }

    const startDateTime = new Date(fromDate);
    const endDateTime = new Date(toDate);

    if (startDateTime > endDateTime) {
      toast.error('Start Date cannot be later than End Date.');
      return;
    }
    const teamIds = selectedTeams.map(team => team.id);

    const body = {
      title,
      fromDate,
      toDate,
      description,
      type,
      userId: user?.id || 0,
      status: 'P',
      teamsId: teamIds || [],
      members: selectedMembers || [],
      locations: selectedLocations || []
    };

    try {
      const response = await addEvent(body);
      if (response) {
        handleClose();
      }
    } catch (error) {
      console.error('Error adding event:', error);
    }
  };

  const removeSelectedMember = (id: number) => {
    setSelectedMembers(prev => prev.filter(member => member.id !== id));
  };

  const removeSelectedTeam = (id: number) => {
    setSelectedTeams(prev => prev.filter(team => team.id !== id));
  };

  const removeSelectedLocation = (id: number) => {
    setSelectedLocations(prev => prev.filter(location => location.id !== id));
  };

  const handleAddLocation = (location: { lat: number; lng: number; address: string }) => {
    const newLocation: SelectedLocation = {
      id: Date.now(),
      ...location
    };
    setSelectedLocations(prev => [...prev, newLocation]);
    setShowLocation(false);
  };

  return (
    <>
      {(isorganizer === 'Y') ? (
        <div className="fixed inset-0 bg-orange-100/20 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div
            className="bg-linear-to-br from-purple-50 via-blue-50 to-orange-50 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-linear-to-br from-orange-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  Schedule New Event
                </h3>
              </div>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Event/Task Toggle */}
              <div className="mb-6 hidden">
                <label className="block text-sm font-medium text-gray-700 mb-3">Type</label>
                <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1">
                  <button
                    type="button"
                    onClick={() => handleTypeToggle('event')}
                    className={`cursor-pointer min-w-20 px-4 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ease-in-out ${inputs.type === 'event'
                      ? 'bg-white text-orange-600 shadow-sm border border-gray-300'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                      }`}
                  >
                    <span className="flex items-center justify-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Event
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTypeToggle('task')}
                    className={`cursor-pointer min-w-20 px-4 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ease-in-out ${inputs.type === 'task'
                      ? 'bg-white text-orange-600 shadow-sm border border-gray-300'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                      }`}
                  >
                    <span className="flex items-center justify-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Task
                    </span>
                  </button>
                </div>
              </div>

              {/* Team & Member Selection */}
              <div>
                {/* Selected Teams Display */}
                {selectedTeams.length > 0 && (
                  <div className="mb-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="flex items-center gap-2 mb-3">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span className="text-sm font-medium text-blue-800">
                        Selected Teams ({selectedTeams.length})
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 max-h-32 overflow-auto pr-1">
                      {selectedTeams.map((item) => (
                        <span
                          key={item.id}
                          className="inline-flex items-center gap-1 px-3 py-2 bg-blue-100 text-blue-800 rounded-full text-sm border border-blue-200"
                        >
                          {item.name}
                          <button
                            type="button"
                            onClick={() => removeSelectedTeam(item.id)}
                            className="text-blue-600 hover:text-blue-800 transition-colors cursor-pointer p-0.5 rounded-full hover:bg-blue-200"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Selected Members Display */}
                {selectedMembers.length > 0 && (
                  <div className="mb-4 p-4 bg-orange-50 rounded-xl border border-orange-200">
                    <div className="flex items-center gap-2 mb-3">
                      <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                      <span className="text-sm font-medium text-orange-800">
                        Selected Members ({selectedMembers.length})
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 max-h-32 overflow-auto pr-1">
                      {selectedMembers.map((item) => (
                        <span
                          key={item.id}
                          className="inline-flex items-center gap-1 px-3 py-2 bg-orange-100 text-orange-800 rounded-full text-sm border border-orange-200"
                        >
                          {item.first_name} {item.last_name}
                          <button
                            type="button"
                            onClick={() => removeSelectedMember(item.id)}
                            className="text-orange-600 hover:text-orange-800 transition-colors cursor-pointer p-0.5 rounded-full hover:bg-orange-200"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-1">
                  {/* Label */}
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Teams & Members <span className="text-orange-600">*</span>
                  </label>

                  {/* Input + Button Row */}
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <input
                        type="text"
                        className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:border-orange-500 outline-none text-orange-600 placeholder:text-orange-600"
                        placeholder="Select teams and members..."
                        value={`Selected teams ${selectedTeams.length} & members ${selectedMembers.length}`}
                        readOnly
                      />
                    </div>

                    <button
                      type="button"
                      className="px-4 py-2 text-sm font-medium text-white bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 rounded-lg hover:shadow transition duration-300 flex items-center gap-2 cursor-pointer"
                      onClick={() => setShowMember(true)}
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
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title <span className="text-orange-600">*</span>
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    name="title"
                    value={inputs.title}
                    onChange={handleChange}
                    placeholder="Enter title"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all duration-200"
                    required
                  />
                </div>
              </div>

              {/* Date & Time Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date & Time <span className="text-orange-600">*</span>
                  </label>
                  <div className="relative group">
                    <input
                      type="datetime-local"
                      name="fromDate"
                      value={inputs.fromDate}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:ring-orange-500 focus:border-orange-500 outline-none"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date & Time <span className="text-orange-600">*</span>
                  </label>
                  <div className="relative group">
                    <input
                      type="datetime-local"
                      name="toDate"
                      value={inputs.toDate}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:ring-orange-500 focus:border-orange-500 outline-none"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Location leaflet Selection */}
              {/* <div>
              <div className="flex flex-col gap-1">

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Leaflet Location <span className="text-orange-600">*</span>
                </label>

                <div className="flex gap-2">
                  <div className="flex-1">
                    <input
                      type="text"
                      className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:border-orange-500 outline-none text-orange-600 placeholder:text-orange-600"
                      placeholder="Select location..."
                      readOnly
                    />
                  </div>

                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-white bg-linear-to-r from-orange-500 to-purple-600 rounded-lg hover:shadow transition duration-300 flex items-center gap-2 cursor-pointer"
                    onClick={() => setShowLocation(true)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-map-pin-plus-icon lucide-map-pin-plus"><path d="M19.914 11.105A7.298 7.298 0 0 0 20 10a8 8 0 0 0-16 0c0 4.993 5.539 10.193 7.399 11.799a1 1 0 0 0 1.202 0 32 32 0 0 0 .824-.738" /><circle cx="12" cy="10" r="3" /><path d="M16 18h6" /><path d="M19 15v6" /></svg>
                  </button>
                </div>
              </div>
            </div> */}

              {/* Location Selection */}
              <div>
                {/* Selected Locations Display */}
                {selectedLocations.length > 0 && (
                  <div className="mb-4 p-4 bg-green-50 rounded-xl border border-green-200">
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

                <div className="flex flex-col gap-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Locations <span className="text-orange-600">*</span>
                  </label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <input
                        type="text"
                        className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:border-orange-500 outline-none text-orange-600 placeholder:text-orange-600"
                        placeholder="Select locations..."
                        readOnly
                        value={selectedLocations.length > 0 ? `${selectedLocations.length} locations selected` : ''}
                      />
                    </div>

                    <button
                      type="button"
                      className="px-4 py-2 text-sm font-medium text-white bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 rounded-lg hover:shadow transition duration-300 flex items-center gap-2 cursor-pointer"
                      onClick={() => setShowLocation(true)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-map-pin-plus-icon lucide-map-pin-plus"><path d="M19.914 11.105A7.298 7.298 0 0 0 20 10a8 8 0 0 0-16 0c0 4.993 5.539 10.193 7.399 11.799a1 1 0 0 0 1.202 0 32 32 0 0 0 .824-.738" /><circle cx="12" cy="10" r="3" /><path d="M16 18h6" /><path d="M19 15v6" /></svg>
                    </button>
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
                    rows={2}
                    name="description"
                    value={inputs.description}
                    onChange={handleChange}
                    placeholder="Enter details, objectives, or notes..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:ring-orange-500 focus:border-orange-500 outline-none resize-none transition-all duration-200"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-0 focus:ring-offset-2 focus:ring-orange-500 cursor-pointer transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-sm font-medium text-white bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 border border-transparent rounded-lg hover:shadow-lg focus:outline-none focus:ring-0 focus:ring-offset-2 focus:ring-orange-500 cursor-pointer transition-all duration-200 flex items-center gap-2"
                >
                  Add {inputs.type === 'event' ? 'Event' : 'Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="fixed inset-0 bg-orange-100/20 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div
            className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-linear-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  Access Denied
                </h3>
              </div>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Access Denied Content */}
            <div className="p-6">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Permission Required
                </h4>
                <p className="text-gray-600 mb-6">
                  You don't have the necessary permissions to schedule events.
                  Please contact your administrator for access.
                </p>

              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-center p-6 border-t border-gray-200">
              <button
                onClick={handleClose}
                className="px-6 py-2 text-sm font-medium text-white bg-linear-to-r from-red-500 to-orange-600 border border-transparent rounded-lg hover:shadow-lg focus:outline-none focus:ring-0 focus:ring-offset-2 focus:ring-red-500 cursor-pointer transition-all duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>

      )}


      {/* Member Selection Modal */}
      {showMember && (
        <MemberModal
          show={showMember}
          setShow={setShowMember}
          setSelectedMembers={setSelectedMembers}
          setSelectedTeams={setSelectedTeams}
          selectedMembers={selectedMembers}
          selectedTeams={selectedTeams}
        />
      )}

      {/* {showLocation && (
        <LocationModal
          isShow={showLocation}
          setIsShow={setShowLocation}
          setLocation={setSelectedLocation}
        />
      )} */}

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

export default EventModal