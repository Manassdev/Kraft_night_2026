import {
  Journey,
  JourneyRequest,
  Rating,
  TrustedConnection,
  User,
} from '../types';
import { calculateTrustBreakdown } from '../utils/trustScore';
import { supabaseAuth, supabaseDb } from './supabase';

export const api = {
  login: async (email: string, password?: string): Promise<User | null> => {
    if (password) {
      const { data, error } = await supabaseAuth.signInWithPassword(email, password);
      if (data?.user && !error) {
        const { data: profile } = await supabaseDb.getUserProfile(data.user.id);
        return {
          id: data.user.id,
          name: profile?.name || data.user.user_metadata?.name || email.split('@')[0],
          email: data.user.email || email,
          gender: data.user.user_metadata?.gender || 'Male',
          trustScore: profile?.cooperation_score ?? 70,
          verified: profile?.verified ?? true,
          completedJourneys: 0,
          cooperationHistoryCount: 0,
          ratingsAverage: 5.0,
          ratingsCount: 0,
          safetyScore: 10,
        };
      }
    }

    await supabaseAuth.signInWithOtp(email);
    return null;
  },

  register: async (userData: { name: string; email: string; password?: string; gender: 'Male' | 'Female' | 'Other'; phone?: string }): Promise<User> => {
    if (userData.password) {
      const { data, error } = await supabaseAuth.signUp(userData.email, userData.password, {
        name: userData.name,
        gender: userData.gender,
        phone: userData.phone,
      });
      if (error) {
        throw error;
      }
      if (data?.user) {
        return {
          id: data.user.id,
          name: userData.name || 'Traveler',
          email: data.user.email || userData.email,
          gender: userData.gender || 'Male',
          trustScore: 70,
          verified: true,
          completedJourneys: 0,
          cooperationHistoryCount: 0,
          ratingsAverage: 0,
          ratingsCount: 0,
          safetyScore: 10,
          phone: userData.phone,
        };
      }
    }

    const { error } = await supabaseAuth.signInWithOtp(userData.email, {
      data: {
        name: userData.name,
        gender: userData.gender,
        phone: userData.phone,
      },
    });
    if (error) {
      throw error;
    }
    throw new Error('Verification email sent. Open the magic link to continue.');
  },

  getJourneys: async (): Promise<Journey[]> => {
    const dbJourneys = await supabaseDb.getJourneys();
    if (dbJourneys && dbJourneys.length > 0) {
      return dbJourneys;
    }
    return [];
  },

  createJourney: async (journeyData: Partial<Journey>): Promise<Journey | null> => {
    const created = await supabaseDb.createJourney(journeyData);
    return created;
  },

  getMatches: async (journeyId: string): Promise<Journey[]> => {
    const all = await api.getJourneys();
    return all.filter(j => j.id !== journeyId);
  },

  createRequest: async (reqData: Partial<JourneyRequest>): Promise<JourneyRequest | null> => {
    if (!reqData.journeyId || !reqData.senderId) return null;
    const reqId = await supabaseDb.createRequest(reqData.journeyId, reqData.senderId);
    if (!reqId) return null;
    const fallback: JourneyRequest = {
      id: reqId,
      journeyId: reqData.journeyId,
      senderId: reqData.senderId,
      senderName: reqData.senderName || 'User',
      senderTrustScore: reqData.senderTrustScore || 70,
      senderVerified: reqData.senderVerified ?? true,
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
    return fallback;
  },

  acceptRequest: async (requestId: string): Promise<{ success: boolean }> => {
    const ok = await supabaseDb.updateRequestStatus(requestId, 'accepted');
    return { success: ok };
  },

  rejectRequest: async (requestId: string): Promise<{ success: boolean }> => {
    const ok = await supabaseDb.updateRequestStatus(requestId, 'rejected');
    return { success: ok };
  },

  submitRating: async (ratingData: Partial<Rating>): Promise<Rating | null> => {
    if (!ratingData.journeyId || !ratingData.fromUserId || !ratingData.toUserId) {
      return null;
    }

    const saved: Rating = {
      id: ratingData.id || '',
      fromUserId: ratingData.fromUserId,
      fromUserName: ratingData.fromUserName || 'Traveler',
      toUserId: ratingData.toUserId,
      toUserName: ratingData.toUserName || '',
      journeyId: ratingData.journeyId,
      stars: ratingData.stars || 0,
      comment: ratingData.comment || '',
      createdAt: 'Just now',
    };

    const ok = await supabaseDb.submitRating({
      journeyId: saved.journeyId,
      reviewerId: saved.fromUserId,
      reviewedUserId: saved.toUserId,
      stars: saved.stars,
      comment: saved.comment,
    });

    if (!ok) return null;
    return saved;
  },

  getUserTrust: async (userId: string) => {
    const { data: user } = await supabaseDb.getUserProfile(userId);
    if (!user) return null;
    return calculateTrustBreakdown({
      id: user.id,
      name: user.name,
      email: user.email,
      gender: 'Male',
      trustScore: user.cooperation_score ?? 70,
      verified: user.verified ?? true,
      completedJourneys: 0,
      cooperationHistoryCount: 0,
      ratingsAverage: 0,
      ratingsCount: 0,
      safetyScore: 10,
    });
  },

  getTrusted: async (userId: string): Promise<TrustedConnection[]> => {
    const dbTrusted = await supabaseDb.getTrusted(userId);
    if (dbTrusted && dbTrusted.length > 0) {
      return dbTrusted;
    }
    return [];
  },
};