import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { User as SupabaseAuthUser } from '@supabase/supabase-js';
import { supabase, supabaseAuth, supabaseDb, supabaseRealtime } from '../services/supabase';
import { sendOtp
 } from '../services/auth';
import { socketService } from '../services/socket';
import {
  ActiveJourneySession,
  Journey,
  JourneyRequest,
  JourneyView,
  Rating,
  TrustedConnection,
  User,
} from '../types';

function mapGender(value: unknown): User['gender'] {
  if (value === 'Female') return 'Female';
  if (value === 'Other' || value === 'Prefer not to say') return 'Other';
  return 'Male';
}

interface JourneyContextType {
  currentUser: User | null;
  users: Record<string, User>;
  journeys: Journey[];
  requests: JourneyRequest[];
  activeJourney: ActiveJourneySession | null;
  ratings: Rating[];
  trustedList: TrustedConnection[];
  login: (email: string, userKey?: string, password?: string) => Promise<boolean>;
  register: (name: string, email: string, gender: 'Male' | 'Female' | 'Other', phone?: string, password?: string) => Promise<void>;
  logout: () => void;
  createJourney: (journeyData: Partial<Journey>) => Promise<Journey | null>;
  sendRequest: (journey: Journey, message?: string) => Promise<JourneyRequest | null>;
  acceptRequest: (requestId: string) => Promise<ActiveJourneySession | null>;
  rejectRequest: (requestId: string) => Promise<void>;
  startJourney: (journeyId: string) => Promise<boolean>;
  completeActiveJourney: () => void;
  submitRating: (toUserId: string, stars: number, comment: string) => Promise<void>;
  toggleTrustedPerson: (targetUser: Partial<User>) => Promise<void>;
  isTrusted: (userId: string) => boolean;
  refreshData: () => Promise<void>;
  recordView: (journeyId: string) => Promise<void>;
  getJourneyViewers: (journeyId: string) => Promise<JourneyView[]>;
}

const JourneyContext = createContext<JourneyContextType | undefined>(undefined);

// Demo user used when no Supabase session exists (hackathon demo path)
const DEMO_USER: User = {
  id: 'demo-user-001',
  name: 'Demo User',
  email: 'demo@cojourney.app',
  gender: 'Male',
  trustScore: 87,
  verified: true,
  completedJourneys: 12,
  cooperationHistoryCount: 14,
  ratingsAverage: 4.8,
  ratingsCount: 10,
  safetyScore: 10,
  phone: '+91 9876543210',
};

