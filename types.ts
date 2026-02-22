
export type UserRole = 'WORKER' | 'POSTER' | 'ADMIN';
export type Language = 'GE' | 'EN';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar: string;
  location: string;
  rating: number;
  earnings?: number;
  completedTasks?: number;
  verified: boolean;
  skills: string[];
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  job_id: string;
  content: string;
  created_at: string;
  profiles?: {
    name: string;
    avatar_url: string;
  };
}

export interface Job {
  id: string;
  title: string;
  description: string;
  category: string;
  budget: number;
  location: string;
  coordinates?: { lat: number; lng: number };
  date: string;
  startTime: string;
  endTime: string;
  isUrgent: boolean;
  isFeatured: boolean;
  posterId: string;
  city?: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING';
  timestamp: string;
  read: boolean;
}