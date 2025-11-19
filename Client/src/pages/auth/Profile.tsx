/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import {
  User,
  Mail,
  CheckCircle,
  IdCard,
  Phone,
  Shield,
  Zap,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';
import CryptoJS from 'crypto-js';
const Profile: React.FC = () => {
  const secretKey = `Malpani@2025`;

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
  const userData = decryptUser(encryptedUser);
  console.log(userData);

  if (!userData) {
    return (
      <div className="min-h-screen bg-linear-to-br from-purple-50 to-orange-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100 max-w-md w-full" data-aos="zoom-in">
          <div className="w-16 h-16 bg-linear-to-br from-gray-500 to-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <User className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">User Not Found</h2>
          <p className="text-gray-600 mb-6">Please log in to continue</p>
          <Link
            to="/auth/login"
            className="inline-flex items-center justify-center px-6 py-3 bg-linear-to-r from-orange-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-shadow duration-300"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  const InfoCard = ({ icon: Icon, title, children, className = "" }: any) => (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-300 ${className}`} >
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 bg-linear-to-br from-orange-500 to-purple-600 rounded-xl flex items-center justify-center mr-3">
          <Icon className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      {children}
    </div>
  );

  const InfoItem = ({ label, value, icon: Icon }: any) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
      <div className="flex items-center">
        {Icon && <Icon className="w-4 h-4 text-gray-400 mr-3" />}
        <span className="text-gray-600 font-medium">{label}</span>
      </div>
      <span className="text-gray-900 font-semibold">{value || "N/A"}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-50 to-orange-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-8" >
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Profile <span className="text-orange-600">Details</span>
          </h1>
          <p className="text-gray-600 text-lg">
            Manage your account information and preferences
          </p>
        </div>

        <div className="max-w-2xl mx-auto space-y-6">
          {/* Profile Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6" >
            <div className="text-center">
              <div className="w-24 h-24 bg-linear-to-br from-orange-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-2xl font-bold text-white">
                  {userData.firstName?.[0]}{userData.lastName?.[0]}
                </span>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                {userData.firstName} {userData.lastName}
              </h2>
              <div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-3">
                <CheckCircle className="w-4 h-4 mr-1" />
                Verified Account
              </div>
            </div>

            {/* Feature Icons */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <div className="flex justify-center space-x-4">
                <div className="p-3 bg-purple-50 rounded-xl">
                  <Shield className="w-5 h-5 text-purple-600" />
                </div>
                <div className="p-3 bg-orange-50 rounded-xl">
                  <Zap className="w-5 h-5 text-orange-600" />
                </div>
                <div className="p-3 bg-yellow-50 rounded-xl">
                  <Sparkles className="w-5 h-5 text-yellow-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Information Cards */}
          <InfoCard icon={User} title="Personal Information">
            <InfoItem label="First Name" value={userData.firstName} icon={User} />
            <InfoItem label="Last Name" value={userData.lastName} icon={User} />
          </InfoCard>

          <InfoCard icon={Mail} title="Contact Information" >
            <InfoItem label="Email Address" value={userData.email} icon={Mail} />
            <InfoItem label="Phone Number" value={userData.phone} icon={Phone} />
          </InfoCard>

          <InfoCard icon={IdCard} title="Account Information" >
            <InfoItem label="User ID" value={userData.id} icon={IdCard} />
            <InfoItem label="Account Role" value={userData.role} icon={Shield} />
            <InfoItem label="Member Since" value={userData.createdAt ? new Date(userData.createdAt).toLocaleDateString() : "N/A"} icon={CheckCircle} />
          </InfoCard>
        </div>
      </div>
    </div>
  );
};

export default Profile;