export const JourneyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<Record<string, User>>({});
  const [currentUser, setCurrentUser] = useState<User | null>(DEMO_USER);
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [requests, setRequests] = useState<JourneyRequest[]>([]);
  const [activeJourney, setActiveJourney] = useState<ActiveJourneySession | null>(null);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [trustedList, setTrustedList] = useState<TrustedConnection[]>([]);

  // Synchronize Supabase Auth user to User state and public.users table
  const syncUserProfile = useCallback(async (authUser: SupabaseAuthUser) => {
    if (!authUser?.id) return;

    try {
      const { data: dbUser } = await supabaseDb.getUserProfile(authUser.id);
      const metadataName =
        typeof authUser.user_metadata?.name === 'string' ? authUser.user_metadata.name : undefined;
      const metadataPhone =
        typeof authUser.user_metadata?.phone === 'string' ? authUser.user_metadata.phone : undefined;
      const gender = mapGender(authUser.user_metadata?.gender);

      if (dbUser) {
        const u: User = {
          id: dbUser.id,
          name: dbUser.name || metadataName || authUser.email?.split('@')[0] || 'Traveler',
          email: dbUser.email || authUser.email || '',
          gender,
          trustScore: Number(dbUser.cooperation_score) || 70,
          verified: Boolean(dbUser.verified),
          completedJourneys: 0,
          cooperationHistoryCount: 0,
          ratingsAverage: 0,
          ratingsCount: 0,
          safetyScore: 10,
          phone: dbUser.phone || metadataPhone,
          avatar: dbUser.profile_image,
        };
        setCurrentUser(u);
        setUsers(prev => ({ ...prev, [u.id]: u }));
      } else {
        const name = metadataName || authUser.email?.split('@')[0] || 'Traveler';
        const phone = metadataPhone || null;
        const { data: createdUser } = await supabaseDb.upsertUserProfile({
          id: authUser.id,
          name,
          email: authUser.email || '',
          phone,
          cooperation_score: 70,
          verified: true,
        });

        const u: User = {
          id: authUser.id,
          name: createdUser?.name || name,
          email: createdUser?.email || authUser.email || '',
          gender,
          trustScore: 70,
          verified: true,
          completedJourneys: 0,
          cooperationHistoryCount: 0,
          ratingsAverage: 0,
          ratingsCount: 0,
          safetyScore: 10,
          phone: phone || undefined,
        };
        setCurrentUser(u);
        setUsers(prev => ({ ...prev, [u.id]: u }));
      }
    } catch (err) {
      console.log('Error syncing user profile:', err);
    }
  }, []);

  const refreshData = useCallback(async () => {
    try {
      const dbJourneys = await supabaseDb.getJourneys();
      if (dbJourneys) {
        setJourneys(dbJourneys);
        setUsers(prev => {
          const next = { ...prev };
          dbJourneys.forEach(j => {
            if (j.userId && !next[j.userId]) {
              next[j.userId] = {
                id: j.userId,
                name: j.userName,
                email: '',
                gender: mapGender(j.userGender),
                trustScore: j.userTrustScore || 70,
                verified: j.userVerified,
                completedJourneys: 0,
                cooperationHistoryCount: 0,
                ratingsAverage: 5.0,
                ratingsCount: 0,
                safetyScore: 10,
              };
            }
          });
          return next;
        });
      }

      const dbRequests = await supabaseDb.getRequests();
      if (dbRequests) {
        setRequests(dbRequests);
      }

      if (currentUser?.id) {
        const dbTrusted = await supabaseDb.getTrusted(currentUser.id);
        if (dbTrusted) {
          setTrustedList(dbTrusted);
        }
      }
    } catch (err) {
      console.log('Error refreshing data from Supabase:', err);
    }
  }, [currentUser?.id]);

  // Listen for Supabase auth state changes and initial session
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session?.user) {
        syncUserProfile(data.session.user);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        syncUserProfile(session.user);
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        socketService.disconnect();
      }
    });

    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, [syncUserProfile]);

  // Fetch remote journeys and requests on mount
  useEffect(() => {
    refreshData();

    // Supabase Realtime subscriptions
    const journeySub = supabaseRealtime.subscribeToJourneys((payload) => {
      if (payload?.eventType === 'INSERT' || payload?.eventType === 'UPDATE') {
        refreshData();
      }
    });

    const requestSub = supabaseRealtime.subscribeToRequests((payload) => {
      if (payload?.eventType === 'INSERT' || payload?.eventType === 'UPDATE') {
        refreshData();
      }
    });

    return () => {
      journeySub?.unsubscribe?.();
      requestSub?.unsubscribe?.();
    };
  }, [refreshData]);

  // Connect Socket.IO client when currentUser is authenticated
  useEffect(() => {
    if (currentUser?.id) {
      socketService.connect(currentUser.id);
    }
  }, [currentUser?.id]);

  const login = async (email: string, _userKey?: string, password?: string): Promise<boolean> => {
    if (password) {
      const { data, error } = await supabaseAuth.signInWithPassword(email.trim(), password);
      if (!error && data?.user) {
        await syncUserProfile(data.user);
        return true;
      }
    }

    const { error } = await supabaseAuth.signInWithOtp(email.trim());
    if (error) {
      throw error;
    }
    return true;
  };

  const register = async (
    name: string,
    email: string,
    gender: 'Male' | 'Female' | 'Other',
    phone?: string,
    password?: string
  ) => {
    if (password) {
      const { data, error } = await supabaseAuth.signUp(email.trim(), password, { name, gender, phone });
      if (!error && data?.user) {
        await syncUserProfile(data.user);
        return;
      }
    }

    await sendOtp(email.trim(), name.trim(), phone?.trim(), gender);
  };

  const logout = () => {
    supabaseAuth.signOut().catch(() => {});
    socketService.disconnect();
    setCurrentUser(DEMO_USER); // reset to demo user so app stays usable
  };

  const createJourney = async (data: Partial<Journey>): Promise<Journey | null> => {
    if (!currentUser) return null;

    const journeyData: Partial<Journey> = {
      ...data,
      userId: currentUser.id,
      userName: currentUser.name,
      userTrustScore: currentUser.trustScore,
      userVerified: currentUser.verified,
      userGender: currentUser.gender,
    };

    const created = await supabaseDb.createJourney(journeyData);
    if (created) {
      setJourneys(prev => [created, ...prev]);
      return created;
    }
    return null;
  };

  const sendRequest = async (journey: Journey, message?: string): Promise<JourneyRequest | null> => {
    if (!currentUser) return null;

    const reqId = await supabaseDb.createRequest(journey.id, currentUser.id);
    if (!reqId) return null;

    const newRequest: JourneyRequest = {
      id: reqId,
      journeyId: journey.id,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderTrustScore: currentUser.trustScore,
      senderVerified: currentUser.verified,
      receiverId: journey.userId,
      receiverName: journey.userName,
      requestType: journey.cooperationType,
      status: 'pending',
      message: message || `Hi ${journey.userName}, I would like to cooperate on your journey.`,
      createdAt: 'Just now',
      journeyFrom: journey.from,
      journeyTo: journey.to,
      journeyTime: journey.time,
    };

    setRequests(prev => [newRequest, ...prev]);
    return newRequest;
  };

  const acceptRequest = async (requestId: string): Promise<ActiveJourneySession | null> => {
    const targetReq = requests.find(r => r.id === requestId);
    if (!targetReq) return null;

    await supabaseDb.updateRequestStatus(requestId, 'accepted');

    setRequests(prev =>
      prev.map(r => (r.id === requestId ? { ...r, status: 'accepted' } : r))
    );

    const relatedJourney = journeys.find(j => j.id === targetReq.journeyId);
    const session: ActiveJourneySession = {
      id: `active_${Date.now()}`,
      journeyId: targetReq.journeyId,
      from: targetReq.journeyFrom,
      to: targetReq.journeyTo,
      time: targetReq.journeyTime,
      cooperationType: targetReq.requestType,
      meetingPoint: relatedJourney?.meetingPoint || `${targetReq.journeyFrom} Main Gate`,
      status: 'in_progress',
      startedAt: 'Just now',
      participants: [
        {
          id: currentUser?.id || 'creator',
          name: currentUser?.name || 'Creator',
          trustScore: currentUser?.trustScore || 70,
          verified: currentUser?.verified || true,
          role: 'creator',
        },
        {
          id: targetReq.senderId,
          name: targetReq.senderName,
          trustScore: targetReq.senderTrustScore,
          verified: targetReq.senderVerified,
          role: 'cooperator',
        },
      ],
    };

    setActiveJourney(session);
    return session;
  };

  const rejectRequest = async (requestId: string) => {
    await supabaseDb.updateRequestStatus(requestId, 'rejected');
    setRequests(prev =>
      prev.map(r => (r.id === requestId ? { ...r, status: 'rejected' } : r))
    );
  };

  const startJourney = async (journeyId: string): Promise<boolean> => {
    const success = await supabaseDb.startJourney(journeyId);
    if (success) {
      setJourneys(prev =>
        prev.map(j => (j.id === journeyId ? { ...j, status: 'active' as const } : j))
      );

      // Build active session from existing accepted request for this journey
      const acceptedReq = requests.find(
        r => r.journeyId === journeyId && r.status === 'accepted'
      );
      const theJourney = journeys.find(j => j.id === journeyId);

      if (theJourney && !activeJourney) {
        const session: ActiveJourneySession = {
          id: `active_${Date.now()}`,
          journeyId,
          from: theJourney.from,
          to: theJourney.to,
          time: theJourney.time,
          cooperationType: theJourney.cooperationType,
          meetingPoint: theJourney.meetingPoint || `${theJourney.from} Main Gate`,
          status: 'in_progress',
          startedAt: 'Just now',
          participants: [
            {
              id: currentUser?.id || 'creator',
              name: currentUser?.name || 'Creator',
              trustScore: currentUser?.trustScore || 70,
              verified: currentUser?.verified || true,
              role: 'creator',
            },
            ...(acceptedReq
              ? [{
                  id: acceptedReq.senderId,
                  name: acceptedReq.senderName,
                  trustScore: acceptedReq.senderTrustScore,
                  verified: acceptedReq.senderVerified,
                  role: 'cooperator' as const,
                }]
              : []),
          ],
        };
        setActiveJourney(session);

        // Notify Socket.IO server so it can cache authorized participants in Redis.
        // This prevents unauthorized users from joining the active journey room.
        const participantIds = acceptedReq ? [acceptedReq.senderId] : [];
        socketService.notifyJourneyStarted(
          journeyId,
          currentUser?.id || '',
          participantIds
        );
      }
    }
    return success;
  };

  const recordView = async (journeyId: string): Promise<void> => {
    if (!currentUser?.id) return;
    await supabaseDb.recordJourneyView(journeyId, currentUser.id);
  };

  const getJourneyViewers = async (journeyId: string): Promise<JourneyView[]> => {
    const viewers = await supabaseDb.getJourneyViewers(journeyId);
    return viewers || [];
  };

  const completeActiveJourney = () => {
    if (!activeJourney) return;
    setActiveJourney(prev => (prev ? { ...prev, status: 'completed' } : null));

    if (currentUser) {
      const updatedUser: User = {
        ...currentUser,
        completedJourneys: (currentUser.completedJourneys || 0) + 1,
        cooperationHistoryCount: (currentUser.cooperationHistoryCount || 0) + 1,
        trustScore: Math.min(100, currentUser.trustScore + 2),
      };
      setCurrentUser(updatedUser);
      setUsers(prev => ({ ...prev, [currentUser.id]: updatedUser }));
    }
  };

  const submitRating = async (toUserId: string, stars: number, comment: string) => {
    if (!currentUser || !activeJourney) return;

    await supabaseDb.submitRating({
      journeyId: activeJourney.journeyId,
      reviewerId: currentUser.id,
      reviewedUserId: toUserId,
      stars,
      comment,
    });

    const newRating: Rating = {
      id: `rate_${Date.now()}`,
      fromUserId: currentUser.id,
      fromUserName: currentUser.name,
      toUserId,
      toUserName: 'Partner',
      journeyId: activeJourney.journeyId,
      stars,
      comment,
      createdAt: 'Just now',
    };

    setRatings(prev => [newRating, ...prev]);
    setActiveJourney(null);
  };

  const toggleTrustedPerson = async (targetUser: Partial<User>) => {
    if (!currentUser || !targetUser.id) return;
    await supabaseDb.toggleTrusted(currentUser.id, targetUser.id);
    const isCurrentlyTrusted = trustedList.some(t => t.trustedUserId === targetUser.id);
    if (isCurrentlyTrusted) {
      setTrustedList(prev => prev.filter(t => t.trustedUserId !== targetUser.id));
    } else {
      setTrustedList(prev => [
        {
          id: `trust_${Date.now()}`,
          userId: currentUser.id,
          trustedUserId: targetUser.id!,
          trustedUserName: targetUser.name || 'User',
          trustedUserScore: targetUser.trustScore || 70,
          verified: targetUser.verified || true,
          addedAt: 'Just now',
        },
        ...prev,
      ]);
    }
  };

  const isTrusted = (userId: string): boolean => {
    return trustedList.some(t => t.trustedUserId === userId);
  };

  return (
    <JourneyContext.Provider
      value={{
        currentUser,
        users,
        journeys,
        requests,
        activeJourney,
        ratings,
        trustedList,
        login,
        register,
        logout,
        createJourney,
        sendRequest,
        acceptRequest,
        rejectRequest,
        startJourney,
        completeActiveJourney,
        submitRating,
        toggleTrustedPerson,
        isTrusted,
        refreshData,
        recordView,
        getJourneyViewers,
      }}>
      {children}
    </JourneyContext.Provider>
  );
};

export const useJourney = () => {
  const context = useContext(JourneyContext);
  if (!context) {
    throw new Error('useJourney must be used within a JourneyProvider');
  }
  return context;
};
