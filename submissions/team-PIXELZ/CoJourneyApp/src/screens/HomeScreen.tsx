import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { JourneyCard } from '../components/JourneyCard';
import { useJourney } from '../context/JourneyContext';
import { CooperationType, Journey } from '../types';
import { calculateJourneyMatch } from '../utils/matching';

interface HomeScreenProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
  };
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { currentUser, journeys, activeJourney } = useJourney();
  const [destinationSearch, setDestinationSearch] = useState('');

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const handleSelectMode = (mode: CooperationType) => {
    navigation.navigate('CreateJourney', { mode, destination: destinationSearch });
  };

  // Calculate nearby journeys with match score relative to a default route
  const defaultTarget: Partial<Journey> = {
    from: 'College',
    to: destinationSearch.trim() || 'Kollam',
    time: '5:00 PM',
  };

  const nearbyJourneys = journeys
    .filter(j => j.userId !== currentUser?.id)
    .map(journey => {
      const match = calculateJourneyMatch(defaultTarget, journey, currentUser || undefined);
      return {
        journey,
        matchPercentage: match.matchPercentage,
        reasons: match.reasons,
      };
    })
    .sort((a, b) => b.matchPercentage - a.matchPercentage);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Top Greeting Header */}
      <View style={styles.header}>
        <View style={styles.headerTextCol}>
          <Text style={styles.greetingText}>
            {getTimeGreeting()}, {currentUser?.name || 'Rahul'} 👋
          </Text>
          <Text style={styles.communitySubtext}>
            Your journey can help someone else's.
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate('Profile')}
          style={styles.profileAvatar}>
          <Text style={styles.profileAvatarText}>
            {(currentUser?.name || 'R').charAt(0)}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Active Journey Banner if there's an ongoing journey */}
      {activeJourney && (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigation.navigate('ActiveJourney')}
          style={styles.activeJourneyBanner}>
          <View style={styles.activeDot} />
          <View style={styles.activeBannerContent}>
            <Text style={styles.activeBannerTitle}>Active Cooperation Session</Text>
            <Text style={styles.activeBannerRoute}>
              {activeJourney.from} → {activeJourney.to} • Tap to view live session
            </Text>
          </View>
          <Text style={styles.activeArrow}>→</Text>
        </TouchableOpacity>
      )}

      {/* Destination Search Box */}
      <View style={styles.searchCard}>
        <Text style={styles.searchTitle}>Where are you going?</Text>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            placeholder="Search destination (e.g. Kollam, Town, Station)"
            placeholderTextColor="#94A3B8"
            value={destinationSearch}
            onChangeText={setDestinationSearch}
            style={styles.searchInput}
          />
          {destinationSearch.length > 0 && (
            <TouchableOpacity onPress={() => setDestinationSearch('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Cooperation Modes Section */}
      <View style={styles.modesSection}>
        <Text style={styles.sectionTitle}>How can you cooperate?</Text>
        <Text style={styles.sectionSubtitle}>
          We make existing journeys useful to others along the way.
        </Text>

        <View style={styles.modesGrid}>
          {/* Mode 1: Daily Walk */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => handleSelectMode('daily_walk')}
            style={[styles.modeCard, styles.modeCardWalk]}>
            <Text style={styles.modeIcon}>🚶</Text>
            <Text style={styles.modeTitle}>Daily Walk</Text>
            <Text style={styles.modeDesc}>Walk together on everyday routes</Text>
          </TouchableOpacity>

          {/* Mode 2: Carry Along */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.navigate('CarryItem')}
            style={[styles.modeCard, styles.modeCardCarry]}>
            <Text style={styles.modeIcon}>📦</Text>
            <Text style={styles.modeTitle}>Carry Along</Text>
            <Text style={styles.modeDesc}>Deliver small permitted items</Text>
          </TouchableOpacity>

          {/* Mode 3: Share Vehicle */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.navigate('VehicleShare')}
            style={[styles.modeCard, styles.modeCardVehicle]}>
            <Text style={styles.modeIcon}>🚗</Text>
            <Text style={styles.modeTitle}>Share Vehicle</Text>
            <Text style={styles.modeDesc}>Offer empty seats on your route</Text>
          </TouchableOpacity>

          {/* Mode 4: Join Journey */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => handleSelectMode('join_journey')}
            style={[styles.modeCard, styles.modeCardJoin]}>
            <Text style={styles.modeIcon}>🤝</Text>
            <Text style={styles.modeTitle}>Join Journey</Text>
            <Text style={styles.modeDesc}>Cooperate on an existing trip</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Action Button: Create / Offer Journey */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => navigation.navigate('CreateJourney')}
        style={styles.postJourneyBanner}>
        <View style={styles.postJourneyContent}>
          <Text style={styles.postJourneyHeading}>Already traveling somewhere?</Text>
          <Text style={styles.postJourneySub}>
            Post your journey to share seats or carry a document along the way.
          </Text>
        </View>
        <View style={styles.postJourneyBtn}>
          <Text style={styles.postJourneyBtnText}>+ Post</Text>
        </View>
      </TouchableOpacity>

      {/* Nearby Journeys */}
      <View style={styles.nearbySection}>
        <View style={styles.nearbyHeaderRow}>
          <Text style={styles.sectionTitle}>Nearby journeys</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Explore')}>
            <Text style={styles.viewAllText}>View all ({journeys.length}) →</Text>
          </TouchableOpacity>
        </View>

        {nearbyJourneys.slice(0, 3).map(({ journey, matchPercentage, reasons }) => (
          <JourneyCard
            key={journey.id}
            journey={journey}
            matchPercentage={matchPercentage}
            reasons={reasons}
            onPress={() => navigation.navigate('JourneyDetails', { journey, matchPercentage, reasons })}
            onActionPress={() => navigation.navigate('JourneyDetails', { journey, matchPercentage, reasons })}
            actionLabel="View Details & Cooperate"
          />
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 16,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 4,
  },
  headerTextCol: {
    flex: 1,
  },
  greetingText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  communitySubtext: {
    fontSize: 13,
    color: '#2563EB',
    fontWeight: '600',
    marginTop: 2,
  },
  profileAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  profileAvatarText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 18,
  },
  activeJourneyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#15803D',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  activeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#86EFAC',
    marginRight: 10,
  },
  activeBannerContent: {
    flex: 1,
  },
  activeBannerTitle: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  activeBannerRoute: {
    color: '#BBF7D0',
    fontSize: 12,
    marginTop: 2,
  },
  activeArrow: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  searchCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  searchTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    fontSize: 15,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    paddingVertical: 0,
  },
  clearIcon: {
    color: '#94A3B8',
    fontSize: 14,
    padding: 4,
  },
  modesSection: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    marginBottom: 12,
  },
  modesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  modeCard: {
    width: '48%',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.2,
    elevation: 2,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  modeCardWalk: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  modeCardCarry: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  modeCardVehicle: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  modeCardJoin: {
    backgroundColor: '#FAF5FF',
    borderColor: '#E9D5FF',
  },
  modeIcon: {
    fontSize: 26,
    marginBottom: 8,
  },
  modeTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  modeDesc: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 15,
  },
  postJourneyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E40AF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
  },
  postJourneyContent: {
    flex: 1,
    marginRight: 10,
  },
  postJourneyHeading: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  postJourneySub: {
    color: '#BFDBFE',
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
  postJourneyBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  postJourneyBtnText: {
    color: '#1E40AF',
    fontWeight: '800',
    fontSize: 13,
  },
  nearbySection: {
    marginBottom: 10,
  },
  nearbyHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  viewAllText: {
    color: '#2563EB',
    fontSize: 13,
    fontWeight: '700',
  },
});
