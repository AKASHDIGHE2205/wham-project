import { Eye, EyeOff } from 'lucide-react';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { login } from '../../feature/authSlice';
import { loginApi } from '../../services/auth/authApi';

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

  return (
    <div className="min-h-screen bg-linear-to-r from-purple-50 to-indigo-50 flex items-center justify-center">
      {/* Centered Login Card with Shadow */}
      <div className="w-full max-w-lg px-6 py-8" data-aos="fade-up">
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Header with W and WHam Energy */}
          <div className="text-center mb-8">
            <div className="flex flex-col items-center justify-center space-x-2">
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
              SAP Portal Login
            </h2>
          </div>

          {/* Login Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Login ID Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Login ID
              </label>
              <input
                type="text"
                name="email"
                value={inputs.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-1 h-12 border border-gray-300 rounded-lg focus:ring-0 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-gray-50"
                placeholder="Enter your username (Email/Mobile)"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={inputs.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 h-12 border border-gray-300 rounded-lg focus:ring-0 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-gray-50"
                  placeholder="**********"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="text-end">
              <Link
                to="/auth/forgot-password"
                className="text-sm text-indigo-600 hover:text-indigo-700 hover:underline"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#3232ff] hover:bg-[#2424fa] text-white py-3 px-4 rounded-lg font-medium transition-all duration-300 shadow-lg shadow-indigo-500/25 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>

            {/* Forgot Password Link */}
            <div className=" flex justify-center items-center text-center gap-1">
              <span className='text-sm text-gray-700'>Don't have an account?</span>
              <Link
                to="/auth/register"
                className="text-sm text-indigo-600 hover:text-indigo-700 hover:underline"
              >
                Sign up here
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

export default Login;