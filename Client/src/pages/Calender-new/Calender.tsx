import { endOfMonth, endOfWeek, endOfYear, format, startOfMonth, startOfWeek, startOfYear } from "date-fns";
import { ChevronDown } from "lucide-react";
import moment from "moment";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getUserFromStorage } from "../../helper/cryptoUser";
import { getActivities } from "../../services/calender/calenderApi";
import DailyView from "./DailyView";
import MonthlyView from "./MonthlyView";
import WeeklyView from "./WeeklyView";
import YearlyView from "./YearlyView";
export type CalendarView = "daily" | "weekly" | "monthly" | "yearly";

export interface Activities {
  id: number;
  date: string;
  title: string;
  start_date: string;
  end_date: string;
  vehicle_type: string;
  status: 'A' | 'p' | 'R' | '';
}

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>("monthly");
  const [activities, setActivities] = useState<Activities[]>([]);
  const user = getUserFromStorage();
  const [loading, setLoading] = useState(true);
  const redirect = useNavigate();

 const getDateRange = () => {
    switch (view) {
      case "daily":
        return {
          startDate: format(currentDate, 'yyyy-MM-dd'),
          endDate: format(currentDate, 'yyyy-MM-dd')
        };

      case "weekly":
        return {
          startDate: format(startOfWeek(currentDate), 'yyyy-MM-dd'),
          endDate: format(endOfWeek(currentDate), 'yyyy-MM-dd')
        };

      case "monthly":
        return {
          startDate: format(startOfMonth(currentDate), 'yyyy-MM-dd'),
          endDate: format(endOfMonth(currentDate), 'yyyy-MM-dd')
        };

      case "yearly":
        return {
          startDate: format(startOfYear(currentDate), 'yyyy-MM-dd'),
          endDate: format(endOfYear(currentDate), 'yyyy-MM-dd')
        };

      default:
        return {
          startDate: format(startOfMonth(currentDate), 'yyyy-MM-dd'),
          endDate: format(endOfMonth(currentDate), 'yyyy-MM-dd')
        };
    }
  };

  const fetchData = async () => {
    setLoading(true);
    const { startDate, endDate } = getDateRange();

    const body = {
      userId: user?.id || 0,
      role: user?.role || '',
      startDate: startDate,
      endDate: endDate,
      view: view
    };

    const response = await getActivities(body);
    setLoading(false);

    if (response) {
      setActivities(response?.activities || []);
    }
  };

  useEffect(() => {
    fetchData();
  }, [view, currentDate])

  const navigate = (direction: "prev" | "next") => {
    const multiplier = direction === "prev" ? -1 : 1;
    const newDate = new Date(currentDate);

    if (view === "daily") newDate.setDate(currentDate.getDate() + multiplier);
    if (view === "weekly") newDate.setDate(currentDate.getDate() + multiplier * 7);
    if (view === "monthly") newDate.setMonth(currentDate.getMonth() + multiplier);
    if (view === "yearly") newDate.setFullYear(currentDate.getFullYear() + multiplier);

    setCurrentDate(newDate);
  };


  const renderCurrentView = () => {
    switch (view) {
      case "daily":
        return <DailyView
          currentDate={currentDate}
          Data={activities}
          Loading={loading}
        />;
      case "weekly":
        return (
          <WeeklyView
            currentDate={currentDate}
            Data={activities}
            Loading={loading}
            onclickDate={handleClickDate}
          />
        );
      case "monthly":
        return (
          <MonthlyView
            currentDate={currentDate}
            Data={activities}
            Loading={loading}
            onclickDate={handleClickDate}
          />
        );
      case "yearly":
        return (
          <YearlyView
            currentDate={currentDate}
            onDateSelect={setCurrentDate}
            onclickDate={handleClickDate}
          />
        );
      default:
        return (
          <MonthlyView
            currentDate={currentDate}
            Data={activities}
            Loading={loading}
            onclickDate={handleClickDate}
          />
        );
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleClickDate = (date: Date) => {
    const formattedDate = moment(date).format('DD-MM-YYYY');
    redirect(`/add-activity?date=${formattedDate}`)
  }

  return (
    <div className="min-h-screen flex flex-col bg-white border border-gray-200 m-1 rounded-lg shadow-sm">
      {/* HEADER — UPDATED STYLING */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-6 border-b border-gray-200 bg-white">
        {/* HEADER SECTION */}
        <div className="flex items-center justify-between sm:justify-start space-x-4 sm:space-x-6">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-linear-to-r from-[#5441ff] to-[#4531ff] rounded-lg flex items-center justify-center shadow-sm">
              <svg
                className="w-4 h-4 sm:w-6 sm:h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h1 className="text-lg sm:text-xl font-semibold text-gray-800">
              Calendar
            </h1>
          </div>
          <button
            onClick={goToToday}
            className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-md text-sm text-indigo-700 font-medium transition-colors duration-200 cursor-pointer"
          >
            Today
          </button>
        </div>

        {/* NAVIGATION SECTION */}
        <div className="flex items-center justify-center space-x-2">
          {/* Previous Button */}
          <button
            onClick={() => navigate("prev")}
            className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 bg-white hover:bg-gray-50 border border-gray-200 rounded-md transition-colors duration-200 cursor-pointer"
          >
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          {/* Date Display */}
          <div className="bg-white px-5  py-2 rounded-md border border-gray-200 min-w-40 sm:min-w-[220px] text-center">
            <div className="text-base sm:text-lg font-medium text-gray-800">
              {view === "daily" && format(currentDate, "MMM yyyy")}
              {view === "weekly" && (
                <>
                  {format(startOfWeek(currentDate), "MMM d")} -{" "}
                  {format(endOfWeek(currentDate), "MMM d, yyyy")}
                </>
              )}
              {view === "monthly" && format(currentDate, "MMMM yyyy")}
              {view === "yearly" && format(currentDate, "yyyy")}
            </div>
          </div>

          {/* Next Button */}
          <button
            onClick={() => navigate("next")}
            className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 bg-white hover:bg-gray-50 border border-gray-200 rounded-md transition-colors duration-200 cursor-pointer"
          >
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>

        {/* VIEW SELECTOR */}
        <div className="flex items-center justify-center gap-2">
          <div className="relative inline-block">
            <select
              value={view}
              onChange={(e) => setView(e.target.value as CalendarView)}
              className="appearance-none bg-white border border-gray-300 rounded-md px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-700 focus:outline-none focus:ring-0 focus:ring-[#4f3fe0] focus:border-[#4f3fe0] cursor-pointer pr-8 sm:pr-10"
            >
              {(["daily", "weekly", "monthly", "yearly"] as CalendarView[]).map(
                (item) => (
                  <option
                    key={item}
                    value={item}
                    className="bg-white text-gray-800"
                  >
                    {item.charAt(0).toUpperCase() + item.slice(1)}
                  </option>
                ),
              )}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          <Link
            to={'/add-activity'}
            className="px-8 py-2 bg-linear-to-r from-[#5441ff] to-[#4531ff] text-white font-semibold rounded-md transition-colors"
          >
            Add activity
          </Link>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">{renderCurrentView()}</div>
    </div>
  );
};

export default Calendar;