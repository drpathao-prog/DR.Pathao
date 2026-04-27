import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Pill, Plus, Clock, CheckCircle2, Trash2, X, Bell, ChevronRight, AlertCircle, Loader2, Calendar } from 'lucide-react';
import { useReminderStore } from '../../store/useReminderStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useUIStore } from '../../store/useUIStore';
import { clsx } from 'clsx';
import CalendarComponent from '../../components/CalendarComponent';

export default function RemindersScreen() {
  const { medicines, toggleMedicine, addMedicine, deleteMedicine, isLoading } = useReminderStore();
  const { user } = useAuthStore();
  const { setLoginModalOpen } = useUIStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newMed, setNewMed] = useState({ name: '', dosage: '', time: '08:00', frequency: 'daily' as const });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMed.name || !newMed.dosage || !newMed.time) return;
    await addMedicine(newMed);
    setNewMed({ name: '', dosage: '', time: '08:00', frequency: 'daily' });
    setIsAddModalOpen(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-blue-50 p-6 rounded-[40px] mb-6">
          <Pill size={48} className="text-blue-600" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Sign in Required</h2>
        <p className="text-sm text-slate-500 max-w-[240px] mb-6">Please sign in to track your medications and set health reminders.</p>
        <button 
          onClick={() => setLoginModalOpen(true)}
          className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-blue-100"
        >
          Sign In Now
        </button>
      </div>
    );
  }

  const takenCount = medicines.filter(m => m.taken).length;
  const totalCount = medicines.length;

  return (
    <div className="bg-[#f8fafc] min-h-screen pb-32">
      {/* Header Sticky Banner */}
      <div className="bg-blue-600 p-8 rounded-b-[40px] shadow-xl text-white relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-blue-100 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Daily Habit</p>
          <h1 className="text-2xl font-black tracking-tight mb-4">Medication Tracker</h1>
          
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
               <Pill className="text-white" size={24} />
            </div>
            <div>
              <p className="text-xs font-bold opacity-80">{takenCount}/{totalCount} Medicines Taken</p>
              <div className="w-40 h-1.5 bg-white/20 rounded-full mt-2 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(takenCount / totalCount) * 100}%` }}
                  className="h-full bg-white rounded-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Circles */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-400/20 rounded-full -ml-8 -mb-8 blur-lg" />
      </div>

      {/* Reminder List */}
      <div className="px-6 -mt-6">
        <div className="bg-white rounded-[32px] p-6 shadow-xl shadow-blue-900/5 border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Clock size={14} />
              Scheduled for Today
            </h3>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="text-blue-600 text-xs font-black uppercase tracking-widest flex items-center gap-1 hover:bg-blue-50 px-3 py-1 rounded-full transition-colors"
            >
              <Plus size={14} />
              Add New
            </button>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 opacity-20">
                <Loader2 className="animate-spin" size={32} />
                <p className="text-[10px] font-black uppercase tracking-widest">Syncing with Health Vault...</p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {medicines.map((med) => (
                  <motion.div
                    key={med.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className={clsx(
                      "group relative overflow-hidden p-5 rounded-[24px] border border-slate-100 transition-all",
                      med.taken ? "bg-slate-50 opacity-60" : "bg-white hover:border-blue-100"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => toggleMedicine(med.id)}
                        className={clsx(
                          "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                          med.taken ? "bg-emerald-500 text-white" : "bg-blue-50 text-blue-600 group-hover:scale-110"
                        )}
                      >
                        {med.taken ? <CheckCircle2 size={24} /> : <Pill size={24} />}
                      </button>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className={clsx("font-bold text-slate-900", med.taken && "line-through")}>{med.name}</h4>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full uppercase">
                              {med.time}
                            </span>
                            <button 
                              onClick={() => deleteMedicine(med.id)}
                              className="p-1 text-slate-300 hover:text-rose-500 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-slate-400 font-medium mt-1">{med.dosage}</p>
                      </div>

                      <div className={clsx(
                        "w-1.5 h-8 rounded-full",
                        med.taken ? "bg-emerald-500" : "bg-blue-500"
                      )} />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>

      {/* Health Calendar Integration */}
      <div className="px-6 mt-10">
        <div className="flex items-center justify-between mb-6 px-1">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                <Calendar size={20} />
             </div>
             <div>
                <h3 className="text-sm font-black text-slate-900 tracking-tight">Master Calendar</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Global & Personal Events</p>
             </div>
          </div>
        </div>
        <CalendarComponent showAgenda={true} />
      </div>

      {/* Pro Tip Section */}
      <div className="px-6 mt-8">
        <div className="bg-slate-900 text-white rounded-[32px] p-6 flex items-start gap-4 shadow-xl shadow-slate-200">
           <div className="bg-white/10 p-2 rounded-xl text-amber-400">
              <AlertCircle size={20} />
           </div>
           <div>
             <h5 className="text-sm font-bold mb-1">Missed a Dose?</h5>
             <p className="text-[11px] text-white/60 leading-relaxed">
               Don't double up! Consult with your doctor on Dr. Pathao to know how to adjust your schedule safely.
             </p>
             <button className="mt-3 text-[10px] font-black uppercase tracking-widest text-blue-400 flex items-center gap-1">
               Go to Consultation <ChevronRight size={10} />
             </button>
           </div>
        </div>
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60]"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="fixed inset-x-0 bottom-0 bg-white rounded-t-[40px] z-[70] p-8 pb-12 shadow-2xl"
            >
              <div className="w-12 h-1.5 bg-slate-100 rounded-full mx-auto mb-8" />
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Add Reminder</h3>
                <button onClick={() => setIsAddModalOpen(false)} className="text-slate-300">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleAdd} className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Medicine Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Paracetamol"
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-600/20"
                    value={newMed.name}
                    onChange={e => setNewMed({ ...newMed, name: e.target.value })}
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3 px-1">How often?</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['daily', 'weekly', 'monthly'] as const).map((freq) => (
                        <button
                          key={freq}
                          type="button"
                          onClick={() => setNewMed({ ...newMed, frequency: freq })}
                          className={clsx(
                            "h-12 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                            newMed.frequency === freq 
                              ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100" 
                              : "bg-slate-50 border-slate-50 text-slate-400 hover:bg-slate-100"
                          )}
                        >
                          {freq}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Dosage</label>
                      <input 
                        type="text" 
                        placeholder="500mg"
                        className="w-full h-14 bg-slate-50 border-none rounded-2xl px-4 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-600/20"
                        value={newMed.dosage}
                        onChange={e => setNewMed({ ...newMed, dosage: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Time</label>
                      <div className="relative group">
                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                          type="time" 
                          className="w-full h-14 bg-slate-50 border-none rounded-2xl pl-12 pr-4 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-600/20 appearance-none"
                          value={newMed.time}
                          onChange={e => setNewMed({ ...newMed, time: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Time Quick Scroller */}
                  <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                    {['08:00', '12:00', '16:00', '20:00', '22:00'].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setNewMed({ ...newMed, time: t })}
                        className={clsx(
                          "shrink-0 px-4 py-2 rounded-lg text-[10px] font-bold border transition-colors",
                          newMed.time === t 
                            ? "border-blue-600 text-blue-600 bg-blue-50" 
                            : "border-slate-100 text-slate-400 hover:bg-slate-50"
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-blue-600 text-white rounded-2xl py-5 text-sm font-black uppercase tracking-widest shadow-xl shadow-blue-100 active:scale-[0.98] transition-all"
                >
                  Save Reminder
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
