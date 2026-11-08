import React, { useState, useEffect, useMemo, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Sparkles,
  Sun,
  Compass,
  Car,
  Utensils,
  X,
  Info,
  ExternalLink,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FolderOpen,
  CalendarDays,
  Luggage,
  ShieldAlert,
  Users
} from 'lucide-react';

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const toLocalDateKey = (dateInput) => {
  if (!dateInput) return null;
  const d = new Date(dateInput);
  if (Number.isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const TravelCalendar = ({ activeItinerary = null, onSelectPlanToEdit = null }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const initialDate = useMemo(() => {
    if (activeItinerary?.dates?.start) {
      const d = new Date(activeItinerary.dates.start);
      if (!Number.isNaN(d.getTime())) return d;
    }
    return new Date();
  }, [activeItinerary]);

  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth() + 1); // 1-12
  const [selectedDateKey, setSelectedDateKey] = useState(toLocalDateKey(initialDate));
  const [holidays, setHolidays] = useState([]);
  const [serverScheduledDays, setServerScheduledDays] = useState([]);
  const [upcomingPlans, setUpcomingPlans] = useState([]);
  const [allDestinations, setAllDestinations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Modals state
  const [selectedActivityModal, setSelectedActivityModal] = useState(null);
  const [isAddTripModalOpen, setIsAddTripModalOpen] = useState(false);
  const [deleteConfirmPlanId, setDeleteConfirmPlanId] = useState(null);

  // Success / Error toast feedback
  const [toastMessage, setToastMessage] = useState(null);

  // New trip modal form
  const [newTripForm, setNewTripForm] = useState({
    title: '',
    startDate: '',
    days: 3,
    travelers: 2,
    transportType: 'Car',
    packageLevel: 'Standard',
    selectedDestinations: []
  });

  const showToast = (text, type = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Sync month/year when activeItinerary start date changes
  useEffect(() => {
    if (activeItinerary?.dates?.start) {
      const d = new Date(activeItinerary.dates.start);
      if (!Number.isNaN(d.getTime())) {
        setCurrentYear(d.getFullYear());
        setCurrentMonth(d.getMonth() + 1);
        setSelectedDateKey(toLocalDateKey(d));
      }
    }
  }, [activeItinerary?.dates?.start]);

  // Load calendar data (holidays + scheduled days)
  const fetchCalendarData = async (year, month) => {
    setLoading(true);
    try {
      const res = await api.get(`/calendar/${year}/${month}`);
      const payload = res.data?.data || {};
      setHolidays(payload.holidays || []);
      setServerScheduledDays(payload.scheduledDays || []);
    } catch (err) {
      console.error('Error loading calendar data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load upcoming saved plans for logged-in user
  const fetchUserPlans = async () => {
    if (!user) return;
    try {
      const res = await api.get('/itineraries');
      setUpcomingPlans(res.data?.data || []);
    } catch (err) {
      // User may not have itineraries yet
    }
  };

  // Load destinations for the quick schedule dropdown
  const fetchDestinations = async () => {
    try {
      const res = await api.get('/destinations');
      setAllDestinations(res.data?.data || []);
    } catch (err) {
      console.error('Error fetching destinations:', err);
    }
  };

  useEffect(() => {
    fetchCalendarData(currentYear, currentMonth);
  }, [currentYear, currentMonth]);

  useEffect(() => {
    fetchUserPlans();
    fetchDestinations();
  }, [user]);

  // Combined Schedule Mapping
  const combinedScheduleByDate = useMemo(() => {
    const map = {};

    const addDayEntry = (entry) => {
      const key = entry.dateKey || toLocalDateKey(entry.date);
      if (!key) return;
      if (!map[key]) map[key] = [];
      const exists = map[key].some(
        (e) =>
          (e.planId && entry.planId && e.planId.toString() === entry.planId.toString()) ||
          (e.dayNumber === entry.dayNumber && e.planTitle === entry.planTitle)
      );
      if (!exists) {
        map[key].push(entry);
      }
    };

    // 1. Add active in-memory itinerary
    if (activeItinerary && Array.isArray(activeItinerary.dailyItinerary)) {
      activeItinerary.dailyItinerary.forEach((dayItem) => {
        if (!dayItem.date) return;
        const dObj = new Date(dayItem.date);
        if (dObj.getFullYear() === currentYear && dObj.getMonth() + 1 === currentMonth) {
          addDayEntry({
            planId: activeItinerary._id || 'draft',
            planTitle: activeItinerary.title || 'Active Smart Itinerary',
            packageLevel: activeItinerary.preferences?.packageLevel || 'Standard',
            transportType: activeItinerary.transportType || 'Car',
            travelers: activeItinerary.travelers || 2,
            dayNumber: dayItem.dayNumber,
            date: dayItem.date,
            dateKey: toLocalDateKey(dayItem.date),
            dayTitle: dayItem.title,
            districtFocus: dayItem.districtFocus,
            activities: dayItem.activities || [],
            isActiveDraft: !activeItinerary._id
          });
        }
      });
    }

    // 2. Add saved plans from MongoDB
    serverScheduledDays.forEach((sDay) => {
      addDayEntry(sDay);
    });

    return map;
  }, [activeItinerary, serverScheduledDays, currentYear, currentMonth]);

  // Map holidays by YYYY-MM-DD
  const holidaysByDate = useMemo(() => {
    const map = {};
    holidays.forEach((h) => {
      const key = h.dateKey || new Date(h.date).toISOString().split('T')[0];
      if (!map[key]) map[key] = [];
      map[key].push(h);
    });
    return map;
  }, [holidays]);

  // Build calendar grid cells
  const calendarCells = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1);
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    const startWeekday = firstDayOfMonth.getDay();

    const cells = [];
    for (let i = 0; i < startWeekday; i++) {
      cells.push({ isPadding: true, key: `pad-start-${i}` });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      cells.push({
        isPadding: false,
        day,
        dateKey,
        holidays: holidaysByDate[dateKey] || [],
        scheduledEntries: combinedScheduleByDate[dateKey] || []
      });
    }

    return cells;
  }, [currentYear, currentMonth, holidaysByDate, combinedScheduleByDate]);

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleJumpToToday = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth() + 1);
    setSelectedDateKey(toLocalDateKey(now));
  };

  // Open "Add Trip" modal with prefilled date
  const handleOpenAddTripModal = (prefillDate = null) => {
    if (!user) {
      navigate('/login');
      return;
    }
    const targetDate = prefillDate || selectedDateKey || toLocalDateKey(new Date());
    setNewTripForm({
      title: 'Sri Lanka Dream Tour',
      startDate: targetDate,
      days: 3,
      travelers: 2,
      transportType: 'Car',
      packageLevel: 'Standard',
      selectedDestinations: allDestinations.slice(0, 3).map((d) => d._id)
    });
    setIsAddTripModalOpen(true);
  };

  // Submit new trip
  const handleCreateTripSubmit = async (e) => {
    e.preventDefault();
    if (!newTripForm.startDate) {
      alert('Please select a start date.');
      return;
    }
    if (newTripForm.selectedDestinations.length === 0) {
      alert('Please select at least one destination.');
      return;
    }

    setActionLoading(true);
    try {
      const payload = {
        title: newTripForm.title || `Sri Lanka ${newTripForm.days}-Day Tour`,
        days: Number(newTripForm.days),
        travelers: Number(newTripForm.travelers),
        startDate: newTripForm.startDate,
        dates: {
          start: new Date(newTripForm.startDate)
        },
        transportType: newTripForm.transportType,
        stops: newTripForm.selectedDestinations,
        preferences: {
          packageLevel: newTripForm.packageLevel,
          transportation: newTripForm.transportType
        }
      };

      const res = await api.post('/itineraries', payload);
      if (res.data?.success) {
        setIsAddTripModalOpen(false);
        showToast('New tour plan successfully scheduled in your calendar!');
        // Refresh calendar & saved plans
        await fetchCalendarData(currentYear, currentMonth);
        await fetchUserPlans();
      }
    } catch (err) {
      console.error('Error creating itinerary:', err);
      alert(err.response?.data?.error || 'Failed to save travel plan. Please check inputs.');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete trip with confirmation
  const handleDeletePlan = async (planId) => {
    if (!planId) return;
    setActionLoading(true);
    try {
      await api.delete(`/itineraries/${planId}`);
      setDeleteConfirmPlanId(null);
      showToast('Tour plan removed from calendar.');
      await fetchCalendarData(currentYear, currentMonth);
      await fetchUserPlans();
    } catch (err) {
      console.error('Error deleting itinerary:', err);
      alert(err.response?.data?.error || 'Failed to delete plan.');
    } finally {
      setActionLoading(false);
    }
  };

  const selectedDayHolidays = holidaysByDate[selectedDateKey] || [];
  const selectedDaySchedules = combinedScheduleByDate[selectedDateKey] || [];
  const totalScheduledDaysInMonth = Object.keys(combinedScheduleByDate).length;

  return (
    <div className="space-y-8">
      {/* Toast Feedback */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 p-4 rounded-2xl shadow-xl flex items-center gap-3 text-sm font-bold text-white transition-all transform animate-bounce ${
            toastMessage.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
          }`}
        >
          <CheckCircle2 size={20} />
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Calendar Header & Month Navigation */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              Interactive Travel Itinerary Calendar
            </span>
            <span className="text-xs font-semibold text-gray-500">
              • Sri Lanka Edition
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-2 flex items-center gap-2.5">
            <CalendarIcon size={28} className="text-blue-900" />
            {MONTH_NAMES[currentMonth - 1]} {currentYear}
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-2xl">
            Track daily sightseeing schedules, hotel nights, guide activities, and official Sri Lankan Public & Full Moon Poya holidays.
          </p>
        </div>

        {/* Action Controls & Navigation */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-100 text-gray-700 transition"
            title="Previous Month"
          >
            <ChevronLeft size={18} />
          </button>

          <select
            value={currentMonth}
            onChange={(e) => setCurrentMonth(Number(e.target.value))}
            className="px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 bg-gray-50 cursor-pointer focus:ring-2 focus:ring-blue-500"
          >
            {MONTH_NAMES.map((mName, idx) => (
              <option key={mName} value={idx + 1}>
                {mName}
              </option>
            ))}
          </select>

          <select
            value={currentYear}
            onChange={(e) => setCurrentYear(Number(e.target.value))}
            className="px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 bg-gray-50 cursor-pointer focus:ring-2 focus:ring-blue-500"
          >
            {[2025, 2026, 2027].map((yr) => (
              <option key={yr} value={yr}>
                {yr}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleNextMonth}
            className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-100 text-gray-700 transition"
            title="Next Month"
          >
            <ChevronRight size={18} />
          </button>

          <button
            type="button"
            onClick={handleJumpToToday}
            className="px-4 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 font-bold text-xs transition border border-blue-200"
          >
            Today
          </button>

          <button
            type="button"
            onClick={() => handleOpenAddTripModal()}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition flex items-center gap-1.5"
          >
            <Plus size={15} /> Schedule Trip
          </button>
        </div>
      </div>

      {/* Visual Color Legend Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-gray-50 px-6 py-3.5 rounded-2xl border border-gray-200 text-xs">
        <div className="flex flex-wrap items-center gap-5">
          <span className="flex items-center gap-1.5 font-semibold text-gray-700">
            <span className="w-3 h-3 rounded-full bg-blue-600 inline-block" />
            Planned Tour Activity
          </span>
          <span className="flex items-center gap-1.5 font-semibold text-gray-700">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
            Active / Confirmed Itinerary
          </span>
          <span className="flex items-center gap-1.5 font-semibold text-gray-700">
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
            Full Moon Poya Holiday (Sri Lanka)
          </span>
          <span className="flex items-center gap-1.5 font-semibold text-gray-700">
            <span className="w-3 h-3 rounded-full bg-purple-600 inline-block" />
            National / Public Holiday
          </span>
        </div>
        <div className="text-gray-600 font-medium text-xs">
          <strong>{totalScheduledDaysInMonth}</strong> scheduled travel day(s) &bull;{' '}
          <strong>{holidays.length}</strong> official Sri Lankan holidays
        </div>
      </div>

      {/* Main Grid: Calendar Month Grid (Col 2/3) + Selected Date Details Panel (Col 1/3) */}
      <div className="grid lg:grid-cols-12 gap-8">
        {/* Calendar Grid */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            {/* Weekday Column Headers */}
            <div className="grid grid-cols-7 bg-slate-900 text-white text-center py-3.5 text-xs font-extrabold uppercase tracking-wider">
              {WEEKDAYS.map((day) => (
                <div key={day}>{day}</div>
              ))}
            </div>

            {loading ? (
              <div className="py-32 text-center text-gray-500 text-sm">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-900 mx-auto mb-3" />
                Synchronizing travel calendar & Sri Lankan holidays...
              </div>
            ) : (
              <div className="grid grid-cols-7 border-t border-gray-100">
                {calendarCells.map((cell) => {
                  if (cell.isPadding) {
                    return (
                      <div
                        key={cell.key}
                        className="min-h-[120px] bg-gray-50/50 border-b border-r border-gray-100"
                      />
                    );
                  }

                  const isSelected = selectedDateKey === cell.dateKey;
                  const isToday = toLocalDateKey(new Date()) === cell.dateKey;
                  const hasTravel = cell.scheduledEntries.length > 0;
                  const hasHoliday = cell.holidays.length > 0;

                  // Flatten activities
                  const cellActivities = cell.scheduledEntries.flatMap((e) =>
                    (e.activities || []).map((a) => ({
                      ...a,
                      dayNumber: e.dayNumber,
                      planTitle: e.planTitle
                    }))
                  );

                  return (
                    <div
                      key={cell.dateKey}
                      onClick={() => setSelectedDateKey(cell.dateKey)}
                      className={`min-h-[120px] p-2 sm:p-2.5 border-b border-r border-gray-100 cursor-pointer transition flex flex-col justify-between ${
                        isSelected
                          ? 'bg-blue-50/80 ring-2 ring-inset ring-blue-600'
                          : hasTravel
                            ? 'bg-emerald-50/20 hover:bg-blue-50/40'
                            : hasHoliday
                              ? 'bg-amber-50/20 hover:bg-amber-50/40'
                              : 'bg-white hover:bg-gray-50'
                      }`}
                    >
                      {/* Top Row: Date Number + Badges */}
                      <div className="flex justify-between items-start">
                        <span
                          className={`w-7 h-7 rounded-full text-xs font-black flex items-center justify-center transition ${
                            isSelected
                              ? 'bg-blue-600 text-white shadow-md'
                              : isToday
                                ? 'bg-blue-100 text-blue-900 border border-blue-300 font-extrabold'
                                : 'text-gray-700'
                          }`}
                        >
                          {cell.day}
                        </span>

                        {hasTravel && (
                          <span className="text-[10px] font-extrabold bg-blue-600 text-white px-1.5 py-0.5 rounded-md shadow-xs">
                            Day {cell.scheduledEntries[0].dayNumber}
                          </span>
                        )}
                      </div>

                      {/* Middle & Bottom: Holiday Badges & Scheduled Events */}
                      <div className="space-y-1 mt-1.5 overflow-hidden">
                        {cell.holidays.map((hol, hIdx) => (
                          <div
                            key={hIdx}
                            title={`${hol.name} (${hol.type})`}
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded truncate border ${
                              hol.isPoya
                                ? 'bg-amber-100 text-amber-900 border-amber-300'
                                : 'bg-purple-100 text-purple-900 border-purple-300'
                            }`}
                          >
                            {hol.isPoya ? '🌕 ' : '🇱🇰 '}
                            {hol.name}
                          </div>
                        ))}

                        {cellActivities.slice(0, 2).map((act, aIdx) => (
                          <div
                            key={aIdx}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDateKey(cell.dateKey);
                              setSelectedActivityModal(act);
                            }}
                            className={`text-[10px] font-semibold px-1.5 py-0.5 rounded truncate border transition cursor-pointer hover:shadow-xs ${
                              act.type === 'visit'
                                ? 'bg-blue-600 text-white border-blue-700 hover:bg-blue-700'
                                : act.type === 'meal'
                                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                  : 'bg-slate-100 text-slate-800 border-slate-200'
                            }`}
                          >
                            {act.startTime?.replace(' AM', 'a').replace(' PM', 'p')}{' '}
                            {act.destinationName || act.title}
                          </div>
                        ))}

                        {cellActivities.length > 2 && (
                          <div className="text-[10px] font-bold text-blue-700 pl-1">
                            +{cellActivities.length - 2} more activities
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Selected Date Details Panel (Right Drawer) */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-gray-200 p-6 sm:p-7 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-6">
            {/* Header with Date formatting */}
            <div className="border-b border-gray-100 pb-4 flex justify-between items-start">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  Daily Itinerary & Schedule
                </span>
                <h3 className="text-xl font-black text-gray-900 mt-1">
                  {selectedDateKey
                    ? new Date(`${selectedDateKey}T00:00:00`).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })
                    : 'Select a Date'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => handleOpenAddTripModal(selectedDateKey)}
                className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 transition"
                title="Add event on this date"
              >
                <Plus size={18} />
              </button>
            </div>

            {/* Sri Lankan Public Holidays on this date */}
            {selectedDayHolidays.length > 0 && (
              <div className="space-y-2.5">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                  <Sun size={14} className="text-amber-500" /> Sri Lankan Public Holiday
                </h4>
                {selectedDayHolidays.map((hol, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-2xl border ${
                      hol.isPoya
                        ? 'bg-amber-50 border-amber-200 text-amber-950'
                        : 'bg-purple-50 border-purple-200 text-purple-950'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <span className="font-bold text-sm">
                        {hol.isPoya ? '🌕 ' : '🇱🇰 '}
                        {hol.name}
                      </span>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-white/80 border border-current">
                        {hol.type}
                      </span>
                    </div>
                    {hol.description && (
                      <p className="text-xs opacity-90 mt-1.5 leading-relaxed">
                        {hol.description}
                      </p>
                    )}
                    {hol.isPoya && (
                      <p className="text-[11px] font-semibold text-amber-900 mt-2 pt-1.5 border-t border-amber-200/60">
                        Temple Travel Advisory: Modest white attire is recommended when visiting heritage temples & stupas.
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Scheduled Trips / Activities on Selected Date */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                <Compass size={14} className="text-blue-600" /> Scheduled Travel Activities
              </h4>

              {selectedDaySchedules.length === 0 ? (
                <div className="text-center py-10 px-4 bg-gray-50/80 rounded-2xl border border-dashed border-gray-200 space-y-3">
                  <CalendarIcon size={36} className="mx-auto text-gray-300" />
                  <div>
                    <p className="text-sm font-bold text-gray-800">
                      No Scheduled Trips on This Date
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Ready to explore Sri Lanka? Plan an itinerary or add stops for this day.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenAddTripModal(selectedDateKey)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition shadow-sm"
                  >
                    <Plus size={14} /> Schedule Trip for This Date
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedDaySchedules.map((sched, sIdx) => (
                    <div
                      key={sIdx}
                      className="rounded-2xl border border-blue-200 bg-blue-50/30 p-4 space-y-3"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase bg-blue-600 text-white px-2 py-0.5 rounded-full">
                              Day {sched.dayNumber}
                            </span>
                            <span className="text-[10px] font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full">
                              {sched.packageLevel} Tier
                            </span>
                          </div>
                          <h5 className="font-extrabold text-gray-900 text-sm mt-1">
                            {sched.dayTitle || sched.planTitle}
                          </h5>
                          {sched.districtFocus && (
                            <span className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                              <MapPin size={11} /> {sched.districtFocus}
                            </span>
                          )}
                        </div>

                        {/* Plan Actions: Edit / Delete */}
                        <div className="flex items-center gap-2">
                          {onSelectPlanToEdit && sched.planId && sched.planId !== 'draft' && (
                            <button
                              type="button"
                              onClick={() => onSelectPlanToEdit(sched.planId)}
                              className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                            >
                              Edit <ExternalLink size={12} />
                            </button>
                          )}
                          {sched.planId && sched.planId !== 'draft' && (
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmPlanId(sched.planId)}
                              className="text-gray-400 hover:text-red-600 p-1 transition"
                              title="Delete this itinerary"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Activities List */}
                      <div className="space-y-2">
                        {(sched.activities || []).map((act, aIdx) => (
                          <div
                            key={aIdx}
                            onClick={() =>
                              setSelectedActivityModal({
                                ...act,
                                dayNumber: sched.dayNumber,
                                dateKey: selectedDateKey,
                                planTitle: sched.planTitle
                              })
                            }
                            className="bg-white p-3 rounded-xl border border-gray-200 hover:border-blue-400 cursor-pointer transition shadow-xs"
                          >
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-extrabold text-blue-900 flex items-center gap-1">
                                <Clock size={12} className="text-blue-600" />
                                {act.startTime} – {act.endTime}
                              </span>
                              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                                {act.type}
                              </span>
                            </div>
                            <p className="font-bold text-gray-900 text-xs mt-1.5">{act.title}</p>
                            {act.district && (
                              <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                                <MapPin size={10} /> {act.district}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Sri Lankan Holidays list for month */}
          {holidays.length > 0 && (
            <div className="pt-4 border-t border-gray-100">
              <span className="text-[11px] font-bold uppercase text-gray-400 block mb-2">
                {MONTH_NAMES[currentMonth - 1]} Holidays ({holidays.length})
              </span>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {holidays.map((h, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedDateKey(h.dateKey)}
                    className="w-full text-left flex justify-between items-center text-xs p-2 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200 transition"
                  >
                    <span className="font-medium text-gray-800 truncate">
                      {h.isPoya ? '🌕 ' : '🇱🇰 '}
                      {h.name}
                    </span>
                    <span className="text-[11px] font-bold text-gray-500 ml-2 flex-shrink-0">
                      {new Date(h.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Trips Management Section */}
      {user && upcomingPlans.length > 0 && (
        <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                My Saved Itineraries
              </span>
              <h3 className="text-xl font-extrabold text-gray-900 mt-2">
                Your Upcoming Sri Lankan Journeys
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Manage your scheduled tours, view full itineraries, or plan new routes.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/planner')}
              className="px-4 py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
            >
              <Compass size={15} /> Create in Smart Planner
            </button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {upcomingPlans.map((plan) => {
              const startFormatted = plan.dates?.start
                ? new Date(plan.dates.start).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })
                : 'Flexible Date';

              return (
                <div
                  key={plan._id}
                  className="rounded-2xl border border-gray-200 bg-gray-50/50 hover:bg-white hover:border-blue-300 p-5 transition flex flex-col justify-between space-y-4 shadow-xs"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-bold uppercase bg-blue-100 text-blue-900 px-2.5 py-0.5 rounded-full">
                        {plan.days || 3} Days • {plan.transportType || 'Car'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmPlanId(plan._id)}
                        className="text-gray-400 hover:text-red-600 transition p-1"
                        title="Delete Plan"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <h4 className="font-extrabold text-gray-900 text-base">
                      {plan.title || 'Sri Lanka Tour Plan'}
                    </h4>

                    <div className="text-xs text-gray-600 flex items-center gap-1.5">
                      <CalendarDays size={14} className="text-blue-600" />
                      <span>Starts {startFormatted}</span>
                    </div>

                    {/* Destination tags */}
                    {Array.isArray(plan.stops) && plan.stops.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {plan.stops.slice(0, 3).map((stop, sIdx) => (
                          <span
                            key={sIdx}
                            className="text-[10px] font-semibold bg-white border border-gray-200 text-gray-700 px-2 py-0.5 rounded-md"
                          >
                            {typeof stop === 'object' ? stop.name : 'Destination'}
                          </span>
                        ))}
                        {plan.stops.length > 3 && (
                          <span className="text-[10px] font-bold text-gray-400">
                            +{plan.stops.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-gray-200/80 flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        if (plan.dates?.start) {
                          const d = new Date(plan.dates.start);
                          setCurrentYear(d.getFullYear());
                          setCurrentMonth(d.getMonth() + 1);
                          setSelectedDateKey(toLocalDateKey(d));
                        }
                      }}
                      className="font-bold text-blue-700 hover:underline flex items-center gap-1"
                    >
                      Show on Calendar &rarr;
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/planner?tab=saved')}
                      className="font-bold text-gray-600 hover:text-gray-900"
                    >
                      Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL: Quick Add / Schedule Trip */}
      {isAddTripModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-lg w-full overflow-hidden p-6 sm:p-8 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                  Quick Travel Scheduler
                </span>
                <h3 className="text-xl font-extrabold text-gray-900 mt-1">
                  Schedule New Sri Lanka Tour
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddTripModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateTripSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Trip Title
                </label>
                <input
                  type="text"
                  required
                  value={newTripForm.title}
                  onChange={(e) => setNewTripForm({ ...newTripForm, title: e.target.value })}
                  placeholder="e.g. Hill Country & Tea Trails Tour"
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={newTripForm.startDate}
                    onChange={(e) => setNewTripForm({ ...newTripForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Duration (Days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="14"
                    required
                    value={newTripForm.days}
                    onChange={(e) => setNewTripForm({ ...newTripForm, days: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Transport Type
                  </label>
                  <select
                    value={newTripForm.transportType}
                    onChange={(e) => setNewTripForm({ ...newTripForm, transportType: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl bg-white"
                  >
                    <option value="Car">Private Car</option>
                    <option value="Van">Passenger Van</option>
                    <option value="SUV">Luxury SUV</option>
                    <option value="Train">Scenic Train</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Package Tier
                  </label>
                  <select
                    value={newTripForm.packageLevel}
                    onChange={(e) => setNewTripForm({ ...newTripForm, packageLevel: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl bg-white"
                  >
                    <option value="Standard">Standard</option>
                    <option value="Premium">Premium</option>
                    <option value="Basic">Basic</option>
                  </select>
                </div>
              </div>

              {/* Destination Selector */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Select Destinations ({newTripForm.selectedDestinations.length} selected)
                </label>
                <div className="max-h-36 overflow-y-auto border border-gray-200 rounded-xl p-2 grid grid-cols-2 gap-1.5 bg-gray-50/50">
                  {allDestinations.map((dest) => {
                    const isChecked = newTripForm.selectedDestinations.includes(dest._id);
                    return (
                      <label
                        key={dest._id}
                        className={`flex items-center gap-2 p-1.5 rounded-lg text-xs cursor-pointer border transition ${
                          isChecked
                            ? 'bg-blue-50 border-blue-300 text-blue-900 font-bold'
                            : 'bg-white border-transparent text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewTripForm({
                                ...newTripForm,
                                selectedDestinations: [...newTripForm.selectedDestinations, dest._id]
                              });
                            } else {
                              setNewTripForm({
                                ...newTripForm,
                                selectedDestinations: newTripForm.selectedDestinations.filter(
                                  (id) => id !== dest._id
                                )
                              });
                            }
                          }}
                          className="w-3.5 h-3.5 text-blue-600 rounded"
                        />
                        <span className="truncate">{dest.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddTripModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-extrabold shadow-md transition"
                >
                  {actionLoading ? 'Saving...' : 'Confirm & Schedule Trip'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Delete Confirmation */}
      {deleteConfirmPlanId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-sm w-full p-6 text-center space-y-4">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
              <ShieldAlert size={26} />
            </div>
            <div>
              <h4 className="text-lg font-extrabold text-gray-900">Delete Tour Plan?</h4>
              <p className="text-xs text-gray-600 mt-1">
                Are you sure you want to remove this itinerary from your calendar? This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmPlanId(null)}
                className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50"
              >
                Keep Itinerary
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleDeletePlan(deleteConfirmPlanId)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl text-xs font-extrabold shadow-md transition"
              >
                {actionLoading ? 'Deleting...' : 'Yes, Delete Plan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Activity Details */}
      {selectedActivityModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-md w-full overflow-hidden">
            {selectedActivityModal.image && (
              <div className="h-44 bg-slate-900 relative">
                <img
                  src={selectedActivityModal.image}
                  alt={selectedActivityModal.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <span className="text-[10px] font-bold uppercase bg-blue-600 px-2.5 py-0.5 rounded-full">
                    Day {selectedActivityModal.dayNumber} &bull; {selectedActivityModal.type}
                  </span>
                  <h3 className="text-xl font-bold mt-1">{selectedActivityModal.title}</h3>
                </div>
              </div>
            )}

            <div className="p-6 space-y-4 text-sm">
              {!selectedActivityModal.image && (
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-bold uppercase text-blue-600">
                      Day {selectedActivityModal.dayNumber} Calendar Entry
                    </span>
                    <h3 className="text-xl font-bold text-gray-900 mt-0.5">
                      {selectedActivityModal.title}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedActivityModal(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={20} />
                  </button>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3.5 rounded-xl border border-gray-100 text-xs">
                <div>
                  <span className="text-gray-400 block">Time Slot</span>
                  <strong className="text-gray-900">
                    {selectedActivityModal.startTime} – {selectedActivityModal.endTime}
                  </strong>
                </div>
                <div>
                  <span className="text-gray-400 block">District</span>
                  <strong className="text-gray-900">
                    {selectedActivityModal.district || 'Sri Lanka'}
                  </strong>
                </div>
                {selectedActivityModal.bestVisitTime && (
                  <div>
                    <span className="text-gray-400 block">Best Visit Time</span>
                    <strong className="text-gray-900">{selectedActivityModal.bestVisitTime}</strong>
                  </div>
                )}
                {selectedActivityModal.openingHours && (
                  <div>
                    <span className="text-gray-400 block">Opening Hours</span>
                    <strong className="text-gray-900">{selectedActivityModal.openingHours}</strong>
                  </div>
                )}
              </div>

              {selectedActivityModal.description && (
                <p className="text-xs text-gray-600 leading-relaxed">
                  {selectedActivityModal.description}
                </p>
              )}

              {selectedActivityModal.notes && (
                <div className="bg-blue-50 text-blue-900 p-3 rounded-xl text-xs">
                  <strong>Notes:</strong> {selectedActivityModal.notes}
                </div>
              )}

              <div className="flex justify-end pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setSelectedActivityModal(null)}
                  className="px-5 py-2 bg-blue-900 text-white rounded-xl text-xs font-bold hover:bg-blue-800 transition"
                >
                  Close Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TravelCalendar;
