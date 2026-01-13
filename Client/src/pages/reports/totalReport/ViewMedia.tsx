/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FC } from "react";
import { useState, useEffect } from "react";
import { getMedia } from "../../../services/reports/reportServices";
import { MEDIA_URL } from "../../../constant/Baseurl";
import { MapPin, User, Calendar, Clock, X, ChevronLeft, ChevronRight, Image as ImageIcon, Loader2, AlertCircle } from "lucide-react";
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
  const [imageLoading, setImageLoading] = useState(true);

  useEffect(() => {
    if (show) {
      setCurrentIndex(0);
      setImageLoading(true);
    }
  }, [show]);

  useEffect(() => {
    const fetchData = async () => {
      if (!show || !selectedEvent) return;

      setLoading(true);
      setImageLoading(true);
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
    setImageLoading(true);
  };

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? allPhotos?.length - 1 : prevIndex - 1
    );
    setImageLoading(true);
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === allPhotos?.length - 1 ? 0 : prevIndex + 1
    );
    setImageLoading(true);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.src = "https://jobs.ficsi.in/assets/front_end/images/no-image-found.jpg";
    setImageLoading(false);
  };

  const currentPhoto = allPhotos[currentIndex];
  const totalPhotos = allPhotos?.length;

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[85vh] overflow-hidden shadow-2xl border border-gray-200 animate-in slide-in-from-bottom-4 duration-300 flex flex-col">
        {/* Modal Header - Reduced padding */}
        <div className="flex items-center justify-between p-4 bg-linear-to-r from-gray-50 to-white border-b border-gray-100 shrink-0">
          <div className="flex items-start space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-linear-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center shadow-md">
                <ImageIcon className="w-5 h-5 text-white" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-gray-900">Media Gallery</h2>
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-medium text-gray-600">Step:</span>
                  <span className="text-xs text-gray-800 font-semibold truncate max-w-[180px]">
                    {currentPhoto ? currentPhoto?.step_name : selectedEvent?.step_name || "N/A"}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-xs font-medium text-gray-600">Task:</span>
                  <span className="text-xs text-gray-800 font-semibold truncate max-w-[200px]">
                    {currentPhoto ? currentPhoto?.task_name : selectedEvent?.task_name || "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-all duration-200 cursor-pointer group shrink-0"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-gray-500 group-hover:text-gray-700 transition-colors" />
          </button>
        </div>

        {/* Main Content Area - Now scrollable */}
        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
          {/* Image Preview Section */}
          <div className="lg:w-2/3 p-4 bg-linear-to-br from-gray-50 to-gray-100/50 overflow-auto">
            <div className="relative aspect-4/3 w-full rounded-xl bg-white shadow-inner border border-gray-200 overflow-hidden">
              {loading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="w-10 h-10 text-orange-500 animate-spin mx-auto mb-3" />
                    <p className="text-gray-600 font-medium text-sm">Loading media...</p>
                  </div>
                </div>
              ) : totalPhotos === 0 ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                    <AlertCircle className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-1">No Photos Available</h3>
                  <p className="text-gray-500 text-sm max-w-md">
                    No members attended this event.
                  </p>
                </div>
              ) : (
                <>
                  {imageLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white">
                      <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
                    </div>
                  )}

                  <img
                    src={`${MEDIA_URL}/${currentPhoto?.media_path}`}
                    alt={`Photo ${currentIndex + 1}`}
                    className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-300 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                  />

                  {/* Navigation Arrows for Large Screens */}
                  {totalPhotos > 1 && (
                    <>
                      <button
                        onClick={handlePrevious}
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center transition-all duration-200 cursor-pointer group hover:scale-105 hover:shadow-xl"
                        aria-label="Previous photo"
                      >
                        <ChevronLeft className="w-5 h-5 text-gray-700 group-hover:text-orange-600 transition-colors" />
                      </button>
                      <button
                        onClick={handleNext}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center transition-all duration-200 cursor-pointer group hover:scale-105 hover:shadow-xl"
                        aria-label="Next photo"
                      >
                        <ChevronRight className="w-5 h-5 text-gray-700 group-hover:text-orange-600 transition-colors" />
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Metadata Sidebar */}
          <div className="lg:w-1/3 p-4 border-t lg:border-t-0 lg:border-l border-gray-200 overflow-auto">
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                  Attendee Information
                </h3>

                {currentPhoto ? (
                  <div className="space-y-3">
                    {/* Taken By */}
                    <div className="bg-linear-to-r from-gray-50 to-white p-3 rounded-lg border border-gray-100">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-linear-to-br from-orange-100 to-amber-100 rounded-lg flex items-center justify-center">
                          <User className="w-4 h-4 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500">Taken By</p>
                          <p className="text-sm font-semibold text-gray-900">{currentPhoto.member_name}</p>
                        </div>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="bg-linear-to-r from-gray-50 to-white p-3 rounded-lg border border-gray-100">
                      <div className="flex items-start gap-2 mb-2">
                        <div className="w-8 h-8 bg-linear-to-br from-blue-100 to-cyan-100 rounded-lg flex items-center justify-center shrink-0">
                          <MapPin className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-500 mb-1">Location</p>
                          <p className="text-xs text-gray-800 font-medium wrap-break-words">{currentPhoto.address}</p>
                        </div>
                      </div>
                    </div>

                    {/* Date & Time */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-linear-to-r from-gray-50 to-white p-3 rounded-lg border border-gray-100">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <Calendar className="w-3.5 h-3.5 text-gray-500" />
                          <p className="text-xs font-medium text-gray-500">Date</p>
                        </div>
                        <p className="text-sm font-semibold text-gray-900">
                          {moment(currentPhoto.punch_date).format("DD MMM, YYYY")}
                        </p>
                      </div>

                      <div className="bg-linear-to-r from-gray-50 to-white p-3 rounded-lg border border-gray-100">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <Clock className="w-3.5 h-3.5 text-gray-500" />
                          <p className="text-xs font-medium text-gray-500">Time</p>
                        </div>
                        <p className="text-sm font-semibold text-gray-900">{currentPhoto.in_time}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500">No members attended this event.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Reduced padding */}
        <div className="flex items-center justify-between p-3 border-t border-gray-200 bg-gray-50 shrink-0">
          <div className="flex items-center gap-2">
            {totalPhotos > 1 && (
              <div className="flex items-center gap-1 bg-white rounded-md border border-gray-200 p-0.5">
                <button
                  onClick={handlePrevious}
                  disabled={loading || totalPhotos === 0}
                  className="p-1.5 hover:bg-gray-100 rounded transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Previous"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-700" />
                </button>
                <div className="px-2 py-1">
                  <span className="text-xs font-medium text-gray-700">
                    Photo <span className="font-bold">{currentIndex + 1}</span> of <span className="font-bold">{totalPhotos}</span>
                  </span>
                </div>
                <button
                  onClick={handleNext}
                  disabled={loading || totalPhotos === 0}
                  className="p-1.5 hover:bg-gray-100 rounded transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Next"
                >
                  <ChevronRight className="w-4 h-4 text-gray-700" />
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleClose}
              className="px-4 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:shadow-sm transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
            >
              Close
            </button>

            {currentPhoto && (
              <a
                href={`${MEDIA_URL}/${currentPhoto?.media_path}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-1.5 text-xs font-semibold text-white bg-linear-to-r from-orange-500 to-amber-500 rounded-md hover:from-orange-600 hover:to-amber-600 hover:shadow-md transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                View Original
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewMedia;