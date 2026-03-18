import { Calendar, CheckCircle2, Circle, Clock, GraduationCap, MapPin, Phone, User, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { MEDIA_URL } from '../../constant/Baseurl';
import { getUserFromStorage } from '../../helper/cryptoUser';
import { getUserProfile } from '../../services/auth/authApi';

export interface UserProfile {
  mem_id: number;
  user_id: number;
  first_name: string;
  middle_name: string;
  last_name: string;
  mobile: string;
  email: string;
  education_year: string;
  join_date: string;
  birth_date: string;
  clg_id: number;
  clg_name: string;
  dept_id: number;
  dept_name: string;
  role: string;
  isorganizer: "Y" | "N";
  photo: string;
}
export interface Team {
  team_id: number;
  team_name: string;
  manager_id: number;
}
export interface TeamMember {
  mem_id: number;
  mem_name: string;
  user_id: number;
  teams: Team[];
}
export interface GetUserWithTeamsResponse {
  user: UserProfile;
  teamMembers: TeamMember[];
}

export default function Profile() {
  const [isLoading, setIsLoading] = useState(true);
  const [imgError, setImgError] = useState(false);
  const [userProfile, setUserProfile] = useState<GetUserWithTeamsResponse | null>(null);
  const userData = getUserFromStorage();

  const fetchUserDetails = async () => {
    setIsLoading(true);
    const response = await getUserProfile(userData?.id || 0);
    if (response) {
      setUserProfile(response);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (userData?.id) {
      fetchUserDetails();
    }
  }, [userData?.id]);

  if (!userData) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8 flex justify-center items-center font-sans text-slate-900">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center max-w-md">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-10 h-10 text-slate-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">User Not Found</h2>
          <p className="text-slate-600 mb-6">Please log in to continue</p>
          <a
            href="/auth/log-out"
            className="inline-flex items-center justify-center px-6 py-3 bg-[#4f3fe0] text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }
  const tasks = [
    {
      id: 1,
      title: "Activity 1",
      description: "Description for activity 1.",
      dueDate: "2026-03-17"
    },
    {
      id: 2,
      title: "Activity 2",
      description: "Description for activity 2.",
      dueDate: "2026-03-18"
    }
  ];

  const getInitials = () => {
    if (userProfile?.user?.first_name && userProfile?.user?.last_name) {
      return `${userProfile.user.first_name[0]}${userProfile.user.last_name[0]}`.toUpperCase();
    }
    if (userData?.firstName && userData?.lastName) {
      return `${userData.firstName[0]}${userData.lastName[0]}`.toUpperCase();
    }
    return 'U';
  };

  const getFullName = () => {
    if (userProfile?.user) {
      const parts = [];
      if (userProfile.user.first_name) parts.push(userProfile.user.first_name);
      if (userProfile.user.middle_name) parts.push(userProfile.user.middle_name);
      if (userProfile.user.last_name) parts.push(userProfile.user.last_name);
      return parts.join(' ') || 'User';
    }
    
    const parts = [];
    if (userData?.firstName) parts.push(userData.firstName);
    if (userData?.middleName) parts.push(userData.middleName);
    if (userData?.lastName) parts.push(userData.lastName);
    return parts.join(' ') || 'User';
  };

  const getProfilePhoto = () => {
    if (userProfile?.user?.photo && !imgError) {
      return `${MEDIA_URL}${userProfile.user.photo}`;
    }
    return null;
  };

  const getRole = () => {
    if (userProfile?.user?.role === 'User') {
      return 'Student';
    }else if (userProfile?.user?.role) {
      return userProfile.user.role;
    }
    return userData?.role || 'Student';
  };

  const getEmail = () => {
    if (userProfile?.user?.email) {
      return userProfile.user.email;
    }
    return userData?.email || '';
  };

  const getPhone = () => {
    if (userProfile?.user?.mobile) {
      return userProfile.user.mobile;
    }
    return userData?.phone || 'Not provided';
  };

  const getCollegeName = () => {
    if (userProfile?.user?.clg_name) {
      return userProfile.user.clg_name;
    }
   
    return userProfile?.user?.clg_name || 'College Not Specified';
  };

  const getDepartmentName = () => {
    if (userProfile?.user?.dept_name) {
      return userProfile.user.dept_name;
    }
    return 'Not specified';
  };

  const getEducationYear = () => {
    if (userProfile?.user?.education_year) {
      return userProfile.user.education_year;
    }
    return 'N/A';
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 flex justify-center items-start font-sans text-slate-900">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">

          {/* Main Profile Card */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100">
            {/* Banner */}
            <div className="h-32 bg-linear-to-r from-[#5d4bff] to-[#4f3fe0] w-full"></div>

            <div className="px-6 md:px-8 pb-8 relative">
              {/* Profile Picture */}
              <div className="absolute -top-16 left-6 md:left-8">
                {getProfilePhoto() ? (
                  <img
                    src={getProfilePhoto()!}
                    alt={getFullName()}
                    className="w-32 h-32 rounded-full border-4 border-white object-cover bg-white shadow-lg"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full border-4 border-white bg-linear-to-br from-[#6554fa] to-[#4f3fe0] flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                    {getInitials()}
                  </div>
                )}
              </div>

              {/* Badge */}
              <div className="flex justify-end pt-4">
                <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                  {getRole()}
                  {userProfile?.user?.isorganizer === 'Y' && ' • Organizer'}
                </span>
              </div>

              {/* Name & Handle */}
              <div className="mt-4">
                <h1 className="text-3xl font-bold text-slate-900">{getFullName()}</h1>
                <p className="text-slate-500 mt-1">@{getEmail()}</p>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-full shrink-0">
                    <GraduationCap size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Education</p>
                    <p className="text-sm font-medium text-slate-700 mt-0.5">
                      {getDepartmentName()} • Year {getEducationYear()}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-50 text-[#4f3fe0] rounded-full shrink-0">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">College</p>
                    <p className="text-sm font-medium text-slate-700 mt-0.5">{getCollegeName()}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-full shrink-0">
                    <Phone size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Phone</p>
                    <p className="text-sm font-medium text-slate-700 mt-0.5">{getPhone()}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-50 text-amber-600 rounded-full shrink-0">
                    <Clock size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Member ID</p>
                    <p className="text-sm font-medium text-slate-700 mt-0.5">#{userProfile?.user?.mem_id || userData?.id || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Join Date */}
              {userProfile?.user?.join_date && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-xs text-slate-600">
                    Member since {new Date(userProfile.user.join_date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Team Members Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="text-[#4f3fe0]" size={20} />
              <h2 className="text-lg font-bold text-slate-900">Team Members</h2>
              <span className="ml-auto text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                {userProfile?.teamMembers?.length || 0} members
              </span>
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-4 border-[#4f3fe0] border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-slate-500 text-sm mt-2">Loading team members...</p>
              </div>
            ) : userProfile?.teamMembers && userProfile.teamMembers.length > 0 ? (
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {userProfile.teamMembers.map((member: TeamMember) => (
                  <div key={member.mem_id} className="border border-slate-200 rounded-xl p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-linear-to-br from-indigo-100 to-purple-100 text-indigo-700 rounded-full flex items-center justify-center text-sm font-bold">
                        {member.mem_name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">{member.mem_name}</h3>
                        <p className="text-xs text-slate-400">ID: {member.mem_id}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {member.teams?.map((team: Team) => (
                        <span
                          key={team.team_id}
                          className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg text-xs font-medium"
                        >
                          {team.team_name}
                          {team.manager_id === userProfile.user.user_id && (
                            <span className="ml-1 text-amber-600">(Manager)</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">No team members found</p>
                <p className="text-xs text-slate-400 mt-1">You haven't joined any teams yet</p>
              </div>
            )}
          </div>

        </div>

        {/* Right Column */}
        <div className="space-y-6 flex flex-col">

          {/* Task List Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col flex-1 min-h-80">
            <div className="p-5 border-b border-slate-100 flex items-center gap-2">
              <CheckCircle2 className="text-[#4f3fe0]" size={20} />
              <h2 className="text-lg font-bold text-slate-900">Task List</h2>
            </div>
            <div className="p-5 flex-1 space-y-3">
              {tasks.map((task) => (
                <div key={task.id} className="border border-slate-200 rounded-xl p-4 flex items-start gap-3 hover:border-indigo-200 transition-colors">
                  <button className="mt-0.5 text-slate-300 hover:text-[#4f3fe0] transition-colors shrink-0">
                    <Circle size={20} />
                  </button>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 text-sm">{task.title}</h3>
                    <p className="text-slate-500 text-xs mt-1 leading-relaxed">{task.description}</p>
                    <div className="flex items-center gap-1.5 mt-3 text-slate-400 text-xs font-medium">
                      <Calendar size={14} />
                      <span>{task.dueDate}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Score Card */}
          <div className="bg-linear-to-br from-[#4f3fe0] to-[#4f3fe0] rounded-2xl shadow-sm p-6 text-white shrink-0">
            <h2 className="text-lg font-bold mb-2">Account Status</h2>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-5xl font-bold tracking-tight">100</span>
              <span className="text-indigo-200 text-lg font-medium">%</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-indigo-800/50 rounded-full h-2 mb-4 overflow-hidden">
              <div className="bg-white h-full rounded-full" style={{ width: '100%' }}></div>
            </div>

            <p className="text-indigo-200 text-xs font-medium">
              Member ID: #{userProfile?.user?.mem_id || userData?.id} • Role: {getRole()}
            </p>
            {userProfile?.user?.isorganizer === 'Y' && (
              <p className="text-indigo-200 text-xs font-medium mt-1">
                Organizer Account • Additional privileges
              </p>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}