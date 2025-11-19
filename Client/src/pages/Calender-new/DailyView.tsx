/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { format } from 'date-fns';
import moment from 'moment';
import type { CalendarEvent } from './MonthlyView';

interface DailyViewProps {
  currentDate: Date;
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  onShowModal: (show: boolean) => void;
  Data: any;
  setIsEditShowModal: (show: boolean) => void;
  setEditData: (data: any) => void;
  setSelectedDate: (date: Date | null) => void;
}

const DailyView: React.FC<DailyViewProps> = ({
  currentDate,
  onShowModal,
  Data,
  setIsEditShowModal,
  setEditData,
  setSelectedDate
}) => {
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const safeParseDate = (dateString: string): Date | null => {
    if (!dateString || dateString.includes("0000-00-00")) return null;
    const d = new Date(dateString);
    return isNaN(d.getTime()) ? null : new Date(d.getFullYear(), d.getMonth(), d.getDate());
  };

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

  const getEventsForHour = (hour: number): CalendarEvent[] => {
    const dayEvents = getEventsForDate(currentDate);

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

  const handleHourClick = (hour: number) => {
    const selectedDateTime = new Date(currentDate);
    selectedDateTime.setHours(hour, 0, 0, 0);
    setSelectedDate(selectedDateTime);
    onShowModal(true);
  };

  const handleEditEvent = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditData(event);
    setIsEditShowModal(true);
  };

  // Format time from date strings like MonthlyView does
  const formatTimeFromDate = (dateString: string): string => {
    if (!dateString || dateString.includes("0000-00-00")) return "All day";
    try {
      return moment(dateString).format("HH:mm");
    } catch {
      return "All day";
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50/30">
      <div className="text-center py-5 bg-linear-to-br from-blue-50 to-indigo-50 border-b shadow-sm">
        <div className="text-base text-blue-600 font-medium tracking-wide animate-fade-in">
          {format(currentDate, 'EEEE')}
        </div>
        <div className="text-3xl font-bold text-gray-800 mt-1 drop-shadow-sm">
          {format(currentDate, 'MMMM d, yyyy')}
        </div>
      </div>

      <div className="relative max-w-5xl mx-auto p-2 sm:p-4">
        {hours.map(hour => {
          const hourEvents = getEventsForHour(hour);

          return (
            <div
              key={hour}
              className="flex border-b border-gray-100 min-h-16 sm:min-h-20 group transition-all hover:bg-blue-50/40 cursor-pointer"
            >
              <div
                className="w-16 sm:w-24 p-2 sm:p-4 text-xs sm:text-sm text-gray-600 font-medium border-r border-gray-100 bg-white/70 sticky left-0 z-10"
                onClick={() => handleHourClick(hour)}
              >
                {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
              </div>

              <div
                className="flex-1 p-2 sm:p-3 relative"
                onClick={() => handleHourClick(hour)}
              >
                {hourEvents.map((event) => (
                  <div
                    key={event.id}
                    className={`text-xs px-2 py-1 rounded border cursor-pointer hover:shadow-md transition-all duration-200 truncate
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
                    <span className="truncate flex-1 font-semibold flex items-center gap-2">
                      {event.type === 'task' ?
                        (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-check-big-icon lucide-circle-check-big"><path d="M21.801 10A10 10 0 1 1 17 3.335" /><path d="m9 11 3 3L22 4" /></svg>) : (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-calendar-icon lucide-calendar"><path d="M8 2v4" /><path d="M16 2v4" /><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M3 10h18" /></svg>)}
                      {event.title}
                    </span>

                    <div className="flex justify-between text-[10px] mt-1">
                      <span className="text-gray-600">
                        {moment(event.from_date).format('DD/MMM')}
                        {event.from_date !== event.to_date &&
                          ` to ${moment(event.to_date).format('DD/MMM')}`}
                      </span>
                      <span>
                        {formatTimeFromDate(event.from_date)} - {formatTimeFromDate(event.to_date)}
                      </span>
                    </div>
                  </div>
                ))}

                {hourEvents.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    <span className="text-xs text-gray-400 bg-white/80 px-2 py-1 rounded border">
                      Click to add event
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DailyView;