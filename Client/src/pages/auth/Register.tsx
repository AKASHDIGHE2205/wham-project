import { ArrowRight, Eye, EyeOff, Image, Lock, Mail, Phone, Shield, User } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { registerApi } from "../../services/auth/authApi";

const Register: React.FC = () => {
  const [inputs, setInputs] = useState({
    firstName: "",
    lastName: "",
    middleName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const year = new Date().getFullYear();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleRemovePhoto = () => {
    setSelectedPhoto(null);
    setPhotoPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputs.firstName || !inputs.lastName || !inputs.email || !inputs.phone || !inputs.password || !inputs.confirmPassword) {
      toast.error("All fields are required!");
      return;
    }
    if (inputs.password !== inputs.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    const body = {
      firstName: inputs.firstName,
      lastName: inputs.lastName,
      middleName: inputs.middleName,
      email: inputs.email,
      phone: inputs.phone,
      password: inputs.password
    }

    try {
      setLoading(true);

      // Create FormData for API call
      const formData = new FormData();
      formData.append("userData", JSON.stringify(body));
      if (selectedPhoto) {
        formData.append("photo", selectedPhoto);
      }
      const response = await registerApi(formData);
      if (response) {
        setInputs({
          firstName: "",
          lastName: "",
          middleName: "",
          email: "",
          phone: "",
          password: "",
          confirmPassword: ""
        });
        setSelectedPhoto(null);
        setPhotoPreview(null);
        navigate('/auth/login');
      }
    } catch (error) {
      console.error("Registration error:", error);
    } finally {
      setLoading(false);
    }
  }

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

      {/* Register Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="z-10 w-full max-w-[600px] px-6 my-8"
      >
        <div className="bg-white/90 backdrop-blur-xl rounded-[40px] shadow-2xl p-10 flex flex-col items-center border border-white/20">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-14 h-14 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-2xl">W</span>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-slate-900">WHam Energy</h1>
          <p className="text-slate-500 font-medium mb-4">SAP Portal Register</p>

          {/* Profile Photo Upload Section */}
          <div className="w-full mb-6 pb-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-blue-600 mb-4">Profile Photo</h2>
            <div className="flex items-center space-x-6">
              <div className="shrink-0">
                {photoPreview ? (
                  <img
                    className="h-24 w-24 object-cover rounded-full border-2 border-blue-300 shadow-md"
                    src={photoPreview}
                    alt="Profile preview"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-full bg-linear-to-br from-slate-100 to-slate-200 border-2 border-dashed border-slate-300 flex items-center justify-center">
                    <User className="w-8 h-8 text-slate-400" />
                  </div>
                )}
              </div>
              <div className="flex flex-col space-y-2">
                <div className="flex space-x-2">
                  <label className="cursor-pointer">
                    <div className="px-4 py-2 text-sm font-medium text-white bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 inline-flex items-center gap-2">
                      <Image className="w-4 h-4" />
                      Upload Photo
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handlePhotoChange}
                    />
                  </label>
                </div>
                {photoPreview && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Form */}
          <form className="w-full space-y-2" onSubmit={handleSubmit}>
            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">First Name <span className='text-red-500'>*</span></label>
                <div className="relative group mt-1">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <User className="w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    name="firstName"
                    onChange={handleChange}
                    value={inputs.firstName}
                    required
                    placeholder="First Name"
                    className="w-full text-sm bg-white border border-slate-200 rounded-lg h-10 pl-12 pr-4 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 placeholder:text-slate-400 shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">Middle Name</label>
                <div className="relative group mt-1">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <User className="w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    name="middleName"
                    onChange={handleChange}
                    value={inputs.middleName}
                    placeholder="Middle Name"
                    className="w-full text-sm bg-white border border-slate-200 rounded-lg h-10 pl-12 pr-4 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 placeholder:text-slate-400 shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">Last Name <span className='text-red-500'>*</span></label>
                <div className="relative group mt-1">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <User className="w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    name="lastName"
                    required
                    onChange={handleChange}
                    value={inputs.lastName}
                    placeholder="Last Name"
                    className="w-full text-sm bg-white border border-slate-200 rounded-lg h-10 pl-12 pr-4 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 placeholder:text-slate-400 shadow-sm"
                  />
                </div>
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700 ml-1">Email <span className='text-red-500'>*</span></label>
              <div className="relative group mt-1">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Mail className="w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  type="email"
                  name="email"
                  onChange={handleChange}
                  value={inputs.email}
                  required
                  placeholder="Enter your email"
                  className="w-full text-sm bg-white border border-slate-200 rounded-lg py-2 h-10 pl-12 pr-4 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 placeholder:text-slate-400 shadow-sm"
                />
              </div>
            </div>

            {/* Mobile Number Field */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1">Mobile Number <span className='text-red-500'>*</span></label>
              <div className="relative group mt-1">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Phone className="w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  type="tel"
                  name="phone"
                  onChange={handleChange}
                  value={inputs.phone}
                  maxLength={10}
                  pattern="[0-9]{10}"
                  required
                  placeholder="Enter mobile number"
                  className="w-full text-sm bg-white border border-slate-200 rounded-lg py-2 h-10 pl-12 pr-4 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 placeholder:text-slate-400 shadow-sm"
                />
              </div>
            </div>

            {/* Password Fields */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1">Password <span className='text-red-500'>*</span></label>
              <div className="relative group mt-1">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  onChange={handleChange}
                  value={inputs.password}
                  placeholder="Create a strong password"
                  className="w-full text-sm bg-white border border-slate-200 rounded-lg py-2 h-10 pl-12 pr-12 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 placeholder:text-slate-400 shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1">Confirm Password <span className='text-red-500'>*</span></label>
              <div className="relative group mt-1">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Shield className="w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  onChange={handleChange}
                  value={inputs.confirmPassword}
                  placeholder="Confirm your password"
                  className="w-full text-sm bg-white border border-slate-200 rounded-lg py-2 h-10 pl-12 pr-4 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 placeholder:text-slate-400 shadow-sm"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-2 rounded-lg shadow-lg shadow-blue-500/25 transform active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Registering...
                </>
              ) : (
                <>
                  Register
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <p className="text-slate-600 text-sm font-medium text-center">
              Already have an account? <Link to="/auth/login" className="text-blue-600 font-bold hover:underline">Sign in here</Link>
            </p>
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

export default Register;