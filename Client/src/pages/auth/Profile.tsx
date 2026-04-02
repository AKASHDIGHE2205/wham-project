import { endOfMonth, format, startOfMonth } from "date-fns";
import { Calendar as CalendarIcon, Circle, GraduationCap, MapPin, Phone, User, Users } from 'lucide-react';
import moment from "moment";
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MEDIA_URL } from '../../constant/Baseurl';
import { getUserFromStorage } from '../../helper/cryptoUser';
import { getUserProfile } from '../../services/auth/authApi';
import { getActivities } from '../../services/calender/calenderApi';

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
  first_name: string;
  middle_name: string;
  last_name: string;
  user_id: number;
  teams: Team[];
}

export interface Activities {
  id: number;
  date: string;
  title: string;
  start_date: string;
  end_date: string;
  vehicle_type: string;
  status: 'A' | 'p' | 'R' | '';
}

export interface GetUserWithTeamsResponse {
  user: UserProfile;
  teamMembers: TeamMember[];
}

export default function Profile() {
  const [isLoading, setIsLoading] = useState(true);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [imgError, setImgError] = useState(false);
  const [userProfile, setUserProfile] = useState<GetUserWithTeamsResponse | null>(null);
  const [activities, setActivities] = useState<Activities[]>([]);
  const userData = getUserFromStorage();

  const fetchUserDetails = async () => {
    setIsLoading(true);
    const response = await getUserProfile(userData?.id || 0);
    if (response) {
      setUserProfile(response);
    }
    setIsLoading(false);
  };

  const fetchMonthlyActivities = async () => {
    setActivitiesLoading(true);
    const currentDate = new Date();
    const body = {
      userId: userData?.id || 0,
      role: userData?.role || '',
      startDate: format(startOfMonth(currentDate), 'yyyy-MM-dd'),
      endDate: format(endOfMonth(currentDate), 'yyyy-MM-dd'),
      view: 'monthly'
    };

    const response = await getActivities(body);

    if (response) {
      setActivities(response?.activities || []);
    }
    setActivitiesLoading(false);
  };

  useEffect(() => {
    if (userData?.id) {
      fetchUserDetails();
      fetchMonthlyActivities();
    }
  }, [userData?.id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'A':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'p':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'R':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'A':
        return 'Approved';
      case 'p':
        return 'Pending';
      case 'R':
        return 'Rejected';
      default:
        return 'Draft';
    }
  };

  if (!userData) {
    return (
      <div className="min-h-screen bg-white p-4 md:p-8 flex justify-center items-center font-sans text-slate-900">
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
    } else if (userProfile?.user?.role) {
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

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const dob = new Date(birthDate);

    let age = today.getFullYear() - dob.getFullYear();

    const monthDiff = today.getMonth() - dob.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < dob.getDate())
    ) {
      age--;
    }

    return age;
  };

  const groupedActivities = activities.reduce((acc: { [key: string]: Activities[] }, activity) => {
    const date = activity.date || activity.start_date?.split('T')[0];
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(activity);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedActivities).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  return (
    <div className="min-h-screen bg-slate-50 p-4 flex justify-center items-start font-sans text-slate-900">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Left Column */}
        <div className="lg:col-span-3 space-y-6" data-aos="fade-down">
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
                    <p className="text-sm text-slate-700 mt-0.5">
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
                    <p className="text-sm text-slate-700 mt-0.5">{getCollegeName()}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-full shrink-0">
                    <Phone size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Phone</p>
                    <p className="text-sm text-slate-700 mt-0.5">{getPhone()}</p>
                  </div>
                </div>

                {/* Join Date */}
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-50 text-amber-600 rounded-full shrink-0">
                    <User />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Age/Join Date</span>
                    <div className="text-sm text-slate-700 mt-0.5">
                      {userProfile?.user?.join_date && (
                        <div>
                          <p className="text-xs text-slate-600">
                            Age: {calculateAge(userProfile?.user?.birth_date)} <br />
                            Member since{" "}
                            {moment(userProfile?.user?.join_date).format("MMMM D, YYYY")}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Team Members Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="text-[#4f3fe0]" size={20} />
              <h2 className="text-lg font-bold text-slate-900">Team Members</h2>
              <span className="ml-auto text-xs bg-blue-100 text-slate-600 px-2 py-1 rounded-full">
                {userProfile?.teamMembers?.length || 0} members
              </span>
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-4 border-[#4f3fe0] border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-slate-500 text-sm mt-2">Loading team members...</p>
              </div>
            ) : userProfile?.teamMembers && userProfile.teamMembers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto pr-2">
                {userProfile.teamMembers.map((member: TeamMember) => (
                  <div key={member.mem_id} className="border border-slate-200 rounded-xl p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-linear-to-br from-indigo-100 to-purple-100 text-indigo-700 rounded-full flex items-center justify-center text-sm font-bold">
                        {member.first_name?.charAt(0) || 'U'}{member.last_name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <h3 className="text-slate-900">{member.first_name} {member.middle_name} {member.last_name}</h3>
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
        <div className="lg:col-span-2 space-y-6">
          {/* Activities Card - Replacing Task List */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col flex-1 h-full">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarIcon className="text-[#4f3fe0]" size={20} />
                <h2 className="text-lg font-bold text-slate-900">This Month's Activities</h2>
              </div>
              <Link
                to="/calender"
                className="text-xs text-[#4f3fe0] hover:text-indigo-700 font-medium"
              >
                View All
              </Link>
            </div>

            <div className="p-5 flex-1 overflow-y-auto">
              {activitiesLoading ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-4 border-[#4f3fe0] border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-slate-500 text-sm mt-2">Loading activities...</p>
                </div>
              ) : activities.length > 0 ? (
                <div className="space-y-4">
                  {sortedDates.slice(0, 5).map((date) => (
                    <div key={date} className="space-y-2">
                      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        {new Date(date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </h3>
                      {groupedActivities[date].map((activity) => (
                        <Link
                          key={activity.id}
                          to={`/update-activity/${activity?.id}/${moment(activity?.date).format('YYYY-MM-DD')}`}
                          className="block border border-slate-200 rounded-xl p-3 hover:border-indigo-200 transition-colors hover:shadow-sm"
                        >
                          <div className="flex items-start gap-2">
                            <button className="mt-0.5 text-slate-300 hover:text-[#4f3fe0] transition-colors shrink-0">
                              <Circle size={16} />
                            </button>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-slate-900 text-sm truncate">
                                {activity.title}
                              </h3>
                              {activity.vehicle_type && (
                                <p className="text-slate-500 text-xs mt-0.5">
                                  Vehicle: {activity.vehicle_type}
                                </p>
                              )}
                              <div className="flex items-center justify-between mt-2">
                                <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusColor(activity.status)}`}>
                                  {getStatusText(activity.status)}
                                </span>
                                {activity.start_date && activity.end_date && (
                                  <span className="text-xs text-slate-400">
                                    {new Date(activity.start_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ))}

                  {activities.length > 5 && (
                    <Link
                      to="/calendar"
                      className="block text-center text-xs text-[#4f3fe0] font-medium mt-4 hover:text-indigo-700"
                    >
                      + {activities.length - 5} more activities
                    </Link>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CalendarIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm">No activities this month</p>
                  <Link
                    to="/add-activity"
                    className="inline-block mt-4 px-4 py-2 bg-[#4f3fe0] text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Create Activity
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}