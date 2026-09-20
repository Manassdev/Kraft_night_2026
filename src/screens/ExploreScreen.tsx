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
import { useTheme } from '../theme/ThemeContext';
import { Radius, Typography } from '../theme/theme';
import { CooperationType, Journey } from '../types';
import { calculateJourneyMatch } from '../utils/matching';

interface ExploreScreenProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
    goBack: () => void;
  };
}

export const ExploreScreen: React.FC<ExploreScreenProps> = ({ navigation }) => {
  const { journeys, currentUser } = useJourney();
  const { theme, isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'Time' | 'Type' | 'Distance' | 'Trust'>('all');
  const [selectedType, setSelectedType] = useState<CooperationType | null>(null);

  const filterChips: { id: 'Time' | 'Type' | 'Distance' | 'Trust'; label: string }[] = [
    { id: 'Time', label: 'Time' },
    { id: 'Type', label: 'Type' },
    { id: 'Distance', label: 'Distance' },
    { id: 'Trust', label: 'Trust' },
  ];

  const defaultUserTarget: Partial<Journey> = {
    from: '',
    to: searchQuery.trim(),
    time: '',
  };

  const filteredJourneys = journeys
    .filter(j => j.userId !== currentUser?.id)
    // PRIVACY: hide active/in-progress journeys from public discovery
    .filter(j => j.status !== 'active' && (j.status as string) !== 'in_progress')
    .filter(j => {
      if (selectedType && j.cooperationType !== selectedType) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchDest = j.to.toLowerCase().includes(q);
        const matchOrigin = j.from.toLowerCase().includes(q);
        const matchUser = j.userName.toLowerCase().includes(q);
        const matchType = j.cooperationType.toLowerCase().includes(q);
        return matchDest || matchOrigin || matchUser || matchType;
      }
      return true;
    })
    .map(journey => {
      const match = calculateJourneyMatch(defaultUserTarget, journey, currentUser || undefined);
      return {
        journey,
        matchPercentage: match.matchPercentage,
        reasons: match.reasons,
      };
    })
    .sort((a, b) => {
      if (activeFilter === 'Trust') {
        return b.journey.userTrustScore - a.journey.userTrustScore;
      }
      if (activeFilter === 'Time') {
        return a.journey.time.localeCompare(b.journey.time);
      }
      return b.matchPercentage - a.matchPercentage;
    });

  const handleFilterPress = (chipId: 'Time' | 'Type' | 'Distance' | 'Trust') => {
    if (activeFilter === chipId) {
      setActiveFilter('all');
      setSelectedType(null);
    } else {
      setActiveFilter(chipId);
      if (chipId === 'Type') {
        const types: CooperationType[] = ['share_vehicle', 'carry_along', 'daily_walk', 'join_journey'];
        const nextIndex = selectedType ? (types.indexOf(selectedType) + 1) % types.length : 0;
        setSelectedType(types[nextIndex]);
      } else {
        setSelectedType(null);
      }
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header title="Explore Journeys" />

      {/* Search Input Bar */}
      <View style={[styles.searchContainer, { backgroundColor: theme.headerBg }]}>
        <View style={[styles.searchBar, { backgroundColor: theme.inputBg, borderColor: theme.border }]} collapsable={false}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            placeholder="Where are you going?"
            placeholderTextColor={theme.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            underlineColorAndroid="transparent"
            textAlignVertical="center"
            style={[styles.searchInput, { color: theme.textPrimary, includeFontPadding: false }]}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={[styles.clearText, { color: theme.textMuted }]}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Chips matching Reference Screen 8 */}
      <View style={[styles.filterRow, { backgroundColor: theme.headerBg, borderBottomColor: theme.borderLight }]}>
        {filterChips.map(chip => {
          const isActive = activeFilter === chip.id;
          return (
            <TouchableOpacity
              key={chip.id}
              activeOpacity={0.8}
              onPress={() => handleFilterPress(chip.id)}
              style={[
                styles.filterChip,
                {
                  backgroundColor: isActive ? theme.primary : isDark ? '#152438' : '#F1F5F9',
                  borderColor: isActive ? theme.primary : theme.border,
                },
              ]}>
              <Text
                style={[
                  styles.filterChipText,
                  {
                    color: isActive ? '#FFFFFF' : theme.textSecondary,
                    fontWeight: isActive ? Typography.fontWeights.bold : Typography.fontWeights.medium,
                  },
                ]}>
                {chip.label} {isActive && chip.id === 'Type' && selectedType ? `(${selectedType.replace('_', ' ')})` : ''}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Journeys Feed */}
      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}>
        {filteredJourneys.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>No journeys found</Text>
            <Text style={[styles.emptySub, { color: theme.textSecondary }]}>
              Try adjusting your search destination or filters to find available cooperation opportunities.
            </Text>
          </View>
        ) : (
          filteredJourneys.map(({ journey, matchPercentage, reasons }) => (
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
              actionLabel="View"
            />
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.full,
    borderWidth: 1,
    paddingHorizontal: 14,
    height: 44,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.fontSizes.base,
    paddingVertical: 6,
  },
  clearText: {
    fontSize: 14,
    padding: 4,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: Typography.fontSizes.xs + 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
    marginBottom: 6,
  },
  emptySub: {
    fontSize: Typography.fontSizes.sm,
    textAlign: 'center',
    lineHeight: 18,
  },
});
