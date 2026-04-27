import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Stethoscope, Bell, ShoppingBag, ClipboardList, AlertCircle, Loader2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { auth, resendVerificationEmail } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function AppLayout() {
  const location = useLocation();
  const [isVerified, setIsVerified] = useState(true);
  const [isResending, setIsResending] = useState(false);
  const [showBanner, setShowBanner] = useState(true);

  React.useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsVerified(user.emailVerified || user.providerData.some(p => p.providerId === 'google.com'));
      }
    });
  }, []);

  const handleResend = async () => {
    setIsResending(true);
    try {
      await resendVerificationEmail();
      alert('Verification email sent! Please check your inbox.');
    } catch (err: any) {
      alert(err.message || 'Failed to resend email');
    } finally {
      setIsResending(false);
    }
  };

  const navItems = [
    { label: 'Home', icon: Home, path: '/' },
    { label: 'Consult', icon: Stethoscope, path: '/consult' },
    { label: 'Reminders', icon: Bell, path: '/reminders' },
    { label: 'Pharmacy', icon: ShoppingBag, path: '/pharmacy' },
    { label: 'Records', icon: ClipboardList, path: '/records' },
  ];

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-900 font-sans max-w-md mx-auto shadow-2xl relative overflow-hidden">
      {!isVerified && showBanner && (
        <div className="bg-rose-500 text-white p-3 flex items-center justify-between gap-3 text-[11px] font-bold z-50">
          <div className="flex items-center gap-2">
            <AlertCircle size={14} />
            <span>Verify your email to unlock all features.</span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleResend}
              disabled={isResending}
              className="bg-white/20 hover:bg-white/30 px-2 py-1 rounded-lg transition-colors flex items-center gap-1"
            >
              {isResending ? <Loader2 size={10} className="animate-spin" /> : 'Resend'}
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-24">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="absolute bottom-0 left-0 right-0 h-20 bg-white border-t border-slate-200 flex items-center justify-around px-2 pb-safe shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center gap-1 transition-all duration-200 w-16",
                isActive ? "text-blue-600 scale-110" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium tracking-wide">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
