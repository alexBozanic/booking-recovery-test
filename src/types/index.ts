export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  subscription: 'free' | 'pro' | 'enterprise';
}

export interface Client {
  id: string;
  userId: string;
  name: string;
  domain: string;
  trackingId: string;
  createdAt: string;
}

export interface Booking {
  id: string;
  clientId: string;
  sessionId: string;
  email?: string;
  phone?: string;
  name?: string;
  bookingData: Record<string, any>;
  status: 'abandoned' | 'completed' | 'recovered';
  abandonedAt?: string;
  completedAt?: string;
  recoveredAt?: string;
}

export interface Campaign {
  id: string;
  clientId: string;
  name: string;
  type: 'email' | 'sms';
  template: string;
  delayMinutes: number;
  isActive: boolean;
}
