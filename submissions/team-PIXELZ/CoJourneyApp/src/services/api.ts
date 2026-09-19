import {
  INITIAL_JOURNEYS,
  INITIAL_TRUSTED,
  MOCK_USERS,
} from '../data/mockData';
import {
  Journey,
  JourneyRequest,
  Rating,
  TrustedConnection,
  User,
} from '../types';
import { calculateTrustBreakdown } from '../utils/trustScore';

const BASE_URL = 'http://10.0.2.2:5000'; // Standard Android emulator localhost bridge

// Helper for fetch with automatic mock fallback
async function fetchWithFallback<T>(
  endpoint: string,
  options: RequestInit,
  fallbackData: T
): Promise<T> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // Quick 2s timeout
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });
    clearTimeout(timeoutId);
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Gracefully fallback to mock
  }
  return fallbackData;
}

export const api = {
  login: async (email: string): Promise<User> => {
    const fallback =
      Object.values(MOCK_USERS).find(u => u.email.toLowerCase() === email.toLowerCase()) ||
      MOCK_USERS.user_rahul;
    return fetchWithFallback('/login', { method: 'POST', body: JSON.stringify({ email }) }, fallback);
  },

  register: async (userData: Partial<User>): Promise<User> => {
    const fallback: User = {
      id: `user_${Date.now()}`,
      name: userData.name || 'New User',
      email: userData.email || '',
      gender: userData.gender || 'Male',
      trustScore: 70,
      verified: true,
      completedJourneys: 0,
      cooperationHistoryCount: 0,
      ratingsAverage: 5.0,
      ratingsCount: 0,
      safetyScore: 10,
    };
    return fetchWithFallback('/register', { method: 'POST', body: JSON.stringify(userData) }, fallback);
  },

  getJourneys: async (): Promise<Journey[]> => {
    return fetchWithFallback('/journeys', { method: 'GET' }, INITIAL_JOURNEYS);
  },

  createJourney: async (journeyData: Partial<Journey>): Promise<Journey> => {
    const fallback: Journey = {
      id: `journey_${Date.now()}`,
      userId: journeyData.userId || 'user_rahul',
      userName: journeyData.userName || 'Rahul',
      userTrustScore: journeyData.userTrustScore || 92,
      userVerified: true,
      from: journeyData.from || '',
      to: journeyData.to || '',
      time: journeyData.time || '5:00 PM',
      cooperationType: journeyData.cooperationType || 'daily_walk',
      status: 'scheduled',
      notes: journeyData.notes,
      vehicleDetails: journeyData.vehicleDetails,
      itemDetails: journeyData.itemDetails,
      companionPreference: journeyData.companionPreference,
      travelType: journeyData.travelType,
    };
    return fetchWithFallback(
      '/journeys',
      { method: 'POST', body: JSON.stringify(journeyData) },
      fallback
    );
  },

  getMatches: async (journeyId: string): Promise<Journey[]> => {
    const fallback = INITIAL_JOURNEYS.filter(j => j.id !== journeyId);
    return fetchWithFallback(`/matches/${journeyId}`, { method: 'GET' }, fallback);
  },

  createRequest: async (reqData: Partial<JourneyRequest>): Promise<JourneyRequest> => {
    const fallback: JourneyRequest = {
      id: `req_${Date.now()}`,
      journeyId: reqData.journeyId || '',
      senderId: reqData.senderId || 'user_rahul',
      senderName: reqData.senderName || 'Rahul',
      senderTrustScore: 92,
      senderVerified: true,
      receiverId: reqData.receiverId || '',
      receiverName: reqData.receiverName || '',
      requestType: reqData.requestType || 'share_vehicle',
      status: 'pending',
      message: reqData.message,
      createdAt: 'Just now',
      journeyFrom: reqData.journeyFrom || '',
      journeyTo: reqData.journeyTo || '',
      journeyTime: reqData.journeyTime || '',
    };
    return fetchWithFallback(
      '/requests',
      { method: 'POST', body: JSON.stringify(reqData) },
      fallback
    );
  },

  acceptRequest: async (requestId: string): Promise<{ success: boolean }> => {
    return fetchWithFallback(`/requests/${requestId}/accept`, { method: 'PUT' }, { success: true });
  },

  rejectRequest: async (requestId: string): Promise<{ success: boolean }> => {
    return fetchWithFallback(`/requests/${requestId}/reject`, { method: 'PUT' }, { success: true });
  },

  submitRating: async (ratingData: Partial<Rating>): Promise<Rating> => {
    const fallback: Rating = {
      id: `rate_${Date.now()}`,
      fromUserId: ratingData.fromUserId || 'user_rahul',
      fromUserName: ratingData.fromUserName || 'Rahul',
      toUserId: ratingData.toUserId || '',
      toUserName: ratingData.toUserName || '',
      journeyId: ratingData.journeyId || '',
      stars: ratingData.stars || 5,
      comment: ratingData.comment || '',
      createdAt: 'Just now',
    };
    return fetchWithFallback(
      '/ratings',
      { method: 'POST', body: JSON.stringify(ratingData) },
      fallback
    );
  },

  getUserTrust: async (userId: string) => {
    const user = MOCK_USERS[userId] || MOCK_USERS.user_rahul;
    return fetchWithFallback(`/users/${userId}/trust`, { method: 'GET' }, calculateTrustBreakdown(user));
  },

  getTrusted: async (): Promise<TrustedConnection[]> => {
    return fetchWithFallback('/trusted', { method: 'GET' }, INITIAL_TRUSTED);
  },

  addTrusted: async (targetUser: Partial<User>): Promise<TrustedConnection> => {
    const fallback: TrustedConnection = {
      id: `trust_${Date.now()}`,
      userId: 'user_rahul',
      trustedUserId: targetUser.id || 'user_anjali',
      trustedUserName: targetUser.name || 'Anjali',
      trustedUserScore: targetUser.trustScore || 94,
      verified: targetUser.verified || true,
      addedAt: 'Just now',
    };
    return fetchWithFallback(
      '/trusted',
      { method: 'POST', body: JSON.stringify({ trustedUserId: targetUser.id }) },
      fallback
    );
  },
};
