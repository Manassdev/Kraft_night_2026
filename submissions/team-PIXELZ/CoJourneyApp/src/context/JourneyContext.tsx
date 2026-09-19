import React, { createContext, useContext, useState } from 'react';
import {
  INITIAL_JOURNEYS,
  INITIAL_RATINGS,
  INITIAL_REQUESTS,
  INITIAL_TRUSTED,
  MOCK_USERS,
} from '../data/mockData';
import {
  ActiveJourneySession,
  Journey,
  JourneyRequest,
  Rating,
  TrustedConnection,
  User,
} from '../types';

interface JourneyContextType {
  currentUser: User | null;
  users: Record<string, User>;
  journeys: Journey[];
  requests: JourneyRequest[];
  activeJourney: ActiveJourneySession | null;
  ratings: Rating[];
  trustedList: TrustedConnection[];
  login: (email: string, userKey?: string) => boolean;
  register: (name: string, email: string, gender: 'Male' | 'Female' | 'Other', phone?: string) => void;
  logout: () => void;
  createJourney: (journeyData: Partial<Journey>) => Journey;
  sendRequest: (journey: Journey, message?: string) => JourneyRequest;
  acceptRequest: (requestId: string) => ActiveJourneySession | null;
  rejectRequest: (requestId: string) => void;
  completeActiveJourney: () => void;
  submitRating: (toUserId: string, stars: number, comment: string) => void;
  toggleTrustedPerson: (targetUser: Partial<User>) => void;
  isTrusted: (userId: string) => boolean;
  switchDemoUser: (userKey: string) => void;
}

const JourneyContext = createContext<JourneyContextType | undefined>(undefined);

export const JourneyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<Record<string, User>>(MOCK_USERS);
  const [currentUser, setCurrentUser] = useState<User | null>(MOCK_USERS.user_rahul);
  const [journeys, setJourneys] = useState<Journey[]>(INITIAL_JOURNEYS);
  const [requests, setRequests] = useState<JourneyRequest[]>(INITIAL_REQUESTS);
  const [activeJourney, setActiveJourney] = useState<ActiveJourneySession | null>(null);
  const [ratings, setRatings] = useState<Rating[]>(INITIAL_RATINGS);
  const [trustedList, setTrustedList] = useState<TrustedConnection[]>(INITIAL_TRUSTED);

  const login = (email: string, userKey?: string): boolean => {
    if (userKey && users[userKey]) {
      setCurrentUser(users[userKey]);
      return true;
    }
    const found = Object.values(users).find(u => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      setCurrentUser(found);
      return true;
    }
    // Fallback: create temporary demo user
    const fallbackUser: User = {
      id: `user_${Date.now()}`,
      name: email.split('@')[0] || 'Demo User',
      email,
      gender: 'Male',
      trustScore: 75,
      verified: true,
      completedJourneys: 2,
      cooperationHistoryCount: 2,
      ratingsAverage: 4.8,
      ratingsCount: 2,
      safetyScore: 10,
    };
    setCurrentUser(fallbackUser);
    return true;
  };

  const register = (
    name: string,
    email: string,
    gender: 'Male' | 'Female' | 'Other',
    phone?: string
  ) => {
    const id = `user_${Date.now()}`;
    const newUser: User = {
      id,
      name,
      email,
      gender,
      trustScore: 70, // Initial verified/new user trust score
      verified: true, // Community phone verified
      completedJourneys: 0,
      cooperationHistoryCount: 0,
      ratingsAverage: 5.0,
      ratingsCount: 0,
      safetyScore: 10,
      phone,
    };
    setUsers(prev => ({ ...prev, [id]: newUser }));
    setCurrentUser(newUser);
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const switchDemoUser = (userKey: string) => {
    if (users[userKey]) {
      setCurrentUser(users[userKey]);
    }
  };

  const createJourney = (data: Partial<Journey>): Journey => {
    const user = currentUser || MOCK_USERS.user_rahul;
    const newJourney: Journey = {
      id: `journey_${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userTrustScore: user.trustScore,
      userVerified: user.verified,
      userGender: user.gender,
      from: data.from || 'Campus',
      to: data.to || 'City',
      time: data.time || '5:00 PM',
      cooperationType: data.cooperationType || 'share_vehicle',
      status: 'scheduled',
      notes: data.notes,
      companionPreference: data.companionPreference,
      travelType: data.travelType,
      vehicleDetails: data.vehicleDetails,
      itemDetails: data.itemDetails,
      meetingPoint: data.meetingPoint || `${data.from} Main Point`,
    };

    setJourneys(prev => [newJourney, ...prev]);
    return newJourney;
  };

  const sendRequest = (journey: Journey, message?: string): JourneyRequest => {
    const user = currentUser || MOCK_USERS.user_rahul;
    const newRequest: JourneyRequest = {
      id: `req_${Date.now()}`,
      journeyId: journey.id,
      senderId: user.id,
      senderName: user.name,
      senderTrustScore: user.trustScore,
      senderVerified: user.verified,
      receiverId: journey.userId,
      receiverName: journey.userName,
      requestType: journey.cooperationType,
      status: 'pending',
      message: message || `Hi ${journey.userName}, I would like to cooperate on this journey.`,
      createdAt: 'Just now',
      journeyFrom: journey.from,
      journeyTo: journey.to,
      journeyTime: journey.time,
    };

    setRequests(prev => [newRequest, ...prev]);
    return newRequest;
  };

  const acceptRequest = (requestId: string): ActiveJourneySession | null => {
    const targetReq = requests.find(r => r.id === requestId);
    if (!targetReq) return null;

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
      meetingPoint: relatedJourney?.meetingPoint || `${targetReq.journeyFrom} Gate`,
      status: 'in_progress',
      startedAt: 'Just now',
      participants: [
        {
          id: currentUser?.id || 'user_rahul',
          name: currentUser?.name || 'Rahul',
          trustScore: currentUser?.trustScore || 92,
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

  const rejectRequest = (requestId: string) => {
    setRequests(prev =>
      prev.map(r => (r.id === requestId ? { ...r, status: 'rejected' } : r))
    );
  };

  const completeActiveJourney = () => {
    if (!activeJourney) return;
    setActiveJourney(prev => (prev ? { ...prev, status: 'completed' } : null));

    // Increase completed journeys count for current user
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

  const submitRating = (toUserId: string, stars: number, comment: string) => {
    const fromUser = currentUser || MOCK_USERS.user_rahul;
    const targetUser = Object.values(users).find(u => u.id === toUserId) || MOCK_USERS.user_anjali;

    const newRating: Rating = {
      id: `rate_${Date.now()}`,
      fromUserId: fromUser.id,
      fromUserName: fromUser.name,
      toUserId: targetUser.id,
      toUserName: targetUser.name,
      journeyId: activeJourney?.journeyId || 'journey_completed',
      stars,
      comment,
      createdAt: 'Just now',
    };

    setRatings(prev => [newRating, ...prev]);

    // Recalculate target user's trust score & rating average
    const currentTotalRatings = targetUser.ratingsCount * targetUser.ratingsAverage + stars;
    const newCount = targetUser.ratingsCount + 1;
    const newAverage = Number((currentTotalRatings / newCount).toFixed(1));
    const newTrustScore = Math.min(100, targetUser.trustScore + (stars >= 4 ? 2 : -2));

    const updatedTargetUser: User = {
      ...targetUser,
      ratingsCount: newCount,
      ratingsAverage: newAverage,
      trustScore: newTrustScore,
      completedJourneys: targetUser.completedJourneys + 1,
      cooperationHistoryCount: targetUser.cooperationHistoryCount + 1,
    };

    setUsers(prev => ({ ...prev, [targetUser.id]: updatedTargetUser }));
    setActiveJourney(null);
  };

  const toggleTrustedPerson = (targetUser: Partial<User>) => {
    if (!currentUser || !targetUser.id) return;
    const existing = trustedList.find(t => t.trustedUserId === targetUser.id);
    if (existing) {
      setTrustedList(prev => prev.filter(t => t.trustedUserId !== targetUser.id));
    } else {
      const newConnection: TrustedConnection = {
        id: `trust_${Date.now()}`,
        userId: currentUser.id,
        trustedUserId: targetUser.id,
        trustedUserName: targetUser.name || 'User',
        trustedUserScore: targetUser.trustScore || 80,
        verified: targetUser.verified || true,
        addedAt: 'Just now',
      };
      setTrustedList(prev => [newConnection, ...prev]);
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
        completeActiveJourney,
        submitRating,
        toggleTrustedPerson,
        isTrusted,
        switchDemoUser,
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
