import React from 'react';
import { useNavigate } from 'react-router-dom';
import TravelCalendar from '../components/TravelCalendar';
import {
  Calendar as CalendarIcon,
  Compass,
  FolderOpen,
  Sparkles,
  MapPin,
  Sun,
  ShieldCheck,
  Info
} from 'lucide-react';

const CalendarPage = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-900 rounded-3xl p-8 sm:p-10 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        {/* Decorative blur rings */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-[11px] font-black uppercase tracking-widest text-amber-300 bg-blue-800/80 px-3.5 py-1 rounded-full border border-amber-400/30">
              Dream Ceylon &bull; Smart Lanka Tourism Planner
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight flex items-center gap-3">
            <CalendarIcon size={34} className="text-amber-400" />
            Smart Travel Calendar & Schedule
          </h1>

          <p className="text-blue-200 text-xs sm:text-sm mt-2 max-w-2xl leading-relaxed">
            Manage your Sri Lankan travel schedule in one unified view. Track daily sightseeing stops, guide bookings, and hotel stays synchronized with official Sri Lankan Public & Full Moon Poya holidays.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => navigate('/planner?tab=saved')}
            className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-2xl font-bold text-xs flex items-center gap-2 transition backdrop-blur-sm"
          >
            <FolderOpen size={16} /> Saved Plans
          </button>
          <button
            type="button"
            onClick={() => navigate('/planner')}
            className="px-5 py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-blue-950 rounded-2xl font-extrabold text-xs flex items-center gap-2 shadow-lg transition"
          >
            <Compass size={16} /> Open Smart Planner
          </button>
        </div>
      </div>

      {/* Cultural & Travel Calendar Tips Cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0">
            <Sun size={20} />
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-gray-900">Full Moon Poya Holidays</h4>
            <p className="text-[11px] text-gray-500 mt-0.5 leading-normal">
              Monthly Buddhist sacred days. Great for temple cultural observances; banks & state offices are closed.
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center flex-shrink-0">
            <Compass size={20} />
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-gray-900">Synchronized Day Plans</h4>
            <p className="text-[11px] text-gray-500 mt-0.5 leading-normal">
              Click any calendar date to see destination stops, travel times, certified guides, and hotel details.
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-gray-900">Trip Persistence</h4>
            <p className="text-[11px] text-gray-500 mt-0.5 leading-normal">
              Add, edit, and delete travel itineraries with immediate live updates to your MongoDB travel profile.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Travel Calendar Component */}
      <TravelCalendar
        onSelectPlanToEdit={() => {
          navigate('/planner?tab=saved');
        }}
      />
    </div>
  );
};

export default CalendarPage;
