/* eslint-disable @typescript-eslint/no-explicit-any */
import { ArrowRight, CheckCircle, Clock, Eye, EyeOff, Lock, Phone } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { sendOtp, UpdateOtp, ValidateOtp } from '../../services/auth/authApi';

const ForgotPassword: React.FC = () => {
  const [step, setStep] = useState(1);
  const [mobile, setMobile] = useState([]);
  const [password, setPassword] = useState('');
  const [cPassword, setCPassword] = useState('');
  const [showPass, setShowPass] = useState(false)
  const [otp, setOtp] = useState(0)
  const [timeLeft, setTimeLeft] = useState(120);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [loading, setLoading] = useState({
    sendOtp: false,
    verifyOtp: false,
    resetPassword: false,
    resendOtp: false
  });
  const navigate = useNavigate();
  const maskedMobile = mobile ? mobile.toString().slice(0, -3).replace(/./g, "X") + mobile.toString().slice(-3) : "";

  // Countdown timer effect
  useEffect(() => {
    if (!isTimerRunning) return;

    const interval = window.setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsTimerRunning(false);
          toast.error('OTP has expired. Please request a new one.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleSendOtp = async () => {
    if (!mobile || mobile.length !== 10) {
      toast.error("Please enter a valid mobile number.");
      return;
    }

    setLoading(prev => ({ ...prev, sendOtp: true }));

    try {
      const body = { mobile }
      const response = await sendOtp(body);
      if (response?.status === 200) {
        setStep(2);
        setTimeLeft(120);;
        setIsTimerRunning(true);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(prev => ({ ...prev, sendOtp: false }));
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      toast.error('Please fill otp.');
      return;
    }

    // Check if OTP has expired
    if (timeLeft === 0) {
      toast.error('OTP has expired. Please request a new one.');
      return;
    }

    setLoading(prev => ({ ...prev, verifyOtp: true }));

    try {
      const body = {
        mobile,
        otp
      }
      const response = await ValidateOtp(body);
      if (response?.status === 200) {
        setIsTimerRunning(false);
        setStep(3);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(prev => ({ ...prev, verifyOtp: false }));
    }
  };

  const handleResetPassword = async () => {
    if (!password || !cPassword || !mobile) {
      toast.error('Please fill all required fields.')
      return;
    }
    if (password !== cPassword) {
      toast.error('Password & confirm password should be match.');
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    if (!passwordRegex.test(password)) {
      toast.error('Invalid format.');
      return;
    }

    setLoading(prev => ({ ...prev, resetPassword: true }));

    try {
      const body = {
        mobile,
        password
      }

      const response = await UpdateOtp(body);
      if (response?.status === 200) {
        setCPassword('');
        setMobile([]);
        setOtp(0);
        setPassword('');
        setTimeLeft(120);;
        setIsTimerRunning(false);
        setStep(1)
        navigate('/auth/login')
      }
    } catch (error) {
      console.log(error);
      toast.error('Failed to reset password. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, resetPassword: false }));
    }
  };

  // Resend OTP functionality
  const handleResendOtp = async () => {
    if (timeLeft > 0 && isTimerRunning) {
      toast.error(`Please wait ${formatTime(timeLeft)} before requesting a new OTP`);
      return;
    }

    setLoading(prev => ({ ...prev, resendOtp: true }));

    try {
      const body = {
        mobile
      }
      const response = await sendOtp(body);
      if (response?.status === 200) {
        setTimeLeft(120);
        setIsTimerRunning(true);
        setOtp(0);
      }
    } catch (error) {
      console.log(error);
      toast.error('Failed to resend OTP. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, resendOtp: false }));
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-r from-purple-50 to-indigo-50 flex items-center justify-center">
      {/* Centered Floating Card */}
      <div className="w-full max-w-lg px-6 py-8" data-aos="fade-up">
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Header with Logo */}
          <div className="text-center mb-8">
            <div className="flex flex-col items-center justify-center">
              <div className="flex items-center gap-2 group focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg mb-3">
                <div className="w-16 h-16 bg-[#3232ff] rounded-lg flex items-center justify-center shadow-sm group-hover:shadow transition-all">
                  <span className="text-white font-bold text-xl">W</span>
                </div>
              </div>
              <span className="text-xl font-bold bg-linear-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                WHam Energy
              </span>
            </div>

            <h2 className="text-sm font-semibold text-gray-500 mb-2 mt-1">
              {step === 1 && "Reset Your Password"}
              {step === 2 && "Verify OTP"}
              {step === 3 && "Create New Password"}
            </h2>
          </div>

          {/* Step Progress Indicator */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center">
              {[1, 2, 3].map((stepNumber) => (
                <React.Fragment key={stepNumber}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                    ${step >= stepNumber
                      ? 'bg-[#3232ff] text-white shadow-md shadow-indigo-500/30'
                      : 'bg-gray-100 text-gray-400 border border-gray-200'
                    }`}>
                    {step > stepNumber ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      stepNumber
                    )}
                  </div>
                  {stepNumber < 3 && (
                    <div className={`w-12 h-1 mx-1 rounded-full ${step > stepNumber ? 'bg-[#3232ff]' : 'bg-gray-200'
                      }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Form */}
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            {/* Step 1: Mobile Input */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      onChange={(e: any) => setMobile(e.target.value)}
                      maxLength={10}
                      minLength={10}
                      required
                      className="w-full pl-10 pr-4 py-2 h-12 border border-gray-300 rounded-lg focus:ring-0 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-gray-50"
                      placeholder="Enter 10-digit mobile number"
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    We'll send a verification code to this number
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading.sendOtp}
                  className="w-full bg-[#3232ff] hover:bg-[#2424fa] text-white py-3 px-4 rounded-lg font-medium transition-all duration-300 shadow-lg shadow-indigo-500/25 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading.sendOtp ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      Send OTP
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Step 2: OTP Verification */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Enter OTP
                  </label>
                  <input
                    type="text"
                    onChange={(e: any) => setOtp(e.target.value)}
                    maxLength={6}
                    className="w-full px-4 py-2 h-12 text-center text-2xl tracking-[0.5em] font-mono border border-gray-300 rounded-lg focus:ring-0 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-gray-50"
                    placeholder="••••••"
                  />
                  <p className="text-xs text-gray-500">
                    OTP sent to {maskedMobile}
                  </p>
                </div>

                {/* Timer and Resend */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      Code expires in
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`font-mono font-bold ${timeLeft < 60 ? 'text-red-600' : 'text-[#3232ff]'}`}>
                      {formatTime(timeLeft)}
                    </span>
                    {!isTimerRunning && (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={loading.resendOtp}
                        className="text-sm text-[#3232ff] hover:text-[#2424fa] font-medium disabled:opacity-50"
                      >
                        {loading.resendOtp ? 'Sending...' : 'Resend'}
                      </button>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={loading.verifyOtp}
                  className="w-full bg-[#3232ff] hover:bg-[#2424fa] text-white py-3 px-4 rounded-lg font-medium transition-all duration-300 shadow-lg shadow-indigo-500/25 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading.verifyOtp ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Verifying...
                    </>
                  ) : (
                    <>
                      Verify OTP
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Step 3: New Password */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showPass ? "text" : "password"}
                      onChange={(e: any) => setPassword(e.target.value)}
                      required
                      className="w-full pl-10 pr-12 py-2 h-12 border border-gray-300 rounded-lg focus:ring-0 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-gray-50"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors"
                    >
                      {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      onChange={(e: any) => setCPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 h-12 border border-gray-300 rounded-lg focus:ring-0 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-gray-50"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>

                {/* Password Hint */}
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-700">
                    <span className="font-semibold">Password must:</span> Be at least 8 characters, include uppercase, lowercase, number, and special character.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleResetPassword}
                  disabled={loading.resetPassword}
                  className="w-full bg-[#3232ff] hover:bg-[#2424fa] text-white py-3 px-4 rounded-lg font-medium transition-all duration-300 shadow-lg shadow-indigo-500/25 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading.resetPassword ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Resetting...
                    </>
                  ) : (
                    <>
                      Reset Password
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Back to Login Link */}
            <div className="text-center">
              <Link
                to="/auth/login"
                className="text-sm text-indigo-600 hover:text-indigo-700 hover:underline"
              >
                ← Back to Sign In
              </Link>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center text-xs text-gray-400">
            © 2024 WHam Energy. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;