/* eslint-disable @typescript-eslint/no-explicit-any */
import { format, isToday } from "date-fns";
import { Calendar, Clock } from "lucide-react";
import moment from "moment";
import React from "react";
import DataLoading from "../../components/DataLoading";
import type { Activities } from "./Calender";

interface DailyViewProps {
  currentDate: Date;
  Data: Activities[]
  Loading: boolean
}

// Reuse the same activity styles from MonthlyView
const getActivityStyles = (status: string) => {
  switch (status) {
    case 'A':
      return {
        bg: 'bg-green-100',
        border: 'border-green-100',
        hover: 'hover:bg-green-200',
        text: 'text-green-800'
      };
    case 'P':
      return {
        bg: 'bg-yellow-100',
        border: 'border-yellow-100',
        hover: 'hover:bg-yellow-200',
        text: 'text-yellow-800'
      };
    case 'R':
      return {
        bg: 'bg-red-100',
        border: 'border-red-100',
        hover: 'hover:bg-red-200',
        text: 'text-red-800'
      };
    case 'C':
      return {
        bg: 'bg-red-100',
        border: 'border-red-100',
        hover: 'hover:bg-red-200',
        text: 'text-red-800'
      };
    default:
      return {
        bg: 'bg-blue-100',
        border: 'border-blue-100',
        hover: 'hover:bg-blue-200',
        text: 'text-blue-800'
      };
  }
};

const parseDateTime = (dateTimeStr: string): Date => {
  const isoString = dateTimeStr.replace(' ', 'T');
  return new Date(isoString);
};

const formatTime = (date: Date): string => {
  return format(date, 'HH:mm');
};

const DailyView: React.FC<DailyViewProps> = ({ currentDate, Data, Loading }) => {
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const isPastDate = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(date);
    target.setHours(0, 0, 0, 0);
    return target < today;
  };

  // Get activities for the current day
  const getActivitiesForDay = (): Activities[] => {
    return Data.filter(activity => {
      const startDate = parseDateTime(activity?.start_date);
      const endDate = parseDateTime(activity?.end_date);
      
      const dayStart = new Date(currentDate);
      dayStart.setHours(0, 0, 0, 0);
      
      const dayEnd = new Date(currentDate);
      dayEnd.setHours(23, 59, 59, 999);
      
      return (
        (startDate <= dayEnd && endDate >= dayStart) ||
        (format(startDate, 'yyyy-MM-dd') === format(currentDate, 'yyyy-MM-dd')) ||
        (format(endDate, 'yyyy-MM-dd') === format(currentDate, 'yyyy-MM-dd'))
      );
    });
  };

  // Get activities for a specific hour
  const getActivitiesForHour = (hour: number): Activities[] => {
    const dayActivities = getActivitiesForDay();
    
    return dayActivities.filter(activity => {
      const startDate = parseDateTime(activity?.start_date);
      const endDate = parseDateTime(activity?.end_date);
      
      const hourStart = new Date(currentDate);
      hourStart.setHours(hour, 0, 0, 0);
      
      const hourEnd = new Date(currentDate);
      hourEnd.setHours(hour, 59, 59, 999);
      
      // Check if activity overlaps with this hour
      return (
        (startDate <= hourEnd && endDate >= hourStart)
      );
    });
  };

  const handleActivityClick = (activity: Activities, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Activity clicked:', activity);
  };

  const isPastHour = (hour: number): boolean => {
    return (
      isPastDate(currentDate) ||
      (isToday(currentDate) && hour < new Date().getHours())
    );
  };

  if (Loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <DataLoading/>
      </div>
    );
  }

  return (
    <div className="h-full bg-white sm:mx-4 my-2 rounded-lg border border-gray-200 overflow-hidden">
      {/* Header with date */}
      <div className="bg-gray-50 border-b border-gray-200 p-4 text-center">
        <div className="text-base text-purple-600 font-medium tracking-wide">
          {format(currentDate, "EEEE")}
        </div>
        <div className="text-3xl font-bold text-gray-800 mt-1 drop-shadow-sm">
          {format(currentDate, "MMMM d, yyyy")}
        </div>
      </div>

      {/* Time slots */}
      <div className="relative max-w-5xl mx-auto hidden">
        {hours?.map((hour) => {
          const hourActivities = getActivitiesForHour(hour);
          const isPastHourSlot = isPastHour(hour);
          
          return (
            <div
              key={hour}
              className={`flex border-b border-gray-200 min-h-20 group transition-all 
                ${isPastHourSlot ? "cursor-not-allowed opacity-60 bg-gray-50" : "hover:bg-gray-50"}`}
            >
              {/* Time label */}
              <div className="w-20 sm:w-24 p-3 text-xs sm:text-sm text-gray-600 font-medium border-r border-gray-200 bg-gray-50/80 sticky left-0">
                {hour === 0 ? "12 AM"
                  : hour < 12 ? `${hour} AM`
                    : hour === 12 ? "12 PM"
                      : `${hour - 12} PM`}
              </div>

              {/* Activities container */}
              <div className="flex-1 p-2 relative min-h-20">
                {hourActivities?.length > 0 ? (
                  <div className="space-y-2">
                    {hourActivities?.map((activity, index) => {
                      const styles = getActivityStyles(activity?.status);
                      const startDate = parseDateTime(activity?.start_date);
                      const endDate = parseDateTime(activity?.end_date);
                      
                      return (
                        <div
                          key={index}
                          className={`text-xs p-2 rounded border ${styles.bg} ${styles.border} cursor-pointer ${styles.hover} transition-colors`}
                          title={`Click to Edit`}
                          onClick={(e) => handleActivityClick(activity, e)}
                        >
                          <div className={`truncate font-medium ${styles.text} mb-1`}>#{activity?.title}</div>
                          <div className="text-[10px] flex items-center gap-2 text-gray-600">
                            <div className="flex items-center gap-1">
                              <Clock size={10}/> 
                              {formatTime(startDate)} - {formatTime(endDate)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* Empty state */
                  !isPastHourSlot && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <span className="text-xs text-gray-400 bg-white px-2 py-1 rounded border border-gray-200 shadow-sm">
                        Click to add event
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary of all-day activities (if any) */}
      {getActivitiesForDay().length > 0 && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <h3 className="text-sm font-medium text-gray-700 mb-2">All activities for {format(currentDate, "MMMM d, yyyy")}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {getActivitiesForDay()?.map((activity, index) => {
              const styles = getActivityStyles(activity?.status);
              const startDate = parseDateTime(activity?.start_date);
              const endDate = parseDateTime(activity?.end_date);
              
              return (
                <div
                  key={index}
                  className={`text-xs p-2 rounded border ${styles.bg} ${styles.border} cursor-pointer ${styles.hover} transition-colors`}
                  onClick={(e) => handleActivityClick(activity, e)}
                >
                  <div className={`font-medium ${styles.text} mb-1`}>#{activity?.title}</div>
                  <div className="text-[10px] flex items-center gap-2 text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar size={10}/> 
                      {moment(startDate).format('DD/MM')} - {moment(endDate).format('DD/MM')}
                    </div>
                  </div>
                  <div className="text-[10px] flex items-center gap-2 text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock size={10}/> 
                      {formatTime(startDate)} - {formatTime(endDate)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyView;