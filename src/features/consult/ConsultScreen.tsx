import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, Star, Clock, MapPin, ChevronLeft, ChevronRight, Stethoscope, Smartphone, Loader2 } from 'lucide-react';
import { useNavigate, useLocation, Routes, Route, Link } from 'react-router-dom';
import { clsx } from 'clsx';
import dayjs from '../../utils/date';
import { useAuthStore } from '../../store/useAuthStore';
import { useUIStore } from '../../store/useUIStore';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';

import CheckoutGuard from '../../components/CheckoutGuard';

export default function ConsultScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSpecialty, setActiveSpecialty] = useState('All');
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { setLoginModalOpen, setOnboardingModalOpen } = useUIStore();
  const [bookingStep, setBookingStep] = useState<'details' | 'scheduling'>('details');
  const [bookingDate, setBookingDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [bookingTime, setBookingTime] = useState('10:00 AM');
  const [bookingOption, setBookingOption] = useState<'scheduled' | 'asap' | 'queue'>('scheduled');
  const [consultType, setConsultType] = useState<'tele' | 'home' | null>(null);
  const [symptomText, setSymptomText] = useState('');
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirmBooking = async () => {
    if (!user || !selectedDoctor) return;
    
    setIsLoading(true);
    try {
      await addDoc(collection(db, 'appointments'), {
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        userId: user.id,
        userName: user.name || 'Anonymous',
        status: 'pending',
        createdAt: serverTimestamp(),
        fee: selectedDoctor.fee,
        type: consultType,
        preferredDate: bookingDate,
        preferredTime: bookingTime,
        bookingOption: bookingOption
      });
      setSelectedDoctor(null);
      setBookingStep('details');
      setIsChatOpen(true);
    } catch (error) {
      console.error('Booking error:', error);
      handleFirestoreError(error, OperationType.WRITE, 'appointments');
    } finally {
      setIsLoading(false);
    }
  };

  const specialties = ['All', 'General', 'Pediatrics', 'Dentist', 'Dermatology', 'Eye Care', 'Cardiology', 'Gynecology'];
  
  const doctors = [
    { id: 1, name: 'Dr. Binod Shrestha', specialty: 'General Physician', category: 'General', exp: '12 Yrs', rating: 4.8, fee: 800, available: true, bio: 'Expert in primary care with over 12 years of experience in internal medicine.', types: ['tele', 'home'] },
    { id: 2, name: 'Dr. Sarala Thapa', specialty: 'Gynecologist', category: 'Gynecology', exp: '8 Yrs', rating: 4.9, fee: 1200, available: false, bio: 'Specialist in womens health and maternity care.', types: ['tele'] },
    { id: 3, name: 'Dr. Ramesh Karki', specialty: 'Cardiologist', category: 'Cardiology', exp: '15 Yrs', rating: 4.7, fee: 1500, available: true, bio: 'Experienced in treating complex heart conditions and preventative cardiology.', types: ['tele'] },
    { id: 4, name: 'Dr. Nira Acharya', specialty: 'Dentist', category: 'Dentist', exp: '10 Yrs', rating: 4.8, fee: 1000, available: true, bio: 'Specialist in cosmetic dentistry and orthodontics.', types: ['home'] },
    { id: 5, name: 'Dr. Pratap Shah', specialty: 'Skin Specialist', category: 'Dermatology', exp: '14 Yrs', rating: 4.9, fee: 1100, available: true, bio: 'Expert in dermatology and skin rejuvenation.', types: ['tele', 'home'] },
    { id: 6, name: 'Dr. Anjali Rai', specialty: 'Pediatrician', category: 'Pediatrics', exp: '6 Yrs', rating: 4.8, fee: 900, available: true, bio: 'Compassionate care for infants, children, and adolescents.', types: ['tele', 'home'] },
    { id: 7, name: 'Dr. Kishore Jha', specialty: 'Ophthalmologist', category: 'Eye Care', exp: '20 Yrs', rating: 4.6, fee: 1300, available: true, bio: 'Senior eye surgeon specialized in cataract and glaucoma.', types: ['tele'] },
  ];

  const symptomMapping: Record<string, string> = {
    'headache': 'General',
    'fever': 'General',
    'cold': 'General',
    'cough': 'General',
    'tooth': 'Dentist',
    'gum': 'Dentist',
    'heart': 'Cardiology',
    'chest': 'Cardiology',
    'skin': 'Dermatology',
    'rash': 'Dermatology',
    'baby': 'Pediatrics',
    'child': 'Pediatrics',
    'eye': 'Eye Care',
    'vision': 'Eye Care',
    'pregnancy': 'Gynecology',
    'women': 'Gynecology'
  };

  const handleSymptomAnalysis = () => {
    const text = symptomText.toLowerCase();
    let foundSpecialty = 'All';
    
    for (const [key, spec] of Object.entries(symptomMapping)) {
      if (text.includes(key)) {
        foundSpecialty = spec;
        break;
      }
    }
    
    setActiveSpecialty(foundSpecialty);
    navigate('specialty', { state: { type: consultType } });
  };

  const filteredDoctors = doctors.filter(doc => {
    // Filter by type first
    if (consultType && !doc.types.includes(consultType)) return false;
    
    if (activeSpecialty === 'All') return true;
    return doc.category === activeSpecialty;
  });

  return (
    <div className="p-5 flex flex-col gap-6 relative min-h-screen">
      {/* Detail Overlay */}
      {selectedDoctor && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-5">
           <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedDoctor(null)} />
           <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            className="w-full max-w-md bg-white rounded-t-[40px] sm:rounded-[40px] p-8 relative z-10 shadow-2xl overflow-hidden"
           >
              <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6 sm:hidden" />
              
              <AnimatePresence mode="wait">
                {bookingStep === 'details' ? (
                  <motion.div 
                    key="details"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex flex-col items-center text-center"
                  >
                    <div className="w-24 h-24 rounded-3xl bg-blue-50 border-4 border-white shadow-xl mb-4 overflow-hidden">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedDoctor.name}`} alt={selectedDoctor.name} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">{selectedDoctor.name}</h3>
                    <p className="text-blue-600 font-bold text-sm tracking-tight">{selectedDoctor.specialty}</p>
                    
                    <div className="flex gap-4 my-6">
                       <div className="bg-slate-50 px-4 py-2 rounded-2xl">
                         <p className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">Exp</p>
                         <p className="text-sm font-bold text-slate-700">{selectedDoctor.exp}</p>
                       </div>
                       <div className="bg-slate-50 px-4 py-2 rounded-2xl">
                         <p className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">Rating</p>
                         <p className="text-sm font-bold text-slate-700">{selectedDoctor.rating}</p>
                       </div>
                       <div className="bg-slate-50 px-4 py-2 rounded-2xl">
                         <p className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">Reviews</p>
                         <p className="text-sm font-bold text-slate-700">120+</p>
                       </div>
                    </div>

                    <p className="text-slate-500 text-sm leading-relaxed px-2">
                      {selectedDoctor.bio}
                    </p>

                    <div className="w-full mt-8 flex flex-col gap-3">
                      <CheckoutGuard onSuccess={() => {
                        if (consultType === 'home') {
                          setBookingStep('scheduling');
                        } else {
                          handleConfirmBooking();
                        }
                      }}>
                        {({ handleAction }) => (
                          <button 
                            onClick={handleAction}
                            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-200 active:scale-95 transition-all flex items-center justify-center gap-2"
                          >
                             {isLoading && <Loader2 className="animate-spin" size={20} />}
                            {consultType === 'home' ? 'Choose Date & Time' : 'Confirm & Start Chat'}
                          </button>
                        )}
                      </CheckoutGuard>
                      <button 
                        onClick={() => {
                          setSelectedDoctor(null);
                          setBookingStep('details');
                        }} 
                        className="w-full py-4 text-slate-400 font-bold text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="scheduling"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="w-full"
                  >
                    <div className="flex items-center gap-3 mb-6">
                       <button onClick={() => setBookingStep('details')} className="p-2 -ml-2 text-slate-400 hover:text-slate-600"><ChevronLeft size={20} /></button>
                       <h3 className="text-xl font-bold text-slate-900">Schedule Home Visit</h3>
                    </div>

                    <div className="space-y-6 max-h-[60vh] overflow-y-auto px-1 scrollbar-hide">
                      {/* Booking Options */}
                      <div className="grid grid-cols-3 gap-3">
                        {(['asap', 'scheduled', 'queue'] as const).map((option) => (
                          <button
                            key={option}
                            onClick={() => setBookingOption(option)}
                            className={clsx(
                              "py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all",
                              bookingOption === option 
                                ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100" 
                                : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
                            )}
                          >
                            {option}
                          </button>
                        ))}
                      </div>

                      {bookingOption === 'scheduled' && (
                        <div className="space-y-4">
                          <div className="bg-slate-50 rounded-[32px] p-6 space-y-4">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-black uppercase tracking-widest text-slate-400">Select Date</p>
                              <p className="text-sm font-bold text-blue-600">{dayjs(bookingDate).format('MMMM D, YYYY')}</p>
                            </div>
                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                              {[0, 1, 2, 3, 4, 5, 6].map(offset => {
                                const date = dayjs().add(offset, 'day');
                                const isSelected = bookingDate === date.format('YYYY-MM-DD');
                                return (
                                  <button
                                    key={offset}
                                    onClick={() => setBookingDate(date.format('YYYY-MM-DD'))}
                                    className={clsx(
                                      "flex flex-col items-center justify-center min-w-[64px] h-20 rounded-2xl border transition-all",
                                      isSelected 
                                        ? "bg-blue-600 border-blue-600 text-white shadow-md" 
                                        : "bg-white border-slate-100 text-slate-500 hover:border-slate-200"
                                    )}
                                  >
                                    <span className="text-[10px] font-black uppercase opacity-60 mb-1">{date.format('ddd')}</span>
                                    <span className="text-lg font-black">{date.format('D')}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <div className="bg-slate-50 rounded-[32px] p-6 space-y-4">
                             <div className="flex items-center justify-between">
                              <p className="text-xs font-black uppercase tracking-widest text-slate-400">Select Time</p>
                              <p className="text-sm font-bold text-blue-600">{bookingTime}</p>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              {['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'].map(time => (
                                <button
                                  key={time}
                                  onClick={() => setBookingTime(time)}
                                  className={clsx(
                                    "py-2.5 rounded-xl text-xs font-bold border transition-all",
                                    bookingTime === time 
                                      ? "bg-blue-600 border-blue-600 text-white shadow-md" 
                                      : "bg-white border-slate-100 text-slate-500 hover:border-slate-200"
                                  )}
                                >
                                  {time}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {bookingOption === 'asap' && (
                        <div className="bg-emerald-50 rounded-[32px] p-6 text-center">
                           <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                              <Clock size={24} />
                           </div>
                           <h4 className="font-bold text-emerald-900">ASAP Request</h4>
                           <p className="text-xs text-emerald-600/70 mt-1">We will notify the doctor to visit you at the earliest available time.</p>
                        </div>
                      )}

                      {bookingOption === 'queue' && (
                        <div className="bg-amber-50 rounded-[32px] p-6 text-center">
                           <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                              <Search size={24} />
                           </div>
                           <h4 className="font-bold text-amber-900">Join Queue</h4>
                           <p className="text-xs text-amber-600/70 mt-1">You will be placed in the current waiting list. Current queue: 3 people.</p>
                        </div>
                      )}
                    </div>

                    <div className="w-full mt-8 flex flex-col gap-3">
                      <CheckoutGuard onSuccess={handleConfirmBooking}>
                        {({ handleAction }) => (
                          <button 
                            onClick={handleAction}
                            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-200 active:scale-95 transition-all flex items-center justify-center gap-2"
                          >
                            {isLoading && <Loader2 className="animate-spin" size={20} />}
                            Confirm Booking
                          </button>
                        )}
                      </CheckoutGuard>
                      <button 
                        onClick={() => {
                          setSelectedDoctor(null);
                          setBookingStep('details');
                        }} 
                        className="w-full py-4 text-slate-400 font-bold text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
           </motion.div>
        </div>
      )}

      {/* Chat Overlay */}
      <AnimatePresence>
        {isChatOpen && (
          <div className="fixed inset-0 z-[60] flex flex-col bg-white">
             <div className="bg-slate-900 p-6 flex items-center justify-between text-white">
                <div className="flex items-center gap-3">
                  <button onClick={() => setIsChatOpen(false)} className="p-1"><ChevronLeft size={24} /></button>
                   <div className="w-10 h-10 rounded-full bg-blue-100 overflow-hidden border border-white/20">
                     <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Consult`} alt="Doctor" />
                   </div>
                   <div>
                     <p className="font-bold text-sm leading-tight">Dr. Assistant</p>
                     <p className="text-[10px] text-emerald-400 font-bold uppercase">Online Now</p>
                   </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center"><Clock size={18} /></div>
                </div>
             </div>

             <div className="flex-1 p-6 overflow-y-auto bg-slate-50 flex flex-col gap-4">
                <div className="max-w-[80%] bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-slate-100">
                  <p className="text-sm text-slate-700">Namaste! How can I help you today?</p>
                  <p className="text-[9px] text-slate-400 font-bold mt-2">10:45 AM</p>
                </div>
                <div className="max-w-[80%] bg-blue-600 p-4 rounded-2xl rounded-tr-none shadow-lg self-end text-white">
                  <p className="text-sm">I have a persistent headache since morning.</p>
                  <p className="text-[9px] text-white/60 font-bold mt-2">10:46 AM</p>
                </div>
             </div>

             <div className="p-6 bg-white border-t border-slate-100 flex items-center gap-4">
               <div className="flex-1 bg-slate-100 rounded-2xl px-4 py-3">
                 <input type="text" placeholder="Type symptom or query..." className="w-full bg-transparent border-none focus:ring-0 text-sm font-medium" />
               </div>
               <button className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg active:scale-90 transition-transform">
                 <ChevronRight size={24} />
               </button>
             </div>
          </div>
        )}
      </AnimatePresence>

      <Routes>
        <Route index element={
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-6 py-12 items-center text-center"
          >
            <div className="w-20 h-20 bg-blue-50 rounded-[32px] flex items-center justify-center text-blue-600 mb-4 shadow-xl shadow-blue-50/50">
               <Search size={40} />
            </div>
            <h1 className="text-3xl font-black text-slate-900 leading-tight">Find the Right<br/>Care Today</h1>
            <p className="text-slate-400 text-sm font-medium px-8 mb-8">How would you like to consult with our experts?</p>
            
            <div className="w-full flex flex-col gap-4">
               <button 
                onClick={() => navigate('type')}
                className="w-full bg-white border-2 border-slate-100 p-6 rounded-[32px] flex items-center justify-between hover:border-blue-500 hover:bg-blue-50/30 transition-all group"
               >
                  <div className="text-left">
                    <p className="text-xl font-bold text-slate-900">Consult Doctor</p>
                    <p className="text-xs text-slate-400 mt-1">Virtual or home visit services</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                    <ChevronRight size={24} />
                  </div>
               </button>

               <button onClick={() => navigate('/')} className="text-slate-400 font-bold text-sm mt-8 underline underline-offset-4 decoration-slate-200">Return to Home</button>
            </div>
          </motion.div>
        } />

        <Route path="type" element={
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col gap-6 py-12"
          >
            <div className="flex items-center gap-4 mb-4">
               <button onClick={() => navigate(-1)} className="p-2 -ml-2"><ChevronLeft size={24} /></button>
               <h1 className="text-xl font-bold text-slate-900">Consultation Type</h1>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <button 
                onClick={() => {
                  setConsultType('tele');
                  navigate('selection', { state: { type: 'tele' } });
                }}
                className="bg-white p-8 rounded-[40px] border-2 border-slate-100 hover:border-blue-500 hover:bg-blue-50/50 transition-all text-left shadow-sm group"
              >
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                  <Smartphone size={32} />
                </div>
                <h3 className="text-2xl font-black text-slate-900">Tele Doctor</h3>
                <p className="text-sm text-slate-500 mt-2">Connect with experts remotely via video/audio call.</p>
              </button>

              <button 
                onClick={() => {
                  setConsultType('home');
                  navigate('selection', { state: { type: 'home' } });
                }}
                className="bg-white p-8 rounded-[40px] border-2 border-slate-100 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all text-left shadow-sm group"
              >
                <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 transition-transform">
                  <MapPin size={32} />
                </div>
                <h3 className="text-2xl font-black text-slate-900">Home Visit</h3>
                <p className="text-sm text-slate-500 mt-2">Get nearest available doctor to visit your home.</p>
              </button>
            </div>
          </motion.div>
        } />

        <Route path="selection" element={
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-6 py-12 items-center text-center"
          >
            <div className="w-20 h-20 bg-blue-50 rounded-[32px] flex items-center justify-center text-blue-600 mb-4 shadow-xl shadow-blue-50/50">
               <Search size={40} />
            </div>
            <h1 className="text-3xl font-black text-slate-900 leading-tight">Next, How should<br/>we find them?</h1>
            <p className="text-slate-400 text-sm font-medium px-8 mb-8">Selected: {(location.state?.type || consultType) === 'tele' ? 'Tele Consultation' : 'Home Visit'}</p>
            
            <div className="w-full flex flex-col gap-4">
               <button 
                onClick={() => navigate('../symptom', { state: { type: location.state?.type || consultType } })}
                className="w-full bg-white border-2 border-slate-100 p-6 rounded-[32px] flex items-center justify-between hover:border-blue-500 hover:bg-blue-50/30 transition-all group"
               >
                  <div className="text-left">
                    <p className="text-xl font-bold text-slate-900">Describe Symptoms</p>
                    <p className="text-xs text-slate-400 mt-1">Smart mapping to specialties</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                    <ChevronRight size={24} />
                  </div>
               </button>
               
               <button 
                onClick={() => navigate('../specialty', { state: { type: location.state?.type || consultType } })}
                className="w-full bg-white border-2 border-slate-100 p-6 rounded-[32px] flex items-center justify-between hover:border-emerald-500 hover:bg-emerald-50/30 transition-all group"
               >
                  <div className="text-left">
                    <p className="text-xl font-bold text-slate-900">Choose Specialty</p>
                    <p className="text-xs text-slate-400 mt-1">Browse by categories</p>
                  </div>
                  <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                    <ChevronRight size={24} />
                  </div>
               </button>

               <button onClick={() => navigate(-1)} className="text-slate-400 font-bold text-sm mt-8 underline underline-offset-4 decoration-slate-200">Change Consultation Type</button>
            </div>
          </motion.div>
        } />

        <Route path="symptom" element={
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-6"
          >
            <div className="flex items-center gap-4">
               <button onClick={() => navigate(-1)} className="p-2 -ml-2"><ChevronLeft size={24} /></button>
               <h1 className="text-xl font-bold text-slate-900">What's the symptom?</h1>
            </div>

            <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm">
               <textarea 
                rows={5}
                value={symptomText}
                onChange={(e) => setSymptomText(e.target.value)}
                placeholder="e.g. I have a sharp pain in my tooth..."
                className="w-full bg-slate-50 border-none rounded-[24px] p-6 text-sm font-medium focus:ring-2 focus:ring-blue-500/10 placeholder:text-slate-300"
               />
            </div>

            <button 
              disabled={!symptomText.trim()}
              onClick={handleSymptomAnalysis}
              className="w-full bg-blue-600 text-white py-5 rounded-[24px] font-bold shadow-xl shadow-blue-100 active:scale-95 disabled:opacity-50 transition-all"
            >
              Find Doctor
            </button>
          </motion.div>
        } />

        <Route path="specialty" element={
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-6"
          >
            <div className="flex items-center justify-between">
              <button 
                onClick={() => {
                  const type = location.state?.type || consultType;
                  navigate('../selection', { state: { type } });
                }} 
                className="p-2 -ml-2"
              >
                <ChevronLeft size={24} />
              </button>
              {activeSpecialty !== 'All' && (
                <button onClick={() => setActiveSpecialty('All')} className="text-blue-600 text-xs font-bold px-3 py-1 bg-blue-50 rounded-full">Reset Filter</button>
              )}
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">{activeSpecialty === 'All' ? 'Find Your Specialist' : `Experts in ${activeSpecialty}`}</h1>
              <p className="text-xs text-slate-400 font-medium mb-6">
                Showing {filteredDoctors.length} doctors available for {(location.state?.type || consultType) === 'tele' ? 'video consultation' : 'home visit'}
              </p>
              
              <div className="relative group mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                <input 
                  type="text" 
                  placeholder="Search doctors, sub-specialties..." 
                  className="w-full bg-white pl-12 pr-4 py-4 rounded-[24px] shadow-sm border border-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-sm"
                />
                <button className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-slate-50 rounded-xl text-slate-400 hover:text-blue-600 transition-colors">
                  <Filter size={18} />
                </button>
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide -mx-2 px-2">
              {specialties.map(spec => (
                <button
                  key={spec}
                  onClick={() => setActiveSpecialty(spec)}
                  className={clsx(
                    "px-5 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest whitespace-nowrap transition-all border shrink-0",
                    activeSpecialty === spec 
                      ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100" 
                      : "bg-white text-slate-400 border-slate-100 hover:border-slate-200"
                  )}
                >
                  {spec}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-4">
              {filteredDoctors.length > 0 ? filteredDoctors.map(doc => (
                <div key={doc.id} className="bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm flex flex-col gap-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-blue-50 overflow-hidden border-2 border-white shadow-sm ring-1 ring-slate-100">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${doc.name}`} alt={doc.name} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-slate-900 leading-none">{doc.name}</h4>
                        <div className="flex items-center gap-1 text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full">
                          <Star size={12} fill="currentColor" />
                          <span className="text-[10px] font-bold">{doc.rating}</span>
                        </div>
                      </div>
                      <p className="text-xs text-blue-600 font-bold mt-1.5">{doc.specialty}</p>
                      <div className="flex items-center gap-3 mt-2">
                         <div className="flex items-center gap-1 text-slate-400 text-[10px] font-bold uppercase">
                           <Clock size={12} /> {doc.exp}
                         </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <p className="font-bold text-slate-900">Rs. {doc.fee}</p>
                    <button 
                      onClick={() => {
                        if (doc.available) setSelectedDoctor(doc);
                      }}
                      className={clsx(
                        "px-6 py-2.5 rounded-xl text-xs font-bold transition-all",
                        doc.available ? "bg-blue-600 text-white shadow-lg active:scale-95" : "bg-slate-100 text-slate-400 cursor-not-allowed"
                      )}
                    >
                      {doc.available ? 'Book Now' : 'Busy'}
                    </button>
                  </div>
                </div>
              )) : (
                <div className="bg-white rounded-[32px] p-12 text-center border border-slate-100 flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300">
                    <Search size={32} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">No Doctors Found</h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-[200px]">Try resetting the filters or searching for something else.</p>
                  </div>
                  <button 
                    onClick={() => setActiveSpecialty('All')}
                    className="mt-2 text-blue-600 font-bold text-xs"
                  >
                    Reset Filter
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        } />
      </Routes>
    </div>
  );
}
