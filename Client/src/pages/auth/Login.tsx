import { Eye, EyeOff, Lock, User } from 'lucide-react';
import { motion } from 'motion/react';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { login } from '../../feature/authSlice';
import { loginApi } from '../../services/auth/authApi';

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [inputs, setInputs] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const year = new Date().getFullYear();

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
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden bg-[#ffffff]">
      {/* Background Gradients */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 blur-[120px] rounded-full" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-pink-600/10 blur-[100px] rounded-full" />
        
        {/* Animated Waves (Simplified) */}
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

      {/* Login Card */}
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
          <p className="text-slate-500 font-medium mb-8">SAP Portal Login</p>

          {/* Form */}
          <form className="w-full space-y-6 " onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1">Login ID</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <User className="w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input 
                  type="text"
                  name="email"
                  value={inputs.email}
                  onChange={handleChange}
                  required
                  placeholder="Enter your username (Email/Mobile)"
                  className="w-full text-sm bg-white border border-slate-200 rounded-lg py-2 h-12 pl-12 pr-4 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 placeholder:text-slate-400 shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input 
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={inputs.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="w-full bg-white border border-slate-200 rounded-lg py-2 h-12 pl-12 pr-12 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 placeholder:text-slate-400 shadow-sm"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <div className="flex justify-end">
                <Link to="/auth/forgot-password" className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                  Forgot Password?
                </Link>
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 rounded-2xl shadow-lg shadow-blue-500/25 transform active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <p className="mt-8 text-slate-600 text-sm font-medium">
            Don't have an account? <Link to="/auth/register" className="text-blue-600 font-bold hover:underline">Sign up here</Link>
          </p>
        </div>
      </motion.div>

      {/* Footer */}
      <footer className="absolute bottom-8 text-slate-400 text-xs tracking-wider z-10">
        © {year} WHam Energy. All rights reserved.
      </footer>
    </div>
  );
};

export default Login;