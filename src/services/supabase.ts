import { createClient, type AuthChangeEvent, type Session } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-url-polyfill/auto';
import { CooperationType, Journey, JourneyRequest, TrustedConnection, VehicleType } from '../types';

const supabaseUrl = 'https://irvuwyllixbmpjujsqqc.supabase.co';
const supabasePublishableKey = 'sb_publishable_BRuI6LAODW4NExrEzofFjQ_9n_FFr0U';

export const supabase = createClient(
  supabaseUrl,
  supabasePublishableKey,
  {
    auth: {
      storage: AsyncStorage,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  }
);

// -----------------------------------------------------------------------------
// 1. SUPABASE AUTH SERVICE
// -----------------------------------------------------------------------------
export const supabaseAuth = {
  signInWithOtp: async (
    email: string,
    options?: { data?: Record<string, string | undefined>; shouldCreateUser?: boolean; emailRedirectTo?: string }
  ) => {
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: 'cojourney://auth/callback',
          ...options,
        },
      });
      return { data, error };
    } catch (err: unknown) {
      return { data: null, error: err instanceof Error ? err : new Error(String(err)) };
    }
  },

  signInWithPassword: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { data, error };
    } catch (err: unknown) {
      return { data: null, error: err instanceof Error ? err : new Error(String(err)) };
    }
  },

  signUp: async (email: string, password: string, metadata?: { name?: string; gender?: string; phone?: string }) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });
      return { data, error };
    } catch (err: unknown) {
      return { data: null, error: err instanceof Error ? err : new Error(String(err)) };
    }
  },

  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (err: unknown) {
      return { error: err instanceof Error ? err : new Error(String(err)) };
    }
  },

  getSession: async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      return { session: data?.session, error };
    } catch (err: unknown) {
      return { session: null, error: err instanceof Error ? err : new Error(String(err)) };
    }
  },

  onAuthStateChange: (callback: (event: AuthChangeEvent, session: Session | null) => void) => {
    return supabase.auth.onAuthStateChange(callback);
  },
};

interface JourneyQueryRow {
  id: string;
  user_id: string;
  from_location: string;
  to_location: string;
  journey_time?: string;
  journey_type: CooperationType;
  status?: string;
  description?: string;
  users?: {
    name?: string;
    cooperation_score?: number;
    verified?: boolean;
  };
  vehicle_details?: Array<{
    vehicle_type?: string;
    available_seats?: number;
    travel_contribution?: number;
  }>;
  items?: Array<{
    description?: string;
  }>;
}

interface RequestQueryRow {
  id: string;
  journey_id: string;
  requester_id: string;
  status: JourneyRequest['status'];
  users?: {
    name?: string;
    cooperation_score?: number;
    verified?: boolean;
  };
  journeys?: {
    user_id?: string;
    journey_type?: CooperationType;
    from_location?: string;
    to_location?: string;
    journey_time?: string;
    users?: { name?: string };
  };
}

interface TrustedQueryRow {
  id: string;
  user_id: string;
  trusted_user_id: string;
  users?: {
    name?: string;
    cooperation_score?: number;
    verified?: boolean;
  };
}

function mapJourneyStatus(status?: string): Journey['status'] {
  if (status === 'completed' || status === 'cancelled' || status === 'active' || status === 'scheduled') {
    return status;
  }
  return 'scheduled';
}

function mapVehicleType(value?: string): VehicleType {
  if (value === 'Two-wheeler' || value === 'Auto' || value === 'Cab' || value === 'Car') {
    return value;
  }
  return 'Car';
}

