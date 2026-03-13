import type { FC } from "react";
import { useState } from "react";
import { MEDIA_URL } from "../constant/Baseurl";

interface Props {
  show: boolean;
  setShow: (show: boolean) => void;
  data: any;
}

const ShowMedia: FC<Props> = ({ show, setShow, data }) => {
  const [imageLoading, setImageLoading] = useState(true);

  const handleClose = () => {
    setShow(false);
    setImageLoading(true);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-orange-100/20 backdrop-blur-xs flex items-center justify-center p-4 z-50" onClick={handleClose}>
      <div
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-md font-bold text-gray-900">
            {data?.name || ""}
          </h3>

          <button
            className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg"
            onClick={handleClose}
          >
            ✕
          </button>
        </div>

        {/* Image Container */}
        <div className="border border-gray-200 rounded-lg m-4 relative min-h-[200px] flex items-center justify-center">

          {/* Loader */}
          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70 rounded-lg">
              <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          <img
            src={`${MEDIA_URL}${data?.photo}`}
            alt={data?.name || "Image"}
            className={`w-full h-auto max-h-[60vh] object-contain mx-auto rounded-lg transition-opacity duration-300 ${imageLoading ? "opacity-0" : "opacity-100"}`}
            onLoad={() => setImageLoading(false)}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSxKZLMxdyaZL_Y5EtYZK-GyZ2NBFe2SzpGHw&s";
              setImageLoading(false);
            }}
          />
        </div>

        <div className="p-4">
          <button
            className="px-6 py-2 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
            onClick={handleClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShowMedia;