import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, LogIn, Mail, Smartphone, ChevronLeft, Loader2, User, Lock, CheckCircle2 } from 'lucide-react';
import { 
  signInWithGoogle, 
  signInWithEmail, 
  signUpWithEmail, 
  setupRecaptcha, 
  signInWithPhone,
  db,
  auth
} from '../lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = 'social' | 'email-signin' | 'email-signup' | 'phone' | 'otp';

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [mode, setMode] = useState<AuthMode>('social');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  // Phone/OTP states
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+977');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<any>(null);

  const COUNTRY_CODES = [
    { code: '+977', country: 'Nepal', flag: '🇳🇵' },
    { code: '+91', country: 'India', flag: '🇮🇳' },
    { code: '+1', country: 'USA/Canada', flag: '🇺🇸' },
    { code: '+44', country: 'UK', flag: '🇬🇧' },
  ];

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    setError(null);
    try {
      if (mode === 'email-signup') {
        if (!name.trim()) throw new Error('Please enter your full name');
        await signUpWithEmail(email, password, name);
        onClose();
      } else {
        await signInWithEmail(email, password);
        onClose();
      }
    } catch (err: any) {
      console.error('Email Auth Error:', err);
      setError(getAuthErrorMessage(err, mode));
    } finally {
      setIsLoading(false);
    }
  };

  const getAuthErrorMessage = (err: any, mode?: string) => {
    if (err.code === 'auth/email-already-in-use') {
      return 'This email is already registered. Please sign in instead.';
    } else if (err.code === 'auth/weak-password') {
      return 'Password should be at least 6 characters.';
    } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
      return 'Invalid email or password. Please check your credentials.';
    } else if (err.code === 'auth/billing-not-enabled') {
      return 'Phone authentication/Identity Platform features require the Firebase Blaze plan. Please use Email or Google sign-in for now.';
    } else if (err.code === 'auth/operation-not-allowed') {
      return err.message?.includes('region') 
        ? 'SMS messages are not enabled for this region. Please update SMS settings in Firebase Console.'
        : 'This sign-in method is not enabled. Please enable it in the Firebase Console.';
    } else if (err.message) {
      return err.message;
    }
    return 'Authentication failed. Please try again.';
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const fullPhone = `${countryCode}${phoneNumber}`;
      
      // PREVIEW BYPASS: If using a specific test number, bypass real SMS
      if (phoneNumber === '0000000000' || phoneNumber === '9800000000') {
        setConfirmationResult({
          confirm: async (code: string) => {
            if (code === '123456') {
              const { signInAnonymously } = await import('firebase/auth');
              const result = await signInAnonymously(auth);
              // Setup a basic profile for the demo user
              await setDoc(doc(db, 'users', result.user.uid), {
                id: result.user.uid,
                name: 'Demo Patient',
                email: 'demo@pathao.com',
                phone: fullPhone,
                role: 'patient',
                onboardingComplete: false,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
              });
              onClose();
              return result;
            }
            throw new Error('Invalid code. For demo number, use 123456');
          }
        });
        setMode('otp');
        setIsLoading(false);
        return;
      }

      const verifier = setupRecaptcha('recaptcha-container');
      const result = await signInWithPhone(fullPhone, verifier);
      setConfirmationResult(result);
      setMode('otp');
    } catch (err: any) {
      console.error('Phone Auth Error:', err);
      setError(getAuthErrorMessage(err));
      // Cleanup recaptcha if it fails
      const container = document.getElementById('recaptcha-container');
      if (container) container.innerHTML = '';
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await confirmationResult.confirm(otp);
      onClose();
    } catch (err: any) {
      console.error('OTP Error:', err);
      setError(getAuthErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setPhoneNumber('');
    setOtp('');
    setConfirmationResult(null);
    setError(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-5">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            key={mode}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="w-full max-w-sm bg-white rounded-[40px] p-8 relative z-10 shadow-2xl overflow-hidden"
          >
            <div id="recaptcha-container"></div>
            
            <button 
              onClick={onClose} 
              className="absolute right-6 top-6 text-slate-400 hover:text-slate-600 z-20"
            >
              <X size={20} />
            </button>

            {mode !== 'social' && (
              <button 
                onClick={() => {
                  if (mode === 'otp') setMode('phone');
                  else setMode('social');
                  
                  if (mode !== 'otp') resetForm();
                }}
                className="absolute left-6 top-6 text-slate-400 hover:text-slate-600 z-20 flex items-center gap-1 text-xs font-bold"
              >
                <ChevronLeft size={16} />
                Back
              </button>
            )}

            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mx-auto mb-4">
                <LogIn size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                {mode === 'social' ? 'Sign in Needed' : 
                 mode === 'email-signin' ? 'Welcome Back' : 
                 mode === 'email-signup' ? 'Create Account' : 
                 mode === 'phone' ? 'Phone Sign In' : 'Verify Phone'}
              </h3>
              <p className="text-xs text-slate-500 mt-2">
                {mode === 'social' ? 'Join DR.Pathao to access health services' : 
                 mode === 'otp' ? `We sent a code to ${countryCode}${phoneNumber}` : 'Please enter your details'}
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-xs font-medium text-center">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-3">
              {mode === 'social' ? (
                <>
                  <button
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                    className="flex items-center justify-center gap-3 w-full bg-white border border-slate-200 py-3.5 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-50 disabled:scale-100"
                  >
                    {isLoading ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
                    )}
                    Continue with Google
                  </button>

                  <button 
                    onClick={() => setMode('phone')}
                    className="flex items-center justify-center gap-3 w-full bg-slate-900 text-white py-3.5 rounded-2xl font-bold hover:bg-slate-800 transition-all active:scale-95"
                  >
                    <Smartphone size={20} />
                    Continue with Phone
                  </button>

                  <button 
                    onClick={() => setMode('email-signin')}
                    className="flex items-center justify-center gap-3 w-full bg-slate-100 text-slate-700 py-3.5 rounded-2xl font-bold hover:bg-slate-200 transition-all active:scale-95"
                  >
                    <Mail size={20} />
                    Continue with Email
                  </button>

                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-100"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-slate-400 font-bold tracking-widest text-[9px]">Help us grow DR.Pathao</span>
                    </div>
                  </div>

                  <p className="text-[10px] text-center text-slate-400 mt-4 px-4">
                    By continuing, you agree to DR.Pathao's <span className="text-blue-500 underline">Terms of Service</span> and <span className="text-blue-500 underline">Privacy Policy</span>.
                  </p>
                </>
              ) : mode === 'phone' ? (
                <form onSubmit={handlePhoneSubmit} className="space-y-4">
                  <div className="flex gap-2">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="w-24 h-14 bg-slate-50 border-none rounded-3xl text-sm font-bold focus:ring-2 focus:ring-blue-500"
                    >
                      {COUNTRY_CODES.map(cc => (
                        <option key={cc.code} value={cc.code}>{cc.flag} {cc.code}</option>
                      ))}
                    </select>
                    <div className="flex-1 relative">
                      <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        type="tel"
                        placeholder="Phone Number"
                        required
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                        className="w-full h-14 pl-12 pr-4 bg-slate-50 border-none rounded-3xl text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400 text-center font-bold px-4">
                    Preview Mode: Use <span className="text-blue-500">9800000000</span> for testing
                  </p>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-200 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:scale-100"
                  >
                    {isLoading && <Loader2 className="animate-spin" size={20} />}
                    Send OTP Code
                  </button>
                </form>
              ) : mode === 'otp' ? (
                <form onSubmit={handleOtpSubmit} className="space-y-4">
                  <div className="relative">
                    <CheckCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      placeholder="6-digit OTP"
                      required
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      className="w-full h-14 pl-12 pr-4 bg-slate-50 border-none rounded-3xl text-sm font-bold tracking-[1em] text-center focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>

                  <p className="text-[10px] text-slate-400 text-center font-bold px-4">
                    Preview OTP: <span className="text-blue-500">123456</span>
                  </p>

                  <button
                    type="submit"
                    disabled={isLoading || otp.length < 6}
                    className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-200 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:scale-100"
                  >
                    {isLoading && <Loader2 className="animate-spin" size={20} />}
                    Verify & Sign In
                  </button>
                  
                  <p className="text-center text-xs text-slate-500 pt-2">
                    Didn't receive code?{' '}
                    <button 
                      type="button"
                      onClick={() => setMode('phone')}
                      className="text-blue-600 font-bold hover:underline"
                    >
                      Resend
                    </button>
                  </p>
                </form>
              ) : (
                <form onSubmit={handleEmailAuth} className="space-y-3">
                  {mode === 'email-signup' && (
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        type="text"
                        placeholder="Full Name"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full h-14 pl-12 pr-4 bg-slate-50 border-none rounded-3xl text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                    </div>
                  )}
                  
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="email"
                      placeholder="Email Address"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-14 pl-12 pr-4 bg-slate-50 border-none rounded-3xl text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>

                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="password"
                      placeholder="Password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-14 pl-12 pr-4 bg-slate-50 border-none rounded-3xl text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-200 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:scale-100"
                  >
                    {isLoading && <Loader2 className="animate-spin" size={20} />}
                    {mode === 'email-signin' ? 'Sign In' : 'Create Account'}
                  </button>

                  <p className="text-center text-xs text-slate-500 pt-2">
                    {mode === 'email-signin' ? (
                      <>
                        New to DR.Pathao?{' '}
                        <button 
                          type="button"
                          onClick={() => {
                            setMode('email-signup');
                            resetForm();
                          }}
                          className="text-blue-600 font-bold hover:underline"
                        >
                          Create an account
                        </button>
                      </>
                    ) : (
                      <>
                        Already have an account?{' '}
                        <button 
                          type="button"
                          onClick={() => {
                            setMode('email-signin');
                            resetForm();
                          }}
                          className="text-blue-600 font-bold hover:underline"
                        >
                          Sign in here
                        </button>
                      </>
                    )}
                  </p>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
