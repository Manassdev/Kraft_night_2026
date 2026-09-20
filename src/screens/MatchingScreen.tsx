import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button } from '../components/Button';
import { Header } from '../components/Header';
import { useJourney } from '../context/JourneyContext';
import { useTheme } from '../theme/ThemeContext';
import { Radius, Typography } from '../theme/theme';
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
      journey?: Journey;
      journeyId?: string;
    };
  };
}

export const MatchingScreen: React.FC<MatchingScreenProps> = ({
  navigation,
  route,
}) => {
  const { journeys, currentUser } = useJourney();
  const { theme, isDark } = useTheme();

  const targetJourney: Journey | undefined =
    route?.params?.journey ||
    route?.params?.targetJourney ||
    journeys.find(j => j.userId === currentUser?.id) ||
    journeys[0];

  const matches: MatchResult[] = targetJourney
    ? findJourneyMatches(targetJourney, journeys, currentUser || undefined)
    : [];

  const bestMatch: MatchResult | null = matches[0] || null;

  const handleViewJourney = (match: MatchResult) => {
    navigation.navigate('JourneyDetails', {
      journey: match.journey,
      matchPercentage: match.matchPercentage,
      reasons: match.reasons,
    });
  };

  if (!bestMatch || !bestMatch.journey) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Header
          title="Cooperation Matches"
          onBack={() => navigation.goBack()}
        />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🤝</Text>
          <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>No Matches Found Yet</Text>
          <Text style={[styles.emptySub, { color: theme.textSecondary }]}>
            There are currently no matching journeys along this route. As new journeys are scheduled by fellow travelers, compatible cooperation opportunities will appear here.
          </Text>
          <Button
            title="Browse All Journeys"
            onPress={() => navigation.navigate('Explore')}
            variant="primary"
            style={{ marginTop: 24 }}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header
        title="Your Best Cooperation Matches"
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Prominent Circular Match Gauge matching Reference Screen 14 */}
        <View style={styles.gaugeContainer}>
          <View style={[styles.outerCircle, { borderColor: theme.primary, backgroundColor: isDark ? '#0A2B23' : '#E6F7F4' }]}>
            <View style={[styles.innerCircle, { backgroundColor: theme.card }]}>
              <Text style={[styles.percentageText, { color: theme.primary }]}>{bestMatch.matchPercentage}%</Text>
            </View>
          </View>
          <Text style={[styles.gaugeLabel, { color: theme.primary }]}>Cooperation Match</Text>
        </View>

        {/* Best Match Profile Card */}
        <View style={[styles.profileCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <View style={styles.cardHeader}>
            <View style={[styles.avatar, { backgroundColor: isDark ? '#1C3147' : '#E6F7F4' }]}>
              <Text style={[styles.avatarText, { color: theme.primary }]}>
                {bestMatch.journey.userName.charAt(0)}
              </Text>
            </View>
            <View style={styles.nameCol}>
              <Text style={[styles.userName, { color: theme.textPrimary }]}>{bestMatch.journey.userName}</Text>
              <View style={styles.trustBadgesRow}>
                <Text style={[styles.trustText, { color: theme.warning }]}>
                  ★ {bestMatch.journey.userTrustScore} Trust Score
                </Text>
                {bestMatch.journey.userVerified && (
                  <View style={[styles.verifiedBadge, { backgroundColor: isDark ? '#064E3B' : '#DCFCE7' }]}>
                    <Text style={[styles.verifiedCheck, { color: theme.success }]}>✓ Verified</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Route info */}
          <View style={[styles.routeBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.routeText, { color: theme.textPrimary }]}>
              {bestMatch.journey.from} <Text style={[styles.arrow, { color: theme.textMuted }]}>→</Text> {bestMatch.journey.to}
            </Text>
            <Text style={[styles.timeText, { color: theme.textSecondary }]}>🕒 {bestMatch.journey.time}</Text>
          </View>

          {/* "Why you match?" Section */}
          <View style={styles.reasonsBox}>
            <Text style={[styles.reasonsHeading, { color: theme.textPrimary }]}>Why you match?</Text>
            {bestMatch.reasons.slice(0, 4).map((r, i) => (
              <View key={i} style={styles.reasonRow}>
                <Text style={[styles.greenCheck, { color: theme.primary }]}>✓</Text>
                <Text style={[styles.reasonText, { color: theme.textSecondary }]}>{r}</Text>
              </View>
            ))}
          </View>

          {/* Primary CTA */}
          <Button
            title="View Journey"
            onPress={() => handleViewJourney(bestMatch)}
            variant="primary"
            size="large"
            style={styles.viewBtn}
          />
        </View>

        {/* Additional Matches if present */}
        {matches.length > 1 && (
          <View style={styles.moreMatchesSection}>
            <Text style={[styles.moreMatchesTitle, { color: theme.textPrimary }]}>Other Compatible Travelers</Text>
            {matches.slice(1, 4).map((m, idx) => (
              <TouchableOpacity
                key={idx}
                activeOpacity={0.85}
                onPress={() => handleViewJourney(m)}
                style={[styles.otherMatchCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                <View style={[styles.otherAvatar, { backgroundColor: isDark ? '#1C3147' : '#E6F7F4' }]}>
                  <Text style={[styles.otherAvatarText, { color: theme.primary }]}>
                    {m.journey.userName.charAt(0)}
                  </Text>
                </View>
                <View style={styles.otherInfo}>
                  <Text style={[styles.otherName, { color: theme.textPrimary }]}>{m.journey.userName}</Text>
                  <Text style={[styles.otherRoute, { color: theme.textSecondary }]}>
                    {m.journey.from} → {m.journey.to} • {m.journey.time}
                  </Text>
                </View>
                <View style={[styles.otherBadge, { backgroundColor: isDark ? '#0A2B23' : '#E6F7F4' }]}>
                  <Text style={[styles.otherBadgeText, { color: theme.primary }]}>{m.matchPercentage}%</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  gaugeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 18,
  },
  outerCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 6,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#00A884',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  innerCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentageText: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  gaugeLabel: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.bold,
    marginTop: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  profileCard: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    padding: 18,
    elevation: 3,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.bold,
  },
  nameCol: {
    flex: 1,
  },
  userName: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.extrabold,
    marginBottom: 4,
  },
  trustBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trustText: {
    fontSize: Typography.fontSizes.xs + 1,
    fontWeight: Typography.fontWeights.semibold,
  },
  verifiedBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  verifiedCheck: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.bold,
  },
  routeBox: {
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: 12,
    marginBottom: 16,
  },
  routeText: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.bold,
    marginBottom: 4,
  },
  arrow: {
    fontWeight: '400',
  },
  timeText: {
    fontSize: Typography.fontSizes.sm,
  },
  reasonsBox: {
    marginBottom: 20,
  },
  reasonsHeading: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.bold,
    marginBottom: 10,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  greenCheck: {
    fontSize: Typography.fontSizes.base,
    fontWeight: 'bold',
    marginRight: 8,
  },
  reasonText: {
    fontSize: Typography.fontSizes.sm,
  },
  viewBtn: {
    marginTop: 4,
  },
  moreMatchesSection: {
    marginTop: 4,
  },
  moreMatchesTitle: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.bold,
    marginBottom: 12,
  },
  otherMatchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
  },
  otherAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  otherAvatarText: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.bold,
  },
  otherInfo: {
    flex: 1,
  },
  otherName: {
    fontSize: Typography.fontSizes.sm + 1,
    fontWeight: Typography.fontWeights.bold,
    marginBottom: 2,
  },
  otherRoute: {
    fontSize: Typography.fontSizes.xs,
  },
  otherBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  otherBadgeText: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.bold,
  },
  emptyContainer: {
    flex: 1,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.extrabold,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: Typography.fontSizes.sm,
    textAlign: 'center',
    lineHeight: 22,
  },
});
