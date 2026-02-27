/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom"
import { getMemberDetails, updateMember } from "../../../services/master/masterApi";
import TeamModal from "./TeamModal";
import UserModal from "./UserModal";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../../store/store";
import { handleSelectUser } from "../../../feature/masterSlice";

export interface Member {
  mem_id: number;
  first_name: string;
  middle_name: string;
  last_name: string;
  mobile: string;
  email: string;
  birth_date: string;
  address: string;
  designation: string;
  isorganizer: "Y" | "N";
  gender: string;
  status: string;
  user_id: number;
  role: string | null;
  user_name: string;
  teams?: any[];
}

interface TeamModalTeam {
  id: number;
  name: string;
}

export interface ApiTeam {
  team_id: number;
  name: string;
}

const EditMember = () => {
  const { id } = useParams();
  const [data, setData] = useState<Member | null>(null);
  const [inputs, setInputs] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    mobile: "",
    email: "",
    address: "",
    designation: "",
    birth_date: "",
    isOrganizer: "",
    gender: "",
    user_id: 0,
    role: ""
  });
  const [showTeams, setShowTeams] = useState(false);
  const [selectedTeams, setSelectedTeams] = useState<ApiTeam[]>([]);
  const [showUser, setShowUser] = useState(false);
  const { user_id, user_name } = useSelector((state: RootState) => state.master)
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (data) {
      setInputs({
        first_name: data?.first_name || "",
        middle_name: data?.middle_name || "",
        last_name: data?.last_name || "",
        mobile: data?.mobile || "",
        email: data?.email || "",
        address: data?.address || "",
        designation: data?.designation || "",
        birth_date: data?.birth_date || "",
        isOrganizer: data?.isorganizer || "",
        gender: data?.gender || "", // Added gender field
        user_id: data?.user_id || 0,
        role: data?.role || ""
      });
      dispatch(handleSelectUser({ id: data.user_id, name: data.user_name }))
    }
  }, [data]);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      const response = await getMemberDetails(id);
      if (response) {
        setData(response?.member || null);
        // Map API teams to our internal format
        const apiTeams: ApiTeam[] = response?.member?.teams?.map((team: any) => ({
          team_id: team.team_id,
          name: team.name
        })) || [];
        setSelectedTeams(apiTeams);
      }
    }
    fetchData();
  }, [id]);

  const removeTeam = (teamId: number) => {
    setSelectedTeams(prev => prev.filter(team => team.team_id !== teamId));
  }

  // Convert our internal format to TeamModal format
  const getTeamsForModal = (): TeamModalTeam[] => {
    return selectedTeams.map(team => ({
      id: team.team_id,
      name: team.name
    }));
  }

  // Handle teams coming from TeamModal (convert back to our internal format)
  const handleTeamSelection = (teams: TeamModalTeam[]) => {
    const apiTeams: ApiTeam[] = teams.map(team => ({
      team_id: team.id,
      name: team.name
    }));
    setSelectedTeams(apiTeams);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setInputs(prev => ({ ...prev, [e.target.name]: e.target.value }))
  };

  const handleCancel = () => {
    setInputs({
      first_name: "",
      middle_name: "",
      last_name: "",
      mobile: "",
      email: "",
      address: "",
      designation: "",
      birth_date: "",
      isOrganizer: "",
      gender: "", // Added gender field
      user_id: 0,
      role: ""
    })
    dispatch(handleSelectUser({ id: 0, name: "" }))
    setSelectedTeams([])
    navigate('/master/view-members')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const body = {
      mem_id: id,
      first_name: inputs.first_name,
      middle_name: inputs.middle_name,
      last_name: inputs.last_name,
      mobile: inputs.mobile,
      email: inputs.email,
      address: inputs.address,
      designation: inputs.designation,
      birth_date: inputs.birth_date,
      isOrganizer: inputs.isOrganizer,
      gender: inputs.gender,
      role: inputs.role,
      user_id: user_id,
      teams: selectedTeams
    }
    const response = await updateMember(body);
    if (response) {
      setLoading(false);
      handleCancel();
    }
  }

  return (
    <>
      <div className="min-h-screen bg-white p-2 sm:p-6">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6 transform hover:shadow-md transition-all duration-300">
            <div className="flex items-center space-x-4">
              <div className="bg-linear-to-r from-orange-500 to-purple-600 p-3 rounded-xl">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-orange-600">Update Member</h1>
                <p className="text-orange-500">Update member profile.</p>
              </div>
            </div>
          </div>

          {/* Form Container */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <form className="space-y-6" onSubmit={handleSubmit} >
              {/* Personal Information Section */}
              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-lg font-semibold text-black mb-4">Personal Information</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* First Name */}
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      First Name <span className="text-red-600 font-semibold">*</span>
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        name="first_name"
                        value={inputs.first_name}
                        onChange={handleChange}
                        placeholder="Enter first name"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all duration-200"
                      />
                    </div>
                  </div>

                  {/* Middle Name */}
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Middle Name
                    </label>
                    <input
                      type="text"
                      name="middle_name"
                      value={inputs.middle_name}
                      onChange={handleChange}
                      placeholder="Enter middle name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all duration-200"
                    />
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Last Name <span className="text-red-600 font-semibold ">*</span>
                    </label>
                    <input
                      type="text"
                      name="last_name"
                      value={inputs.last_name}
                      onChange={handleChange}
                      placeholder="Enter last name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Gender and Birth Date in Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {/* Gender */}
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Gender
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <select
                        name="gender"
                        value={inputs.gender}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:ring-orange-500 focus:border-orange-500 outline-none appearance-none bg-white cursor-pointer"
                      >
                        <option value="" disabled>Select gender</option>
                        <option value="M">Male</option>
                        <option value="F">Female</option>
                        <option value="O" hidden>Other</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Birth Date */}
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Birth Date
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <input
                        type="date"
                        name="birth_date"
                        value={inputs.birth_date}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information Section */}
              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-lg font-semibold text-black mb-4">Contact Information</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Mobile */}
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Mobile <span className="text-red-600 font-semibold">*</span>
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <input
                        type="tel"
                        name="mobile"
                        maxLength={10}
                        minLength={10}
                        value={inputs.mobile}
                        onChange={handleChange}
                        placeholder="Enter mobile number"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all duration-200"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Email <span className="text-red-600 font-semibold">*</span>
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <input
                        type="email"
                        name="email"
                        value={inputs.email}
                        onChange={handleChange}
                        placeholder="Enter email address"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-black mb-2">
                    Address
                  </label>
                  <div className="relative group">
                    <div className="absolute top-3 left-3 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <textarea
                      rows={2}
                      name="address"
                      value={inputs.address}
                      onChange={handleChange}
                      placeholder="Enter complete address"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:ring-orange-500 focus:border-orange-500 outline-none resize-none transition-all duration-200"
                    />
                  </div>
                </div>
              </div>

              {/* Professional Information Section */}
              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-lg font-semibold text-black mb-4">Professional Information</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Designation */}
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Designation <span className="text-red-600 font-semibold">*</span>
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        name="designation"
                        value={inputs.designation}
                        onChange={handleChange}
                        placeholder="Enter designation"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all duration-200"
                      />
                    </div>
                  </div>

                  {/* Is Organizer */}
                  <div hidden>
                    <label className="block text-sm font-medium text-black mb-2">
                      Is Organizer? <span className="text-red-600 font-semibold">*</span>
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <select
                        name="isOrganizer"
                        value={inputs.isOrganizer}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:ring-orange-500 focus:border-orange-500 outline-none appearance-none bg-white cursor-pointer"
                      >
                        <option value="" disabled>Select option</option>
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
                </div>

                {/* Team Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {/* Team Selection */}
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Teams
                    </label>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <input
                            type="text"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all duration-200 bg-white"
                            placeholder="Select teams..."
                            value={`${selectedTeams.length} teams selected`}
                            readOnly
                          />
                        </div>
                        <button
                          type="button"
                          className="px-4 py-2 text-sm font-medium text-white bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 rounded-lg hover:shadow-lg transition duration-300 flex items-center gap-2 cursor-pointer"
                          onClick={() => setShowTeams(true)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-list-icon lucide-list"><path d="M3 5h.01" /><path d="M3 12h.01" /><path d="M3 19h.01" /><path d="M8 5h13" /><path d="M8 12h13" /><path d="M8 19h13" /></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                  {/* Empty div to maintain grid structure */}
                  <div></div>
                </div>
                {/* Selected Teams Preview */}
                {selectedTeams.length > 0 && (
                  <div className="bg-linear-to-r from-orange-50 to-purple-50 border-b border-orange-200 p-4 m-4">

                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center w-6 h-6 bg-linear-to-br from-orange-500 to-purple-600 text-white text-sm font-bold rounded-full shadow-sm">
                          {selectedTeams.length}
                        </span>
                        <span className="text-sm font-semibold text-orange-800">
                          Selected Teams
                        </span>
                      </div>

                      {/* Clear All */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTeams([]);
                        }}
                        className="text-xs text-red-600 hover:text-red-800 font-medium flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Clear All
                      </button>
                    </div>

                    {/* List of selected teams */}
                    <div className="flex flex-wrap gap-2 max-h-32 overflow-auto pr-2">
                      {selectedTeams.map((team) => (
                        <div
                          key={team.team_id}
                          className="bg-orange-100 border border-orange-200 text-orange-800 rounded-full px-3 py-2 shadow-sm flex items-center gap-2 group hover:shadow-md transition-all duration-200"
                        >
                          <span className="text-sm font-medium">
                            👥 {team.name}
                          </span>

                          {/* Remove team */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeTeam(team.team_id);
                            }}
                            className="p-0.5 rounded-full transition-colors text-orange-600 hover:text-orange-800 hover:bg-orange-200"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* User Information Section */}
              <div className="border-b border-gray-200 pb-4 hidden">
                <h2 className="text-lg font-semibold text-black mb-4">User Information</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {/* Role */}
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      User Role <span className="text-red-600 font-semibold">*</span>
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <select
                        name="role"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:ring-orange-500 focus:border-orange-500 outline-none appearance-none bg-white cursor-pointer"
                        value={inputs.role}
                        onChange={handleChange}
                      >
                        <option value="" disabled>Select Role</option>
                        <option value="Master">Master</option>
                        <option value="User">User</option>
                        <option value="Admin">Admin</option>
                        <option value="Manager">Manager</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* User */}
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Assign User
                    </label>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <input
                            type="text"
                            value={user_name}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all duration-200 bg-white"
                            placeholder="Select user..."
                            readOnly
                          />
                        </div>
                        <button
                          type="button"
                          className="px-4 py-2 text-sm font-medium text-white bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 rounded-lg hover:shadow-lg transition duration-300 flex items-center gap-2 cursor-pointer "
                          onClick={() => setShowUser(true)}
                          hidden
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
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
                </div>

              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end space-x-3 pt-6">
                <button
                  type="button"
                  className="px-6 py-2 text-sm font-medium text-black bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-0 focus:ring-offset-2 focus:ring-orange-500 cursor-pointer transition-all duration-200"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 text-sm font-medium text-white bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 border border-transparent rounded-lg hover:shadow-lg focus:outline-none focus:ring-0 focus:ring-offset-2 focus:ring-orange-500 cursor-pointer transition-all duration-200 flex items-center gap-2"
                >
                  {loading ? 'Updating' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div >
      </div >
      {/* Team Modal */}
      {showTeams && (
        < TeamModal
          show={showTeams}
          setShow={setShowTeams}
          setSelectedTeams={handleTeamSelection}
          selectedTeams={getTeamsForModal()}
        />
      )}
      {showUser && (
        <UserModal
          show={showUser}
          setShow={setShowUser}
        />
      )}
    </>
  )
}

export default EditMember