import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../components/Button';
import { Header } from '../components/Header';
import { MatchCard } from '../components/MatchCard';
import { useJourney } from '../context/JourneyContext';
import { Journey, MatchResult } from '../types';
import { findJourneyMatches } from '../utils/matching';

interface MatchingScreenProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
    goBack: () => void;
  };
  route?: {
    params?: {
      targetJourney?: Journey;
    };
  };
}

export const MatchingScreen: React.FC<MatchingScreenProps> = ({
  navigation,
  route,
}) => {
  const { journeys, currentUser, sendRequest } = useJourney();

  const targetJourney: Journey =
    route?.params?.targetJourney ||
    journeys.find(j => j.userId === currentUser?.id) ||
    journeys[0];

  const matches: MatchResult[] = findJourneyMatches(
    targetJourney,
    journeys,
    currentUser || undefined
  );

  const handleSendRequest = (match: MatchResult) => {
    sendRequest(
      match.journey,
      `Hello ${match.journey.userName}, our journeys have a ${match.matchPercentage}% cooperation match. I would love to cooperate along the route!`
    );
    Alert.alert(
      'Request Sent!',
      `Your cooperation request was sent to ${match.journey.userName}. You can track status in the Requests tab.`,
      [
        {
          text: 'View Requests',
          onPress: () => navigation.navigate('Requests'),
        },
        {
          text: 'OK',
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title="Cooperation Matches"
        subtitle="Deterministic algorithmic route compatibility"
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.content}>
        {/* User's Created Journey Summary */}
        <View style={styles.targetBanner}>
          <Text style={styles.targetLabel}>YOUR ACTIVE ROUTE</Text>
          <Text style={styles.targetRoute}>
            {targetJourney.from} <Text style={styles.arrow}>→</Text> {targetJourney.to}
          </Text>
          <Text style={styles.targetMeta}>
            🕒 {targetJourney.time} • Meeting point: {targetJourney.meetingPoint || 'Main gate'}
          </Text>
        </View>

        {/* Algorithm Score Explanation Header */}
        <View style={styles.algoNoteBox}>
          <Text style={styles.algoTitle}>⚖️ Match Weight Distribution</Text>
          <Text style={styles.algoDesc}>
            Destination (30%) • Route Overlap (25%) • Time Proximity (20%) • Preferences (10%) • Trust (10%) • History (5%)
          </Text>
        </View>

        {/* Matches Feed */}
        <Text style={styles.resultsCount}>
          Found {matches.length} Compatible Journeys
        </Text>

        {matches.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>⏳</Text>
            <Text style={styles.emptyTitle}>No exact matches right now</Text>
            <Text style={styles.emptyDesc}>
              Your journey is visible to others in Explore. You will receive notifications when another traveler connects.
            </Text>
            <Button
              title="Explore All Journeys"
              onPress={() => navigation.navigate('Explore')}
              variant="outline"
              style={styles.emptyBtn}
            />
          </View>
        ) : (
          matches.map(match => (
            <MatchCard
              key={match.journey.id}
              match={match}
              onPress={() =>
                navigation.navigate('JourneyDetails', {
                  journey: match.journey,
                  matchPercentage: match.matchPercentage,
                  reasons: match.reasons,
                })
              }
              onRequest={() => handleSendRequest(match)}
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
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 16,
    paddingBottom: 30,
  },
  targetBanner: {
    backgroundColor: '#1E3A8A',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  targetLabel: {
    color: '#93C5FD',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  targetRoute: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 4,
  },
  arrow: {
    color: '#60A5FA',
  },
  targetMeta: {
    color: '#BFDBFE',
    fontSize: 12,
    marginTop: 4,
  },
  algoNoteBox: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
  },
  algoTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E40AF',
  },
  algoDesc: {
    fontSize: 11,
    color: '#3B82F6',
    marginTop: 2,
    lineHeight: 15,
  },
  resultsCount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 10,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  emptyDesc: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  emptyBtn: {
    marginTop: 16,
  },
});
