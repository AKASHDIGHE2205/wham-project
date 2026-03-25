/* eslint-disable @typescript-eslint/no-explicit-any */
import { eachDayOfInterval, endOfWeek, format, isToday, startOfWeek } from 'date-fns';
import { CalendarHeart, Clock } from 'lucide-react';
import React from 'react';
import DataLoading from '../../components/DataLoading';
import type { Activities } from './Calender';

interface WeeklyViewProps {
  currentDate: Date;
  Data: Activities[]
  Loading: boolean
  onclickDate: (date: Date) => void
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

// Reuse the same date/time parsing functions
const parseDateTime = (dateTimeStr: string): Date => {
  const isoString = dateTimeStr.replace(' ', 'T');
  return new Date(isoString);
};

const formatDate = (date: Date): string => {
  return format(date, 'dd/MMM');
};

const formatTime = (date: Date): string => {
  return format(date, 'HH:mm');
};

const WeeklyView: React.FC<WeeklyViewProps> = ({ currentDate, Data, Loading, onclickDate }) => {
  const weekEnd = endOfWeek(currentDate);
  const weekStart = startOfWeek(currentDate);
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const isPastDate = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(date);
    target.setHours(0, 0, 0, 0);
    return target < today;
  };

  const getActivitiesForDay = (day: Date): Activities[] => {
    return Data.filter(activity => {
      const startDate = parseDateTime(activity.start_date);
      const endDate = parseDateTime(activity.end_date);

      const dayStart = new Date(day);
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(day);
      dayEnd.setHours(23, 59, 59, 999);

      return (
        (startDate <= dayEnd && endDate >= dayStart) ||
        (format(startDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')) ||
        (format(endDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd'))
      );
    });
  };

  const handleDayClick = (day: Date) => {
    if (isPastDate(day)) return;
    onclickDate(day);
  };

  const handleActivityClick = (activity: Activities, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Activity clicked:', activity);
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
      <div className="overflow-x-auto">
        {/* Header with days */}
        <div className="grid grid-cols-7 min-w-[750px] bg-gray-50 border-b border-gray-200">
          {days?.map((day) => {
            const isPastDay = isPastDate(day);
            return (
              <div
                key={day.toISOString()}
                className={`text-center py-3 border-l border-gray-200 first:border-l-0
                ${isPastDay ? 'opacity-60' : ''}`}
              >
                <div className="text-xs sm:text-sm font-medium text-gray-600">
                  {format(day, "EEE")}
                </div>
                <div
                  className={`inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full mt-1 font-semibold text-sm sm:text-base
                  transition-colors duration-200
                  ${isPastDay ? 'cursor-not-allowed text-gray-400' : 'cursor-pointer hover:bg-purple-50'}
                  ${isToday(day) ? "bg-purple-600 text-white hover:bg-purple-700" : ""}`}
                  onClick={() => handleDayClick(day)}
                  title={isPastDay ? "Unable to select past date" : "Click to add event"}
                >
                  {format(day, "d")}
                </div>
              </div>
            );
          })}
        </div>

        {/* Days Grid with Activities */}
        <div className="grid grid-cols-7 min-w-[750px] bg-white">
          {days?.map((day, idx) => {
            const isPastDay = isPastDate(day);
            const dayActivities = getActivitiesForDay(day);

            return (
              <div
                key={idx}
                className={`min-h-[200px] sm:min-h-[300px] p-2 border-l border-b border-gray-200 first:border-l-0
                ${isPastDay ? 'bg-gray-50 opacity-60' : 'bg-white'}
                transition-colors duration-200`}
              >
                {/* Activities Container */}
                <div className="space-y-2">
                  {dayActivities?.length === 0 ? (
                    <div className="text-xs text-gray-400 text-center mt-4">
                      {!isPastDay && (
                        <span className="cursor-pointer hover:text-white" onClick={() => handleDayClick(day)}>

                        </span>
                      )}
                    </div>
                  ) : (
                    dayActivities?.map((activity, index) => {
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
                          <div className="text-[10px] flex flex-col gap-1 text-gray-600">
                            <div className="flex justify-start items-center gap-1">
                              <CalendarHeart size={10} />
                              <span>{formatDate(startDate)}</span>
                              {formatDate(startDate) !== formatDate(endDate) && (
                                <span>- {formatDate(endDate)}</span>
                              )}
                            </div>
                            <div className="flex justify-start items-center gap-1">
                              <Clock size={10} />
                              {formatTime(startDate)} - {formatTime(endDate)}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WeeklyView;