/* eslint-disable @typescript-eslint/no-explicit-any */
import { eachDayOfInterval, endOfMonth, endOfWeek, format, isSameMonth, isToday, startOfMonth, startOfWeek } from 'date-fns';
import { CalendarHeart, Clock } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import DataLoading from '../../components/DataLoading';
import type { Activities } from './Calender';

interface MonthlyViewProps {
  currentDate: Date;
  Data: Activities[]
  Loading: boolean
  onclickDate: (date: Date) => void;
}

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
        bg: 'bg-blue-100',
        border: 'border-blue-100',
        hover: 'hover:bg-blue-200',
        text: 'text-blue-800'
      };
    default:
      return {
        bg: 'bg-gray-100',
        border: 'border-gray-100',
        hover: 'hover:bg-gray-200',
        text: 'text-gray-800'
      };
  }
};

// Function to parse date string with time
const parseDateTime = (dateTimeStr: string): Date => {
  const isoString = dateTimeStr.replace(' ', 'T');
  return new Date(isoString);
};

// Format date to "DD/MMM"
const formatDate = (date: Date): string => {
  return format(date, 'dd/MM');
};

// Format time to "HH:mm"
const formatTime = (date: Date): string => {
  return format(date, 'HH:mm');
};

const MonthlyView: React.FC<MonthlyViewProps> = ({ currentDate, Data, Loading, onclickDate }) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const navigate = useNavigate();
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getActivitiesForDay = (day: Date): Activities[] => {
    return Data.filter(activity => {
      const startDate = parseDateTime(activity.start_date);
      const endDate = parseDateTime(activity.end_date);

      // Set the day to start and end of day for proper comparison
      const dayStart = new Date(day);
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(day);
      dayEnd.setHours(23, 59, 59, 999);

      // Check if the activity range overlaps with the day
      return (
        (startDate <= dayEnd && endDate >= dayStart) ||
        (format(startDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')) ||
        (format(endDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd'))
      );
    });
  };

  const handleClickDate = (day: Date) => {
    onclickDate(day);
  };

  const handleActivityClick = (activity: Activities, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/update-activity/${activity?.id}/${activity?.date}`);
  };

  if (Loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <DataLoading/>
      </div>
    );
  }

  return (
    <div className="h-full bg-white sm:mx-4 my-2 rounded-lg border border-gray-200 overflow-hidden flex flex-col">
      {/* Single scrollable container for both header and grid */}
      <div className="overflow-x-auto hide-scrollbar flex-1">
        <div className="min-w-[700px] sm:min-w-full">
          {/* Header - Days of week */}
          <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200 text-xs sm:text-sm font-medium text-gray-600 sticky top-0 ">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center py-3 px-1">{day}</div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 bg-white">
            {days?.map((day, idx) => {
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isPast = day < new Date(new Date().setHours(0, 0, 0, 0));
              const dayActivities = getActivitiesForDay(day);

              return (
                <div
                  key={idx}
                  className={`relative min-h-[120px] sm:min-h-[140px] p-1 border border-gray-200
                    ${isCurrentMonth ? 'bg-white' : 'bg-gray-50 text-gray-400'}
                    ${isPast && isCurrentMonth ? 'opacity-60' : ''}
                    transition-colors duration-200 overflow-hidden`}
                >
                  {isToday(day) && (<div className="absolute inset-0 border border-purple-500 pointer-events-none"></div>)}

                  {/* Date Number */}
                  <div className="relative z-10 flex justify-between items-start">
                    <div
                      className={`flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full text-sm sm:text-base cursor-pointer
                          ${isToday(day) ? "bg-indigo-600 text-white" :
                          isCurrentMonth ? "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600" :
                            "text-gray-400"} transition-colors duration-200`}
                      onClick={() => { if (!isPast) handleClickDate(day) }}
                      title={isPast ? "Unable to select past date" : "Click to add event"}
                    >
                      {format(day, "d")}
                    </div>

                    {/* More indicator if many activities */}
                    {dayActivities?.length > 3 && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-1.5 rounded">
                        +{dayActivities?.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Activities Container */}
                  <div className="mt-1 space-y-1 max-h-20 sm:max-h-[100px] overflow-y-auto">
                    {dayActivities?.slice(0, 3)?.map((activity, index) => {
                      const styles = getActivityStyles(activity?.status);
                      const startDate = parseDateTime(activity?.start_date);
                      const endDate = parseDateTime(activity?.end_date);
                      return (
                        <div
                          key={index}
                          className={`text-xs p-1 rounded border ${styles.bg} ${styles.border} cursor-pointer ${styles.hover} transition-colors`}
                          title={`Click to Edit`}
                          onClick={(e) => handleActivityClick(activity, e)}
                        >
                          <div className={`truncate font-medium ${styles.text}`}>#{activity.title}</div>
                          <div className="sm:text-[10px] text-[8px] flex flex-col justify-between text-gray-600">
                            <div className="flex justify-start items-center gap-0.5">
                              <CalendarHeart size={10} />
                              <span>{formatDate(startDate)}</span>
                              {formatDate(startDate) !== formatDate(endDate) && (
                                <span>- {formatDate(endDate)}</span>
                              )}
                            </div>
                            <div className='flex justify-start items-center gap-0.5'>
                              <Clock size={10} /> {formatTime(startDate)} - {formatTime(endDate)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyView;