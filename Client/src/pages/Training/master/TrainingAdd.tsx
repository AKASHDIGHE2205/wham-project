// components/training/TrainingAdd.tsx
import React, { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { getUserFromStorage } from "../../../helper/cryptoUser";
import { addTraining } from "../../../services/training/trainingApi";
import type { SelectedFile, TrainingFormData } from "../master/TrainingView";

const TrainingAdd = () => {
  const [inputs, setInputs] = useState<TrainingFormData>({
    training_title: "",
    training_description: "",
    status: "A",
  });
  const [selectedFile, setSelectedFile] = useState<SelectedFile>({
    file: null,
    preview: null,
    type: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const user = getUserFromStorage();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setInputs(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const fileType = file.type.split('/')[0]; // 'image', 'video', etc.
      const fileExt = file.name.split('.').pop()?.toLowerCase();

      let type: SelectedFile['type'] = 'other';
      if (fileType === 'image') type = 'image';
      else if (fileType === 'video') type = 'video';
      else if (fileExt === 'pdf') type = 'pdf';
      else if (['doc', 'docx'].includes(fileExt || '')) type = 'doc';
      else if (fileExt === 'txt') type = 'txt';
      else if (['xls', 'xlsx', 'csv'].includes(fileExt || '')) type = 'excel';

      setSelectedFile({
        file: file,
        preview: fileType === 'image' ? URL.createObjectURL(file) : null,
        type: type
      });
    }
  };

  const handleCancel = () => {
    setInputs({
      training_title: "",
      training_description: "",
      status: "A",
    });
    setSelectedFile({ file: null, preview: null, type: null });
    navigate("/trainings/manage");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputs.training_title || !inputs.status) {
      toast.error('Please fill all required fields!');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("training_title", inputs.training_title);
      formData.append("training_description", inputs.training_description || "");
      formData.append("status", inputs.status);
      formData.append("c_by", user?.id || "0");

      if (selectedFile.file) {
        formData.append("file", selectedFile.file);
        formData.append("file_type", selectedFile.type || "other");
      }

      const response = await addTraining(formData);
      if (response) {
        handleCancel();
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFileIcon = () => {
    if (!selectedFile.type) return null;
    switch (selectedFile.type) {
      case 'image': return '🖼️';
      case 'video': return '🎥';
      case 'pdf': return '📄';
      case 'doc': return '📝';
      case 'txt': return '📃';
      case 'excel': return '📊';
      default: return '📁';
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-50 via-blue-50 to-orange-50 border border-orange-300 m-1 rounded-md p-2 sm:p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 mb-6 transform hover:shadow-md transition-all duration-300">
          <div className="flex items-center space-x-4">
            <div className="bg-linear-to-r from-orange-500 to-purple-600 p-3 rounded-xl">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-orange-600">Add New Training</h1>
              <p className="text-orange-500">Create a new training material</p>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* File Upload Section */}
            <div className="border-b border-gray-200 pb-4">
              <h2 className="font-semibold text-orange-600 mb-4">Training File</h2>
              <div className="flex items-center space-x-6">
                <div className="shrink-0">
                  {selectedFile.preview ? (
                    <img
                      className="h-24 w-24 object-cover rounded-lg border-2 border-orange-300"
                      src={selectedFile.preview}
                      alt="Preview"
                    />
                  ) : selectedFile.type ? (
                    <div className="h-24 w-24 rounded-lg bg-gray-100 border-2 border-orange-300 flex items-center justify-center text-4xl">
                      {getFileIcon()}
                    </div>
                  ) : (
                    <div className="h-24 w-24 rounded-lg bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
                <label className="cursor-pointer">
                  <div className="px-4 py-2 text-sm font-medium text-white bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 rounded-lg hover:shadow-lg transition duration-300 inline-flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Upload File
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*,video/*,.pdf,.doc,.docx,.txt,.xls,.xlsx,.csv"
                    onChange={handleFileChange}
                  />
                </label>
                {selectedFile.file && (
                  <span className="text-sm text-gray-600">
                    {selectedFile.file.name}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Supported formats: Images, Videos, PDF, DOC, DOCX, TXT, XLS, XLSX, CSV
              </p>
            </div>

            {/* Basic Information Section */}
            <div className="border-b border-gray-200 pb-4">
              <h2 className="font-semibold text-black mb-4">Training Information</h2>

              {/* Training Title */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-black mb-2">
                  Training Title <span className="text-red-600 font-semibold">*</span>
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    name="training_title"
                    value={inputs.training_title}
                    onChange={handleChange}
                    placeholder="Enter training title"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 text-black rounded-lg focus:ring-0 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all duration-200"
                    required
                  />
                </div>
              </div>

              {/* Training Description */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-black mb-2">
                  Description
                </label>
                <div className="relative group">
                  <div className="absolute top-3 left-0 pl-3 flex items-start pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                    </svg>
                  </div>
                  <textarea
                    name="training_description"
                    value={inputs.training_description}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Enter training description"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 text-black rounded-lg focus:ring-0 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all duration-200 resize-none"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Status <span className="text-red-600 font-semibold">*</span>
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <select
                    name="status"
                    value={inputs.status}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 text-black rounded-lg focus:ring-0 focus:ring-orange-500 focus:border-orange-500 outline-none appearance-none bg-white cursor-pointer"
                    required
                  >
                    <option value="A">Active</option>
                    <option value="I">Inactive</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-3 pt-6">
              <button
                type="button"
                className="px-6 py-2 text-sm font-medium text-black bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-0 focus:ring-offset-2 focus:ring-orange-500 cursor-pointer transition-all duration-200"
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 text-sm font-medium text-white bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 border border-transparent rounded-lg hover:shadow-lg focus:outline-none focus:ring-0 focus:ring-offset-2 focus:ring-orange-500 cursor-pointer transition-all duration-200 flex items-center gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TrainingAdd;