// -----------------------------------------------------------------------------
// 2. SUPABASE DATABASE SERVICE
// -----------------------------------------------------------------------------
export const supabaseDb = {
  // --- User Profiles ---
  getUserProfile: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      return { data, error };
    } catch (err: unknown) {
      return { data: null, error: err instanceof Error ? err : new Error(String(err)) };
    }
  },

  upsertUserProfile: async (user: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    profile_image?: string | null;
    cooperation_score?: number;
    verified?: boolean;
  }) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone || null,
          profile_image: user.profile_image || null,
          cooperation_score: user.cooperation_score ?? 70,
          verified: user.verified ?? true,
        })
        .select()
        .single();
      return { data, error };
    } catch (err: unknown) {
      return { data: null, error: err instanceof Error ? err : new Error(String(err)) };
    }
  },

  // --- Journeys ---
  getJourneys: async (): Promise<Journey[] | null> => {
    try {
      const { data, error } = await supabase
        .from('journeys')
        .select('*, users(id, name, cooperation_score, verified, phone, profile_image), vehicle_details(*), items(*)')
        .order('created_at', { ascending: false });

      if (error || !data) return null;

      return (data as JourneyQueryRow[]).map(row => ({
        id: row.id,
        userId: row.user_id,
        userName: row.users?.name || 'Traveler',
        userTrustScore: row.users?.cooperation_score ?? 70,
        userVerified: row.users?.verified ?? true,
        userGender: 'Male',
        from: row.from_location,
        to: row.to_location,
        time: row.journey_time || '',
        cooperationType: row.journey_type,
        status: mapJourneyStatus(row.status),
        notes: row.description,
        companionPreference: undefined,
        travelType: undefined,
        meetingPoint: row.from_location ? `${row.from_location} Main Gate` : undefined,
        vehicleDetails: row.vehicle_details?.[0]
          ? {
              vehicleType: mapVehicleType(row.vehicle_details[0].vehicle_type),
              availableSeats: row.vehicle_details[0].available_seats || 1,
              travelContribution: row.vehicle_details[0].travel_contribution || 0,
              contribution: row.vehicle_details[0].travel_contribution || 0,
            }
          : undefined,
        itemDetails: row.items?.[0]
          ? {
              item: row.items[0].description || '',
              itemName: row.items[0].description || '',
              description: row.items[0].description || '',
              itemDescription: row.items[0].description || '',
              suggestedTip: 0,
              isPermitted: true,
            }
          : undefined,
      }));
    } catch {
      return null;
    }
  },

  createJourney: async (journey: Partial<Journey>): Promise<Journey | null> => {
    try {
      const { data: journeyData, error: journeyError } = await supabase
        .from('journeys')
        .insert({
          user_id: journey.userId,
          journey_type: journey.cooperationType || 'daily_walk',
          from_location: journey.from,
          to_location: journey.to,
          journey_date: new Date().toISOString().split('T')[0],
          journey_time: journey.time || '5:00 PM',
          description: journey.notes || '',
          seats_available: journey.vehicleDetails?.availableSeats || 1,
          status: 'open',
        })
        .select()
        .single();

      if (journeyError || !journeyData) return null;

      const journeyId = journeyData.id;

      if (journey.vehicleDetails) {
        await supabase.from('vehicle_details').insert({
          journey_id: journeyId,
          driver_id: journey.userId,
          vehicle_type: journey.vehicleDetails.vehicleType || 'Car',
          available_seats: journey.vehicleDetails.availableSeats || 1,
          travel_contribution: journey.vehicleDetails.travelContribution || 0,
        });
      }

      if (journey.itemDetails) {
        await supabase.from('items').insert({
          journey_id: journeyId,
          owner_id: journey.userId,
          description: journey.itemDetails.description || journey.itemDetails.item || 'Item',
          status: 'available',
        });
      }

      return {
        ...journey,
        id: journeyId,
      } as Journey;
    } catch {
      return null;
    }
  },

  // --- Requests ---
  getRequests: async (): Promise<JourneyRequest[] | null> => {
    try {
      const { data, error } = await supabase
        .from('requests')
        .select('*, journeys(*, users(id, name, cooperation_score, verified)), users!requests_requester_id_fkey(*)')
        .order('created_at', { ascending: false });

      if (error || !data) return null;

      return (data as unknown as RequestQueryRow[]).map(row => ({
        id: row.id,
        journeyId: row.journey_id,
        senderId: row.requester_id,
        senderName: row.users?.name || 'Requester',
        senderTrustScore: row.users?.cooperation_score ?? 70,
        senderVerified: row.users?.verified ?? true,
        receiverId: row.journeys?.user_id || '',
        receiverName: row.journeys?.users?.name || 'Creator',
        requestType: row.journeys?.journey_type || 'daily_walk',
        status: row.status,
        message: `Request for journey from ${row.journeys?.from_location || 'Start'} to ${row.journeys?.to_location || 'Destination'}`,
        journeyFrom: row.journeys?.from_location || 'Start',
        journeyTo: row.journeys?.to_location || 'End',
        journeyTime: row.journeys?.journey_time || '5:00 PM',
        createdAt: 'Recently',
      }));
    } catch {
      return null;
    }
  },

  createRequest: async (journeyId: string, requesterId: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase
        .from('requests')
        .insert({
          journey_id: journeyId,
          requester_id: requesterId,
          status: 'pending',
        })
        .select()
        .single();

      if (error || !data) return null;
      return data.id;
    } catch {
      return null;
    }
  },

  updateRequestStatus: async (requestId: string, status: 'accepted' | 'rejected' | 'completed'): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('requests')
        .update({ status })
        .eq('id', requestId);
      return !error;
    } catch {
      return false;
    }
  },

  // --- Ratings ---
  submitRating: async (rating: { journeyId: string; reviewerId: string; reviewedUserId: string; stars: number; comment: string }): Promise<boolean> => {
    try {
      const { error } = await supabase.from('ratings').insert({
        journey_id: rating.journeyId,
        reviewer_id: rating.reviewerId,
        reviewed_user_id: rating.reviewedUserId,
        rating: rating.stars,
        comment: rating.comment,
      });
      return !error;
    } catch {
      return false;
    }
  },

  // --- Trusted Connections ---
  getTrusted: async (userId: string): Promise<TrustedConnection[] | null> => {
    try {
      const { data, error } = await supabase
        .from('trusted_connections')
        .select('*, users!trusted_connections_trusted_user_id_fkey(*)')
        .eq('user_id', userId);

      if (error || !data) return null;

      return (data as unknown as TrustedQueryRow[]).map(row => ({
        id: row.id,
        userId: row.user_id,
        trustedUserId: row.trusted_user_id,
        trustedUserName: row.users?.name || 'User',
        trustedUserScore: row.users?.cooperation_score ?? 70,
        verified: row.users?.verified ?? true,
        addedAt: 'Recently',
      }));
    } catch {
      return null;
    }
  },

  toggleTrusted: async (userId: string, targetUserId: string): Promise<boolean> => {
    try {
      const { data: existing } = await supabase
        .from('trusted_connections')
        .select('id')
        .eq('user_id', userId)
        .eq('trusted_user_id', targetUserId)
        .maybeSingle();

      if (existing) {
        await supabase.from('trusted_connections').delete().eq('id', existing.id);
      } else {
        await supabase.from('trusted_connections').insert({
          user_id: userId,
          trusted_user_id: targetUserId,
          status: 'active',
        });
      }
      return true;
    } catch {
      return false;
    }
  },

  // --- Journey Views ---
  recordJourneyView: async (journeyId: string, viewerId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('journey_views')
        .upsert(
          { journey_id: journeyId, viewer_id: viewerId, viewed_at: new Date().toISOString() },
          { onConflict: 'journey_id,viewer_id' }
        );
      return !error;
    } catch {
      return false;
    }
  },

  getJourneyViewers: async (journeyId: string): Promise<import('../types').JourneyView[] | null> => {
    try {
      const { data, error } = await supabase
        .from('journey_views')
        .select('*, users!journey_views_viewer_id_fkey(name, verified)')
        .eq('journey_id', journeyId)
        .order('viewed_at', { ascending: false });

      if (error || !data) return null;

      return (data as any[]).map(row => ({
        id: row.id,
        journeyId: row.journey_id,
        viewerId: row.viewer_id,
        viewerName: row.users?.name || 'Traveler',
        viewerVerified: row.users?.verified ?? false,
        viewedAt: row.viewed_at,
      }));
    } catch {
      return null;
    }
  },

  // --- Journey Lifecycle ---
  startJourney: async (journeyId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('journeys')
        .update({ status: 'in_progress' })
        .eq('id', journeyId);
      return !error;
    } catch {
      return false;
    }
  },

  getPublicJourneys: async (): Promise<import('../types').Journey[] | null> => {
    try {
      const { data, error } = await supabase
        .from('journeys')
        .select('*, users(id, name, cooperation_score, verified, phone, profile_image), vehicle_details(*), items(*)')
        .not('status', 'in', '("in_progress","active","completed","cancelled")')
        .order('created_at', { ascending: false });

      if (error || !data) return null;

      return (data as any[]).map(row => ({
        id: row.id,
        userId: row.user_id,
        userName: row.users?.name || 'Traveler',
        userTrustScore: row.users?.cooperation_score ?? 70,
        userVerified: row.users?.verified ?? true,
        userGender: 'Male',
        from: row.from_location,
        to: row.to_location,
        time: row.journey_time || '',
        cooperationType: row.journey_type,
        status: mapJourneyStatus(row.status),
        notes: row.description,
        companionPreference: undefined,
        travelType: undefined,
        meetingPoint: row.from_location ? `${row.from_location} Main Gate` : undefined,
        vehicleDetails: row.vehicle_details?.[0]
          ? {
              vehicleType: mapVehicleType(row.vehicle_details[0].vehicle_type),
              availableSeats: row.vehicle_details[0].available_seats || 1,
              travelContribution: row.vehicle_details[0].travel_contribution || 0,
              contribution: row.vehicle_details[0].travel_contribution || 0,
            }
          : undefined,
        itemDetails: row.items?.[0]
          ? {
              item: row.items[0].description || '',
              itemName: row.items[0].description || '',
              description: row.items[0].description || '',
              itemDescription: row.items[0].description || '',
              suggestedTip: 0,
              isPermitted: true,
            }
          : undefined,
      }));
    } catch {
      return null;
    }
  },
};

// -----------------------------------------------------------------------------
// 3. SUPABASE STORAGE SERVICE (Profile Pictures)
// -----------------------------------------------------------------------------
export const supabaseStorage = {
  uploadAvatar: async (userId: string, imageBase64OrUri: string): Promise<string | null> => {
    try {
      const filePath = `avatars/${userId}_${Date.now()}.jpg`;
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(filePath, imageBase64OrUri, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (error || !data) return null;

      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      return publicUrlData.publicUrl;
    } catch {
      return null;
    }
  },

  getPublicAvatarUrl: (filePath: string): string => {
    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
    return data.publicUrl;
  },
};

// -----------------------------------------------------------------------------
// 4. SUPABASE REALTIME SERVICE
// -----------------------------------------------------------------------------
export const supabaseRealtime = {
  subscribeToRequests: (onInsertOrUpdate: (payload: any) => void) => {
    try {
      return supabase
        .channel('public:requests')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'requests' },
          (payload) => onInsertOrUpdate(payload)
        )
        .subscribe();
    } catch {
      return null;
    }
  },

  subscribeToJourneys: (onInsertOrUpdate: (payload: any) => void) => {
    try {
      return supabase
        .channel('public:journeys')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'journeys' },
          (payload) => onInsertOrUpdate(payload)
        )
        .subscribe();
    } catch {
      return null;
    }
  },
};