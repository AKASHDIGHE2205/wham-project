/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import DailyView from './DailyView';
import WeeklyView from './WeeklyView';
import MonthlyView from './MonthlyView';
import YearlyView from './YearlyView';
import EventModal from './NewEventModal';
import { getEvent } from '../../services/calender/calenderApi';
import CryptoJS from "crypto-js";
import { secretKey } from '../../constant/Baseurl';
import UpdateEvent from './UpdateEvent';

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  color?: string;
  description?: string;
}

export type CalendarView = "daily" | "weekly" | "monthly" | "yearly";

interface CalendarProps {
  events?: CalendarEvent[];
}

const Calendar: React.FC<CalendarProps> = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>('monthly');
  const [isShowModal, setIsShowModal] = useState(false);
  const [isEditShowModal, setIsEditShowModal] = useState(false);
  const [selectedData, setSelectedDate] = useState<Date | null>(null);
  const [data, setData] = useState<any>(null);
  const [editData, setEditData] = useState({});

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
        return (
          <DailyView
            currentDate={currentDate}
            selectedDate={null}
            onDateSelect={() => { }}
            onShowModal={setIsShowModal}
            Data={data}
            setIsEditShowModal={setIsEditShowModal}
            setEditData={setEditData}
            setSelectedDate={setSelectedDate}
          />
        );
      case "weekly":
        return (
          <WeeklyView
            currentDate={currentDate}
            selectedDate={currentDate}
            onDateSelect={setCurrentDate}
            onShowModal={setIsShowModal}
            setSelectedDate={setSelectedDate}
            Data={data}
            setIsEditShowModal={setIsEditShowModal}
            setEditData={setEditData}
          />
        );
      case "monthly":
        return (
          <MonthlyView
            currentDate={currentDate}
            selectedDate={currentDate}
            onDateSelect={setCurrentDate}
            onShowModal={setIsShowModal}
            setSelectedDate={setSelectedDate}
            Data={data}
            setIsEditShowModal={setIsEditShowModal}
            setEditData={setEditData}
          />
        );
      case "yearly":
        return (
          <YearlyView
            currentDate={currentDate}
            selectedDate={currentDate}
            onDateSelect={setCurrentDate}
            onShowModal={setIsShowModal}
          />
        );
      default:
        return (
          <MonthlyView
            currentDate={currentDate}
            selectedDate={currentDate}
            onDateSelect={setCurrentDate}
            onShowModal={setIsShowModal}
            setSelectedDate={setSelectedDate}
            Data={data}
            setIsEditShowModal={setIsEditShowModal}
            setEditData={setEditData}
          />
        );
    }
  };

  const decryptUser = (encrypted: string | null) => {
    if (!encrypted) return null;
    try {
      const bytes = CryptoJS.AES.decrypt(encrypted, secretKey);
      return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    } catch (error) {
      console.error("Decryption failed", error);
      return null;
    }
  };
  const encryptedUser = localStorage.getItem("user");
  const user = decryptUser(encryptedUser);

  const fetchData = async () => {
    try {
      const body = { userId: user?.id || 0 };
      const response = await getEvent(body);
      setData(response.events);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const goToToday = () => {
    fetchData();
    setCurrentDate(new Date());
  };
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* HEADER — NO CHANGES */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-6 border-b border-orange-100 bg-linear-to-r from-white to-orange-50/30">
        {/* HEADER SECTION */}
        <div className="flex items-center justify-between sm:justify-start space-x-4 sm:space-x-6">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-linear-to-br from-orange-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-200/60 hover:shadow-orange-300/40 transition-all duration-300 hover:scale-105">
              <svg className="w-4 h-4 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-lg sm:text-xl font-bold bg-linear-to-r from-orange-600 to-purple-700 bg-clip-text text-transparent">
              Calendar
            </h1>
          </div>
          <button
            onClick={goToToday}
            className="px-4 py-2 bg-linear-to-br from-yellow-100 to-orange-50 hover:from-yellow-200 hover:to-orange-100 border border-yellow-200 rounded-xl shadow-sm hover:shadow-md text-sm text-amber-900 font-medium transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
          >
            Today
          </button>
        </div>

        {/* NAVIGATION SECTION */}
        <div className="flex items-center justify-center space-x-2">
          {/* Previous Button */}
          <button
            onClick={() => navigate('prev')}
            className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 bg-linear-to-br from-white to-orange-50 hover:from-purple-50 hover:to-orange-100 border border-orange-200/60 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105 hover:border-purple-300 group backdrop-blur-sm cursor-pointer"
          >
            <svg className="w-5 h-5 text-amber-700 group-hover:text-purple-600 transition-all duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Date Display */}
          <div className="bg-linear-to-br from-white/90 to-purple-50/80 backdrop-blur-sm px-5 sm:px-8 py-3 rounded-2xl border border-white/70 shadow-lg shadow-purple-100/40 min-w-40 sm:min-w-[220px] text-center relative overflow-hidden">
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-orange-50/20 to-transparent"></div>
            {/* Accent border */}
            <div className="absolute bottom-0 left-1/4 w-1/2 h-0.5 bg-linear-to-r from-transparent via-orange-400 to-transparent"></div>
            <div className="relative">
              <div className="text-base sm:text-lg font-semibold bg-linear-to-r from-gray-900 via-purple-800 to-orange-700 bg-clip-text text-transparent">
                {view === 'daily' && format(currentDate, 'MMM yyyy')}
                {view === 'weekly' && (
                  <>
                    {format(startOfWeek(currentDate), 'MMM d')} - {format(endOfWeek(currentDate), 'MMM d, yyyy')}
                  </>
                )}
                {view === 'monthly' && format(currentDate, 'MMMM yyyy')}
                {view === 'yearly' && format(currentDate, 'yyyy')}
              </div>
            </div>
          </div>

          {/* Next Button */}
          <button
            onClick={() => navigate('next')}
            className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 bg-linear-to-br from-white to-orange-50 hover:from-purple-50 hover:to-orange-100 border border-orange-200/60 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105 hover:border-purple-300 group backdrop-blur-sm cursor-pointer"
          >
            <svg className="w-5 h-5 text-amber-700 group-hover:text-purple-600 transition-all duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* VIEW SELECTOR */}
        <div className="flex items-center justify-center">
          <select
            value={view}
            onChange={(e) => setView(e.target.value as CalendarView)}
            className="appearance-none bg-linear-to-br from-orange-50 to-yellow-50 hover:from-orange-100 hover:to-yellow-100 border border-orange-200 rounded-lg px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 hover:text-purple-900 focus:outline-none focus:ring-0 focus:ring-orange-400 focus:bg-white transition-all duration-200 cursor-pointer pr-6 sm:pr-8 shadow-sm hover:shadow-md "
          >
            {(['daily', 'weekly', 'monthly', 'yearly'] as CalendarView[]).map(v => (
              <option key={v} value={v} className="bg-white text-gray-800">
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">{renderCurrentView()}</div>

      {isShowModal && (
        <EventModal isShow={isShowModal} setIsShow={setIsShowModal} selectedDate={selectedData} fetchData={fetchData} />
      )}
      {isEditShowModal && (
        <UpdateEvent isShow={isEditShowModal} setIsShow={setIsEditShowModal} fetchData={fetchData} Event={editData} />
      )}
    </div>
  );
};

export default Calendar;