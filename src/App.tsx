/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import FirebaseSync from './components/FirebaseSync';
import OnboardingModal from './components/OnboardingModal';
import LoginModal from './components/LoginModal';
import { useUIStore } from './store/useUIStore';

import ProtectedRoute from './components/ProtectedRoute';

// Direct imports
import HomeScreen from './features/home/HomeScreen';
import RemindersScreen from './features/reminders/RemindersScreen';
import ConsultScreen from './features/consult/ConsultScreen';
import PharmacyScreen from './features/pharmacy/PharmacyScreen';
import RecordsScreen from './features/records/RecordsScreen';
import NursingScreen from './features/nursing/NursingScreen';
import ProfileScreen from './features/profile/ProfileScreen';
import CalendarScreen from './features/profile/CalendarScreen';

export default function App() {
  const { isLoginModalOpen, setLoginModalOpen } = useUIStore();

  return (
    <HashRouter>
      <FirebaseSync />
      <OnboardingModal />
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setLoginModalOpen(false)} 
      />
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/consult/*" element={<ConsultScreen />} />
          <Route path="/reminders" element={<ProtectedRoute><RemindersScreen /></ProtectedRoute>} />
          <Route path="/pharmacy" element={<PharmacyScreen />} />
          <Route path="/records" element={<ProtectedRoute><RecordsScreen /></ProtectedRoute>} />
          <Route path="/nursing" element={<NursingScreen />} />
          <Route path="/profile" element={<ProtectedRoute><ProfileScreen /></ProtectedRoute>} />
          <Route path="/profile/calendar" element={<ProtectedRoute><CalendarScreen /></ProtectedRoute>} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
