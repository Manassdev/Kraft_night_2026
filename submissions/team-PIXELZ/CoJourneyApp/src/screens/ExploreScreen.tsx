import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Header } from '../components/Header';
import { JourneyCard } from '../components/JourneyCard';
import { useJourney } from '../context/JourneyContext';
import { CooperationType, Journey } from '../types';
import { calculateJourneyMatch } from '../utils/matching';

interface ExploreScreenProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
  };
}

export const ExploreScreen: React.FC<ExploreScreenProps> = ({ navigation }) => {
  const { journeys, currentUser } = useJourney();
  const [activeFilter, setActiveFilter] = useState<'all' | CooperationType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filterTabs: { id: 'all' | CooperationType; label: string; icon: string }[] = [
    { id: 'all', label: 'All', icon: '🌐' },
    { id: 'daily_walk', label: 'Daily Walk', icon: '🚶' },
    { id: 'carry_along', label: 'Carry Along', icon: '📦' },
    { id: 'share_vehicle', label: 'Share Vehicle', icon: '🚗' },
    { id: 'join_journey', label: 'Join Journey', icon: '🤝' },
  ];

  const filteredJourneys = journeys.filter(j => {
    // Exclude journeys created by current user in explore feed
    if (j.userId === currentUser?.id) return false;

    // Filter by cooperation mode
    if (activeFilter !== 'all' && j.cooperationType !== activeFilter) {
      return false;
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchDest = j.to.toLowerCase().includes(q);
      const matchOrigin = j.from.toLowerCase().includes(q);
      const matchUser = j.userName.toLowerCase().includes(q);
      const matchItem = j.itemDetails?.item.toLowerCase().includes(q);
      if (!matchDest && !matchOrigin && !matchUser && !matchItem) {
        return false;
      }
    }

    return true;
  });

  const defaultUserTarget: Partial<Journey> = {
    from: 'College',
    to: 'Kollam',
    time: '5:00 PM',
  };

  return (
    <View style={styles.container}>
      <Header
        title="Explore Journeys"
        subtitle="Connect with journeys people are already making"
      />

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            placeholder="Search by destination, origin, or person"
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Chips Horizontal Scroll */}
      <View style={styles.tabsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContainer}>
          {filterTabs.map(tab => (
            <TouchableOpacity
              key={tab.id}
              activeOpacity={0.8}
              onPress={() => setActiveFilter(tab.id)}
              style={[
                styles.tabChip,
                activeFilter === tab.id && styles.tabChipActive,
              ]}>
              <Text style={styles.tabIcon}>{tab.icon}</Text>
              <Text
                style={[
                  styles.tabLabel,
                  activeFilter === tab.id && styles.tabLabelActive,
                ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Feed List */}
      <ScrollView contentContainerStyle={styles.listContent}>
        {filteredJourneys.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyTitle}>No matching journeys found</Text>
            <Text style={styles.emptySub}>
              Try adjusting your filter or post your own journey to find cooperative matches.
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('CreateJourney')}
              style={styles.emptyBtn}>
              <Text style={styles.emptyBtnText}>+ Create a Journey</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredJourneys.map(journey => {
            const match = calculateJourneyMatch(defaultUserTarget, journey, currentUser || undefined);
            return (
              <JourneyCard
                key={journey.id}
                journey={journey}
                matchPercentage={match.matchPercentage}
                reasons={match.reasons}
                onPress={() =>
                  navigation.navigate('JourneyDetails', {
                    journey,
                    matchPercentage: match.matchPercentage,
                    reasons: match.reasons,
                  })
                }
                onActionPress={() =>
                  navigation.navigate('JourneyDetails', {
                    journey,
                    matchPercentage: match.matchPercentage,
                    reasons: match.reasons,
                  })
                }
                actionLabel="View Details & Cooperate"
              />
            );
          })
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    paddingVertical: 0,
  },
  clearText: {
    fontSize: 14,
    color: '#94A3B8',
    padding: 4,
  },
  tabsWrapper: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 10,
  },
  tabsContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tabChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tabChipActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  tabIcon: {
    fontSize: 13,
    marginRight: 6,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  tabLabelActive: {
    color: '#2563EB',
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
    paddingBottom: 30,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  emptySub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  emptyBtn: {
    marginTop: 18,
    backgroundColor: '#2563EB',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  emptyBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});
