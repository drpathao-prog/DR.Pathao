import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Stethoscope, HeartPulse, FlaskConical, ChevronRight, Bell, Calendar, Pill } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useReminderStore } from '../../store/useReminderStore';
import { useCalendarStore } from '../../store/useCalendarStore';
import dayjs from '../../utils/date';
import { useUIStore } from '../../store/useUIStore';
import ProfileMenu from '../../components/ProfileMenu';

export default function HomeScreen() {
  const { medicines } = useReminderStore();
  const { events } = useCalendarStore();
  const { user } = useAuthStore();
  const { setLoginModalOpen } = useUIStore();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Get next upcoming event
  const upcomingEvents = events
    .filter(e => dayjs(e.date).isAfter(dayjs().subtract(1, 'day')))
    .sort((a, b) => dayjs(a.date).diff(dayjs(b.date)));

  const nextEvent = upcomingEvents[0];
  const { setOnboardingModalOpen } = useUIStore();

  const quickActions = [
    { id: 'consult', title: 'Consult Doctor', icon: Stethoscope, color: 'bg-blue-50 text-blue-600', path: '/consult' },
    { id: 'nursing', title: 'Nursing Services', icon: HeartPulse, color: 'bg-rose-50 text-rose-600', path: '/nursing' },
    { id: 'pharmacy', title: 'Pharmacy', icon: Pill, color: 'bg-emerald-50 text-emerald-600', path: '/pharmacy' },
    { id: 'lab', title: 'Book Lab Test', icon: FlaskConical, color: 'bg-amber-50 text-amber-600', path: '/records' },
  ];

  const upcomingReminders = medicines
    .filter(m => !m.taken)
    .slice(0, 2)
    .map(m => ({
      id: m.id,
      title: m.name,
      time: m.time,
      type: 'Medication',
      status: 'Upcoming'
    }));

  return (
    <div className="p-5 flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center justify-between mt-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-slate-400 text-sm font-medium">Namaste!</h2>
            <span className="text-[10px] bg-blue-50 text-blue-600 font-bold px-2 py-0.5 rounded-full uppercase tracking-widest leading-none">
              {dayjs().format('hh:mm A')}
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">{user?.name || 'Dr. Guest'}</h1>
        </div>
        <button 
          onClick={() => setIsProfileOpen(true)}
          className="w-12 h-12 rounded-full border-2 border-white shadow-md bg-blue-100 flex items-center justify-center overflow-hidden active:scale-95 transition-transform"
        >
          <img src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'Guest'}`} alt="User Avatar" />
        </button>
      </div>

        <ProfileMenu 
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          onLoginClick={() => setLoginModalOpen(true)}
        />

      {/* Profile Completion Card (Only for logged in but incomplete users) */}
      {user && !user.onboardingComplete && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-emerald-50 border border-emerald-100 rounded-[32px] p-6 flex flex-col gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm">
              <HeartPulse size={24} />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-emerald-900 leading-tight mb-0.5">Complete Your Profile</h4>
              <p className="text-[11px] text-emerald-600 font-medium">Verify your phone to access all medical services.</p>
            </div>
          </div>
          <button 
            onClick={() => setOnboardingModalOpen(true)}
            className="w-full bg-emerald-600 text-white py-3 rounded-2xl font-bold text-xs shadow-md shadow-emerald-100 active:scale-95 transition-all"
          >
            Start Verification
          </button>
        </motion.div>
      )}

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-3 gap-3">
        {quickActions.map((action, idx) => (
          <motion.div
            key={action.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Link 
              to={action.path}
              className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white shadow-sm border border-slate-100 hover:shadow-md transition-shadow group h-full"
            >
              <div className={`p-3 rounded-xl ${action.color} mb-3 group-hover:scale-110 transition-transform`}>
                <action.icon size={26} />
              </div>
              <span className="text-[11px] font-bold text-slate-700 text-center leading-tight">
                {action.title}
              </span>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Health Metric Banner */}
      <Link to="/profile/calendar" className="bg-slate-900 rounded-2xl p-5 text-white flex items-center justify-between shadow-xl shadow-slate-200 group active:scale-95 transition-all">
        <div className="flex items-center gap-4">
          <div className="bg-white/10 p-3 rounded-xl group-hover:bg-blue-600/20 transition-colors">
            <Calendar className={nextEvent ? "text-emerald-400" : "text-blue-400"} size={24} />
          </div>
          <div>
            <p className="text-white/60 text-[10px] uppercase tracking-wider font-bold">
              {nextEvent ? "Next Major Date" : "Health Sync"}
            </p>
            <p className="text-sm font-semibold">
              {nextEvent 
                ? `${nextEvent.title} on ${dayjs(nextEvent.date).format('MMM DD')}` 
                : "Ready for your checkup?"
              }
            </p>
          </div>
        </div>
        <div className="bg-blue-600 p-2 rounded-lg group-hover:bg-blue-500 transition-colors">
          <ChevronRight size={16} />
        </div>
      </Link>

      {/* Reminders Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Bell size={18} className="text-blue-600" />
            Upcoming Reminders
          </h3>
          <Link to="/reminders" className="text-blue-600 text-xs font-bold hover:underline">See All</Link>
        </div>

        <div className="flex flex-col gap-3">
          {upcomingReminders.map((reminder) => (
            <div key={reminder.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-10 rounded-full ${reminder.type === 'Medication' ? 'bg-emerald-400' : 'bg-blue-400'}`} />
                <div>
                  <h4 className="text-sm font-bold text-slate-800">{reminder.title}</h4>
                  <p className="text-[11px] text-slate-500">{reminder.type} • {reminder.time}</p>
                </div>
              </div>
              <div className="bg-slate-50 px-3 py-1.5 rounded-lg text-[10px] font-bold text-slate-600">
                {reminder.status}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Top Specialty */}
      <section className="mb-4">
        <h3 className="font-bold text-slate-800 mb-4">Popular Specialties</h3>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {['General Physician', 'Pediatrician', 'Cardiologist', 'Dermatologist'].map((spec) => (
            <div key={spec} className="flex-shrink-0 bg-white border border-slate-100 px-5 py-3 rounded-2xl text-xs font-semibold text-slate-600 shadow-sm whitespace-nowrap">
              {spec}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
