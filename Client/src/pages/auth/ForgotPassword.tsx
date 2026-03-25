/* eslint-disable @typescript-eslint/no-explicit-any */
import { ArrowRight, CheckCircle, Clock, Eye, EyeOff, Lock, Phone } from 'lucide-react';
import { motion } from 'motion/react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { sendOtp, UpdateOtp, ValidateOtp } from '../../services/auth/authApi';

const ForgotPassword: React.FC = () => {
  const [step, setStep] = useState(1);
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [cPassword, setCPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [otp, setOtp] = useState('');
  const [timeLeft, setTimeLeft] = useState(120);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [loading, setLoading] = useState({
    sendOtp: false,
    verifyOtp: false,
    resetPassword: false,
    resendOtp: false
  });
  const year = new Date().getFullYear();
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
      const body = { mobile };
      const response = await sendOtp(body);
      if (response?.status === 200) {
        setStep(2);
        setTimeLeft(120);
        setIsTimerRunning(true);
      }
    } catch (error) {
      console.log(error);
      toast.error('Failed to send OTP. Please try again.');
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
        otp: parseInt(otp)
      };
      const response = await ValidateOtp(body);
      if (response?.status === 200) {
        setIsTimerRunning(false);
        setStep(3);
      }
    } catch (error) {
      console.log(error);
      toast.error('Invalid OTP. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, verifyOtp: false }));
    }
  };

  const handleResetPassword = async () => {
    if (!password || !cPassword || !mobile) {
      toast.error('Please fill all required fields.');
      return;
    }
    if (password !== cPassword) {
      toast.error('Password & confirm password should be match.');
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    if (!passwordRegex.test(password)) {
      toast.error('Password must be at least 8 characters, include uppercase, lowercase, number, and special character.');
      return;
    }

    setLoading(prev => ({ ...prev, resetPassword: true }));

    try {
      const body = {
        mobile,
        password
      };

      const response = await UpdateOtp(body);
      if (response?.status === 200) {
        setCPassword('');
        setMobile('');
        setOtp('');
        setPassword('');
        setTimeLeft(120);
        setIsTimerRunning(false);
        setStep(1);
        toast.success('Password reset successfully!');
        navigate('/auth/login');
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
      };
      const response = await sendOtp(body);
      if (response?.status === 200) {
        setTimeLeft(120);
        setIsTimerRunning(true);
        setOtp('');
        toast.success('OTP resent successfully!');
      }
    } catch (error) {
      console.log(error);
      toast.error('Failed to resend OTP. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, resendOtp: false }));
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden bg-[#ffffff]">
      {/* Background Gradients */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 blur-[120px] rounded-full" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-pink-600/10 blur-[100px] rounded-full" />
        
        {/* Animated Waves */}
        <motion.div 
          animate={{ 
            x: [0, 50, 0],
            y: [0, -30, 0],
            rotate: [0, 5, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/4 -left-20 w-[120%] h-32 bg-linear-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 blur-3xl transform -rotate-12"
        />
        <motion.div 
          animate={{ 
            x: [0, -50, 0],
            y: [0, 30, 0],
            rotate: [0, -5, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-1/4 -right-20 w-[120%] h-40 bg-linear-to-r from-pink-500/10 via-blue-500/10 to-purple-500/10 blur-3xl transform rotate-12"
        />
      </div>

      {/* Forgot Password Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="z-10 w-full max-w-[480px] px-6"
      >
        <div className="bg-white/90 backdrop-blur-xl rounded-[40px] shadow-2xl p-10 flex flex-col items-center border border-white/20">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-14 h-14 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-2xl">W</span>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-slate-900">WHam Energy</h1>
          <p className="text-slate-500 font-medium mb-8">Reset Your Password</p>

          {/* Step Progress Indicator */}
          <div className="flex justify-center mb-8 w-full">
            <div className="flex items-center">
              {[1, 2, 3].map((stepNumber) => (
                <React.Fragment key={stepNumber}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                    ${step >= stepNumber
                      ? 'bg-linear-to-br from-blue-500 to-purple-600 text-white shadow-md shadow-blue-500/30'
                      : 'bg-white border border-slate-200 text-slate-400'
                    }`}>
                    {step > stepNumber ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      stepNumber
                    )}
                  </div>
                  {stepNumber < 3 && (
                    <div className={`w-12 h-1 mx-1 rounded-full ${step > stepNumber ? 'bg-blue-500' : 'bg-slate-200'
                      }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Form */}
          <form className="w-full space-y-6" onSubmit={(e) => e.preventDefault()}>
            {/* Step 1: Mobile Input */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 ml-1">Mobile Number</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                      <Phone className="w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                    <input 
                      type="tel"
                      onChange={(e: any) => setMobile(e.target.value)}
                      maxLength={10}
                      minLength={10}
                      required
                      className="w-full text-sm bg-white border border-slate-200 rounded-xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 placeholder:text-slate-400 shadow-sm"
                      placeholder="Enter 10-digit mobile number"
                    />
                  </div>
                  <p className="text-xs text-slate-500 ml-1">
                    We'll send a verification code to this number
                  </p>
                </div>

                <button 
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading.sendOtp}
                  className="w-full bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 rounded-2xl shadow-lg shadow-blue-500/25 transform active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                  <label className="text-sm font-semibold text-slate-700 ml-1">Enter OTP</label>
                  <input
                    type="text"
                    onChange={(e: any) => setOtp(e.target.value)}
                    maxLength={6}
                    className="w-full text-center text-2xl tracking-[0.5em] font-mono bg-white border border-slate-200 rounded-xl py-2 px-4 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 placeholder:text-slate-400 shadow-sm"
                    placeholder="••••••"
                  />
                  <p className="text-xs text-slate-500 ml-1">
                    OTP sent to {maskedMobile}
                  </p>
                </div>

                {/* Timer and Resend */}
                <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-500" />
                    <span className="text-sm text-slate-600 font-medium">
                      Code expires in
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`font-mono font-bold ${timeLeft < 60 ? 'text-red-600' : 'text-blue-600'}`}>
                      {formatTime(timeLeft)}
                    </span>
                    {!isTimerRunning && (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={loading.resendOtp}
                        className="text-sm text-blue-600 hover:text-blue-700 font-semibold disabled:opacity-50 transition-colors"
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
                  className="w-full bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 rounded-2xl shadow-lg shadow-blue-500/25 transform active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                  <label className="text-sm font-semibold text-slate-700 ml-1">New Password</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                      <Lock className="w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                    <input 
                      type={showPass ? "text" : "password"}
                      onChange={(e: any) => setPassword(e.target.value)}
                      required
                      className="w-full text-sm bg-white border border-slate-200 rounded-xl py-3 pl-12 pr-12 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 placeholder:text-slate-400 shadow-sm"
                      placeholder="Enter new password"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 ml-1">Confirm New Password</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                      <Lock className="w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                    <input 
                      type="password"
                      onChange={(e: any) => setCPassword(e.target.value)}
                      className="w-full text-sm bg-white border border-slate-200 rounded-xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 placeholder:text-slate-400 shadow-sm"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>

                {/* Password Hint */}
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <p className="text-xs text-blue-700">
                    <span className="font-semibold">Password must:</span> Be at least 8 characters, include uppercase, lowercase, number, and special character.
                  </p>
                </div>

                <button 
                  type="button"
                  onClick={handleResetPassword}
                  disabled={loading.resetPassword}
                  className="w-full bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 rounded-2xl shadow-lg shadow-blue-500/25 transform active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                ← Back to Sign In
              </Link>
            </div>
          </form>
        </div>
      </motion.div>

      {/* Footer */}
      <footer className="absolute bottom-8 text-slate-400 text-xs tracking-wider z-10">
        © {year} WHam Energy. All rights reserved.
      </footer>
    </div>
  );
};

export default ForgotPassword;