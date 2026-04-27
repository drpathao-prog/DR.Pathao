import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HeartPulse, ChevronLeft, MapPin, Clock, Star, ShieldCheck, CheckCircle2, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';
import { useAuthStore } from '../../store/useAuthStore';
import { useUIStore } from '../../store/useUIStore';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';

import CheckoutGuard from '../../components/CheckoutGuard';

export default function NursingScreen() {
  const [step, setStep] = useState<'details' | 'selection' | 'success'>('details');
  const [location, setLocation] = useState('');
  const [duration, setDuration] = useState('1 Week');
  const [selectedNurse, setSelectedNurse] = useState<any>(null);
  const { setLoginModalOpen, setOnboardingModalOpen } = useUIStore();
  const { user } = useAuthStore();

  const nurses = [
    { id: 1, name: 'Sr. Anjali Sharma', exp: '8 Yrs', rating: 4.9, fee: 3500, specialty: 'Elderly Care', available: true },
    { id: 2, name: 'Sr. Maya Rai', exp: '5 Yrs', rating: 4.7, fee: 3000, specialty: 'Post-Surgery Care', available: true },
    { id: 3, name: 'Sr. Deepa Karki', exp: '10 Yrs', rating: 4.8, fee: 4000, specialty: 'Chronic Illness', available: true },
    { id: 4, name: 'Sr. Neha Thapa', exp: '6 Yrs', rating: 4.6, fee: 3200, specialty: 'Elderly Care', available: false },
  ];

  const durations = ['1 Day', '3 Days', '1 Week', '2 Weeks', '1 Month'];

  const handleBooking = async () => {
    try {
      await addDoc(collection(db, 'nursing_bookings'), {
        userId: user!.id,
        userName: user?.name || 'Anonymous',
        nurseId: selectedNurse.id,
        nurseName: selectedNurse.name,
        location,
        duration,
        status: 'pending',
        createdAt: serverTimestamp(),
        totalFee: selectedNurse.fee
      });
      setStep('success');
    } catch (error) {
      console.error('Nursing booking error:', error);
      handleFirestoreError(error, OperationType.CREATE, 'nursing_bookings');
    }
  };

  return (
    <div className="p-5 flex flex-col gap-6 min-h-screen relative pb-12">
      <AnimatePresence mode="wait">
        {step === 'details' && (
          <motion.div 
            key="details"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col gap-8"
          >
            <div className="flex items-center gap-4">
               <button onClick={() => window.history.back()} className="p-2 -ml-2"><ChevronLeft size={24} /></button>
               <h1 className="text-xl font-bold text-slate-900">Nursing Requirements</h1>
            </div>

            <div className="bg-rose-50 rounded-[32px] p-6 border border-rose-100 flex items-center gap-4">
               <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-rose-600 shadow-sm">
                  <HeartPulse size={24} />
               </div>
               <div>
                  <p className="text-rose-900 font-bold">Elderly & Sick Care</p>
                  <p className="text-rose-700/60 text-xs">Professional home nursing services</p>
               </div>
            </div>

            <div className="flex flex-col gap-6">
               <div>
                  <label className="text-sm font-bold text-slate-800 mb-2 block ml-1">Service Location</label>
                  <div className="relative">
                     <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                     <input 
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Enter full address of the patient..."
                        className="w-full bg-white border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all outline-none"
                     />
                  </div>
               </div>

               <div>
                  <label className="text-sm font-bold text-slate-800 mb-2 block ml-1">Service Duration</label>
                  <div className="grid grid-cols-3 gap-2">
                     {durations.map(d => (
                        <button
                           key={d}
                           onClick={() => setDuration(d)}
                           className={clsx(
                             "py-3 rounded-xl text-xs font-bold transition-all border",
                             duration === d ? "bg-rose-600 text-white border-rose-600" : "bg-white text-slate-500 border-slate-100"
                           )}
                        >
                           {d}
                        </button>
                     ))}
                  </div>
               </div>
            </div>

            <div className="mt-auto">
               <button 
                  disabled={!location.trim()}
                  onClick={() => setStep('selection')}
                  className="w-full bg-slate-900 text-white py-5 rounded-[24px] font-bold shadow-xl active:scale-95 transition-all disabled:opacity-50"
               >
                  Find Available Nurses
               </button>
            </div>
          </motion.div>
        )}

        {step === 'selection' && (
          <motion.div 
            key="selection"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col gap-6"
          >
            <div className="flex items-center gap-4">
               <button onClick={() => setStep('details')} className="p-2 -ml-2"><ChevronLeft size={24} /></button>
               <div>
                 <h1 className="text-xl font-bold text-slate-900">Select Nurse</h1>
                 <p className="text-xs text-slate-400 font-medium">{location.split(',')[0]} • {duration}</p>
               </div>
            </div>

            <div className="flex flex-col gap-4">
               {nurses.map(nurse => (
                 <button
                  key={nurse.id}
                  onClick={() => {
                    if(nurse.available) setSelectedNurse(nurse);
                  }}
                  className={clsx(
                    "bg-white p-5 rounded-[32px] border transition-all text-left flex flex-col gap-4",
                    selectedNurse?.id === nurse.id ? "border-rose-500 ring-4 ring-rose-500/10 shadow-md" : "border-slate-100 shadow-sm"
                  )}
                 >
                   <div className="flex items-center gap-4 w-full">
                      <div className="w-16 h-16 rounded-2xl bg-rose-50 border-2 border-white shadow-sm overflow-hidden">
                         <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${nurse.name}`} alt={nurse.name} />
                      </div>
                      <div className="flex-1">
                         <div className="flex items-center justify-between">
                            <h4 className="font-bold text-slate-900">{nurse.name}</h4>
                            <div className="flex items-center gap-1 text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full">
                               <Star size={10} fill="currentColor" />
                               <span className="text-[10px] font-bold">{nurse.rating}</span>
                            </div>
                         </div>
                         <p className="text-xs text-rose-600 font-bold mt-1">{nurse.specialty}</p>
                         <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-wider">{nurse.exp} Experience</p>
                      </div>
                   </div>

                   <div className="flex items-center justify-between pt-4 border-t border-slate-50 w-full">
                      <div>
                         <p className="text-[10px] text-slate-400 font-bold uppercase">Base Fee</p>
                         <p className="font-bold text-slate-900">Rs. {nurse.fee}</p>
                      </div>
                      {!nurse.available && (
                        <span className="text-[10px] bg-slate-100 text-slate-400 px-3 py-1.5 rounded-full font-bold uppercase">Currently Busy</span>
                      )}
                   </div>
                 </button>
               ))}
            </div>

            <CheckoutGuard onSuccess={handleBooking}>
               {({ handleAction }) => (
                  <button 
                    disabled={!selectedNurse}
                    onClick={handleAction}
                    className="w-full bg-rose-600 text-white py-5 rounded-[24px] font-bold shadow-xl shadow-rose-100 active:scale-95 transition-all mt-4 disabled:opacity-50"
                  >
                    Confirm Booking
                  </button>
               )}
            </CheckoutGuard>
          </motion.div>
        )}

        {step === 'success' && (
          <motion.div 
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center gap-6"
          >
            <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-[40px] flex items-center justify-center shadow-xl shadow-emerald-50/50">
               <CheckCircle2 size={48} />
            </div>
            <div>
               <h1 className="text-2xl font-black text-slate-900">Booking Confirmed!</h1>
               <p className="text-slate-500 text-sm mt-2 px-8 font-medium">Your request for {selectedNurse?.name} has been received. Our team will contact you shortly to finalize the schedule.</p>
            </div>
            
            <div className="w-full bg-white border border-slate-100 rounded-[32px] p-6 text-left mt-4">
               <div className="flex items-center gap-3 mb-4">
                  <ShieldCheck className="text-rose-500" size={20} />
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Booking Receipt</span>
               </div>
               <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Service</span>
                    <span className="font-bold text-slate-900">Home Nursing</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Duration</span>
                    <span className="font-bold text-slate-900">{duration}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Total Fee</span>
                    <span className="font-bold text-rose-600">Rs. {selectedNurse?.fee}</span>
                  </div>
               </div>
            </div>

            <button onClick={() => window.history.back()} className="w-full bg-slate-900 text-white py-5 rounded-[24px] font-bold shadow-xl mt-8">
               Return Home
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LoginModal is now global in App.tsx */}
    </div>
  );
}
