import { EyeOff, Mail, Lock, User, ArrowRight, Phone, Shield, Eye, Users, Calendar, BarChart3, Image, MessageSquare, LayoutDashboard } from "lucide-react";
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
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => { setInputs({ ...inputs, [e.target.name]: e.target.value }); }

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
      const response = await registerApi(body);
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
                        <h3 className="font-semibold text-white text-sm mb-1">{feature.name}</h3>
                        <p className="text-xs text-gray-300 leading-tight">{feature.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <h1 className="text-5xl font-bold mb-6 text-white" data-aos="fade-up" data-aos-delay="200">
              Welcome to <span className="text-orange-400">Our Platform</span>
            </h1>

            <p className="text-xl text-gray-300 mb-8 leading-relaxed" data-aos="fade-up" data-aos-delay="400">
              Join thousands of professionals using our comprehensive platform for learning, collaboration, and productivity.
            </p>

            <div className="space-y-4 text-left mb-8" data-aos="fade-up" data-aos-delay="600">
              {[
                { text: "Centralized Dashboard with activity overview", color: "text-purple-400" },
                { text: "Smart Scheduling with calendar integration", color: "text-orange-400" },
                { text: "Media Gallery for all your files", color: "text-orange-300" }
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

      {/* Right Side - Registration Form (Unchanged) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-8">
        <div className="w-full max-w-2xl" data-aos="fade-left">
          <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">

            <div className="text-center mb-8">
              <div
                className="w-16 h-16 bg-linear-to-br from-orange-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
                data-aos="zoom-in"
                data-aos-delay="200"
              >
                <User className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2" data-aos="fade-up" data-aos-delay="300">
                Create Your <span className="text-orange-600">Account</span>
              </h2>
            </div>

            {/* Form */}
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-6" data-aos="fade-up" data-aos-delay="600">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-black">First Name<span className='text-red-600'>*</span></label>
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
                        className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-0 focus:ring-orange-500 focus:border-orange-500 outline-none"
                        placeholder="First Name"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-black">Middle Name<span className='text-red-600'>*</span></label>
                    <input
                      type="text"
                      name="middleName"
                      onChange={handleChange}
                      value={inputs.middleName}
                      className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-0 focus:ring-orange-500 focus:border-orange-500 outline-none"
                      placeholder="Middle Name"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-black">Last Name<span className='text-red-600'>*</span></label>
                    <input
                      type="text"
                      name="lastName"
                      required
                      onChange={handleChange}
                      value={inputs.lastName}
                      className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-0 focus:ring-orange-500 focus:border-orange-500 outline-none"
                      placeholder="Last Name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-black">Email<span className='text-red-600'>*</span></label>
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
                      className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-0 focus:ring-orange-500 focus:border-orange-500 outline-none"
                      placeholder="email"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-black">Mobile Number<span className='text-red-600'>*</span></label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      required
                      onChange={handleChange}
                      value={inputs.phone}
                      maxLength={10}
                      className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-0 focus:ring-orange-500 focus:border-orange-500 outline-none"
                      placeholder="mobile number"
                    />
                  </div>
                </div>

                <div className="space-y-2 hidden">
                  <label className="text-sm font-medium text-black">Select Team<span className='text-red-600'>*</span></label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Users className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      name="dropdown"
                      required
                      className="block w-full pl-10 pr-4 py-3 border border-orange-300 rounded-lg focus:ring-0 focus:ring-orange-500 focus:border-orange-500 outline-none appearance-none bg-white"
                    >
                      <option>Select your team</option>
                      <option value="Option1">Option 1</option>
                      <option value="Option2">Option 2</option>
                      <option value="Option3">Option 3</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Passwords */}
              <div className="space-y-6" data-aos="fade-up" data-aos-delay="600">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-black">Password<span className='text-red-600'>*</span></label>
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
                      className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-0 focus:ring-orange-500 focus:border-orange-500 outline-none"
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
                  <label className="text-sm font-medium text-black">Confirm Password<span className='text-red-600'>*</span></label>
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
                      className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-0 focus:ring-orange-500 focus:border-orange-500 outline-none"
                      placeholder="Confirm your password"
                    />
                  </div>
                </div>
              </div>

              {/*Button */}
              <div className="space-y-6" data-aos="fade-up" data-aos-delay="600">
                <button
                  type="submit"
                  className="flex-1 w-full bg-linear-to-r from-orange-500 to-purple-600 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center cursor-pointer"
                >
                  {loading ? "Registering" : "Register"}

                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
                <p className="text-gray-600">
                  Already have an account?{" "}
                  <Link to="/auth/login" className="text-orange-600 hover:underline font-medium">
                    Sign in here
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

export default Register;