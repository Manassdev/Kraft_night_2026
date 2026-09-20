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
import { useTheme } from '../theme/ThemeContext';
import { Radius, Typography } from '../theme/theme';
import { CooperationType, Journey } from '../types';
import { calculateJourneyMatch } from '../utils/matching';

interface HomeScreenProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
  };
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { currentUser, journeys, activeJourney } = useJourney();
  const { theme, isDark } = useTheme();
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

  const defaultTarget: Partial<Journey> = {
    from: '',
    to: destinationSearch.trim(),
    time: '',
  };

  const visibleJourneys = journeys
    .filter(j => j.userId !== currentUser?.id)
    .filter(j => j.status !== 'active' && (j.status as string) !== 'in_progress')
    .filter(j => {
      if (!destinationSearch.trim()) return true;
      const q = destinationSearch.toLowerCase();
      return (
        j.to.toLowerCase().includes(q) ||
        j.from.toLowerCase().includes(q) ||
        j.userName.toLowerCase().includes(q)
      );
    })
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
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="none"
      showsVerticalScrollIndicator={false}>
      {/* Top Greeting Header */}
      <View style={styles.header}>
        <View style={[styles.greetingPrefix && styles.headerTextCol]}>
          <Text style={[styles.greetingPrefix, { color: theme.textSecondary }]}>{getTimeGreeting()},</Text>
          <Text style={[styles.greetingName, { color: theme.textPrimary }]}>
            {currentUser?.name || 'Traveler'} 👋
          </Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Notifications')}
            style={[styles.iconBtn, { backgroundColor: isDark ? '#1C2E42' : '#F1F5F9' }]}>
            <Text style={styles.iconBtnText}>🔔</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('Profile')}
            style={[styles.profileAvatar, { backgroundColor: isDark ? '#1C3147' : '#E6F7F4' }]}>
            <Text style={[styles.profileAvatarText, { color: theme.primary }]}>
              {(currentUser?.name || 'T').charAt(0)}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Active Journey Banner if ongoing */}
      {activeJourney && (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigation.navigate('ActiveJourney')}
          style={[styles.activeBanner, { backgroundColor: isDark ? '#0A2D23' : '#E6F7F4', borderColor: theme.primary }]}>
          <View style={[styles.activePulse, { backgroundColor: theme.primary }]} />
          <View style={styles.activeBannerInfo}>
            <Text style={[styles.activeBannerTitle, { color: theme.primary }]}>Active Journey Session</Text>
            <Text style={[styles.activeBannerRoute, { color: theme.textSecondary }]}>
              {activeJourney.from} → {activeJourney.to} • Tap to view
            </Text>
          </View>
          <Text style={[styles.activeArrow, { color: theme.primary }]}>→</Text>
        </TouchableOpacity>
      )}

      {/* Destination Search Box */}
      <View style={[styles.searchBar, { backgroundColor: theme.inputBg, borderColor: theme.border }]} collapsable={false}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          placeholder="Where are you going?"
          placeholderTextColor={theme.textMuted}
          value={destinationSearch}
          onChangeText={setDestinationSearch}
          underlineColorAndroid="transparent"
          textAlignVertical="center"
          style={[styles.searchInput, { color: theme.textPrimary, includeFontPadding: false }]}
        />
        {destinationSearch.length > 0 && (
          <TouchableOpacity onPress={() => setDestinationSearch('')}>
            <Text style={[styles.clearIcon, { color: theme.textMuted }]}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Cooperation Cards Section */}
      <View style={styles.modesSection}>
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>How can you cooperate?</Text>

        <View style={styles.modesGrid}>
          {/* Card 1: Daily Walk */}
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => handleSelectMode('daily_walk')}
            style={[
              styles.modeCard,
              {
                backgroundColor: isDark ? '#0F2820' : theme.walkBg,
                borderColor: isDark ? '#064E3B' : theme.walkBorder,
              },
            ]}>
            <View style={[styles.modeIconCircle, { backgroundColor: isDark ? '#064E3B' : '#C6F6D5' }]}>
              <Text style={styles.modeIcon}>🚶</Text>
            </View>
            <Text style={[styles.modeTitle, { color: theme.textPrimary }]}>Daily Walk</Text>
            <Text style={[styles.modeDesc, { color: theme.textSecondary }]}>Find someone going your way</Text>
          </TouchableOpacity>

          {/* Card 2: Carry Along */}
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => handleSelectMode('carry_along')}
            style={[
              styles.modeCard,
              {
                backgroundColor: isDark ? '#271E10' : theme.carryBg,
                borderColor: isDark ? '#78350F' : theme.carryBorder,
              },
            ]}>
            <View style={[styles.modeIconCircle, { backgroundColor: isDark ? '#78350F' : '#FDE68A' }]}>
              <Text style={styles.modeIcon}>📦</Text>
            </View>
            <Text style={[styles.modeTitle, { color: theme.textPrimary }]}>Carry Along</Text>
            <Text style={[styles.modeDesc, { color: theme.textSecondary }]}>Carry a small permitted item</Text>
          </TouchableOpacity>

          {/* Card 3: Share Vehicle */}
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => handleSelectMode('share_vehicle')}
            style={[
              styles.modeCard,
              {
                backgroundColor: isDark ? '#102538' : theme.shareVehicleBg,
                borderColor: isDark ? '#075985' : theme.shareVehicleBorder,
              },
            ]}>
            <View style={[styles.modeIconCircle, { backgroundColor: isDark ? '#0C4A6E' : '#BAE6FD' }]}>
              <Text style={styles.modeIcon}>🚗</Text>
            </View>
            <Text style={[styles.modeTitle, { color: theme.textPrimary }]}>Share Vehicle</Text>
            <Text style={[styles.modeDesc, { color: theme.textSecondary }]}>Share available seats</Text>
          </TouchableOpacity>

          {/* Card 4: Join Journey */}
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => handleSelectMode('join_journey')}
            style={[
              styles.modeCard,
              {
                backgroundColor: isDark ? '#221738' : theme.joinJourneyBg,
                borderColor: isDark ? '#5B21B6' : theme.joinJourneyBorder,
              },
            ]}>
            <View style={[styles.modeIconCircle, { backgroundColor: isDark ? '#4C1D95' : '#DDD6FE' }]}>
              <Text style={styles.modeIcon}>🤝</Text>
            </View>
            <Text style={[styles.modeTitle, { color: theme.textPrimary }]}>Join Journey</Text>
            <Text style={[styles.modeDesc, { color: theme.textSecondary }]}>Travel together</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Nearby Journeys Feed */}
      <View style={styles.nearbySection}>
        <View style={styles.nearbyHeaderRow}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Nearby journeys</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Explore')}>
            <Text style={[styles.viewAllText, { color: theme.primary }]}>View all ({visibleJourneys.length}) →</Text>
          </TouchableOpacity>
        </View>

        {visibleJourneys.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <Text style={styles.emptyEmoji}>🗺️</Text>
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>No active journeys nearby yet</Text>
            <Text style={[styles.emptySub, { color: theme.textSecondary }]}>
              Be the first to post a journey or check back soon as fellow travelers plan their trips.
            </Text>
            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.createFirstBtn, { backgroundColor: theme.primary }]}
              onPress={() => navigation.navigate('CreateJourney', { mode: 'daily_walk' })}>
              <Text style={styles.createFirstBtnText}>+ Post Your Journey</Text>
            </TouchableOpacity>
          </View>
        ) : (
          visibleJourneys.slice(0, 4).map(({ journey, matchPercentage, reasons }) => (
            <JourneyCard
              key={journey.id}
              journey={journey}
              matchPercentage={matchPercentage}
              reasons={reasons}
              onPress={() =>
                navigation.navigate('JourneyDetails', {
                  journey,
                  matchPercentage,
                  reasons,
                })
              }
              onActionPress={() =>
                navigation.navigate('JourneyDetails', {
                  journey,
                  matchPercentage,
                  reasons,
                })
              }
            />
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnText: {
    fontSize: 16,
  },
  headerTextCol: {
    flex: 1,
  },
  greetingPrefix: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.medium,
    marginBottom: 2,
  },
  greetingName: {
    fontSize: Typography.fontSizes.xxl,
    fontWeight: Typography.fontWeights.extrabold,
    letterSpacing: -0.3,
  },
  profileAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  profileAvatarText: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
  },
  activeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: Radius.lg,
    borderWidth: 1.2,
    marginBottom: 16,
  },
  activePulse: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  activeBannerInfo: {
    flex: 1,
  },
  activeBannerTitle: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  activeBannerRoute: {
    fontSize: Typography.fontSizes.sm,
    marginTop: 2,
  },
  activeArrow: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.full,
    borderWidth: 1,
    paddingHorizontal: 16,
    height: 48,
    marginBottom: 20,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.fontSizes.base,
    paddingVertical: 6,
  },
  clearIcon: {
    fontSize: 14,
    padding: 4,
  },
  modesSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  modesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  modeCard: {
    width: '48%',
    flexGrow: 1,
    borderRadius: Radius.xl,
    borderWidth: 1,
    padding: 14,
    minHeight: 110,
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  modeIconCircle: {
    width: 38,
    height: 38,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  modeIcon: {
    fontSize: 18,
  },
  modeTitle: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.bold,
  },
  modeDesc: {
    fontSize: Typography.fontSizes.xs,
    marginTop: 2,
    lineHeight: 14,
  },
  nearbySection: {
    marginTop: 4,
  },
  nearbyHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  viewAllText: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.bold,
  },
  emptyCard: {
    padding: 24,
    borderRadius: Radius.xl,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: 4,
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.bold,
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: Typography.fontSizes.sm,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  createFirstBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: Radius.full,
  },
  createFirstBtnText: {
    color: '#FFFFFF',
    fontWeight: Typography.fontWeights.bold,
    fontSize: Typography.fontSizes.sm,
  },
});
