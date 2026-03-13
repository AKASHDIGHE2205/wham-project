import { ArrowRight, BarChart3, Calendar, Eye, EyeOff, Image, LayoutDashboard, Lock, Mail, MessageSquare, Phone, Shield, User } from "lucide-react";
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

  const platformFeatures = [
    { icon: LayoutDashboard, name: "Dashboard", description: "Central hub with overview and recent activity" },
    { icon: Calendar, name: "Schedule", description: "Calendar with daily and weekly views" },
    { icon: MessageSquare, name: "Communications", description: "Updates, messages and announcements" },
    { icon: BarChart3, name: "Statistics", description: "Performance metrics and analytics" },
    { icon: Image, name: "Media Gallery", description: "Pictures, videos and documents" }
  ];

  return (
    <>
      <div className="min-h-screen bg-linear-to-br from-purple-50 to-orange-50 flex">
        {/* Left Side - Platform Overview (unchanged) */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-linear-to-br from-purple-900 to-black">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-20 w-64 h-64 border-2 border-orange-400 rounded-full animate-bounce" />
            <div className="absolute bottom-20 right-20 w-48 h-48 border-2 border-yellow-400 rounded-full animate-bounce" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-purple-400 rounded-full animate-bounce" />
          </div>

          <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-white">
            <div className="max-w-2xl text-center" data-aos="fade-right">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-12">
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
                          <h3 className="font-semibold text-white text-xs mb-1">{feature.name}</h3>
                          <p className="text-xs text-gray-300 leading-tight">{feature.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <h1 className="text-xl font-bold mb-6 text-white" data-aos="fade-up" data-aos-delay="200">
                Welcome to <span className="text-orange-400">Our Platform</span>
              </h1>

              <p className="text-lg text-gray-300 mb-8 leading-relaxed" data-aos="fade-up" data-aos-delay="400">
                Join thousands of professionals using our comprehensive platform for learning, collaboration, and productivity.
              </p>

              <div className="space-y-4 text-left mb-8" data-aos="fade-up" data-aos-delay="600">
                {[
                  { text: "Centralized Dashboard with activity overview", color: "text-purple-400" },
                  { text: "Smart Scheduling with calendar integration", color: "text-orange-400" },
                  { text: "Media Gallery for all your files", color: "text-orange-300" }
                ].map((feature) => (
                  <div key={feature.text} className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${feature.color.replace("text", "bg")}`} />
                    <span className="text-gray-300 text-md">{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Registration Form with Photo Upload */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-8">
          <div className="w-full max-w-xl" data-aos="fade-left">
            <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">

              <div className="text-center mb-8">
                <div
                  className="w-16 h-16 bg-linear-to-br from-orange-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
                  data-aos="zoom-in"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white lucide lucide-user-plus-icon lucide-user-plus">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <line x1="19" x2="19" y1="8" y2="14" />
                    <line x1="22" x2="16" y1="11" y2="11" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Create Your <span className="text-orange-600">Account</span>
                </h2>
              </div>

              {/* Photo Upload Section - New */}
              <div className="border-b border-gray-200 pb-4 mb-6">
                <h2 className="text-lg font-semibold text-orange-600 mb-4">Profile Photo</h2>
                <div className="flex items-center space-x-6">
                  <div className="shrink-0">
                    {photoPreview ? (
                      <img
                        className="h-24 w-24 object-cover rounded-full border-2 border-orange-300"
                        src={photoPreview}
                        alt="Profile preview"
                      />
                    ) : (
                      <div className="h-24 w-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                        <User className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col space-y-2">
                    <div className="flex space-x-2">
                      <label className="cursor-pointer">
                        <div className="px-4 py-2 text-sm font-medium text-white bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 rounded-lg hover:shadow-lg transition duration-300 inline-flex items-center gap-2">
                          <Image className="w-4 h-4" />
                          Upload
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
                        className="text-sm text-red-600 hover:text-red-800 flex items-center gap-1"
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

              {/* Form Fields - Updated with photo in FormData */}
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-black">First Name<span className='text-red-600'>*</span></label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          name="firstName"
                          onChange={handleChange}
                          value={inputs.firstName}
                          required
                          className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:ring-orange-500 focus:border-orange-500 outline-none"
                          placeholder="First Name"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-black">Middle Name</label>
                      <input
                        type="text"
                        name="middleName"
                        onChange={handleChange}
                        value={inputs.middleName}
                        className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:ring-orange-500 focus:border-orange-500 outline-none"
                        placeholder="Middle Name"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-black">Last Name<span className='text-red-600'>*</span></label>
                      <input
                        type="text"
                        name="lastName"
                        required
                        onChange={handleChange}
                        value={inputs.lastName}
                        className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:ring-orange-500 focus:border-orange-500 outline-none"
                        placeholder="Last Name"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-black">Email<span className='text-red-600'>*</span></label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        onChange={handleChange}
                        value={inputs.email}
                        required
                        className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:ring-orange-500 focus:border-orange-500 outline-none"
                        placeholder="email"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-black">Mobile Number<span className='text-red-600'>*</span></label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        onChange={handleChange}
                        value={inputs.phone}
                        maxLength={10}
                        pattern="[0-9]{10}"
                        className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:ring-orange-500 focus:border-orange-500 outline-none"
                        placeholder="mobile number"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Passwords */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-black">Password<span className='text-red-600'>*</span></label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        required
                        onChange={handleChange}
                        value={inputs.password}
                        className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:ring-orange-500 focus:border-orange-500 outline-none"
                        placeholder="Create a strong password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute cursor-pointer inset-y-0 right-0 pr-3 flex items-center text-orange-600">
                        {!showPassword ? (<Eye className="h-5 w-5" />) : (<EyeOff className="h-5 w-5" />)}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-black">Confirm Password<span className='text-red-600'>*</span></label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Shield className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="password"
                        name="confirmPassword"
                        required
                        onChange={handleChange}
                        value={inputs.confirmPassword}
                        className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:ring-orange-500 focus:border-orange-500 outline-none"
                        placeholder="Confirm your password"
                      />
                    </div>
                  </div>
                  
                  {/* Submit Button */}
                  <div className="space-y-6">
                    <button
                      type="submit"
                      className="flex-1 w-full bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin h-4 w-4 text-white mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Registering...
                        </>
                      ) : (
                        <>
                          Register
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </button>
                    <p className="text-gray-600">
                      Already have an account?{" "}
                      <Link to="/auth/login" className="text-orange-600 hover:underline font-medium">
                        Sign in here
                      </Link>
                    </p>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;