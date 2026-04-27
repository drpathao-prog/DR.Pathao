import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User as UserIcon, 
  Calendar, 
  Heart, 
  ShieldCheck, 
  ArrowLeft, 
  Mail, 
  Phone, 
  ChevronRight, 
  MapPin, 
  Edit3, 
  Save, 
  X, 
  CheckCircle2, 
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { auth, updateUserProfile } from '../../lib/firebase';
import dayjs from '../../utils/date';
import { multiFactor } from 'firebase/auth';

export default function ProfileScreen() {
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    dob: '',
    sex: '',
    bloodGroup: '',
    address: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form data when user is loaded or editing starts
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        dob: user.dob || '',
        sex: user.sex || '',
        bloodGroup: user.bloodGroup || '',
        address: user.address || ''
      });
    }
  }, [user, isEditing]);

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-bold">Please log in to view your profile.</h2>
        <Link to="/" className="text-blue-600 mt-4 underline">Back Home</Link>
      </div>
    );
  }

  const handleSave = async () => {
    // Validation
    if (!formData.name.trim()) {
      setError('Name cannot be empty');
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      await updateUserProfile(user.id, {
        name: formData.name,
        phone: formData.phone,
        dob: formData.dob,
        sex: formData.sex as any,
        bloodGroup: formData.bloodGroup,
        address: formData.address,
        onboardingComplete: true // Ensure it stays true if they edited
      });
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const sections = [
    { label: 'Full Name', value: user.name, icon: UserIcon, field: 'name' },
    { label: 'Birthday', value: user.dob ? dayjs(user.dob).format('MMM DD, YYYY') : 'Not set', icon: Calendar, field: 'dob', type: 'date' },
    { label: 'Sex', value: user.sex || 'Not set', icon: UserIcon, field: 'sex', type: 'select', options: ['male', 'female', 'other'] },
    { label: 'Blood group', value: user.bloodGroup || 'Not set', icon: Heart, field: 'bloodGroup' },
    { label: 'Address', value: user.address || 'Not set', icon: MapPin, field: 'address' },
  ];

  return (
    <div className="bg-slate-50 min-h-screen pb-12">
      {/* Header */}
      <div className="bg-white p-6 flex items-center justify-between border-b border-slate-100 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link to="/" className="p-2 -ml-2 text-slate-400 hover:text-slate-900 transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-xl font-bold text-slate-900">
            {isEditing ? 'Edit Profile' : 'Personal Information'}
          </h1>
        </div>
        
        {!isEditing ? (
          <button 
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors shadow-sm"
          >
            <Edit3 size={14} />
            Edit
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsEditing(false)}
              disabled={isSaving}
              className="p-2 text-slate-400 hover:text-slate-600 font-bold text-xs"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
              Save
            </button>
          </div>
        )}
      </div>

      <div className="p-6 space-y-6">
        {/* Success / Error Messages */}
        <AnimatePresence>
          {saveSuccess && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-emerald-500 text-white p-4 rounded-2xl shadow-xl shadow-emerald-100 flex items-center gap-3"
            >
              <CheckCircle2 size={20} />
              <p className="text-sm font-bold">Profile updated successfully!</p>
            </motion.div>
          )}

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-2xl flex items-center gap-3"
            >
              <AlertCircle size={20} />
              <p className="text-sm font-bold">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Profile Card Summary */}
        <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-20 h-20 rounded-3xl bg-blue-50 border-2 border-white shadow-sm overflow-hidden shrink-0">
             <img src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt="Avatar" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{user.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] bg-emerald-50 text-emerald-600 font-bold px-2 py-0.5 rounded-full uppercase tracking-widest leading-none">
                Verified Patient
              </span>
            </div>
          </div>
        </div>

        {/* Editable Details */}
        <div className="space-y-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Account Details</p>
          <div className="bg-white rounded-[32px] overflow-hidden border border-slate-100 shadow-sm divide-y divide-slate-50">
            {sections.map((sec, idx) => (
              <div key={idx} className="p-5 flex flex-col gap-1">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center">
                    <sec.icon size={16} />
                  </div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{sec.label}</label>
                </div>
                
                {isEditing ? (
                  <div className="mt-1">
                    {sec.type === 'date' ? (
                      <input 
                        type="date"
                        value={formData[sec.field as keyof typeof formData]}
                        onChange={(e) => setFormData({...formData, [sec.field]: e.target.value})}
                        className="w-full bg-slate-50 border-none rounded-xl px-4 py-2 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500"
                      />
                    ) : sec.type === 'select' ? (
                      <select 
                        value={formData[sec.field as keyof typeof formData]}
                        onChange={(e) => setFormData({...formData, [sec.field]: e.target.value})}
                        className="w-full bg-slate-50 border-none rounded-xl px-4 py-2 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 capitalize"
                      >
                        <option value="">Select...</option>
                        {sec.options?.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : (
                      <input 
                        type="text"
                        placeholder={`Enter ${sec.label}`}
                        value={formData[sec.field as keyof typeof formData]}
                        onChange={(e) => setFormData({...formData, [sec.field]: e.target.value})}
                        className="w-full bg-slate-50 border-none rounded-xl px-4 py-2 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500"
                      />
                    )}
                  </div>
                ) : (
                  <p className={`text-sm font-bold text-slate-700 ml-11`}>{sec.value}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact Info (Read Only for email usually) */}
        <div className="space-y-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Contact Information</p>
          <div className="bg-white rounded-[32px] overflow-hidden border border-slate-100 shadow-sm divide-y divide-slate-50">
            <div className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center">
                  <Mail size={18} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Email</label>
                  <p className="text-sm font-bold text-slate-700">{user.email}</p>
                </div>
              </div>
              <ShieldCheck className="text-emerald-500" size={18} />
            </div>
            <div className="p-5 flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center">
                  <Phone size={18} />
                </div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Phone Number</label>
              </div>
              {isEditing ? (
                <input 
                  type="tel"
                  placeholder="+977 98XXXXXXXX"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full bg-slate-50 border-none rounded-xl px-4 py-2 text-sm font-bold text-slate-700 mt-1 focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-sm font-bold text-slate-700 ml-14">{user.phone || 'Not linked'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="space-y-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Emergency Contact</p>
          <div className="bg-rose-50 rounded-[32px] p-6 border border-rose-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-rose-600 shadow-sm shrink-0">
               <Heart size={24} />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-rose-900">{user.emergencyContact?.name || 'Not set'}</h4>
              <p className="text-xs text-rose-600 font-medium">
                {user.emergencyContact?.phone || 'Safety feature placeholder'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
