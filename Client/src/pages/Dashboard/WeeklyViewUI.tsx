/* eslint-disable @typescript-eslint/no-explicit-any */
import { Calendar, Clock } from "lucide-react";
import moment from "moment";
import React from "react";
import { useNavigate } from "react-router-dom";
import type { Activities } from "../Calender-new/Calender";

interface WeeklyViewUIProps {
  events?: Activities[];
  currentWeekStart: moment.Moment;
}
const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const WeeklyViewUI: React.FC<WeeklyViewUIProps> = ({ events, currentWeekStart = moment().startOf("week") }) => {
  const navigate = useNavigate();
  // Generate week dates
  const weekDates = Array.from({ length: 7 }, (_, i) =>
    moment(currentWeekStart).add(i, "days")
  );
  // Get events for a day
  const getEventsForDay = (date: moment.Moment) =>
    events?.filter((event) => date.isSame(moment(event?.start_date), "day")
    );

  const handleDateClick = (date: moment.Moment) => {
    // Format date as DD-MM-YYYY
    const formattedDate = date.format('DD-MM-YYYY');
    navigate(`/add-activity?date=${formattedDate}`);
  }

  const getActivityStyles = (status: string) => {
    switch (status) {
      case 'A':
        return {
          bg: 'bg-green-100',
          border: 'border-green-500',
          hover: 'hover:bg-green-200',
          text: 'text-green-800'
        };
      case 'P':
        return {
          bg: 'bg-yellow-100',
          border: 'border-yellow-500',
          hover: 'hover:bg-yellow-200',
          text: 'text-yellow-800'
        };
      case 'R':
        return {
          bg: 'bg-red-100',
          border: 'border-red-500',
          hover: 'hover:bg-red-200',
          text: 'text-red-800'
        };
      case 'C':
        return {
          bg: 'bg-blue-100',
          border: 'border-blue-500',
          hover: 'hover:bg-blue-200',
          text: 'text-blue-800'
        };
      default:
        return {
          bg: 'bg-gray-100',
          border: 'border-gray-500',
          hover: 'hover:bg-gray-200',
          text: 'text-gray-800'
        };
    }
  };

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

            return (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded p-2 min-h-[90px] cursor-pointer hover:bg-blue-50/50 transition-colors"
                onClick={() => {
                  if (!date.isBefore(moment(), "day")) {
                    handleDateClick(date);
                  }
                }}
              >
                {dayEvents?.length ? (
                  <>
                    <div className="text-xs text-gray-500 mb-1 hidden">
                      {dayEvents?.length} event
                      {dayEvents?.length > 1 && "s"}
                    </div>

                    <div className="space-y-1">
                      {dayEvents?.slice(0, 3).map((event, i) => {
                        const styles = getActivityStyles(event?.status);

                        return (
                          <div
                            key={i}
                            className={`text-xs p-1 rounded border truncate ${styles.bg} ${styles.border} ${styles.hover} ${styles.text}`}
                            title={event?.title}
                            onClick={(e) => e.stopPropagation()} // Prevent event bubbling when clicking on an event
                          >
                            <div className="truncate">#{event?.title}</div>
                            <div className="text-[10px] flex flex-col justify-between">
                              <div className="flex justify-start items-center">
                                <Calendar size={10} />
                                <span>
                                  {moment(event?.start_date).format("DD/MMM")}
                                  {event?.start_date !== event?.end_date && ` - ${moment(event?.end_date).format("DD/MMM")}`}
                                </span>
                              </div>

                              <div className="flex justify-start items-center">
                                <Clock size={10}/>
                                <span>
                                  {moment(event?.start_date).format("HH:mm")} -{" "}
                                  {moment(event?.end_date).format("HH:mm")}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {dayEvents?.length > 3 && (
                      <div className="text-[9px] text-center text-gray-400 mt-1">
                        +{dayEvents?.length - 3} more
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center text-[10px] text-gray-400 mt-6">
                    No events
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