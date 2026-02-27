/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import {
  format,
  isSameDay,
  isToday,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
} from 'date-fns';
import moment from 'moment';
import type { CalendarEvent } from './MonthlyView';

interface WeeklyViewProps {
  setSelectedDate: (date: Date | null) => void;
  currentDate: Date;
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  onShowModal: (show: boolean) => void;
  Data: any;
  setIsEditShowModal: (show: boolean) => void;
  setEditData: (data: any) => void;
  Loading: boolean;
}

const WeeklyView: React.FC<WeeklyViewProps> = ({
  setSelectedDate,
  currentDate,
  selectedDate,
  onDateSelect,
  onShowModal,
  Data,
  setIsEditShowModal,
  setEditData,
  Loading
}) => {
  const weekStart = startOfWeek(currentDate);
  const weekEnd = endOfWeek(currentDate);
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
  const hours = Array.from({ length: 14 }, (_, i) => i + 7); // 7 AM to 8 PM

  // Same safeParseDate function as MonthlyView
  const safeParseDate = (dateString: string): Date | null => {
    if (!dateString || dateString.includes("0000-00-00")) return null;
    const d = new Date(dateString);
    return isNaN(d.getTime()) ? null : new Date(d.getFullYear(), d.getMonth(), d.getDate());
  };

  // Same getEventsForDate function as MonthlyView
  const getEventsForDate = (date: Date): CalendarEvent[] => {
    if (!Array.isArray(Data)) return [];

    const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    return Data.filter((event: CalendarEvent) => {
      const start = safeParseDate(event.from_date);
      const end = safeParseDate(event.to_date);
      if (!start || !end) return false;

      return targetDate >= start && targetDate <= end;
    });
  };

  // Get events for specific hour (similar to DailyView)
  const getEventsForDateAndHour = (date: Date, hour: number): CalendarEvent[] => {
    const dayEvents = getEventsForDate(date);

    return dayEvents.filter((event: CalendarEvent) => {
      try {
        const eventStartHour = event.from_time ? parseInt(event.from_time.split(':')[0]) : 0;
        return eventStartHour === hour;
      } catch (error) {
        console.error('Error processing event:', error);
        return false;
      }
    });
  };

  // Handle day click (for all-day events or date selection)
  const handleDayClick = (day: Date) => {
    if (isPastDate(day)) return;

    setSelectedDate(day);
    onDateSelect(day);
    onShowModal(true);
  };

  // Handle time slot click (for specific hour)
  const handleTimeSlotClick = (day: Date, hour: number) => {
    const selectedDateTime = new Date(day);
    selectedDateTime.setHours(hour, 0, 0, 0);

    if (isPastDate(selectedDateTime)) return;

    setSelectedDate(selectedDateTime);
    onDateSelect(selectedDateTime);
    onShowModal(true);
  };

  // Handle event edit (same as MonthlyView)
  const handleEditEvent = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation();

    if (isEventInPast(event)) return;

    setEditData(event);
    setIsEditShowModal(true);
  };

  const isEventInPast = (event: CalendarEvent): boolean => {
    const eventEnd = safeParseDate(event.to_date);
    if (!eventEnd) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return eventEnd < today;
  };

  const isPastDate = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const target = new Date(date);
    target.setHours(0, 0, 0, 0);

    return target < today;
  };

  // Format time from date strings (same as DailyView)
  const formatTimeFromDate = (dateString: string): string => {
    if (!dateString || dateString.includes("0000-00-00")) return "All day";
    try {
      return moment(dateString).format("HH:mm");
    } catch {
      return "All day";
    }
  };

  // Get all-day events (events that span the entire day)
  const getAllDayEvents = (date: Date): CalendarEvent[] => {
    const dayEvents = getEventsForDate(date);
    return dayEvents.filter(event =>
      !event.from_time || event.from_time === "00:00:00" || event.from_time === "00:00"
    );
  };

  // Loading state
  if (Loading) {
    return (
      <div className="h-full bg-linear-to-br from-purple-50 via-blue-50 to-orange-50 sm:mx-4 my-2 rounded-xl shadow-md overflow-hidden flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 text-lg">Loading calendar...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="h-full overflow-auto bg-linear-to-b from-white to-blue-50/30">
      {/* Header with days */}
      <div className="flex border-b bg-white/80 backdrop-blur-md shadow-sm">
        <div className="w-16 sm:w-20 p-2 text-xs sm:text-sm text-gray-600 border-r border-gray-200 sticky left-0 bg-white/70 backdrop-blur-md z-20">
          All Day
        </div>
        {days.map((day) => {
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const allDayEvents = getAllDayEvents(day);

          return (
            <div
              key={day.toString()}
              className={`flex-1 text-center border-l border-gray-200 p-2 sm:p-4 min-h-16
                transition-all duration-300 hover:bg-blue-50 relative
                ${isSelected ? "bg-blue-100/60 border-blue-300 shadow-inner" : ""}
                
              `}
            >
              <div className="text-xs text-gray-500">{format(day, "EEE")}</div>

              {/* Date Badge - Clickable for adding events */}
              <div
                className={`mx-auto mt-1 rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center font-semibold
                  transition-all duration-300 cursor-pointer
                  ${isToday(day) ? "bg-blue-600 text-white shadow-md"
                    : isSelected ? "bg-blue-200 text-blue-800"
                      : "text-gray-800 hover:bg-blue-100"
                  }
                `}
                onClick={() => handleDayClick(day)}
                title="Click to add event"
              >
                {format(day, "d")}
              </div>

              {/* All Day Events */}
              <div className="mt-2 space-y-1">
                {allDayEvents.map((event, index) => (
                  <div
                    key={index}
                    className={`text-xs px-1 py-0.5 rounded border truncate
                        ${isEventInPast(event) ? 'opacity-85 cursor-not-allowed' : 'cursor-pointer'}
                        ${event?.isapproved === "P" ? "bg-yellow-100 border-yellow-300 text-yellow-800"
                        : event?.isapproved === "R" ? "bg-red-100 border-red-300 text-red-800"
                          : event?.isapproved === "A" ? "bg-green-100 border-green-300 text-green-800"
                            : event?.isapproved === "C" ? "bg-blue-100 border-blue-300 text-blue-800"
                              : "bg-gray-100 border-gray-300 text-gray-800"
                      }`}
                    onClick={(e) => handleEditEvent(event, e)}
                    title={isEventInPast(event) ? 'Past events cannot be edited' : `Click to edit`}
                  >
                    <div className='flex justify-between mb-1'>
                      <span className="truncate flex-1 font-semibold flex items-center gap-1">
                        {event.type === 'task' ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-check-big-icon lucide-circle-check-big"><path d="M21.801 10A10 10 0 1 1 17 3.335" /><path d="m9 11 3 3L22 4" /></svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-calendar-days-icon lucide-calendar-days"><path d="M8 2v4" /><path d="M16 2v4" /><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M3 10h18" /><path d="M8 14h.01" /><path d="M12 14h.01" /><path d="M16 14h.01" /><path d="M8 18h.01" /><path d="M12 18h.01" /><path d="M16 18h.01" /></svg>
                        )}
                        {event.title}
                      </span>
                    </div>

                    <div className="text-[10px] flex justify-between">
                      <div>
                        {moment(event.from_date).format('DD/MMM')}
                        {event.from_date !== event.to_date &&
                          ` to ${moment(event.to_date).format('DD/MMM')}`}
                      </div>
                      <div>
                        All day
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Time Grid */}
      <div className="relative max-w-7xl mx-auto">
        {hours.map((hour) => (
          <div
            key={hour}
            className="flex border-b border-gray-200 min-h-[70px] sm:min-h-20 group hover:bg-blue-50/20 transition-all duration-300"
          >
            {/* Time Label */}
            <div className="w-16 sm:w-20 p-2 text-xs sm:text-sm text-gray-600 
              border-r border-gray-200 sticky left-0 bg-white/70 backdrop-blur-md z-10">
              {hour < 12 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`}
            </div>

            {/* Grid Cells per Day */}
            {days.map((day) => {
              const hourEvents = getEventsForDateAndHour(day, hour);

              return (
                <div
                  className={`flex-1 border-l p-1 sm:p-2 relative
                  ${isPastDate(day) ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:bg-blue-100/30'}`}
                  onClick={() => {
                    if (!isPastDate(day)) handleTimeSlotClick(day, hour);
                  }}
                >
                  {/* Today Glow */}
                  {isToday(day) && (
                    <div className="absolute inset-0 border-2 border-blue-400/40 rounded-lg pointer-events-none animate-pulse"></div>
                  )}

                  {/* Events for this time slot */}
                  <div className="space-y-1">
                    {hourEvents.map((event, index) => (
                      <div
                        key={index}
                        className={`text-xs px-1 py-0.5 rounded border cursor-pointer hover:shadow-md transition-all duration-200
                          ${event.isapproved === "P"
                            ? "bg-yellow-100 border-yellow-300 text-yellow-800"
                            : event.isapproved === "R"
                              ? "bg-red-100 border-red-300 text-red-800"
                              : event.isapproved === "A"
                                ? "bg-green-100 border-green-300 text-green-800"
                                : event.isapproved === "C"
                                  ? "bg-blue-100 border-blue-300 text-blue-800"
                                  : "bg-gray-100 border-gray-300 text-gray-800"
                          }`}
                        onClick={(e) => handleEditEvent(event, e)}
                        title={`Click to edit: ${event.title}`}
                      >
                        <span className="truncate flex-1 font-semibold flex items-center gap-1">
                          {event.type === 'task' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-check-big-icon lucide-circle-check-big"><path d="M21.801 10A10 10 0 1 1 17 3.335" /><path d="m9 11 3 3L22 4" /></svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-calendar-days-icon lucide-calendar-days"><path d="M8 2v4" /><path d="M16 2v4" /><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M3 10h18" /><path d="M8 14h.01" /><path d="M12 14h.01" /><path d="M16 14h.01" /><path d="M8 18h.01" /><path d="M12 18h.01" /><path d="M16 18h.01" /></svg>
                          )}
                          {event.title}
                        </span>

                        <div className="text-[10px] flex justify-between mt-1">
                          <span className="text-gray-600">
                            {formatTimeFromDate(event.from_time)} - {formatTimeFromDate(event.to_time)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Empty state hint */}
                  {hourEvents.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                      <span className="text-xs text-gray-400 bg-white/80 px-2 py-1 rounded border">
                        Click to add event
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeeklyView;