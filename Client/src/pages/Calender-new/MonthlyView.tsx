/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, startOfWeek, endOfWeek, isSameDay } from 'date-fns';
import moment from 'moment';

interface MonthlyViewProps {
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

export interface CalendarEvent {
  id: number;
  title: string;
  description: string;
  from_date: string;
  to_date: string;
  from_time: string;
  to_time: string;
  team_id: number;
  isapproved: string | null;
  type: string;
  created_by: number;
  approval_by: number;
  created_at: string;
}

const MonthlyView: React.FC<MonthlyViewProps> = ({ setSelectedDate, currentDate, selectedDate,
  onDateSelect, onShowModal, Data, setIsEditShowModal, setEditData, Loading }) => {

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const safeParseDate = (dateString: string): Date | null => {
    if (!dateString || dateString.includes("0000-00-00")) return null;
    const d = new Date(dateString);
    return isNaN(d.getTime()) ? null : new Date(d.getFullYear(), d.getMonth(), d.getDate());
  };

  const getEventsForDate = (date: Date): CalendarEvent[] => {
    if (!Array.isArray(Data)) return [];

    const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    return Data.filter((event: CalendarEvent) => {
      const start = safeParseDate(event?.from_date);
      const end = safeParseDate(event?.to_date);
      if (!start || !end) return false;

      return targetDate >= start && targetDate <= end;
    });
  };

  const handleClickDate = (day: Date) => {
    setSelectedDate(day);
    onDateSelect(day);
    onShowModal(true);
  };

  const handleEditEvent = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditData(event);
    setIsEditShowModal(true);
  };

  // Loading state
  if (Loading) {
    return (
      <div className="h-full bg-white sm:mx-4 my-2 rounded-xl shadow-md overflow-hidden flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 text-lg">Loading calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-white sm:mx-4 my-2 rounded-xl shadow-md overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-7 bg-linear-to-br from-gray-50 to-blue-50/30 border-b text-xs sm:text-sm font-semibold text-gray-600">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']?.map(day => (
          <div key={day} className="text-center py-3">{day}</div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1px bg-gray-200">
        {days?.map((day, idx) => {
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const dayEvents = getEventsForDate(day);

          return (
            <div
              key={idx}
              className={`relative min-h-[85px] sm:min-h-[100px] p-1 sm:p-2 cursor-pointer group
                bg-linear-to-br from-white to-gray-50/70 border
                ${isCurrentMonth ? 'text-gray-700 border-gray-200' : 'text-gray-300 bg-gray-100'}
                ${isSelected ? 'ring-2 ring-blue-500 shadow-lg' : ''}
                hover:shadow-lg hover:scale-[1.03] transition-all duration-300`}
            >

              {isToday(day) && (
                <div className="absolute inset-0 bg-blue-500/10 rounded-md animate-pulse"></div>
              )}

              {/* Date Click */}
              <div
                className="relative z-10"
                onClick={() => handleClickDate(day)}
                title="Click to add event"
              >
                <div className={`flex items-center justify-center
                  w-7 h-7 sm:w-8 sm:h-8 rounded-full mx-auto
                  text-sm sm:text-base font-medium transition-all duration-300
                  ${isToday(day)
                    ? "bg-blue-600 text-white shadow-md"
                    : isCurrentMonth
                      ? "group-hover:bg-blue-100 group-hover:text-blue-600"
                      : ""}`}>
                  {format(day, "d")}
                </div>
              </div>

              {/* Events */}
              <div className="relative z-10 mt-1 space-y-1">
                {dayEvents?.slice(0, 3)?.map((event, index) => (
                  <div
                    key={index}
                    className={`text-xs px-1 py-0.5 rounded border truncate cursor-text
                      ${event?.isapproved === "P"
                        ? "bg-yellow-100 border-yellow-300 text-yellow-800"
                        : event?.isapproved === "R"
                          ? "bg-red-100 border-red-300 text-red-800"
                          : event?.isapproved === "A"
                            ? "bg-green-100 border-green-300 text-green-800"
                            : event?.isapproved === "C"
                              ? "bg-blue-100 border-blue-300 text-blue-800"
                              : "bg-gray-100 border-gray-300 text-gray-800"}`}
                    onClick={(e) => handleEditEvent(event, e)}
                    title={`Click to edit: ${event?.title}`}
                  >
                    <div className='flex justify-between mb-1'>
                      <span className="truncate flex-1 font-semibold flex items-center gap-1">
                        {event?.type === 'task' ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-check-big-icon lucide-circle-check-big"><path d="M21.801 10A10 10 0 1 1 17 3.335" /><path d="m9 11 3 3L22 4" /></svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-calendar-days-icon lucide-calendar-days"><path d="M8 2v4" /><path d="M16 2v4" /><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M3 10h18" /><path d="M8 14h.01" /><path d="M12 14h.01" /><path d="M16 14h.01" /><path d="M8 18h.01" /><path d="M12 18h.01" /><path d="M16 18h.01" /></svg>
                        )}
                        {event?.title}
                      </span>
                    </div>

                    <div className="text-[10px] flex justify-between">
                      <div>
                        {moment(event?.from_date).format('DD/MMM')}
                        {event?.from_date !== event?.to_date &&
                          ` to ${moment(event?.to_date).format('DD/MMM')}`}
                      </div>
                      <div>
                        {moment(event?.from_date).format("HH:mm")} - {moment(event?.to_date).format("HH:mm")}
                      </div>
                    </div>

                  </div>
                ))}
                {dayEvents?.length > 3 && (
                  <div className="text-xs text-gray-500 text-center">
                    +{dayEvents?.length - 3} more
                  </div>
                )}
              </div>

              <div className="absolute inset-0 rounded-md transition-all duration-300 group-hover:bg-blue-500/5" />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MonthlyView;