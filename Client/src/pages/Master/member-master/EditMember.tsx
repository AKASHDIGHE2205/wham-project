/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import TeamModal from "../../../components/TeamModal";
import UserModal from "../../../components/UserModal";
import { handleSelectCollege, handleSelectDepartment, handleSelectUser } from "../../../feature/masterSlice";
import { getMemberDetails, updateMember } from "../../../services/master/masterApi";
import type { RootState } from "../../../store/store";
import SelectCollege from "../department/SelectCollege";
import SelectDept from "./SelectDept";

export interface Member {
  mem_id: number;
  first_name: string;
  middle_name: string;
  last_name: string;
  mobile: string;
  email: string;
  birth_date: string;
  join_date: string;
  education_year: string;
  address: string;
  designation: string;
  isorganizer: "Y" | "N";
  gender: string;
  status: string;
  user_id: number;
  role: string | null;
  user_name: string;
  teams?: any[];
  clg_id: number;
  clg_name: string;
  dept_id: number;
  dept_name: string;
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
  const [searchParams] = useSearchParams();
  const isEdit = searchParams.get('isEdit');
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
    join_date: "",
    education_year: "",
    isOrganizer: "",
    gender: "",
    user_id: 0,
    role: "",
    clg_id: 0,
    clg_name: "",
    dept_id: 0,
    dept_name: ""
  });
  const [showTeams, setShowTeams] = useState(false);
  const [selectedTeams, setSelectedTeams] = useState<ApiTeam[]>([]);
  const [showUser, setShowUser] = useState(false);
  const { user_id, user_name, clg_id, clg_name, dept_id, dept_name } = useSelector((state: RootState) => state.master)
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showCollege, setShowCollege] = useState(false);
  const [showDept, setShowDept] = useState(false);
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
        join_date: data?.join_date || "",
        education_year: data?.education_year || "",
        isOrganizer: data?.isorganizer || "",
        gender: data?.gender || "",
        user_id: data?.user_id || 0,
        role: data?.role || "",
        clg_id: data?.clg_id || 0,
        clg_name: data?.clg_name,
        dept_id: data?.dept_id || 0,
        dept_name: data?.dept_name || ""
      });
      dispatch(handleSelectUser({ id: data.user_id, name: data.user_name }))
      dispatch(handleSelectCollege({ id: data.clg_id, name: data.clg_name }))
      dispatch(handleSelectDepartment({ id: data.dept_id, name: data.dept_name }))
    }
  }, [data]);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      const response = await getMemberDetails(id);
      if (response) {
        setData(response?.member || null);
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

  const getTeamsForModal = (): TeamModalTeam[] => {
    return selectedTeams.map(team => ({
      id: team.team_id,
      name: team.name
    }));
  }

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
      join_date: "",
      education_year: "",
      isOrganizer: "",
      gender: "",
      user_id: 0,
      role: "",
      clg_id: 0,
      clg_name: "",
      dept_id: 0,
      dept_name: ""
    })
    dispatch(handleSelectUser({ id: 0, name: "" }))
    setSelectedTeams([])
    navigate('/master/view-members')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (!inputs.first_name || !inputs.last_name || !inputs.birth_date || !inputs.join_date || !inputs.mobile || !inputs.email ) {
      setLoading(false);
      return toast.error("Please fill all required fields!")
    }
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
      join_date: inputs.join_date,
      education_year: inputs.education_year,
      isOrganizer: inputs.isOrganizer,
      gender: inputs.gender,
      role: inputs.role,
      user_id: user_id,
      teams: selectedTeams,
      clg_id: clg_id,
      dept_id: dept_id
    }
    console.log(body);

    const response = await updateMember(body);
    if (response) {
      setLoading(false);
      handleCancel();
    }
  }

  return (
    <>
      <div className="min-h-screen bg-linear-to-br from-purple-50 via-blue-50 to-indigo-50 p-2 sm:p-6">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 mb-6 transform hover:shadow-md transition-all duration-300">
            <div className="flex items-center space-x-4">
              <div className="bg-linear-to-r from-indigo-500 to-purple-600 p-3 rounded-xl">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-indigo-600">Update Member</h1>
                <p className="text-indigo-500">Update member profile.</p>
              </div>
            </div>
          </div>

          {/* Form Container */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <form className="space-y-6" onSubmit={handleSubmit} >
              {/* Personal Information Section */}
              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                  {/* First Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">
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
                        disabled={isEdit === 'false'}
                        placeholder="Enter first name"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Middle Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">
                      Middle Name
                    </label>
                    <input
                      type="text"
                      name="middle_name"
                      value={inputs.middle_name}
                      onChange={handleChange}
                      disabled={isEdit === 'false'}
                      placeholder="Enter middle name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200 disabled:cursor-not-allowed"
                    />
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">
                      Last Name <span className="text-red-600 font-semibold ">*</span>
                    </label>
                    <input
                      type="text"
                      name="last_name"
                      value={inputs.last_name}
                      onChange={handleChange}
                      disabled={isEdit === 'false'}
                      placeholder="Enter last name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Gender and Birth Date in Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Gender */}
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">
                      Gender <span className="text-red-600 font-semibold">*</span>
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
                        disabled={isEdit === 'false'}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:ring-indigo-500 focus:border-indigo-500 outline-none appearance-none bg-white cursor-pointer disabled:cursor-not-allowed"
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
                    <label className="block text-sm font-medium text-gray-800 mb-2">
                      Birth Date <span className="text-red-600 font-semibold">*</span>
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
                        disabled={isEdit === 'false'}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Join Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">
                      Join Date <span className="text-red-600 font-semibold">*</span>
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <input
                        type="date"
                        name="join_date"
                        value={inputs.join_date}
                        onChange={handleChange}
                        disabled={isEdit === 'false'}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>

                </div>
              </div>

              {/* Contact Information Section */}
              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Mobile */}
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">
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
                        disabled={isEdit === 'false'}
                        placeholder="Enter mobile number"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">
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
                        disabled={isEdit === 'false'}
                        placeholder="Enter email address"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-800 mb-2">
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
                      disabled={isEdit === 'false'}
                      placeholder="Enter complete address"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none transition-all duration-200 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* Professional Information Section */}
              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Professional Information
                </h2>
                {/* Row 1 : Designation + Teams */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  {/* Designation */}
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">
                      Designation <span className="text-red-600 font-semibold">*</span>
                    </label>

                    <div className="relative">
                      <input
                        type="text"
                        name="designation"
                        value={inputs.designation}
                        onChange={handleChange}
                        disabled={isEdit === "false"}
                        placeholder="Enter designation"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200 bg-white"
                      />
                    </div>
                  </div>

                  {/* Teams */}
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">
                      Teams
                    </label>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200 bg-white"
                        value={`${selectedTeams.length} teams selected`}
                        readOnly
                      />
                      <button
                        type="button"
                        onClick={() => setShowTeams(true)}
                        disabled={isEdit === "false"}
                        className="px-4 py-2 text-sm font-medium text-white bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 rounded-lg hover:shadow-lg transition duration-300 flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-list-icon lucide-list"><path d="M3 5h.01" /><path d="M3 12h.01" /><path d="M3 19h.01" /><path d="M8 5h13" /><path d="M8 12h13" /><path d="M8 19h13" /></svg>
                      </button>
                    </div>

                    {/* Selected Teams */}
                    {selectedTeams.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {selectedTeams.map((team) => (
                          <div
                            key={team.team_id}
                            className="flex items-center gap-2 px-3 py-1 text-sm bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-full"
                          >
                            👥 {team.name}

                            <button
                              type="button"
                              onClick={() => removeTeam(team.team_id)}
                              disabled={isEdit === "false"}
                              className="text-indigo-600 hover:text-red-600"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              </div>

              {/* Academic Information Section */}
              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Academic Information</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 mb-2">
                  {/* Department */}
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">
                      Department <span className="text-red-600 font-semibold">*</span>
                    </label>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <input
                            type="text"
                            value={dept_name}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200 bg-white"
                            placeholder="Select teams..."
                            readOnly
                          />
                        </div>
                        <button
                          type="button"
                          className="px-4 py-2 text-sm font-medium text-white bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 rounded-lg hover:shadow-lg transition duration-300 flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                          disabled={isEdit === 'false'}
                          onClick={() => setShowDept(true)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-list-icon lucide-list"><path d="M3 5h.01" /><path d="M3 12h.01" /><path d="M3 19h.01" /><path d="M8 5h13" /><path d="M8 12h13" /><path d="M8 19h13" /></svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* College */}
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">
                      College <span className="text-red-600 font-semibold">*</span>
                    </label>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <input
                            type="text"
                            value={clg_name}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200 bg-white"
                            placeholder="Select teams..."
                            readOnly
                          />
                        </div>
                        <button
                          type="button"
                          className="px-4 py-2 text-sm font-medium text-white bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 rounded-lg hover:shadow-lg transition duration-300 flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                          disabled={isEdit === 'false'}
                          onClick={() => setShowCollege(true)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-list-icon lucide-list"><path d="M3 5h.01" /><path d="M3 12h.01" /><path d="M3 19h.01" /><path d="M8 5h13" /><path d="M8 12h13" /><path d="M8 19h13" /></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                {/* education year*/}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Current year of education*/}
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">
                      Current year of education <span className="text-red-600 font-semibold">*</span>
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <select
                        name="education_year"
                        value={inputs.education_year}
                        onChange={handleChange}
                        disabled={isEdit === 'false'}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:ring-indigo-500 focus:border-indigo-500 outline-none appearance-none bg-white cursor-pointer disabled:cursor-not-allowed"
                      >
                        <option value="" disabled>Select Year</option>
                        <option value="1">First Year</option>
                        <option value="2">Second Year</option>
                        <option value="3">Third Year</option>
                        <option value="4">Fourth Year</option>
                        <option value="O">Other</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* User Information Section */}
              <div className="border-b border-gray-200 pb-4 hidden">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">User Information</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {/* Role */}
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">
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
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:ring-indigo-500 focus:border-indigo-500 outline-none appearance-none bg-white cursor-pointer disabled:cursor-not-allowed"
                        value={inputs.role}
                        onChange={handleChange}

                      >disabled={isEdit === 'false'}
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
                    <label className="block text-sm font-medium text-gray-800 mb-2">
                      Assign User
                    </label>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <input
                            type="text"
                            value={user_name}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200 bg-white"
                            placeholder="Select user..."
                            readOnly
                          />
                        </div>
                        <button
                          type="button"
                          className="px-4 py-2 text-sm font-medium text-white bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 rounded-lg hover:shadow-lg transition duration-300 flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                          onClick={() => setShowUser(true)}
                          disabled={isEdit === 'false'}
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
                  className="px-6 py-2 text-sm font-medium text-gray-800 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-0 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer transition-all duration-200"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
                {isEdit === 'true' && (
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 text-sm font-medium text-white bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 border border-transparent rounded-lg hover:shadow-lg focus:outline-none focus:ring-0 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer transition-all duration-200 flex items-center gap-2"
                  >
                    {loading ? 'Updating' : 'Update'}
                  </button>
                )}
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
        <UserModal show={showUser} setShow={setShowUser} />
      )}
      {showCollege && (
        <SelectCollege show={showCollege} setShow={setShowCollege} />
      )}
      {showDept && (
        <SelectDept show={showDept} setShow={setShowDept} />
      )}
    </>
  )
}

export default EditMember