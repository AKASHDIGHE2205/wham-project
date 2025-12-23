/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FC } from "react";
import { useState, useEffect } from "react";
import { getMedia } from "../../../services/reports/reportServices";
import { MEDIA_URL } from "../../../constant/Baseurl";
import { MapPin, User } from "lucide-react";
import moment from "moment";

interface Props {
  show: boolean;
  setShow: (show: boolean) => void;
  selectedEvent: any;
}

export interface MediaItem {
  sr_no: number;
  event_id: number;
  event_date: string;
  step_id: number;
  step_name: string;
  task_id: number;
  task_name: string;
  in_time: string;
  punch_date: string;
  media_path: string;
  address: string;
  member_name: string;
}

export interface MediaGroup {
  member_id: number;
  member_name: string;
  items: MediaItem[];
}

export interface MediaResponse {
  media: MediaGroup[];
}

const ViewMedia: FC<Props> = ({ show, setShow, selectedEvent }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [allPhotos, setAllPhotos] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (show) {
      setCurrentIndex(0);
    }
  }, [show]);

  useEffect(() => {
    const fetchData = async () => {
      if (!show || !selectedEvent) return;

      setLoading(true);
      try {
        const body = {
          eventId: selectedEvent?.event_id || 0,
          eventDate: selectedEvent?.event_date || "",
          stepNo: selectedEvent?.step_no || 0,
          taskNo: selectedEvent?.task_id || 0,
          memberId: selectedEvent?.mem_id || 0
        };
        const response = await getMedia(body);
        if (response) {
          const flattenedPhotos: MediaItem[] = [];
          response?.media?.forEach((group: MediaGroup) => {
            group?.items?.forEach((item: MediaItem) => {
              flattenedPhotos.push({
                ...item,
                // Add member info to each photo for display
                member_name: group?.member_name,
                member_id: group?.member_id
              } as any);
            });
          });
          setAllPhotos(flattenedPhotos);
        }
      } catch (error) {
        console.error("Error fetching media:", error);
      } finally {
        setLoading(false);
      }
    };

    if (show) {
      fetchData();
    }
  }, [show, selectedEvent]);

  if (!show) return null;

  const handleClose = () => {
    setShow(false);
    setAllPhotos([]);
    setCurrentIndex(0);
  };

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? allPhotos?.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === allPhotos?.length - 1 ? 0 : prevIndex + 1
    );
  };

  const currentPhoto = allPhotos[currentIndex];
  const totalPhotos = allPhotos?.length;

  return (
    <div className="fixed inset-0 bg-orange-100/20 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-screen overflow-hidden shadow-2xl border border-gray-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-linear-to-br from-orange-500 to-purple-600 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <h3 className="text-xl font-bold text-gray-900">View Photos</h3>

              <div className="flex gap-2">
                <span className="font-semibold">Step:</span>
                <span className="truncate max-w-[200px]">
                  {currentPhoto ? currentPhoto?.step_name : selectedEvent?.step_name}
                </span>
              </div>

              <div className="flex gap-2">
                <span className="font-semibold">Task:</span>
                <span className="truncate max-w-[200px] sm:max-w-[600px]">
                  {currentPhoto ? currentPhoto?.task_name : selectedEvent?.task_name}
                </span>
              </div>

            </div>


          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-black transition-colors cursor-pointer p-2 hover:bg-gray-100 rounded-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Slider Container */}
        <div className="relative p-4 bg-gray-50 min-h-[400px] flex items-center justify-center">
          {loading ? (
            <div className="flex items-center justify-center h-[400px]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
          ) : totalPhotos === 0 ? (
            <div className="flex flex-col items-center justify-center h-[400px] text-gray-500">
              <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-lg font-medium">No photos available</p>
              <p className="text-sm">No media found for this task.</p>
            </div>
          ) : (
            <div className="relative w-full h-[400px] flex items-center justify-center">
              <img
                src={`${MEDIA_URL}/${currentPhoto?.media_path}`}
                alt={`Photo ${currentIndex + 1}`}
                className="max-h-full max-w-full object-contain rounded-lg shadow-lg"
                onError={(e) => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/400x300?text=Image+Not+Found"; }}
              />

              {/* Photo Info Overlay - Responsive Version */}
              {currentPhoto && (
                <div className="absolute bottom-2 left-2 right-2 bg-black/80 backdrop-blur-sm text-white p-2 sm:p-3 rounded-lg border border-white/10">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                    {/* Left Column */}
                    <div className="space-y-1 sm:space-y-2">
                      <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                        <User className="text-orange-600 shrink-0 w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="font-medium whitespace-nowrap">Taken By:</span>
                        <span className="truncate">{currentPhoto?.member_name}</span>
                      </div>
                      <div className="flex items-start gap-1 sm:gap-2 text-xs sm:text-sm">
                        <MapPin className="text-orange-600 shrink-0 w-3 h-3 sm:w-4 sm:h-4 mt-0.5" />
                        <span>{currentPhoto?.address}</span>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-1 sm:space-y-2">
                      <div className="flex items-center gap-1 sm:gap-3 text-xs">
                        <div className="whitespace-nowrap ">
                          <span className="font-medium">Date:</span>{" "}
                          <span className="truncate">{moment(currentPhoto?.punch_date).format("DD/MMM/YYYY")}</span>
                        </div>
                        <div className="w-px h-3 sm:h-4 bg-white/30"></div>
                        <div className="whitespace-nowrap">
                          <span className="font-medium">Punch Time:</span> {currentPhoto?.in_time}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Arrows */}
              {totalPhotos > 1 && (
                <>
                  <button
                    onClick={handlePrevious}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer"
                  >
                    <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={handleNext}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer"
                  >
                    <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">

          <div className="flex items-center space-x-3">
            {totalPhotos > 1 && (
              <div className="flex items-center space-x-2 mr-4">
                <button
                  onClick={handlePrevious}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                  disabled={loading || totalPhotos === 0}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <span className="text-sm text-gray-600">
                  {currentIndex + 1} / {totalPhotos}
                </span>
                <button
                  onClick={handleNext}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                  disabled={loading || totalPhotos === 0}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
            <button
              type="button"
              className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-0 focus:ring-offset-2 focus:ring-orange-500 cursor-pointer transition-all duration-200"
              onClick={handleClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewMedia;