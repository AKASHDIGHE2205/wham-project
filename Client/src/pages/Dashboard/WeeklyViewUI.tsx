/* eslint-disable @typescript-eslint/no-explicit-any */
import moment from "moment";
import React from "react";
import { useNavigate } from "react-router-dom";
import DataLoading from "../../components/DataLoading";
import type { Activities } from "../Calender-new/Calender";

interface WeeklyViewUIProps {
  events?: Activities[];
  currentWeekStart: moment.Moment;
  isLoading?: boolean;
}
const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const WeeklyViewUI: React.FC<WeeklyViewUIProps> = ({ events, currentWeekStart = moment().startOf("week"), isLoading = false }) => {
  const navigate = useNavigate();

  const weekDates = Array.from({ length: 7 }, (_, i) =>
    moment(currentWeekStart).add(i, "days")
  );

  const getEventsForDay = (date: moment.Moment) => {
    return events?.filter((event) => {
      const eventStart = moment(event.start_date);
      const eventEnd = moment(event.end_date);
      const currentDay = date.clone().startOf('day');
      const nextDay = date.clone().endOf('day');

      // Check if the event overlaps with the current day
      return (
        eventStart.isSame(currentDay, 'day') ||
        eventEnd.isSame(currentDay, 'day') ||
        (eventStart.isBefore(nextDay) && eventEnd.isAfter(currentDay))
      );
    }) || [];
  };

  const handleDateClick = (date: moment.Moment) => {
    const formattedDate = date.format('DD-MM-YYYY');
    navigate(`/add-activity?date=${formattedDate}`);
  }

  const getActivityStyles = (status: string) => {
    switch (status) {
      case 'A':
        return {
          bg: 'bg-green-100',
          border: 'border-green-100',
          hover: 'hover:bg-green-200',
          text: 'text-green-800',
          badge: 'bg-green-500'
        };
      case 'P':
        return {
          bg: 'bg-yellow-100',
          border: 'border-yellow-100',
          hover: 'hover:bg-yellow-200',
          text: 'text-yellow-800',
          badge: 'bg-yellow-500'
        };
      case 'R':
        return {
          bg: 'bg-red-100',
          border: 'border-red-100',
          hover: 'hover:bg-red-200',
          text: 'text-red-800',
          badge: 'bg-red-500'
        };
      case 'C':
        return {
          bg: 'bg-blue-100',
          border: 'border-blue-100',
          hover: 'hover:bg-blue-200',
          text: 'text-blue-800',
          badge: 'bg-blue-500'
        };
      default:
        return {
          bg: 'bg-gray-100',
          border: 'border-gray-100',
          hover: 'hover:bg-gray-200',
          text: 'text-gray-800',
          badge: 'bg-gray-500'
        };
    }
  };

  const handleEventClick = (data: any, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/update-activity/${data?.id}/${data?.date}`);
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <DataLoading />
      </div>
    );
  }

  return (
    <div className="bg-linear-to-b from-white to-blue-50/30 rounded-lg">
      {/* SINGLE horizontal scroll container */}
      <div className="overflow-x-auto scroll-smooth">
        {/* ================= HEADER ================= */}
        <div className={`grid grid-cols-7 min-w-[700px] sm:min-w-full border-b border-gray-200 bg-white`}>
          {weekDates?.map((date, index) => {
            const isToday = date.isSame(moment(), "day");
            const isPast = date.isBefore(moment(), "day");

            return (
              <div key={index} className="border border-gray-200 p-2 text-center">
                <div className="text-xs text-gray-500">
                  {days[date.day()]}
                </div>

                <div
                  className={`mx-auto mt-1 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                            ${isToday ? "bg-orange-500 text-white cursor-pointer"
                      : isPast ? "text-gray-400 cursor-not-allowed" : "text-gray-700 hover:bg-blue-100 cursor-pointer"
                    }`}
                  onClick={() => {
                    if (!isPast) {
                      handleDateClick(date);
                    }
                  }}
                >
                  {date.date()}
                </div>

                <div className="text-xs text-gray-500">
                  {date.format("MMM")}
                </div>
              </div>
            );
          })}
        </div>

        {/* ================= EVENTS ================= */}
        <div className={`grid grid-cols-7 min-w-[700px] sm:min-w-full gap-2 p-2`}>
          {weekDates?.map((date, index) => {
            const dayEvents = getEventsForDay(date);
            const isPast = date.isBefore(moment(), "day");

            return (
              <div
                key={index}
                className={`bg-white border border-gray-200 rounded p-2 min-h-[120px] 
                  ${!isPast ? 'cursor-pointer hover:bg-blue-50/50' : 'opacity-60'} 
                  transition-colors relative`}
                onClick={() => { if (!isPast) { handleDateClick(date) } }}
              >
                {dayEvents?.length ? (
                  <div className="space-y-1">
                    {dayEvents?.map((event, i) => {
                      const styles = getActivityStyles(event?.status);

                      return (
                        <div
                          key={i}
                          className={`text-xs p-1.5 border ${styles.bg} ${styles.border} 
                            ${styles.hover} ${styles.text} rounded 
                            cursor-pointer transition-colors relative group`}
                          title={`${event?.title} (${moment(event.start_date).format('MMM D')} - ${moment(event.end_date).format('MMM D')})`}
                          onClick={(e) => handleEventClick(event, e)}
                        >
                          <div className="truncate font-medium flex items-center gap-1">
                            {event?.title}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center text-[10px] text-gray-400 mt-6">
                    No events
                  </div>
                )}

                {/* Show count of more events if needed */}
                {dayEvents?.length > 3 && (
                  <div className="absolute bottom-1 right-1 text-[9px] bg-gray-200 text-gray-600 px-1 rounded">
                    +{dayEvents?.length - 3}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WeeklyViewUI;