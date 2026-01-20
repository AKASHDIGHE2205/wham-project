/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { User, Mail, CheckCircle, Phone, Shield, Zap, Sparkles, ChevronDown, ChevronUp, Users } from 'lucide-react';//IdCard
import { Link } from 'react-router-dom';
import { getTeamMembers } from '../../services/auth/authApi';
import { getUserFromStorage } from '../../helper/cryptoUser';

export interface TeamInfo {
  team_id: number;
  team_name: string;
  manager_id: number;
}

export interface MemberTeams {
  mem_id: number;
  mem_name: string;
  user_id: number;
  teams: TeamInfo[];
}

export interface TeamMembersResponse {
  teams: MemberTeams[];
}

const Profile: React.FC = () => {
  const [data, setData] = useState<TeamMembersResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showTeams, setShowTeams] = useState(false);
  const userData = getUserFromStorage();

  useEffect(() => {
    const fetchTeamData = async () => {
      if (showTeams) {
        setIsLoading(true);
        try {
          const body = { userId: userData?.id || 0 };
          const response: any = await getTeamMembers(body);
          if (response) {
            setData(response?.teams || []);
          }
        } catch (error) {
          console.error("Failed to fetch team data", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchTeamData();
  }, [showTeams, userData?.id]);

  const toggleTeamsView = () => {
    setShowTeams(!showTeams);
  };

  if (!userData) {
    return (
      <div className="min-h-screen bg-linear-to-br from-purple-50 via-blue-50 to-orange-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100 max-w-md w-full" data-aos="zoom-in">
          <div className="w-20 h-20 bg-linear-to-br from-gray-500 to-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <User className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">User Not Found</h2>
          <p className="text-gray-600 mb-6">Please log in to continue</p>
          <Link
            to="/auth/log-out"
            className="inline-flex items-center justify-center px-6 py-3 bg-linear-to-r from-orange-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  const InfoCard = ({ icon: Icon, title, children, className = "" }: any) => (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300 ${className}`}>
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 bg-linear-to-br from-orange-500 to-purple-600 rounded-xl flex items-center justify-center mr-4 shadow-md">
          <Icon className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      {children}
    </div>
  );

  const InfoItem = ({ label, value, icon: Icon }: any) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0 group hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors duration-200">
      <div className="flex items-center">
        {Icon && <Icon className="w-4 h-4 text-gray-400 mr-3 group-hover:text-gray-600 transition-colors" />}
        <span className="text-gray-600 font-medium">{label}</span>
      </div>
      <span className="text-gray-900 font-semibold text-right">{value || "N/A"}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-50 via-blue-50 to-orange-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-2">
          <h1 className="text-4xl font-bold text-gray-900 mb-3 bg-linear-to-r from-orange-600 to-purple-600 bg-clip-text ">
            Profile Details
          </h1>
          <p className="text-gray-600 text-lg max-w-md mx-auto hidden">
            Manage your account information and team preferences
          </p>
        </div>

        <div className="max-w-2xl mx-auto space-y-4">
          {/* Profile Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 text-center relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-orange-500 to-purple-600"></div>

            <div className="relative z-10">
              <div className="w-22 h-22 bg-linear-to-br from-orange-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl border-4 border-white">
                <span className="text-2xl font-bold text-white">
                  {userData?.firstName?.[0]}{userData?.lastName?.[0]}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {userData?.firstName} {userData?.lastName}
              </h2>
              <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-4 border border-green-200" hidden>
                <CheckCircle className="w-4 h-4 mr-2" />
                Verified Account
              </div>
            </div>

            {/* Feature Icons */}
            <div className="mt-2 pt-6 border-t border-gray-100" hidden>
              <div className="flex justify-center space-x-6">
                <div className="text-center group">
                  <div className="p-4 bg-purple-50 rounded-2xl inline-flex group-hover:bg-purple-100 group-hover:scale-110 transition-all duration-300">
                    <Shield className="w-6 h-6 text-purple-600" />
                  </div>
                  <p className="text-xs text-gray-600 mt-2">Secure</p>
                </div>
                <div className="text-center group">
                  <div className="p-4 bg-orange-50 rounded-2xl inline-flex group-hover:bg-orange-100 group-hover:scale-110 transition-all duration-300">
                    <Zap className="w-6 h-6 text-orange-600" />
                  </div>
                  <p className="text-xs text-gray-600 mt-2">Fast</p>
                </div>
                <div className="text-center group">
                  <div className="p-4 bg-yellow-50 rounded-2xl inline-flex group-hover:bg-yellow-100 group-hover:scale-110 transition-all duration-300">
                    <Sparkles className="w-6 h-6 text-yellow-600" />
                  </div>
                  <p className="text-xs text-gray-600 mt-2">Premium</p>
                </div>
              </div>
            </div>
          </div>

          {/* Information Cards */}
          <InfoCard icon={User} title="Personal Information">
            <InfoItem label="First Name" value={userData?.firstName} icon={User} />
            <InfoItem label="Middle Name" value={userData?.middleName} icon={User} />
            <InfoItem label="Last Name" value={userData?.lastName} icon={User} />
          </InfoCard>

          <InfoCard icon={Mail} title="Contact Information">
            <InfoItem label="Email Address" value={userData?.email} icon={Mail} />
            <InfoItem label="Phone Number" value={userData?.phone} icon={Phone} />
          </InfoCard>

          {/* <InfoCard icon={IdCard} title="Account Information">
            <InfoItem label="User ID" value={userData?.id} icon={IdCard} />
            <InfoItem label="Account Role" value={userData?.role} icon={Shield} />
          </InfoCard> */}

          {/* Teams Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300">
            <div
              className="flex items-center justify-between mb-6 cursor-pointer group"
              onClick={toggleTeamsView}
            >
              <div className="flex items-center">
                <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4 shadow-md">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Team Members</h3>
                </div>
              </div>
              <button className="flex items-center space-x-2 px-4 py-2 text-orange-600 cursor-pointer">
                <span className="">
                  {showTeams ? 'Hide' : 'View'}
                </span>
                {showTeams ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Teams Content */}
            {showTeams && (
              <div className="border-t border-gray-100 pt-6">
                {isLoading ? (
                  <div className="text-center py-12">
                    <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading team members...</p>
                  </div>
                ) : data.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto pr-2">
                    {data.map((item: any, index: number) => (
                      <div key={index} className="bg-linear-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all duration-300 hover:border-purple-300 group" >
                        <div className="flex items-center mb-3">
                          <div className="w-8 h-8 bg-linear-to-br from-orange-500 to-purple-600 rounded-full flex items-center justify-center mr-3 shadow-md group-hover:scale-105 transition-transform duration-300">
                            <span className="text-white font-bold text-sm">
                              #{item?.mem_id}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-base font-semibold text-gray-900 truncate">
                              {item?.mem_name}
                            </h4>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {item?.teams?.map((team: any) => (
                            <div key={team?.team_id} className="flex items-center justify-between">
                              <span className="text-xs font-medium text-gray-600">Team:</span>
                              <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                                {team?.team_name}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Users className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 mb-2">No team members found</p>
                    <p className="text-sm text-gray-400">You're not part of any teams yet</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div >
  );
};

export default Profile;