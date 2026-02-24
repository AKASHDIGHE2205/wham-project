// components/YearlyView.tsx
import React from 'react';
import {
  format,
  eachMonthOfInterval,
  startOfYear,
  endOfYear,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isToday
} from 'date-fns';

interface YearlyViewProps {
  currentDate: Date;
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  onShowModal: (show: boolean) => void;
}

const YearlyView: React.FC<YearlyViewProps> = ({ currentDate, onDateSelect, onShowModal }) => {
  const yearStart = startOfYear(currentDate);
  const yearEnd = endOfYear(currentDate);
  const months = eachMonthOfInterval({ start: yearStart, end: yearEnd });

  const handleMonthClick = (month: Date) => {
    onDateSelect(month);
    onShowModal(true);
  };

  const handleDayClick = (day: Date) => {
    onDateSelect(day);
    onShowModal(true);
  };

  return (
    <div className="h-full overflow-auto bg-linear-to-br from-purple-50 via-blue-50 to-orange-50 p-3 sm:p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 max-w-7xl mx-auto">
        {months.map((month: Date) => {
          const isCurrentMonth = month.getMonth() === currentDate.getMonth() &&
            month.getFullYear() === currentDate.getFullYear();

          return (
            <div
              key={month.toString()}
              onClick={() => handleMonthClick(month)}
              className={`bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 hover:border-blue-200 cursor-pointer ${isCurrentMonth ? 'ring-1 ring-blue-500 ring-opacity-50' : ''
                }`}
            >
              <h3 className={`text-sm sm:text-base lg:text-lg font-bold mb-3 sm:mb-4 text-center ${isCurrentMonth ? 'text-blue-700' : 'text-gray-800'
                }`}>
                {format(month, 'MMMM yyyy')}
              </h3>

              <div className="grid grid-cols-7 gap-0.5 sm:gap-1 text-xs mb-3 sm:mb-4">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                  <div key={day} className="text-center font-semibold text-gray-500 text-[8px] sm:text-[10px] py-0.5 sm:py-1">
                    {day}
                  </div>
                ))}

                {(() => {
                  const monthStart = startOfMonth(month);
                  const monthEnd = endOfMonth(month);
                  const calendarStart = startOfWeek(monthStart);
                  const calendarEnd = endOfWeek(monthEnd);
                  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

                  return days.map((day: Date) => {
                    const isDayCurrentMonth = isSameMonth(day, month);

                    return (
                      <div
                        key={day.toString()}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDayClick(day);
                        }}
                        className={`text-center p-0.5 sm:p-1 rounded text-[8px] sm:text-[11px] transition-colors cursor-pointer ${!isDayCurrentMonth
                          ? 'text-gray-200'
                          : isCurrentMonth
                            ? 'text-gray-800 hover:bg-blue-100'
                            : 'text-gray-500 hover:bg-blue-50'
                          } ${isToday(day)
                            ? 'bg-linear-to-br from-blue-500 to-blue-600 text-white shadow shadow-blue-300'
                            : ''
                          }`}
                      >
                        {format(day, 'd')}
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default YearlyView;