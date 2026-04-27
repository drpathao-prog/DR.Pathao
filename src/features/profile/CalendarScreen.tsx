import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  MapPin, 
  Info, 
  ArrowLeft, 
  Plus, 
  Clock, 
  Trash2, 
  CheckCircle2, 
  X,
  Pill,
  Stethoscope,
  Bell,
  Activity,
  CalendarDays,
  Baby,
  Edit3,
  Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import dayjs from '../../utils/date';
import { useCalendarStore } from '../../store/useCalendarStore';
import { useReminderStore } from '../../store/useReminderStore';
import { useAuthStore } from '../../store/useAuthStore';
import { clsx } from 'clsx';
import { CalendarEvent } from '../../types';
import CalendarComponent from '../../components/CalendarComponent';

export default function CalendarScreen() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | CalendarEvent['category']>('all');
  const { addEvent, updateEvent, isLoading: isCalendarLoading } = useCalendarStore();
  const { isLoading: isReminderLoading } = useReminderStore();
  const { user } = useAuthStore();

  const isLoading = isCalendarLoading || isReminderLoading;

  const [newEvent, setNewEvent] = useState<Partial<CalendarEvent>>({
    title: '',
    date: dayjs().format('YYYY-MM-DD'),
    time: '09:00',
    type: 'personal',
    category: 'medication',
    status: 'pending'
  });

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-purple-50 p-6 rounded-[40px] mb-6">
          <CalendarIcon size={48} className="text-purple-600" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Health Calendar</h2>
        <p className="text-sm text-slate-500 max-w-[240px]">Sign in to manage your appointments, vaccinations, and health milestones.</p>
      </div>
    );
  }

  const handleEditClick = (event: CalendarEvent) => {
    setNewEvent(event);
    setEditingEventId(event.id);
    setIsAddModalOpen(true);
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title) return;
    
    if (editingEventId) {
      await updateEvent(editingEventId, newEvent);
    } else {
      await addEvent(newEvent as CalendarEvent);
    }

    setNewEvent({
      title: '',
      date: dayjs().format('YYYY-MM-DD'),
      time: '09:00',
      type: 'personal',
      category: 'medication',
      status: 'pending'
    });
    setEditingEventId(null);
    setIsAddModalOpen(false);
  };

  return (
    <div className="bg-[#f8fafc] min-h-screen pb-32 overflow-x-hidden">
      {/* Header */}
      <div className="p-6 flex items-center justify-between sticky top-0 bg-[#f8fafc]/80 backdrop-blur-md z-30">
        <Link to="/" className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center text-slate-800 border border-slate-100">
          <ArrowLeft size={20} />
        </Link>
        <h2 className="text-xl font-black text-slate-900">Health Calendar</h2>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="w-10 h-10 rounded-2xl bg-blue-600 shadow-lg shadow-blue-200 flex items-center justify-center text-white"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Hero Stats */}
      <div className="px-6 mb-8 mt-2">
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {(['all', 'medication', 'appointment', 'cycle', 'alert', 'vaccination'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={clsx(
                "px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border",
                filter === cat 
                  ? "bg-slate-900 text-white border-slate-900 shadow-md" 
                  : "bg-white text-slate-500 border-slate-100 hover:border-slate-300"
              )}
            >
              {cat === 'all' ? 'All Activities' : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6">
        <CalendarComponent 
          onEditEvent={handleEditClick} 
          onAddEvent={() => setIsAddModalOpen(true)}
        />
      </div>

      {filter === 'cycle' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 bg-rose-50 rounded-[32px] p-6 border border-rose-100"
          >
            <div className="flex items-center gap-3 mb-2">
              <Activity className="text-rose-600" size={20} />
              <h4 className="font-black text-rose-900 text-sm italic tracking-tight">Cycle Insights</h4>
            </div>
            <p className="text-xs text-rose-800 opacity-80 mb-4 leading-relaxed">
              Your pattern looks consistent. Log your symptoms daily for smarter predictions.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/80 p-3 rounded-2xl text-center backdrop-blur-sm shadow-sm">
                <p className="text-[9px] font-black text-rose-300 uppercase mb-1">Last Period</p>
                <p className="text-xs font-black text-rose-600">5 Days ago</p>
              </div>
              <div className="bg-white/80 p-3 rounded-2xl text-center backdrop-blur-sm shadow-sm">
                <p className="text-[9px] font-black text-rose-300 uppercase mb-1">Next Cycle</p>
                <p className="text-xs font-black text-rose-600">In 23 Days</p>
              </div>
            </div>
          </motion.div>
        )}
      
      {/* Add Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingEventId(null);
                setNewEvent({
                    title: '',
                    date: dayjs().format('YYYY-MM-DD'),
                    time: '09:00',
                    type: 'personal',
                    category: 'medication',
                    status: 'pending'
                });
              }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 p-6"
            />
            <motion.div 
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="fixed inset-x-0 bottom-0 bg-white rounded-t-[40px] z-[60] p-8 pb-10 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black text-slate-900">{editingEventId ? 'Edit Activity' : 'New Log'}</h3>
                <button onClick={() => {
                   setIsAddModalOpen(false);
                   setEditingEventId(null);
                 }} className="text-slate-400"><X size={24} /></button>
              </div>

              <form onSubmit={handleAddEvent} className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Goal Type</label>
                  <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                    {([
                      { id: 'medication', icon: Pill, label: 'Rx' },
                      { id: 'appointment', icon: Stethoscope, label: 'Doc' },
                      { id: 'cycle', icon: Activity, label: 'Cycle' },
                      { id: 'vaccination', icon: Baby, label: 'Vaccine' },
                      { id: 'alert', icon: Bell, label: 'Alert' }
                    ] as const).map(type => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setNewEvent({ ...newEvent, category: type.id })}
                        className={clsx(
                          "flex flex-col items-center gap-2 p-4 min-w-[70px] rounded-2xl border-2 transition-all",
                          newEvent.category === type.id 
                            ? "bg-slate-900 border-slate-900 text-white shadow-xl" 
                            : "bg-white border-slate-50 text-slate-400 hover:border-slate-200"
                        )}
                      >
                        <type.icon size={20} />
                        <span className="text-[9px] font-black uppercase tracking-tighter">{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <input 
                    type="text" 
                    placeholder="Activity Title"
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold text-slate-900"
                    value={newEvent.title}
                    onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                    required
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input 
                      type="date" 
                      className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold"
                      value={newEvent.date}
                      onChange={e => setNewEvent({ ...newEvent, date: e.target.value })}
                    />
                    <input 
                      type="time" 
                      className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold"
                      value={newEvent.time}
                      onChange={e => setNewEvent({ ...newEvent, time: e.target.value })}
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-blue-600 text-white rounded-2xl py-5 text-sm font-black uppercase tracking-widest shadow-xl shadow-blue-100"
                >
                  {editingEventId ? 'Update Log' : 'Save to Profile'}
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
