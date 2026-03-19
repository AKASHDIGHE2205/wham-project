import { Camera, ChevronDown, FileText } from "lucide-react";
import React, { useRef } from "react";

interface ActivityStep3Props {
  formData: any;
  updateFormData: (data: any) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export const ActivityStep3: React.FC<ActivityStep3Props> = ({ formData, updateFormData, onNext, onPrevious }) => {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    updateFormData({ [name]: value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    updateFormData({ imageAttachment: file });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    updateFormData({ fileAttachment: file });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Step 3: Logistics & Attachments */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Vehicle Type <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-purple-600 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white">
                <option value="" disabled>Vehicle Details</option>
                <option value="Cab">Cab</option>
                <option value="Official">Office Vehicle</option>
                <option value="Personal">Personal Vehicle</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Notes <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={2}
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter any additional notes..."
            ></textarea>
          </div>
        </div>

        <div>
          <div className="grid grid-cols-2 gap-4">
            <label className="border-2 border-dashed border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center space-y-2 hover:bg-gray-50 cursor-pointer transition-colors">
              <input
                type="file"
                ref={imageInputRef}
                accept="image/jpeg,image/png"
                className="hidden"
                onChange={handleImageChange}
              />
              <Camera className="w-8 h-8 text-purple-600" />
              <span className="text-sm font-semibold text-gray-700">
                Image attachment
              </span>
              {formData.imageAttachment && (
                <span className="text-xs text-green-600">
                  {formData.imageAttachment.name}
                </span>
              )}
              <span className="text-xs text-gray-500">
                Supported formats: JPEG, PNG
              </span>
            </label>

            <label className="border-2 border-dashed border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center space-y-2 hover:bg-gray-50 cursor-pointer transition-colors">
              <input
                type="file"
                ref={fileInputRef}
                accept=".pdf,.docx"
                className="hidden"
                onChange={handleFileChange}
              />
              <FileText className="w-8 h-8 text-purple-600" />
              <span className="text-sm font-semibold text-gray-700">
                File attachment
              </span>
              {formData.fileAttachment && (
                <span className="text-xs text-green-600">
                  {formData.fileAttachment.name}
                </span>
              )}
              <span className="text-xs text-gray-500">
                Supported formats: PDF, DOCX
              </span>
            </label>
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-gray-100 flex justify-between">
        <button
          onClick={onPrevious}
          className="px-8 py-2 bg-linear-to-r from-[#5441ff] to-[#4531ff] text-white font-semibold rounded-md hover:bg-purple-700 transition-colors cursor-pointer"
        >
          Previous
        </button>
        <button
          onClick={onNext}
          className="px-8 py-2 bg-linear-to-r from-[#5441ff] to-[#4531ff] text-white font-semibold rounded-md hover:bg-purple-700 transition-colors cursor-pointer"
        >
          Next
        </button>
      </div>
    </div>
  );
};