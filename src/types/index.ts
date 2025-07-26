// /src/types/index.ts

export interface UserData {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
}

export interface ClientData {
  id: string;
  userId: string;
  name: string;
  domain: string;
  trackingId: string;
}

export interface BookingData {
  id: string;
  clientId: string;
  userId: string;
  bookingData: {
    name?: string;
    email?: string;
    [key: string]: any;
  };
  clientInfo: ClientInfo;
  status: 'abandoned' | 'recovered' | 'completed';
  timestamp: string;
}

export interface ClientInfo {
  userAgent: string;
  url: string;
}

export interface CampaignData {
  id: string;
  userId: string;
  subject: string;
  body: string;
  delayMinutes: number;
  isActive: boolean;
}
