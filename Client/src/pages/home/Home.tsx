import { CalendarDays, ChevronLeft, ChevronRight, Rocket, Target, Users } from 'lucide-react';
import moment from 'moment';
import { Link } from 'react-router-dom';
import { getUserFromStorage } from '../../helper/cryptoUser';

export default function Home() {
  const user = getUserFromStorage();
  const currentTime = moment().format("HH:mm:ss");

  return (
    <div className="min-h-screen relative overflow-hidden text-slate-800 bg-linear-to-r from-purple-50 to-indigo-50">

      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-4 lg:px-8 flex flex-col gap-6">
        {/* Greeting Pill */}
        <div className="flex justify-start mt-4" data-aos="fade-right">
          <div>
            <span className='text-2xl sm:text-4xl font-bold'> {(() => {
              const hour = parseInt(currentTime.split(":")[0]);
              if (hour >= 5 && hour < 12) return "Good Morning";
              if (hour >= 12 && hour < 17) return "Good Afternoon";
              if (hour >= 17 && hour < 21) return "Good Evening";
              return "Good Night";
            })()},
              <span className='text-[#4f3fe0]'> {user?.firstName}!</span>
            </span>
            <p className="text-gray-600">Ready to plan your next mission? 🚀</p>
          </div>
        </div>

        {/* Hero Section */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-2">
          {/* Left: Text Content */}
          <div className="flex-1 max-w-2xl" data-aos="fade-down">
            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.1] mb-6">
              Your Mission<br />Command Center
            </h1>
            <p className="text-lg text-slate-600 mb-8 max-w-md leading-relaxed">
              Plan, execute, and track your activities with precision and efficiency.
            </p>
            {(user?.role === 'User' || user?.role === 'Master' || user?.role === 'Admin' || user?.role === 'Manager') && (
              <Link
                to={'/dashboard'}
                className="bg-linear-to-r from-[#5b48ff] to-[#3f2aff] text-white px-8 py-4 rounded-full font-medium text-lg shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all hover:scale-105">
                Go to Dashboard
              </Link>
            )}
          </div>

          {/* Right: Illustration Mockup */}
          <div className="flex-1 relative w-full max-w-2xl aspect-4/3" data-aos="fade-left">{/* hidden md:block */}
            {/* Main Screen Mockup */}
            <div className="absolute inset-12 bg-slate-800 rounded-3xl shadow-2xl overflow-hidden border-4 border-slate-700/50 transform perspective-1000 rotateY-[-5deg] rotateX-[5deg]">
              <div className="absolute inset-0 bg-linear-to-br from-blue-500/10 to-purple-500/10"></div>
              {/* Abstract dashboard elements inside */}
              <div className="p-6 flex flex-col gap-4 h-full">
                <div className="flex gap-4">
                  <div className="h-24 flex-1 bg-slate-700/50 rounded-xl border border-slate-600/50"></div>
                  <div className="h-24 flex-1 bg-slate-700/50 rounded-xl border border-slate-600/50"></div>
                </div>
                <div className="flex-1 bg-slate-700/50 rounded-xl border border-slate-600/50"></div>
              </div>
            </div>

            {/* Floating Widget 1: Missions */}
            <div className="absolute top-4 left-0 bg-white/90 backdrop-blur-md p-5 rounded-2xl shadow-xl border border-white/50 w-64 transform -rotate-2 hover:rotate-0 transition-transform hidden md:block">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Missions</div>
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-3xl font-bold text-slate-800">45</div>
                  <div className="text-sm text-slate-500">Active</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-slate-800">120</div>
                  <div className="text-sm text-slate-500">Completed</div>
                </div>
              </div>
              {/* Decorative wave */}
              <div className="mt-4 h-8 w-full bg-linear-to-r from-blue-50 to-purple-50 rounded-lg relative overflow-hidden">
                <div className="absolute bottom-0 left-0 w-full h-4 bg-blue-400/20 rounded-t-full blur-sm"></div>
              </div>
            </div>

            {/* Floating Widget 2: Team Progress */}
            <div className="absolute bottom-24 -left-5 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/50 w-56 transform rotate-3 hover:rotate-0 transition-transform">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Team Progress</div>
              <div className="h-2 w-full bg-slate-100 rounded-full mb-4 overflow-hidden">
                <div className="h-full bg-linear-to-r from-cyan-400 to-blue-500 w-3/4 rounded-full"></div>
              </div>
              <div className="flex items-end gap-2 h-12">
                {[40, 70, 45, 90, 65, 30, 80].map((h, i) => (
                  <div key={i} className="flex-1 bg-indigo-50 rounded-t-sm" style={{ height: `${h}%` }}>
                    <div className="w-full bg-indigo-400 rounded-t-sm" style={{ height: '100%', opacity: h / 100 }}></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating Widget 3: Circular Progress */}
            <div className="absolute top-16 right-4 bg-white/90 backdrop-blur-md p-4 rounded-3xl shadow-xl border border-white/50 w-24 h-24 flex items-center justify-center transform rotate-6 hover:rotate-0 transition-transform ">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path className="text-slate-100" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="text-blue-500" strokeWidth="3" strokeDasharray="88, 100" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <span className="absolute text-sm font-bold text-slate-700">88%</span>
              </div>
            </div>

            {/* Floating Widget 4: Calendar */}
            <div className="absolute bottom-12 right-0 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/50 w-48 transform -rotate-3 hover:rotate-0 transition-transform">
              <div className="flex justify-between items-center mb-3">
                <div className="text-xs font-semibold text-slate-800">Calendar</div>
                <div className="flex gap-1">
                  <ChevronLeft className="w-3 h-3 text-slate-400" />
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                </div>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center mb-1">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <div key={i} className="text-[8px] text-slate-400 font-medium">{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-1 text-center">
                {Array.from({ length: 28 }).map((_, i) => (
                  <div key={i} className={`text-[10px] w-5 h-5 flex items-center justify-center rounded-full ${i === 14 ? 'bg-purple-500 text-white' : 'text-slate-600'}`}>
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>

            {/* Floating Widget 5: Avatars */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-xl border border-white/50 flex items-center gap-2">
              <div className="flex -space-x-2">
                <img className="w-8 h-8 rounded-full border-2 border-white" src="https://i.pravatar.cc/100?img=1" alt="User1" />
                <img className="w-8 h-8 rounded-full border-2 border-white" src="https://i.pravatar.cc/100?img=2" alt="User2" />
                <img className="w-8 h-8 rounded-full border-2 border-white" src="https://i.pravatar.cc/100?img=3" alt="User3" />
                <img className="w-8 h-8 rounded-full border-2 border-white" src="https://i.pravatar.cc/100?img=4" alt="User4" />
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 ml-1" />
            </div>
          </div>
        </div>

        {/* Core Capabilities Section */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              Core Capabilities
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:-translate-y-1 transition-transform duration-300">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center mb-6">
                <Rocket className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Mission Planning</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Set goals and allocate resources with clarity.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:-translate-y-1 transition-transform duration-300">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center mb-6">
                <CalendarDays className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Smart Scheduling</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Automate tasks and manage your time efficiently.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:-translate-y-1 transition-transform duration-300">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Team Collaboration</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Stay connected and aligned with your team.
              </p>
            </div>

            {/* Card 4 */}
            <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:-translate-y-1 transition-transform duration-300">
              <div className="w-12 h-12 rounded-2xl bg-pink-100 flex items-center justify-center mb-6">
                <Target className="w-6 h-6 text-pink-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Goal Tracking</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Track progress and measure success with KPIs.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
