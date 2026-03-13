// components/training/TrainingEdit.tsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { MEDIA_URL } from "../../../constant/Baseurl";
import { getTrainingDetails, updateTraining } from "../../../services/training/trainingApi";
import type { TrainingFormData } from "./TrainingView";


const TrainingEdit = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isEdit = searchParams.get('isEdit');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [inputs, setInputs] = useState<TrainingFormData>({
    training_title: "",
    training_description: "",
    status: "",
  });
  const [filePath, setFilePath] = useState<string>("");
  const [fileType, setFileType] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getTrainingDetails(Number(id));
        setInputs({
          training_title: response.training_title || "",
          training_description: response.training_description || "",
          status: response.status || "",
        });
        if (response.file_path) {
          setFilePath(response.file_path);
          setFileType(response.file_type || "other");
        }
      } catch (error) {
        console.error("Error fetching training details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    setInputs({
      training_title: "",
      training_description: "",
      status: "",
    });
    navigate("/trainings/manage");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = {
      id: id,
      training_title: inputs.training_title,
      training_description: inputs.training_description,
      status: inputs.status
    };
    const response = await updateTraining(body);
    if (response) {
      handleCancel();
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return '🖼️';
      case 'video': return '🎥';
      case 'pdf': return '📄';
      case 'doc': return '📝';
      case 'txt': return '📃';
      case 'excel': return '📊';
      default: return '📁';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-indigo-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mx-auto"></div>
          <p className="mt-4 text-lg font-medium text-gray-600">Loading training details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-50 via-purple-50 to-pink-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-2 mb-2 transform hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center space-x-4">
            <div className="bg-linear-to-r from-indigo-600 to-purple-600 p-4 rounded-2xl shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {isEdit === 'true' ? 'Edit Training' : 'View Training'}
              </h1>
              <p className="text-gray-500 mt-1">Update training information and details</p>
            </div>
          </div>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <form onSubmit={handleSubmit}>
            {/* Form Body */}
            <div className="p-8 space-y-8">
              {/* File Section */}
              {filePath && (
                <div className="flex items-center space-x-8">
                  <div className="shrink-0">
                    <div className="relative">
                      {fileType === 'image' ? (
                        <img
                          className="h-28 w-28 object-cover rounded-xl border-4 border-white shadow-lg"
                          src={`${MEDIA_URL}${filePath}`}
                          alt={inputs.training_title || "Training preview"}
                        />
                      ) : (
                        <div className="h-28 w-28 rounded-xl bg-linear-to-br from-indigo-100 to-purple-100 border-2 border-indigo-300 flex items-center justify-center text-4xl">
                          {getFileIcon(fileType)}
                        </div>
                      )}
                      <div className="absolute -bottom-2 -right-2 bg-green-400 h-6 w-6 rounded-full border-4 border-white"></div>
                    </div>
                  </div>
                  <span className="text-sm text-gray-600">
                    File type: {fileType}
                  </span>
                </div>
              )}

              {/* Basic Information */}
              <div className="grid grid-cols-1 gap-6">
                {/* Training Title */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Training Title <span className="text-red-500">*</span>
                  </label>
                  <div className="relative rounded-lg shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      name="training_title"
                      value={inputs.training_title}
                      onChange={handleInputChange}
                      disabled={isEdit === 'false'}
                      placeholder="Enter training title"
                      className="w-full pl-10 px-4 py-2 border border-gray-300 text-black rounded-lg focus:ring-0 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all duration-200 disabled:cursor-not-allowed"
                      required
                    />
                  </div>
                </div>

                {/* Training Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <div className="relative rounded-lg shadow-sm">
                    <div className="absolute top-3 left-0 pl-3 flex items-start pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                      </svg>
                    </div>
                    <textarea
                      name="training_description"
                      value={inputs.training_description}
                      onChange={handleInputChange}
                      disabled={isEdit === 'false'}
                      rows={4}
                      placeholder="Enter training description"
                      className="w-full pl-10 px-4 py-2 border border-gray-300 text-black rounded-lg focus:ring-0 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all duration-200 resize-none disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <div className="relative rounded-lg shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <select
                      name="status"
                      value={inputs.status}
                      onChange={handleInputChange}
                      disabled={isEdit === 'false'}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 text-black rounded-lg focus:ring-0 focus:ring-orange-500 focus:border-orange-500 outline-none appearance-none disabled:cursor-not-allowed"
                      required
                    >
                      <option value="" disabled>Select status</option>
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
            </div>

            {/* Form Actions */}
            <div className="bg-gray-50 px-8 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-4 focus:ring-gray-200 transition-all duration-200 shadow-sm cursor-pointer"
              >
                Cancel
              </button>
              {isEdit === "true" && (
                <button
                  type="submit"
                  className="px-6 py-2.5 text-sm font-medium text-white bg-linear-to-r from-indigo-600 to-purple-600 rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:ring-4 focus:ring-indigo-300 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 cursor-pointer"
                >
                  Update
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TrainingEdit;