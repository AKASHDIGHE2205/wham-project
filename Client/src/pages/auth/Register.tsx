import { ArrowRight, Eye, EyeOff, Image, Lock, Mail, Phone, Shield, User } from "lucide-react";
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

  return (
    <>
      <div className="min-h-screen bg-linear-to-br from-purple-50 to-indigo-50 flex">

        {/* Right Side - Registration Form with Photo Upload */}
        <div className="w-full flex items-center justify-center p-4 lg:p-8">
          <div className="w-full max-w-xl" data-aos="fade-left">
            <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">

              <div className="text-center">
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
                  SAP Portal Register
                </h2>
              </div>

              {/* Photo Upload Section - New */}
              <div className="border-b border-gray-200 pb-4 mb-6">
                <h2 className="text-lg font-semibold text-[#3232ff] mb-4">Profile Photo</h2>
                <div className="flex items-center space-x-6">
                  <div className="shrink-0">
                    {photoPreview ? (
                      <img
                        className="h-24 w-24 object-cover rounded-full border-2 border-indigo-300"
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
                        <div className="px-4 py-2 text-sm font-medium text-white bg-linear-to-r from-[#4343ff] to-[#3232ff] hover:from-indigo-700 rounded-lg hover:shadow-lg transition duration-300 inline-flex items-center gap-2">
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
                          className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
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
                        className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
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
                        className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
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
                        className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
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
                        className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
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
                        className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        placeholder="Create a strong password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute cursor-pointer inset-y-0 right-0 pr-3 flex items-center text-indigo-600">
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
                        className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        placeholder="Confirm your password"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="space-y-6">
                    <button
                      type="submit"
                      className="flex-1 w-full bg-linear-to-r from-[#4949fa] to-[#3232ff] text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
                      <Link to="/auth/login" className="text-indigo-600 hover:underline font-medium">
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