import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Pill,
  Stethoscope,
  Bell,
  Activity,
  CalendarDays,
  Baby,
  Edit3,
  Trash2,
  Loader2,
  Globe,
  ClipboardList
} from 'lucide-react';
import dayjs from '../utils/date';
import { useCalendarStore } from '../store/useCalendarStore';
import { useReminderStore } from '../store/useReminderStore';
import { clsx } from 'clsx';
import { CalendarEvent } from '../types';

interface CalendarComponentProps {
  showAgenda?: boolean;
  onEditEvent?: (event: CalendarEvent) => void;
  onAddEvent?: () => void;
}

export default function CalendarComponent({ 
  showAgenda = true, 
  onEditEvent, 
  onAddEvent 
}: CalendarComponentProps) {
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const { events, globalEvents, toggleEventStatus, deleteEvent, isLoading: isCalendarLoading } = useCalendarStore();
  const { medicines, toggleMedicine, isLoading: isReminderLoading } = useReminderStore();

  const isLoading = isCalendarLoading || isReminderLoading;

  const startOfMonth = currentDate.startOf('month');
  const endOfMonth = currentDate.endOf('month');
  const monthName = currentDate.format('MMMM');
  const year = currentDate.format('YYYY');

  const prevMonth = () => setCurrentDate(currentDate.subtract(1, 'month'));
  const nextMonth = () => setCurrentDate(currentDate.add(1, 'month'));

  // Virtual events from reminders based on frequency
  const reminderEvents: CalendarEvent[] = medicines.filter(m => {
    const medDate = dayjs(m.createdAt?.toDate?.() || m.createdAt);
    if (m.frequency === 'daily') return true;
    if (m.frequency === 'weekly') return medDate.day() === selectedDate.day();
    if (m.frequency === 'monthly') return medDate.date() === selectedDate.date();
    return true; // fallback
  }).map(m => ({
    id: `reminder-${m.id}`,
    title: `${m.name} (${m.dosage})`,
    date: selectedDate.format('YYYY-MM-DD'), 
    time: m.time,
    type: 'personal',
    category: 'medication' as const,
    status: m.taken ? 'completed' : 'pending' as const,
    isReminder: true,
    reminderId: m.id
  } as any));

  const allEvents = [...events, ...globalEvents, ...reminderEvents];

  const calendarDays = [];
  const totalDaysInMonth = endOfMonth.date();
  const firstDayOfWeek = startOfMonth.day();

  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= totalDaysInMonth; i++) {
    calendarDays.push(i);
  }

  const getCategoryIcon = (category: CalendarEvent['category']) => {
    switch (category) {
      case 'medication': return <Pill size={16} />;
      case 'appointment': return <Stethoscope size={16} />;
      case 'alert': return <Bell size={16} />;
      case 'cycle': return <Activity size={16} />;
      case 'vaccination': return <Baby size={16} />;
      case 'screening': return <ClipboardList size={16} />;
      case 'health_day': return <Globe size={16} />;
      default: return <CalendarIcon size={16} />;
    }
  };

  const getCategoryColor = (category: CalendarEvent['category']) => {
    switch (category) {
      case 'medication': return 'text-blue-600 bg-blue-50';
      case 'appointment': return 'text-purple-600 bg-purple-50';
      case 'alert': return 'text-amber-600 bg-amber-50';
      case 'cycle': return 'text-rose-600 bg-rose-50';
      case 'vaccination': return 'text-teal-600 bg-teal-50';
      case 'screening': return 'text-indigo-600 bg-indigo-50';
      case 'health_day': return 'text-emerald-600 bg-emerald-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{year}</span>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 text-lg">{monthName}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <ChevronLeft size={20} />
          </button>
          <button onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-[32px] p-6 shadow-xl shadow-slate-200/40 border border-slate-100">
        <div className="grid grid-cols-7 gap-1">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <div key={`${d}-${i}`} className="text-center text-[10px] font-black text-slate-300 uppercase py-2">{d}</div>
          ))}
          {calendarDays.map((day, idx) => {
            if (!day) return <div key={idx} className="aspect-square opacity-0 pointer-events-none" />;
            
            const dateStr = currentDate.date(day).format('YYYY-MM-DD');
            const dayEvents = [...events, ...globalEvents].filter(e => e.date === dateStr);
            const hasReminders = medicines.some(m => {
              const medDate = dayjs(m.createdAt?.toDate?.() || m.createdAt);
              const d = currentDate.date(day);
              if (m.frequency === 'daily') return true;
              if (m.frequency === 'weekly') return medDate.day() === d.day();
              if (m.frequency === 'monthly') return medDate.date() === d.date();
              return true;
            });
            
            const isToday = dayjs().isSame(currentDate.date(day), 'day');
            const isSelected = selectedDate.isSame(currentDate.date(day), 'day');

            return (
              <div 
                key={idx} 
                onClick={() => setSelectedDate(currentDate.date(day))}
                className={clsx(
                  "aspect-square flex flex-col items-center justify-center transition-all relative cursor-pointer rounded-xl",
                  isSelected ? "bg-slate-900 text-white scale-105 z-10 shadow-lg" : isToday ? "text-blue-600 bg-blue-50" : "text-slate-600 hover:bg-slate-50"
                )}
              >
                <span className="text-xs font-bold">{day}</span>
                <div className="flex gap-0.5 mt-1">
                  {dayEvents.slice(0, 3).map((e, ei) => (
                    <div key={ei} className={clsx(
                      "w-1 h-1 rounded-full",
                      e.type === 'public' ? "bg-emerald-400" : "bg-blue-400"
                    )} />
                  ))}
                  {day && hasReminders && (
                    <div className="w-1 h-1 rounded-full bg-amber-400" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Agenda */}
      {showAgenda && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <CalendarDays size={14} />
              Agenda: {selectedDate.format('MMM D')}
            </h3>
            {onAddEvent && (
              <button 
                onClick={onAddEvent}
                className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline"
              >
                + Add Event
              </button>
            )}
          </div>

          <div className="space-y-3">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-8 gap-2 opacity-20">
                <Loader2 className="animate-spin text-slate-400" size={24} />
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Syncing...</p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {allEvents.filter(e => dayjs(e.date).isSame(selectedDate, 'day')).length > 0 ? (
                  allEvents.filter(e => dayjs(e.date).isSame(selectedDate, 'day')).map((event) => (
                    <motion.div
                      key={event.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={clsx(
                        "bg-white p-4 rounded-[20px] border border-slate-100 shadow-sm transition-all relative overflow-hidden group",
                        event.status === 'completed' && "opacity-60"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className={clsx(
                          "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border border-slate-50",
                          getCategoryColor(event.category)
                        )}>
                          {getCategoryIcon(event.category)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <h4 className={clsx("font-bold text-slate-900 truncate text-sm", event.status === 'completed' && "line-through")}>
                                {event.title}
                              </h4>
                              {event.type === 'public' && (
                                <span className="bg-emerald-100 text-emerald-600 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter shrink-0">Official</span>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              {!(event as any).isReminder && event.type !== 'public' && onEditEvent && (
                                <button 
                                  onClick={() => onEditEvent(event)}
                                  className="p-1.5 rounded-lg text-slate-200 bg-slate-50 hover:text-blue-500 hover:bg-blue-50 transition-colors"
                                >
                                  <Edit3 size={14} />
                                </button>
                              )}
                              <button 
                                onClick={() => (event as any).isReminder ? toggleMedicine((event as any).reminderId) : toggleEventStatus(event.id)}
                                className={clsx(
                                  "p-1.5 rounded-lg transition-colors",
                                  event.status === 'completed' ? "text-emerald-500 bg-emerald-50" : "text-slate-200 bg-slate-50 hover:text-emerald-500 hover:bg-emerald-50"
                                )}
                              >
                                <CheckCircle2 size={14} />
                              </button>
                              {!(event as any).isReminder && event.type !== 'public' && (
                                <button 
                                  onClick={() => deleteEvent(event.id)}
                                  className="p-1.5 rounded-lg text-slate-200 bg-slate-50 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-slate-500 mt-1">
                            {event.time && (
                              <div className="flex items-center gap-1">
                                <Clock size={10} className="text-slate-400" />
                                <span className="text-[9px] font-bold">{event.time}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                               <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{event.category}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="py-8 flex flex-col items-center justify-center text-slate-300 gap-2 border-2 border-dashed border-slate-100 rounded-[28px]">
                    <CalendarIcon size={24} className="opacity-10" />
                    <p className="text-[9px] font-bold uppercase tracking-widest opacity-40">Healthy Day Ahead</p>
                  </div>
                )}
              </AnimatePresence>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
