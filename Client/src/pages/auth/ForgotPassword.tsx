/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { Lock, ArrowRight, Shield, Zap, Sparkles, ArrowLeft, Key, Phone, EyeOff, Eye } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { sendOtp, UpdateOtp, ValidateOtp } from '../../services/auth/authApi';

const ForgotPassword: React.FC = () => {
  const [step, setStep] = useState(1);
  const [mobile, setMobile] = useState([]);
  const [password, setPassword] = useState('');
  const [cPassword, setCPassword] = useState('');
  const [showPass, setShowPass] = useState(false)
  const [otp, setOtp] = useState(0)
  const [timeLeft, setTimeLeft] = useState(600);
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
    let interval: number;

    if (isTimerRunning && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsTimerRunning(false);
      toast.error('OTP has expired. Please request a new one.');
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timeLeft]);

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
        setTimeLeft(600);
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
        setTimeLeft(600);
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
        setTimeLeft(600); // Reset to 10 minutes
        setIsTimerRunning(true); // Start the countdown
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
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={loading.sendOtp}
                        className="px-4 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors duration-200 whitespace-nowrap disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center min-w-[90px]"
                      >
                        {loading.sendOtp ? (
                          'Sending OTP'
                        ) : (
                          'Send OTP'
                        )}
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
                          onChange={(e: any) => setOtp(e.target.value)}
                          className="block w-full pl-4 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-0 focus:ring-orange-500 focus:border-orange-500 outline-none"
                          placeholder="Enter OTP"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleVerifyOtp}
                        disabled={loading.verifyOtp}
                        className="px-4 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors duration-200 whitespace-nowrap disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center min-w-[100px]"
                      >
                        {loading.verifyOtp ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          'Verify OTP'
                        )}
                      </button>
                    </div>

                    {/* Timer and Resend OTP */}
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm text-gray-500">
                        OTP sent to your mobile number {maskedMobile}
                      </span>
                      <div className="flex items-center space-x-2">
                        {isTimerRunning ? (
                          <span className={`text-sm font-medium ${timeLeft < 60 ? 'text-red-600' : 'text-orange-600'}`}>
                            {formatTime(timeLeft)}
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={handleResendOtp}
                            disabled={loading.resendOtp || (isTimerRunning && timeLeft > 0)}
                            className="text-sm text-orange-600 hover:text-orange-700 font-medium underline disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                          >
                            {loading.resendOtp ? (
                              <>
                                <div className="w-3 h-3 border-2 border-orange-600 border-t-transparent rounded-full animate-spin mr-1"></div>
                                Sending...
                              </>
                            ) : (
                              'Resend OTP'
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: New Password */}
              {step === 3 && (
                <>
                  <div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Password <span className='text-red-600'>*</span></label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type={showPass ? "text" : "password"}
                          name='password'
                          onChange={(e: any) => setPassword(e.target.value)}
                          required
                          className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-0 focus:ring-orange-500 focus:border-orange-500 outline-none"
                          placeholder="Enter your password"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-orange-600 hover:text-gray-600"
                          onClick={() => setShowPass(!showPass)}
                        >
                          {showPass ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
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
                          onChange={(e: any) => setCPassword(e.target.value)}
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
                      disabled={loading.resetPassword}
                      className="w-full bg-linear-to-r from-orange-500 to-purple-600 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center hover:shadow-lg transition-shadow duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {loading.resetPassword ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Resetting...
                        </>
                      ) : (
                        <>
                          Reset Password
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
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