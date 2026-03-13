import React, { useEffect, useState } from "react";
import { MEDIA_URL } from "../constant/Baseurl";

interface ShowMediaProps {
  show: boolean;
  setShow: (show: boolean) => void;
  data: any;
}

const ShowTrainingDesk: React.FC<ShowMediaProps> = ({ show, setShow, data }) => {
  const [mediaAspectRatio, setMediaAspectRatio] = useState<number | null>(null);
  
  if (!show || !data) return null;

  const fileUrl = data.fileUrl || data?.file_path;
  const fileType = data.fileType || data.file_type;

  useEffect(() => {
    if (fileType === 'image' && fileUrl) {
      const img = new Image();
      img.onload = () => {
        setMediaAspectRatio(img.width / img.height);
      };
      img.src = `${MEDIA_URL}${fileUrl}`;
    }
  }, [fileUrl, fileType]);

  const getMediaContainerClass = () => {
    if (fileType === 'image' && mediaAspectRatio) {
      if (mediaAspectRatio > 1.5) {
        return "w-full max-h-[70vh]";
      } else if (mediaAspectRatio < 0.8) {
        return "h-[70vh] mx-auto";
      }
    }
    return "w-full h-full";
  };

  const renderMedia = () => {
    if (!fileUrl) return (
      <div className="flex flex-col items-center justify-center p-12 bg-gray-50 rounded-lg">
        <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-gray-500 text-lg">No media available</p>
      </div>
    );

    const fullUrl = `${MEDIA_URL}${fileUrl}`;

    if (fileType === 'image') {
      return (
        <div className={`flex items-center justify-center ${getMediaContainerClass()}`}>
          <img
            src={fullUrl}
            alt={data.training_title || data.name || "Media"}
            className="max-w-full max-h-[70vh] w-auto h-auto object-contain rounded-lg shadow-lg"
            onError={(e) => {
              e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Image+not+found';
            }}
          />
        </div>
      );
    } else if (fileType === 'video') {
      return (
        <div className="w-full flex items-center justify-center">
          <video 
            controls 
            className="w-full max-w-4xl max-h-[70vh] rounded-lg shadow-lg"
            controlsList="nodownload"
          >
            <source src={fullUrl} type="video/mp4" />
            <source src={fullUrl} type="video/webm" />
            <source src={fullUrl} type="video/ogg" />
            <p className="text-center p-4">
              Your browser does not support the video tag. 
              <a href={fullUrl} className="text-blue-600 hover:underline ml-2" download>
                Download video
              </a>
            </p>
          </video>
        </div>
      );
    } else if (fileType === 'pdf') {
      return (
        <div className="w-full h-[70vh] rounded-lg overflow-hidden border border-gray-200">
          <iframe
            src={`${fullUrl}#view=FitH`}
            className="w-full h-full"
            title={data.training_title || data.name || "PDF Viewer"}
            style={{ minHeight: '500px' }}
          />
        </div>
      );
    } else {
      // For other file types, provide download link with file info
      const fileExtension = fileUrl?.split('.').pop()?.toUpperCase() || 'FILE';
      
      return (
        <div className="flex flex-col items-center justify-center p-12 bg-gray-50 rounded-lg">
          <div className="text-8xl mb-6 text-gray-600">📄</div>
          <p className="text-xl font-medium text-gray-800 mb-2">
            {fileExtension} File
          </p>
          <p className="text-gray-500 mb-6 text-center max-w-md">
            This file type cannot be previewed directly. You can download it to view.
          </p>
          <a
            href={fullUrl}
            download
            className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition transform hover:scale-105 shadow-md flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download {fileExtension} File
          </a>
        </div>
      );
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 transition-opacity duration-300"
      onClick={() => setShow(false)}
    >
      <div 
        className="relative bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-800 truncate pr-8">
            {data.training_title || data.name || "Media Preview"}
          </h2>
          <button
            onClick={() => setShow(false)}
            className="text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-full p-2 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 bg-gray-100 flex items-center justify-center" style={{ minHeight: '500px' }}>
          {renderMedia()}
        </div>

        {/* Footer with metadata (optional) */}
        {(data.description || data.created_at) && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            {data.description && (
              <p className="text-gray-600 text-sm mb-1">{data.description}</p>
            )}
            {data.created_at && (
              <p className="text-gray-400 text-xs">
                Added: {new Date(data.created_at).toLocaleDateString()}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShowTrainingDesk;