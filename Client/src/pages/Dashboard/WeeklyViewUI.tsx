/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import moment from "moment";
import type { UpcomingEvent } from "./Dashboard";

interface WeeklyViewUIProps {
  events?: UpcomingEvent[];
  currentWeekStart?: moment.Moment;
  onEventClick?: (event: UpcomingEvent) => void;
}

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const WeeklyViewUI: React.FC<WeeklyViewUIProps> = ({ events, currentWeekStart = moment().startOf("week"), onEventClick,
}) => {
  // Generate week dates
  const weekDates = Array.from({ length: 7 }, (_, i) =>
    moment(currentWeekStart).add(i, "days")
  );

  // Get events for a day
  const getEventsForDay = (date: moment.Moment) =>
    events?.filter((event) => date.isSame(moment(event?.from_date), "day")
    );

  const handleEventClick = (event: UpcomingEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    onEventClick?.(event);
  };

  // Shared grid for header + body
  const gridCols = "grid grid-cols-7 min-w-[700px] sm:min-w-full";

  return (
    <div className="bg-linear-to-b from-white to-blue-50/30 rounded-lg">

      {/* SINGLE horizontal scroll container */}
      <div className="overflow-x-auto scroll-smooth">

        {/* ================= HEADER ================= */}
        <div className={`${gridCols} border-b bg-white`}>
          {weekDates?.map((date, index) => (
            <div key={index} className=" border border-gray-200 p-2 text-center">
              <div className="text-xs text-gray-500">
                {days[date.day()]}
              </div>

              <div
                className={`mx-auto mt-1 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                  ${date.isSame(moment(), "day")
                    ? "bg-orange-500 text-white"
                    : "text-gray-700 hover:bg-blue-100"
                  }`}
              >
                {date.date()}
              </div>
              <div>
                {date.format('MMM')}
              </div>
            </div>
          ))}
        </div>

        {/* ================= EVENTS ================= */}
        <div className={`${gridCols} gap-2 p-2`}>
          {weekDates?.map((date, index) => {
            const dayEvents = getEventsForDay(date);

            return (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded p-2 min-h-[90px]"
              >
                {dayEvents?.length ? (
                  <>
                    <div className="text-xs text-gray-500 mb-1 hidden">
                      {dayEvents?.length} event
                      {dayEvents?.length > 1 && "s"}
                    </div>

                    <div className="space-y-1">
                      {dayEvents?.slice(0, 3).map((event, i) => (
                        <div
                          key={i}
                          className="text-xs p-1 rounded bg-green-100 border border-green-300 truncate cursor-pointer hover:bg-green-200"
                          onClick={(e) => handleEventClick(event, e)}
                          title={event?.title}
                        >
                          <div className="truncate">{event?.title}</div>
                          <div className="text-[10px] flex flex-col justify-between">
                            <div>
                              {moment(event?.from_date).format('DD/MMM')}
                              {event?.from_date !== event?.to_date && `- ${moment(event?.to_date).format('DD/MMM')}`}
                            </div>
                            <div>
                              {moment(event?.from_date).format("HH:mm")} - {moment(event?.to_date).format("HH:mm")}
                            </div>
                          </div>
                        </div>
                      ))}
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