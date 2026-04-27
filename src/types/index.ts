/**
 * Global Types for DR.Pathao
 */

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  role: 'patient';
  dob?: string;
  age?: number;
  sex?: 'male' | 'female' | 'other';
  bloodGroup?: string;
  address?: string;
  emergencyContact?: {
    name: string;
    phone: string;
  };
  onboardingComplete?: boolean;
  phoneVerified?: boolean;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  qualification: string;
  experience: number;
  rating: number;
  consultationFee: number;
  available: boolean;
  avatar: string;
}

export interface Reminder {
  id: string;
  userId: string;
  title: string;
  type: 'medication' | 'vaccination' | 'cycle' | 'appointment' | 'followup';
  time: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  active: boolean;
  notes?: string;
  dosage?: string;
  taken?: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // ISO format (YYYY-MM-DD)
  time?: string; // Optional time (HH:mm)
  type: 'public' | 'personal';
  category: 'health_day' | 'appointment' | 'medication' | 'cycle' | 'alert' | 'vaccination' | 'screening';
  description?: string;
  location?: string;
  status?: 'pending' | 'completed' | 'skipped';
  // Virtual fields for reminders
  isReminder?: boolean;
  reminderId?: string;
  // Specific fields for different categories
  medicationInfo?: {
    dosage: string;
    instructions?: string;
  };
  cycleInfo?: {
    day: number;
    phase: 'menstrual' | 'follicular' | 'ovulatory' | 'luteal';
  };
}

export interface Appointment {
  id: string;
  doctorId: number;
  doctorName: string;
  userId: string;
  userName: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: any;
  fee: number;
  type: 'tele' | 'home';
  preferredDate?: string;
  preferredTime?: string;
  bookingOption?: 'scheduled' | 'asap' | 'queue';
}
