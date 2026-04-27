import React, { useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useReminderStore } from '../store/useReminderStore';
import { useCalendarStore } from '../store/useCalendarStore';
import { useUIStore } from '../store/useUIStore';

export default function FirebaseSync() {
  const { user } = useAuthStore();
  const setOnboardingModalOpen = useUIStore(state => state.setOnboardingModalOpen);
  const subscribeReminders = useReminderStore(state => state.subscribe);
  const subscribeCalendar = useCalendarStore(state => state.subscribe);

  useEffect(() => {
    if (user) {
      const unsubReminders = subscribeReminders();
      const unsubCalendar = subscribeCalendar();

      // Automatically trigger onboarding for first-time users
      if (!user.onboardingComplete) {
        setOnboardingModalOpen(true);
      }

      return () => {
        unsubReminders();
        unsubCalendar();
      };
    }
  }, [user, subscribeReminders, subscribeCalendar, setOnboardingModalOpen]);

  return null;
}
