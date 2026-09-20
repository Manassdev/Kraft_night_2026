export type CooperationType = 'daily_walk' | 'carry_along' | 'share_vehicle' | 'join_journey';

export type CompanionPreference = 'Male' | 'Female' | 'Any' | 'Female only' | 'Same college';

export type VehicleType = 'Car' | 'Two-wheeler' | 'Auto' | 'Cab';

export type TravelType = 'Walk' | 'Bus' | 'Bike' | 'Car' | 'Other';

export type ItemSize = 'Small Envelope' | 'Book / Document' | 'Medium Box' | 'Pocket Parcel' | 'Small Packet' | 'Keys / Wallet';

export type RequestStatus = 'pending' | 'accepted' | 'rejected' | 'completed';

export interface User {
  id: string;
  name: string;
  email: string;
  gender: 'Male' | 'Female' | 'Other';
  trustScore: number;
  verified: boolean;
  avatar?: string;
  completedJourneys: number;
  cooperationHistoryCount: number;
  ratingsAverage: number;
  ratingsCount: number;
  safetyScore: number;
  phone?: string;
}

export interface VehicleDetails {
  vehicleType: VehicleType;
  availableSeats: number;
  travelContribution: number; // e.g. ₹50/person
  contribution?: number;
}

export interface ItemDetails {
  item?: string;
  itemName?: string;
  description?: string;
  itemDescription?: string;
  size?: ItemSize;
  itemSize?: ItemSize;
  suggestedTip: number; // e.g. ₹20
  isPermitted: boolean;
}

export interface Journey {
  id: string;
  userId: string;
  userName: string;
  userTrustScore: number;
  userVerified: boolean;
  userGender?: string;
  from: string;
  to: string;
  time: string; // e.g. "5:00 PM"
  cooperationType: CooperationType;
  status: 'active' | 'completed' | 'scheduled' | 'cancelled';
  notes?: string;
  companionPreference?: CompanionPreference;
  travelType?: TravelType;
  vehicleDetails?: VehicleDetails;
  itemDetails?: ItemDetails;
  meetingPoint?: string;
}

export interface JourneyRequest {
  id: string;
  journeyId: string;
  senderId: string;
  senderName: string;
  senderTrustScore: number;
  senderVerified: boolean;
  receiverId: string;
  receiverName: string;
  requestType: CooperationType;
  status: RequestStatus;
  message?: string;
  createdAt: string;
  journeyFrom: string;
  journeyTo: string;
  journeyTime: string;
}

export interface ActiveJourneySession {
  id: string;
  journeyId: string;
  participants: {
    id: string;
    name: string;
    trustScore: number;
    verified: boolean;
    role: 'creator' | 'cooperator';
  }[];
  from: string;
  to: string;
  time: string;
  cooperationType: CooperationType;
  meetingPoint: string;
  status: 'in_progress' | 'completed';
  startedAt: string;
}

export interface Rating {
  id: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  journeyId: string;
  stars: number; // 1-5
  comment: string;
  createdAt: string;
}

export interface TrustedConnection {
  id: string;
  userId: string;
  trustedUserId: string;
  trustedUserName: string;
  trustedUserScore: number;
  verified: boolean;
  addedAt: string;
}

export interface MatchFactor {
  label: string;
  score: number;
  maxScore: number;
  description: string;
}

export interface MatchResult {
  journey: Journey;
  matchPercentage: number;
  reasons: string[];
  factors: MatchFactor[];
}

export interface TrustScoreBreakdown {
  verification: number; // max 30
  completedJourneys: number; // max 25
  cooperationHistory: number; // max 20
  ratings: number; // max 15
  safetyRecord: number; // max 10
  total: number; // max 100
  label: 'Verified' | 'Trusted' | 'New user';
}
