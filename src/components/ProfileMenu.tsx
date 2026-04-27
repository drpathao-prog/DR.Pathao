import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, ClipboardList, LogIn, LogOut, Heart, HelpCircle, MessageSquare, Shield, X, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { Link } from 'react-router-dom';

interface ProfileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginClick: () => void;
}

export default function ProfileMenu({ isOpen, onClose, onLoginClick }: ProfileMenuProps) {
  const { user, logout } = useAuthStore();

  const menuItems = [
    { label: 'General Information', icon: User, path: '/profile', color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Health Calendar', icon: CalendarIcon, path: '/profile/calendar', color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Medical Records', icon: ClipboardList, path: '/records', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Donate Now', icon: Heart, path: '/donate', color: 'text-rose-600', bg: 'bg-rose-50' },
    { label: 'Support', icon: HelpCircle, path: '/support', color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Feedback', icon: MessageSquare, path: '/feedback', color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Terms and Conditions', icon: Shield, path: '/terms', color: 'text-slate-600', bg: 'bg-slate-50' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-[85%] max-w-sm bg-white z-[101] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-bottom border-slate-100">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-slate-900">Profile</h2>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X size={24} className="text-slate-400" />
                </button>
              </div>

              {/* User Info Section */}
              <div className="flex items-center gap-4 p-4 rounded-[24px] bg-slate-50 border border-slate-100">
                <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                  <img 
                    src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'Guest'}`} 
                    alt="User" 
                  />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{user?.name || 'Welcome, Guest!'}</h3>
                  <p className="text-xs text-slate-500 font-medium">{user?.email || 'Sign in to access all features'}</p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-2">
              {menuItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.path}
                  onClick={onClose}
                  className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-xl ${item.bg} ${item.color}`}>
                      <item.icon size={20} />
                    </div>
                    <span className="text-sm font-bold text-slate-700">{item.label}</span>
                  </div>
                  <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-400" />
                </Link>
              ))}
            </div>

            {/* Footer / Auth Button */}
            <div className="p-6 border-t border-slate-100">
              {user ? (
                <button
                  onClick={() => {
                    logout();
                    onClose();
                  }}
                  className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl bg-rose-50 text-rose-600 font-bold hover:bg-rose-100 transition-colors"
                >
                  <LogOut size={20} />
                  Logout
                </button>
              ) : (
                <button
                  onClick={() => {
                    onClose();
                    onLoginClick();
                  }}
                  className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100"
                >
                  <LogIn size={20} />
                  Login / Sign Up
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
