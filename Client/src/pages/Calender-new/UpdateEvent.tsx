/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, type FC } from "react";
import toast from "react-hot-toast";
import { secretKey } from "../../constant/Baseurl";
import CryptoJS from "crypto-js";
import MemberModal from "./MemberModal";
import GoogleLocation from "./GoogleLocation";
import type { SelectedLocation, SelectedMembers, SelectedTeam } from "./NewEventModal";
import { deleteEvent, updateEvent } from "../../services/calender/calenderApi";

export interface EventModalProps {
  isShow: boolean;
  setIsShow: (show: boolean) => void;
  fetchData: () => void;
  Event: any;
  Role: string;
}

export interface EventInterface {
  event_id: number;
  event_date: string;
  title: string;
  description: string;
  from_date: string;
  to_date: string;
  isapproved: "P" | "A" | "R" | string;
  type: string;
  isdeleted: "Y" | "N" | string;
  approved_by: number | null;
  created_by: number;
  created_at: string;
  updated_by: number | null;
  updated_at: string;
  organizer_name: string;
  members: SelectedMembers[];
  teams: SelectedTeam[];
  locations: SelectedLocation[];
}

const UpdateEvent: FC<EventModalProps> = ({ isShow, setIsShow, fetchData, Event, Role }) => {
  const [inputs, setInputs] = useState({
    title: '',
    fromDate: '',
    toDate: '',
    description: '',
    isapproved: '',
    type: 'event',
    isdeleted: 'N'
  });
  const [selectedMembers, setSelectedMembers] = useState<SelectedMembers[] | []>([]);
  const [selectedTeams, setSelectedTeams] = useState<SelectedTeam[] | []>([]);
  const [selectedLocations, setSelectedLocations] = useState<SelectedLocation[] | []>([]);
  const [showMember, setShowMember] = useState(false);
  const [showLocation, setShowLocation] = useState(false);

  useEffect(() => {
    setInputs({
      title: Event?.title || "",
      fromDate: Event?.from_date || "",
      toDate: Event?.to_date || "",
      description: Event?.description || "",
      isapproved: Event?.isapproved || "P",
      type: Event?.type || 'event',
      isdeleted: Event?.isdeleted,
    })
    setSelectedTeams(Event?.teams);
    setSelectedLocations(Event?.locations);
    setSelectedMembers(Event?.members)
  }, [Event])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setInputs(prev => ({ ...prev, [e.target.name]: e.target.value }));
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

  const decryptUser = (encrypted: string | null) => {
    if (!encrypted) return null;
    try {
      const bytes = CryptoJS.AES.decrypt(encrypted, secretKey);
      return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    } catch (error) {
      console.error("Decryption failed", error);
      return null;
    }
  };
  const encryptedUser = localStorage.getItem("user");
  const user = decryptUser(encryptedUser);

  const handleCancel = () => {
    setInputs(
      {
        title: '',
        fromDate: '',
        toDate: '',
        description: '',
        isapproved: '',
        type: 'event',
        isdeleted: 'N',
      }
    )
    setSelectedLocations([])
    setSelectedMembers([])
    setSelectedTeams([])
    setIsShow(false);
    fetchData();
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { title, fromDate, toDate, description, type, isapproved, isdeleted } = inputs;

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
    const body = {
      id: Event?.event_id,
      event_date: Event?.event_date,
      title,
      fromDate,
      toDate,
      description,
      type,
      isapproved,
      isdeleted,
      userId: user?.id || 0,
      teams: selectedTeams || [],
      members: selectedMembers || [],
      locations: selectedLocations || []
    }
    const response = await updateEvent(body);
    if (response) {
      handleCancel();
    }
  }

  const handleDelete = async () => {
    if (!Event?.event_id || !Event?.event_date) {
      toast.error('Please fill in all required fields.');
      return;
    }

    const isConfirmed = window.confirm(
      'Are you sure you want to delete this event?'
    );

    if (!isConfirmed) return;

    const body = {
      id: Event.event_id,
      event_date: Event.event_date,
      isdeleted: "Y"
    };

    const response = await deleteEvent(body);
    if (response) {
      handleCancel();
    }
  };


  const disabled = Event?.isapproved === 'C' || Event?.isapproved === 'A' || !['Master', 'Admin', 'Manager'].includes(Role);


  if (!isShow) return null;
  return (
    <>
      <div className="fixed inset-0 bg-orange-100/20 backdrop-blur-xs flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100">

          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white rounded-t-2xl">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-linear-to-br from-orange-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div>
                <div className="flex items-center">
                  <h3 className="text-xl font-semibold text-gray-900 pr-2">Update Event</h3>
                  <p className="text-sm text-gray-600">{inputs.title}</p>
                </div>
                <div className="flex items-center mt-1">
                  <h3 className="text-sm font-medium text-gray-700 pr-2">Organized by:</h3>
                  <p className="text-sm text-gray-600">
                    <span className="text-orange-600">{Event?.organizer_name || ""}</span>
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {/* Approve Toggle Button */}

              <div className="flex items-center space-x-2 mr-4">
                <span className="text-sm font-medium text-gray-700">Approve</span>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => setInputs({ ...inputs, isapproved: inputs.isapproved === 'A' ? '' : 'A' })}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:cursor-not-allowed focus:ring-offset-2 ${inputs.isapproved === 'A' ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  role="switch"
                  aria-checked={inputs.isapproved === 'A'}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${inputs.isapproved === 'A' ? 'translate-x-5' : 'translate-x-0'
                      }`}
                  />
                </button>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsShow(false)}
                className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Form */}
          <form className="p-6 space-y-3" onSubmit={handleSubmit} >
            {/* Team & Member Selection */}
            <div>
              {/* Selected Teams Display */}
              {selectedTeams?.length > 0 && (
                <div className="mb-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="text-sm font-medium text-blue-800">
                      Selected Teams ({selectedTeams?.length})
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 max-h-32 overflow-auto pr-1">
                    {selectedTeams?.map((item, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-2 bg-blue-100 text-blue-800 rounded-full text-sm border border-blue-200"
                      >
                        {item?.name}
                        <button
                          type="button"
                          onClick={() => removeSelectedTeam(item?.id)}
                          className="text-blue-600 hover:text-blue-800 transition-colors cursor-pointer p-0.5 rounded-full hover:bg-blue-200 disabled:cursor-not-allowed"
                          disabled={disabled}
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
              {selectedMembers?.length > 0 && (
                <div className="mb-4 p-4 bg-orange-50 rounded-xl border border-orange-200">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                    <span className="text-sm font-medium text-orange-800">
                      Selected Members ({selectedMembers?.length})
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 max-h-32 overflow-auto pr-1">
                    {selectedMembers?.map((item, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-2 bg-orange-100 text-orange-800 rounded-full text-sm border border-orange-200"
                      >
                        {item?.first_name} {item?.last_name}
                        <button
                          type="button"
                          onClick={() => removeSelectedMember(item?.id)}
                          className="text-orange-600 hover:text-orange-800 transition-colors cursor-pointer p-0.5 rounded-full hover:bg-orange-200 disabled:cursor-not-allowed"
                          disabled={disabled}
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

              <div className="flex gap-2">
                <div className="flex-1 relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    readOnly
                    value={`Selected teams ${selectedTeams?.length} & members ${selectedMembers?.length}`}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:ring-orange-500 focus:border-orange-500 outline-none disabled:bg-gray-100 text-orange-600 placeholder:text-orange-600 "
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowMember(true)}
                  disabled={disabled}
                  className="px-4 py-2 text-sm font-medium text-white bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-lg hover:shadow-lg disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user-plus-icon lucide-user-plus">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <line x1="19" x2="19" y1="8" y2="14" />
                    <line x1="22" x2="16" y1="11" y2="11" />
                  </svg>
                </button>
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
                  value={inputs?.title}
                  onChange={handleChange}
                  disabled={disabled}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  required
                />
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date & Time <span className="text-orange-600">*</span>
                </label>
                <div className="relative group">
                  <input
                    type="datetime-local"
                    name="fromDate"
                    value={inputs?.fromDate}
                    onChange={handleChange}
                    disabled={disabled}
                    className="w-full px-6 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:ring-orange-500 focus:border-orange-500 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                    value={inputs?.toDate}
                    onChange={handleChange}
                    disabled={disabled}
                    className="w-full px-6 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:ring-orange-500 focus:border-orange-500 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Status (Conditional) */}
            {['Master', 'Manager', 'Admin'].includes(user?.role) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Approve Status <span className="text-orange-600">*</span>
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <select
                    name="isapproved"
                    // disabled={disabled}
                    className={`
                               w-full pl-10 pr-4 py-2 font-semibold rounded-lg transition-all duration-200
                               focus:outline-none focus:ring-0 border  disabled:cursor-not-allowed
                               ${inputs?.isapproved === "P"
                        ? "bg-yellow-50 text-yellow-700 border-yellow-300 focus:border-yellow-500"
                        : inputs?.isapproved === "A"
                          ? "bg-green-50 text-green-700 border-green-300 focus:border-green-500"
                          : inputs?.isapproved === "R"
                            ? "bg-red-50 text-red-700 border-red-300 focus:border-red-500"
                            : inputs?.isapproved === "C"
                              ? "bg-blue-50 text-blue-700 border-blue-300 focus:border-blue-500"
                              : "bg-gray-50 text-gray-700 border-gray-300 focus:border-gray-500"
                      }`}
                    value={inputs?.isapproved}
                    onChange={handleChange}
                  >
                    <option value="P">Pending</option>
                    <option value="A">Approved</option>
                    <option value="R">Rejected</option>
                    <option value="C">Completed</option>
                  </select>
                </div>
              </div>
            )}

            {/* Location Selection */}
            <div>
              {/* Selected Locations Display */}
              {selectedLocations?.length > 0 && (
                <div className="mb-4 p-4 bg-green-50 rounded-xl border border-green-200">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-sm font-medium text-green-800">
                      Selected Locations ({selectedLocations?.length})
                    </span>
                  </div>

                  <div className="space-y-2 max-h-32 overflow-auto pr-1">
                    {selectedLocations?.map((location, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-green-100 text-green-800 rounded-lg border border-green-200"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium">{location?.address}</p>
                          <p className="text-xs text-green-600">
                            Lat: {location?.lat}, Lng: {location?.lng}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeSelectedLocation(location.id)}
                          disabled={disabled}
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

              <div className="flex flex-col gap-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Locations <span className="text-orange-600">*</span>
                </label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <input
                      type="text"
                      disabled={disabled}
                      className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:border-orange-500 outline-none text-orange-600 placeholder:text-orange-600 disabled:cursor-not-allowed"
                      placeholder="Select locations..."
                      readOnly
                      value={
                        selectedLocations?.length > 0
                          ? `${selectedLocations?.length} locations selected`
                          : ''
                      }
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowLocation(true)}
                    disabled={disabled}
                    className="px-4 py-2 text-sm font-medium text-white bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-lg hover:shadow transition duration-300 flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-map-pin-plus-icon lucide-map-pin-plus"><path d="M19.914 11.105A7.298 7.298 0 0 0 20 10a8 8 0 0 0-16 0c0 4.993 5.539 10.193 7.399 11.799a1 1 0 0 0 1.202 0 32 32 0 0 0 .824-.738" /><circle cx="12" cy="10" r="3" /><path d="M16 18h6" /><path d="M19 15v6" /></svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Description */}
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
                  name="description"
                  value={inputs?.description}
                  onChange={handleChange}
                  disabled={disabled}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:ring-orange-500 focus:border-orange-500 outline-none resize-none transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">

              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer"
              >
                Cancel
              </button>
              {((Role === "Admin") || (Role === "Master") || (Role === "Manager")) && (
                <>
                  <button
                    type="button"
                    className="px-6 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-700 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm flex items-center gap-2 cursor-pointer"
                    onClick={handleDelete}
                  >
                    Delete
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 text-sm font-medium text-white bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm flex items-center gap-2 cursor-pointer"
                  >
                    Update
                  </button>
                </>
              )}
            </div>
          </form>
        </div>
      </div>
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
      {showLocation && (
        <GoogleLocation
          isShow={showLocation}
          setIsShow={setShowLocation}
          onLocationSelect={handleAddLocation}
        />
      )}
    </>
  );
};

export default UpdateEvent;