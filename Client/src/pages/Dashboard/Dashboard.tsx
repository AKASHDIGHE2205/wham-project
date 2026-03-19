// Dashboard.tsx - Updated with date range fetching
import { AlertCircle, BarChart2, Bell, Box, Calendar as CalendarIcon, Check, CheckCircle2, ChevronRight, Clock, Package, Plus, X } from 'lucide-react';
import moment from "moment";
import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DataLoading from "../../components/DataLoading";
import { getUserFromStorage } from "../../helper/cryptoUser";
import { getActiveTeams, getActivities } from "../../services/calender/calenderApi";
import type { Activities } from "../Calender-new/Calender";
import WeeklyViewUI from './WeeklyViewUI';

interface Teams {
  id: number;
  name: string;
  description: string;
  manager_id: number;
  status: string;
}

export default function Dashboard() {
  const user = getUserFromStorage();
  const [currentWeekStart, setCurrentWeekStart] = useState(moment().startOf("week"));
  const [activities, setActivities] = useState<Activities[]>([]);
  const [loading, setLoading] = useState(true);
  const [teamsLoading, setTeamsLoading] = useState(true);
  const [showAddStock, setshowAddStock] = useState(false);
  const [teams, setTeams] = useState<Teams[]>([]);

  // Get week date range for API
  const getWeekDateRange = useCallback(() => {
    const weekStart = currentWeekStart.format('YYYY-MM-DD');
    const weekEnd = currentWeekStart.clone().endOf('week').format('YYYY-MM-DD');
    return { weekStart, weekEnd };
  }, [currentWeekStart]);

  const fetchWeekActivities = async () => {
    setLoading(true);
    const { weekStart, weekEnd } = getWeekDateRange();
    const body = {
      userId: user?.id || 0,
      role: user?.role || '',
      startDate: weekStart,
      endDate: weekEnd
    };
    const response = await getActivities(body);
    setLoading(false);
    if (response) {
      setActivities(response?.activities || []);
    }
  };

  const fetchTeams = async () => {
    setTeamsLoading(true);
    const response = await getActiveTeams();
    setTeamsLoading(false);
    if (response) {
      setTeams(response?.Teams || []);
    }
  };

  useEffect(() => {
    fetchWeekActivities();
  }, [currentWeekStart]);

  // Fetch teams on mount
  useEffect(() => {
    fetchTeams();
  }, []);

  const handleWeekChange = (direction: "prev" | "next") => {
    setCurrentWeekStart((prev) =>
      direction === "prev"
        ? moment(prev).subtract(1, "week")
        : moment(prev).add(1, "week")
    );
  };

  const handleSetCurrentWeek = () => {
    setCurrentWeekStart(moment().startOf("week"));
  };

  const getCurrentMonth = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  };

  const currentTime = moment().format("HH:mm:ss");

  if (loading && teamsLoading) {
    return (
      <div className="flex justify-center items-center h-screen w-full">
        <DataLoading />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900" hidden>
              {(() => {
                const hour = parseInt(currentTime.split(":")[0]);
                if (hour >= 5 && hour < 12) return "Good Morning";
                if (hour >= 12 && hour < 17) return "Good Afternoon";
                if (hour >= 17 && hour < 21) return "Good Evening";
                return "Good Night";
              })()}
              , <span className="text-[#3636fa]">{user.firstName}!</span>
            </h1>
            <p className="text-gray-600" hidden>Ready to plan your next mission? 🚀</p>
            <p className="text-slate-700 text-lg font-bold mt-1">
              Here is your weekly overview.
            </p>
          </div>
          <div className="text-sm font-semibold text-slate-700">
            {moment().format("dddd, MMMM D, YYYY")}
          </div>
        </header>

        {(user?.role === 'Master' || user?.role === 'Manager') && (
          <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            {/* Team Analytics */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-indigo-600" /> Team Analytics
              </h2>
              <div className="flex gap-3">
                <input
                  type="month"
                  defaultValue={getCurrentMonth()}
                  className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 bg-white outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                <select className="border border-slate-200 sm:w-40 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 bg-white outline-none focus:ring-2 focus:ring-indigo-500/20">
                  {teams?.map((item) => (
                    <option key={item.id} value={item?.id}>{item?.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Total Samples */}
              <div className="bg-[#f0f4ff] rounded-2xl p-8 flex flex-col items-center justify-center text-center">
                <h3 className="text-indigo-600 font-bold text-sm tracking-wider mb-4">TOTAL SAMPLES (CANS)</h3>
                <div className="text-6xl font-bold text-indigo-900 mb-2">0.0</div>
                <p className="text-indigo-400 text-sm font-medium">Based on 0 pouches</p>
              </div>

              {/* Samples by Occasion */}
              <div className="border border-slate-100 rounded-2xl p-5 flex flex-col">
                <h3 className="text-xs font-bold text-slate-500 tracking-wider mb-4 uppercase">Samples by Occasion</h3>
                <div className="flex-1 min-h-40 -ml-4 border border-gray-600">
                  Here is Graph
                </div>
              </div>

              {/* Demographics */}
              <div className="border border-slate-100 rounded-2xl p-5 flex flex-col">
                <h3 className="text-xs font-bold text-slate-500 tracking-wider mb-4 uppercase">Demographics (Gender)</h3>
                <div className="flex-1 min-h-40 -ml-4 border border-gray-600">
                  Here is Graph
                </div>
                <div className="flex gap-6 text-xs font-medium">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-pink-400 rounded-sm"></div>
                    <span className="text-pink-400">Female</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-blue-500 rounded-sm"></div>
                    <span className="text-blue-500">Male</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-8 space-y-6">
            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard icon={<Clock className="w-5 h-5 text-blue-600" />} bg="bg-blue-50" title="Hours" value="9" />
              <StatCard icon={<Package className="w-5 h-5 text-purple-600" />} bg="bg-purple-50" title="Samples" value="1250" />
              <StatCard
                icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                bg="bg-emerald-50"
                title="Activities"
                value={activities.length.toString()}
              />
              <StatCard icon={<AlertCircle className="w-5 h-5 text-amber-600" />} bg="bg-amber-50" title="Pending" value="1" />
            </div>

            {/* Calendar */}
            <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-indigo-600" /> This Week
                </h2>
                <div className='flex justify-center gap-1 items-center'>
                  <Link
                    className='text-blue-500 underline hover:text-blue-600'
                    to={'/calender'}
                  >
                    View full Calendar
                  </Link>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleWeekChange("prev")}
                      className="rounded-md bg-white/20 hover:bg-white/30 text-black cursor-pointer border border-gray-200 px-1 h-6"
                      disabled={loading}
                    >
                      <ChevronRight className="w-4 h-4 rotate-180" />
                    </button>
                    <button
                      onClick={handleSetCurrentWeek}
                      className="text-xs font-medium cursor-pointer px-2 py-1 bg-[#5555fa] text-white rounded-md"
                      disabled={loading}
                    >
                      Current Week
                    </button>
                    <button
                      onClick={() => handleWeekChange("next")}
                      className="rounded-md bg-white/20 hover:bg-white/30 text-black cursor-pointer border border-gray-200 px-1 h-6"
                      disabled={loading}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              <div>
                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <DataLoading />
                  </div>
                ) : (
                  <WeeklyViewUI
                    events={activities}
                    currentWeekStart={currentWeekStart}
                    isLoading={loading}
                  />
                )}
              </div>
            </section>

            {/* Bottom Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Activity by Occasion */}
              <section className="bg-white rounded-2xl shadow-sm border border-slate-600 p-6">
                <h2 className="text-base font-bold text-slate-800 mb-6">Activity by Occasion</h2>
                <div className="flex flex-col items-center">
                  Here is Graph
                </div>
              </section>

              {/* Performance */}
              <section className="bg-white rounded-2xl shadow-sm border border-slate-600 p-6">
                <h2 className="text-base font-bold text-slate-800 mb-6">Performance</h2>
                <div className="-ml-4">
                  {/* Placeholder for graph */}
                </div>
              </section>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-4 space-y-6">
            {/* Stock Management */}
            <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Box className="w-5 h-5 text-indigo-600" />
                  Stock Management
                </h2>

                <button
                  type="button"
                  onClick={() => setshowAddStock(!showAddStock)}
                  className="border border-slate-200 rounded-lg px-3 py-1 text-sm text-white bg-[#3333ff] cursor-pointer"
                >
                  <span className="flex justify-center items-center gap-1">
                    <Plus size={18} />
                    Add
                  </span>
                </button>
              </div>

              {/* Add Stock Form */}
              {showAddStock && (
                <div className="bg-[#f1f4fc] p-3 w-full max-w-md rounded-md mb-4">
                  <div className="grid grid-cols-12 gap-3 items-end">
                    <div className="col-span-8">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Edition
                      </label>
                      <select className="w-full h-6 px-3 border border-gray-300 rounded-md bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        <option>Cool Mint</option>
                        <option>Bubblegum</option>
                        <option>Red Bull</option>
                        <option>Coffee</option>
                      </select>
                    </div>

                    <div className="col-span-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Qty (Cans)
                      </label>
                      <input
                        type="number"
                        className="w-full h-6 px-3 border border-gray-300 rounded-md bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end items-center gap-4 mt-4">
                    <button
                      type="button"
                      onClick={() => setshowAddStock(false)}
                      className="text-sm text-gray-500 hover:text-gray-700 cursor-pointer h-6"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-5 h-6 rounded-md cursor-pointer"
                    >
                      Submit
                    </button>
                  </div>
                </div>
              )}

              {/* Stock Cards */}
              <div className="grid grid-cols-2 gap-4">
                <StockCard
                  title="Cool Mint"
                  balance="50.0"
                  inVal="50"
                  outVal="0.0"
                  badgeBg="bg-emerald-50"
                  badgeColor="text-emerald-600"
                />
                <StockCard
                  title="Bubblegum"
                  balance="30.0"
                  inVal="30"
                  outVal="0.0"
                  badgeBg="bg-pink-50"
                  badgeColor="text-pink-600"
                />
                <StockCard
                  title="Rage Bull"
                  balance="0.0"
                  inVal="0"
                  outVal="0.0"
                  badgeBg="bg-rose-50"
                  badgeColor="text-rose-600"
                />
                <StockCard
                  title="Coffee"
                  balance="0.0"
                  inVal="0"
                  outVal="0.0"
                  badgeBg="bg-amber-50"
                  badgeColor="text-amber-700"
                />
              </div>
            </section>

            {/* Pending Requests */}
            <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h2 className="text-xs font-bold text-slate-500 tracking-wider mb-4 flex items-center gap-2 uppercase">
                <Clock className="w-4 h-4" /> My Requests
              </h2>
              <div className="border-l-2 border-rose-200 pl-4 py-1 flex justify-between items-center">
                <div>
                  <div className="text-sm font-medium text-slate-800">
                    Sarah Teammate <span className="font-bold">40</span> Rage Bull
                  </div>
                  <div className="text-xs text-slate-400 mt-1">10/2/2024</div>
                </div>
                <div className="flex gap-2">
                  <button className="w-6 h-6 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 transition-colors">
                    <Check className="w-4 h-4" />
                  </button>
                  <button className="w-6 h-6 rounded bg-rose-50 text-rose-600 flex items-center justify-center hover:bg-rose-100 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </section>

            {/* Action Items */}
            <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-md font-bold text-slate-800 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-indigo-600" /> Notification
                </h2>
                <span className="bg-rose-50 text-rose-600 text-xs font-bold px-2 py-1 rounded-full">2</span>
              </div>
              <div className="space-y-3">
                <ActionItem
                  status="APPROVAL NEEDED"
                  date="2026-03-17"
                  title="Waiting for Approval"
                  desc='Sarah Teammate submitted "Football Match Activation".'
                  borderColor="border-amber-200"
                  bgColor="bg-amber-50/50"
                  statusColor="text-amber-600"
                />
                <ActionItem
                  status="REVIEW NEEDED"
                  date="2026-03-16"
                  title="Pending Review"
                  desc='"Finals Week Sampling" by Alex Student is complete.'
                  borderColor="border-blue-200"
                  bgColor="bg-blue-50/50"
                  statusColor="text-blue-600"
                />
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-components
function StatCard({ icon, bg, title, value }: { icon: React.ReactNode, bg: string, title: string, value: string }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${bg}`}>
        {icon}
      </div>
      <div>
        <div className="text-xs font-medium text-slate-500 mb-0.5">{title}</div>
        <div className="text-xl font-bold text-slate-800 leading-none">{value}</div>
      </div>
    </div>
  );
}

function StockCard({ title, balance, inVal, outVal, badgeBg, badgeColor }: { title: string, balance: string, inVal: string, outVal: string, badgeBg: string, badgeColor: string }) {
  return (
    <div className="border border-slate-100 rounded-xl p-4 flex flex-col">
      <div className="flex justify-end mb-2">
        <span className={`text-[10px] px-2 py-0.5 rounded font-bold tracking-wide ${badgeBg} ${badgeColor}`}>
          {title}
        </span>
      </div>
      <div className="mb-4">
        <div className="text-[10px] text-slate-400 font-bold tracking-wider mb-0.5">BALANCE</div>
        <div className="text-xl font-bold text-slate-800 flex items-baseline gap-1">
          {balance} <span className="text-[10px] text-slate-400 font-medium">Cans</span>
        </div>
      </div>
      <div className="flex justify-between text-xs border-t border-slate-50 pt-3 mt-auto">
        <div>
          <div className="text-slate-400 text-[10px] font-medium mb-0.5">In</div>
          <div className="text-emerald-500 font-semibold">+{inVal}</div>
        </div>
        <div className="text-right">
          <div className="text-slate-400 text-[10px] font-medium mb-0.5">Out</div>
          <div className="text-rose-500 font-semibold">-{outVal}</div>
        </div>
      </div>
    </div>
  );
}

function ActionItem({ status, date, title, desc, borderColor, bgColor, statusColor }: { status: string, date: string, title: string, desc: string, borderColor: string, bgColor: string, statusColor: string }) {
  return (
    <div className={`border rounded-xl p-4 ${borderColor} ${bgColor}`}>
      <div className="flex justify-between items-start mb-2">
        <span className={`text-[10px] font-bold tracking-wider ${statusColor}`}>{status}</span>
        <span className="text-[10px] text-slate-400 font-medium">{date}</span>
      </div>
      <h3 className="text-sm font-bold text-slate-800 mb-1">{title}</h3>
      <p className="text-xs text-slate-500">{desc}</p>
    </div>
  );
}