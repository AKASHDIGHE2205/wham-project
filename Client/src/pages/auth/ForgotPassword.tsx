/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Lock, ArrowRight, Shield, Zap, Sparkles, ArrowLeft, Key, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const ForgotPassword: React.FC = () => {
  const [step, setStep] = useState(1);
  const [mobile, setMobile] = useState([]);
  const maskedMobile = mobile
    ? mobile.toString().slice(0, -3).replace(/./g, "X") + mobile.toString().slice(-3)
    : "";



  const handleSendOtp = () => {

    if (!mobile || mobile.length !== 10) {
      toast.error("Please enter a valid mobile number.");
      return;
    }
    console.log(mobile);
    setStep(2);
  };

  const handleVerifyOtp = () => {
    // verify OTP API call
    setStep(3);
  };

  const handleResetPassword = () => {
    // reset password API
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-50 to-orange-50 flex">
      {/* Left Side */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-linear-to-br from-purple-900 to-black">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 border-2 border-orange-400 rounded-full" />
          <div className="absolute bottom-20 right-20 w-48 h-48 border-2 border-yellow-400 rounded-full" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-purple-400 rounded-full" />
        </div>

        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-white">
          <div className="max-w-md text-center">
            <div className="flex justify-center space-x-6 mb-8">
              <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
                <Shield className="w-8 h-8 text-orange-400" />
              </div>
              <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
                <Zap className="w-8 h-8 text-yellow-400" />
              </div>
              <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
                <Sparkles className="w-8 h-8 text-purple-400" />
              </div>
            </div>

            <h1 className="text-4xl font-bold mb-6 text-white">
              Reset Your <span className="text-orange-400">Password</span>
            </h1>

            <p className="text-lg text-gray-300 mb-8 leading-relaxed">
              Secure password reset process with OTP verification to protect your account.
            </p>

            <div className="space-y-4 text-left mb-8">
              {[
                { text: "Instant OTP delivery", color: "text-purple-400" },
                { text: "Secure verification process", color: "text-orange-400" },
                { text: "Real-time validation", color: "text-yellow-400" },
                { text: "Encrypted data protection", color: "text-white" }
              ].map((feature) => (
                <div key={feature.text} className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${feature.color.replace("text", "bg")}`} />
                  <span className="text-gray-300">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">

            <div className="mb-6">
              <Link
                to="/auth/login"
                className="inline-flex items-center text-sm text-black hover:text-orange-600 hover:underline transition-colors duration-200"
              >
                <ArrowLeft className="w-4 h-4 mr-2 " />
                Back to Sign In
              </Link>
            </div>

            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-linear-to-br from-orange-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Key className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-orange-600 mb-2">
                Reset Your Password
              </h2>
              <p className="text-gray-600">
                {step === 1 && "Enter your mobile number to receive OTP"}
                {step === 2 && "Enter the OTP sent to your mobile"}
                {step === 3 && "Set your new password"}
              </p>
            </div>

            {/* Step Progress Indicator */}
            <div className="flex justify-center mb-8">
              <div className="flex items-center">
                {[1, 2, 3].map((stepNumber) => (
                  <React.Fragment key={stepNumber}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= stepNumber
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                      }`}>
                      {stepNumber}
                    </div>
                    {stepNumber < 3 && (
                      <div className={`w-12 h-1 mx-2 ${step > stepNumber ? 'bg-orange-500' : 'bg-gray-200'
                        }`} />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            <form className="space-y-6">
              {/* Step 1: Mobile Input */}
              {step === 1 && (
                <div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Mobile Number</label>

                    {/* Remove nested form */}
                    <div className="flex space-x-2">
                      <div className="relative group flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Phone className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="tel"
                          onChange={(e: any) => setMobile(e.target.value)}
                          maxLength={10}
                          minLength={10}
                          required
                          className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-0 focus:ring-orange-500 focus:border-orange-500 outline-none"
                          placeholder="Enter your mobile number"
                        />
                      </div>

                      {/* Use button type="button" so the parent form does not submit */}
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        className="px-4 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors duration-200 whitespace-nowrap"
                      >
                        Send OTP
                      </button>
                    </div>
                  </div>
                </div>

              )}

              {/* Step 2: OTP Verification */}
              {step === 2 && (
                <div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">OTP Verification</label>
                    <div className="flex space-x-2">
                      <div className="relative group flex-1">
                        <input
                          type="number"
                          className="block w-full pl-4 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-0 focus:ring-orange-500 focus:border-orange-500 outline-none"
                          placeholder="Enter OTP"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleVerifyOtp}
                        className="px-4 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors duration-200 whitespace-nowrap"
                      >
                        Verify OTP
                      </button>
                    </div>
                    <span className="flex justify-center text-sm text-gray-500 mt-2">
                      OTP sent to your mobile number {maskedMobile}
                    </span>
                  </div>
                </div>
              )}

              {/* Step 3: New Password */}
              {step === 3 && (
                <>
                  <div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">New Password</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="password"
                          className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-0 focus:ring-orange-500 focus:border-orange-500 outline-none"
                          placeholder="Enter new password"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Confirm New Password</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="password"
                          className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-0 focus:ring-orange-500 focus:border-orange-500 outline-none"
                          placeholder="Confirm new password"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={handleResetPassword}
                      className="w-full bg-linear-to-r from-orange-500 to-purple-600 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center hover:shadow-lg transition-shadow duration-300"
                    >
                      Reset Password
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </button>
                  </div>
                </>
              )}

              {/* Login Link */}
              <div className="text-center">
                <p className="text-gray-600">
                  Remember your password?{" "}
                  <Link to="/auth/login" className="text-orange-600 hover:underline font-medium">
                    Back to Sign In
                  </Link>
                </p>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;