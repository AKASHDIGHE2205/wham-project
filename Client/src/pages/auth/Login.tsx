import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, LayoutDashboard, Calendar, MessageSquare, BarChart3, Image } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { loginApi } from '../../services/auth/authApi';
import { useDispatch } from 'react-redux';
import { login } from '../../feature/authSlice';

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [inputs, setInputs] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputs.email || !inputs.password) {
      toast.error("Please fill in all fields");
      return;
    }
    const body = {
      email: inputs.email,
      password: inputs.password
    };
    try {
      setLoading(true);
      const response = await loginApi(body);
      dispatch(login({ data: response }));
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setLoading(false);
    }
  }

  const platformFeatures = [
    { icon: LayoutDashboard, name: "Dashboard", description: "Central hub with overview and recent activity" },
    { icon: Calendar, name: "Schedule", description: "Calendar with daily and weekly views" },
    { icon: MessageSquare, name: "Communications", description: "Updates, messages and announcements" },
    { icon: BarChart3, name: "Statistics", description: "Performance metrics and analytics" },
    { icon: Image, name: "Media Gallery", description: "Pictures, videos and documents" }
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-50 to-orange-50 flex">
      {/* Left Side - Updated Platform Overview */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-linear-to-br from-purple-900 to-black">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 border-2 border-orange-400 rounded-full" />
          <div className="absolute bottom-20 right-20 w-48 h-48 border-2 border-yellow-400 rounded-full" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-purple-400 rounded-full" />
        </div>

        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-white">
          <div className="max-w-2xl text-center" data-aos="fade-right">
            {/* Platform Icon Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-6">
              {platformFeatures.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <div
                    key={feature.name}
                    className="p-6 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10 hover:border-orange-400/30 transition-all duration-300 group"
                    data-aos="zoom-in"
                    data-aos-delay={index * 100}
                  >
                    <div className="flex flex-col items-center space-y-3">
                      <div className="p-3 bg-white/10 rounded-xl group-hover:bg-orange-500/20 transition-colors">
                        <IconComponent className="w-6 h-6 text-orange-400" />
                      </div>
                      <div className="text-center">
                        <h3 className="font-semibold text-white text-sm mb-1">{feature.name}</h3>
                        <p className="text-xs text-gray-300 leading-tight">{feature.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <h1 className="text-5xl font-bold mb-6 text-white" data-aos="fade-up" data-aos-delay="200">
              Welcome <span className="text-orange-400">Back</span>
            </h1>

            <p className="text-xl text-gray-300 mb-8 leading-relaxed" data-aos="fade-up" data-aos-delay="400">
              Sign in to access your personalized dashboard and continue your journey with our comprehensive platform.
            </p>

            <div className="space-y-4 text-left mb-8" data-aos="fade-up" data-aos-delay="600">
              {[
                { text: "Access your personalized Dashboard", color: "text-purple-400" },
                { text: "Check your Schedule and calendar", color: "text-orange-400" },
                { text: "View recent Communications", color: "text-yellow-400" },
                { text: "Continue your Courses and learning", color: "text-white" },
                { text: "Track your Statistics and progress", color: "text-purple-300" },
                { text: "Browse your Media Gallery files", color: "text-orange-300" }
              ].map((feature, index) => (
                <div key={feature.text} className="flex items-center space-x-3" data-aos="fade-right" data-aos-delay={800 + index * 100}>
                  <div className={`w-2 h-2 rounded-full ${feature.color.replace("text", "bg")}`} />
                  <span className="text-gray-300 text-lg">{feature.text}</span>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-8">
        <div className="w-full max-w-md" data-aos="fade-left">
          <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
            <div className="text-center mb-4">
              <div
                className="w-16 h-16 bg-linear-to-br from-orange-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
                data-aos="zoom-in"
                data-aos-delay="200"
              >
                <User className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2" data-aos="fade-up" data-aos-delay="300">
                Sign In to <span className="text-orange-600">Your Account</span>
              </h2>
            </div>
            <hr className='text-orange-600 mb-4' />
            {/* Login Form */}
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-6" data-aos="fade-up" data-aos-delay="500">
                {/* Email Field */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Email Address <span className='text-red-600'>*</span> </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      name='email'
                      onChange={handleChange}
                      value={inputs.email}
                      required
                      className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-0 focus:ring-orange-500 focus:border-orange-500 outline-none"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Password <span className='text-red-600'>*</span></label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      name='password'
                      onChange={handleChange}
                      value={inputs.password}
                      required
                      className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-0 focus:ring-orange-500 focus:border-orange-500 outline-none"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-orange-600 hover:text-gray-600"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between" data-aos="fade-up" data-aos-delay="600">
                <div className="flex items-center hidden">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <label className="ml-2 block text-sm text-gray-700">Remember me</label>
                </div>
                <Link
                  to="/auth/forgot-password"
                  className="text-sm text-orange-600 hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <div className="space-y-4" data-aos="fade-up" data-aos-delay="700">
                <button
                  type="submit"
                  className="w-full bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                >
                  {loading ? 'Signing In' : "Sign In"}

                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
                <hr className='text-orange-600 mb-4' />
                {/* Sign Up Link */}
                <p className="text-center text-gray-600">
                  Don't have an account?{" "}
                  <Link
                    to="/auth/register"
                    className="text-orange-600 hover:underline font-medium"
                  >
                    Sign up here
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

export default Login;