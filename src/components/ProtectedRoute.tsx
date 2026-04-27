import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useUIStore } from '../store/useUIStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuthStore();
  const { setLoginModalOpen, setOnboardingModalOpen } = useUIStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-bold text-sm">Synchronizing Health Data...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // If not logged in, redirect to home and open login modal
    setTimeout(() => {
      setLoginModalOpen(true);
    }, 100);
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (user && !user.onboardingComplete && location.pathname !== '/profile') {
    // If logged in but profile not complete, redirect to home and open onboarding modal
    // (Except when trying to access the profile itself)
    setTimeout(() => {
      setOnboardingModalOpen(true);
    }, 100);
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
