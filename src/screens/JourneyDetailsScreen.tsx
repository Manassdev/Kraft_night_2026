import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button } from '../components/Button';
import { Header } from '../components/Header';
import { getCooperationMeta } from '../components/JourneyCard';
import { useJourney } from '../context/JourneyContext';
import { useTheme } from '../theme/ThemeContext';
import { Radius, Typography } from '../theme/theme';
import { Journey } from '../types';

interface JourneyDetailsScreenProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
    goBack: () => void;
  };
  route?: {
    params?: {
      journey?: Journey;
      matchPercentage?: number;
      reasons?: string[];
    };
  };
}

export const JourneyDetailsScreen: React.FC<JourneyDetailsScreenProps> = ({
  navigation,
  route,
}) => {
  const { journeys, sendRequest } = useJourney();
  const { theme, isDark } = useTheme();
  const journey: Journey | undefined = route?.params?.journey || journeys[0];
  const matchPercentage = route?.params?.matchPercentage ?? 90;
  const reasons = route?.params?.reasons || [
    'Route overlap',
    'Compatible schedule',
    'Verified user',
  ];

  const [requestSent, setRequestSent] = useState(false);

  if (!journey) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Header title="Journey Details" onBack={() => navigation.goBack()} />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <Text style={{ fontSize: 40, marginBottom: 12 }}>🗺️</Text>
          <Text style={{ fontSize: Typography.fontSizes.lg, fontWeight: 'bold', color: theme.textPrimary, marginBottom: 8 }}>
            Journey Not Found
          </Text>
          <Text style={{ fontSize: Typography.fontSizes.sm, color: theme.textSecondary, textAlign: 'center', marginBottom: 20 }}>
            This journey might have been completed or is no longer available.
          </Text>
          <Button title="Back to Journeys" onPress={() => navigation.goBack()} variant="primary" />
        </View>
      </View>
    );
  }

  const meta = getCooperationMeta(journey.cooperationType);

  const getActionLabel = () => {
    switch (journey.cooperationType) {
      case 'carry_along':
        return 'Request Carry';
      case 'share_vehicle':
        return 'Request to Join';
      case 'daily_walk':
        return 'Request Walk Companion';
      case 'join_journey':
      default:
        return 'Request to Join';
    }
  };

  const handleSendRequest = () => {
    sendRequest(journey);
    setRequestSent(true);
    Alert.alert(
      'Request Sent',
      `Your request to cooperate was sent to ${journey.userName}. You can view status in Requests or start a chat.`,
      [
        {
          text: 'Chat Now',
          onPress: () => navigation.navigate('Chat', { recipientName: journey.userName, journey }),
        },
        {
          text: 'View Requests',
          onPress: () => navigation.navigate('Requests'),
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header
        title={`${journey.from} → ${journey.to}`}
        onBack={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity
            onPress={() => navigation.navigate('Chat', { recipientName: journey.userName, journey })}
            style={styles.chatHeaderBtn}>
            <Text style={styles.chatHeaderIcon}>💬</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Journey Card Header */}
        <View style={[styles.mainInfoCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.badgeRow}>
            <View style={[styles.typeBadge, { backgroundColor: isDark ? '#142938' : meta.bg }]}>
              <Text style={[styles.typeText, { color: theme.primary }]}>
                {meta.icon} {meta.label}
              </Text>
            </View>
            <Text style={[styles.timeBadgeText, { color: theme.textSecondary }]}>Today • {journey.time}</Text>
          </View>

          {/* Route Display */}
          <Text style={[styles.routeBigText, { color: theme.textPrimary }]}>
            {journey.from} <Text style={[styles.arrow, { color: theme.textMuted }]}>→</Text> {journey.to}
          </Text>

          {journey.meetingPoint && (
            <View style={styles.meetingPointRow}>
              <Text style={styles.meetingIcon}>📍</Text>
              <Text style={[styles.meetingText, { color: theme.textSecondary }]}>
                Meeting point: <Text style={[styles.boldText, { color: theme.textPrimary }]}>{journey.meetingPoint}</Text>
              </Text>
            </View>
          )}
        </View>

        {/* Driver / Traveler Section */}
        <View style={[styles.travelerCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <View style={[styles.avatar, { backgroundColor: isDark ? '#1C3147' : '#E6F7F4' }]}>
            <Text style={[styles.avatarText, { color: theme.primary }]}>{journey.userName.charAt(0)}</Text>
          </View>
          <View style={styles.travelerInfo}>
            <Text style={[styles.travelerRole, { color: theme.textMuted }]}>
              {journey.cooperationType === 'share_vehicle' ? 'Driver' : 'Traveler'}
            </Text>
            <Text style={[styles.travelerName, { color: theme.textPrimary }]}>{journey.userName}</Text>
            <View style={styles.trustBadgeRow}>
              <Text style={[styles.trustScoreText, { color: theme.warning }]}>
                ★ {journey.userTrustScore} Trust Score
              </Text>
              {journey.userVerified && (
                <View style={[styles.verifiedBadge, { backgroundColor: isDark ? '#064E3B' : '#DCFCE7' }]}>
                  <Text style={[styles.verifiedCheck, { color: theme.success }]}>✓ Verified</Text>
                </View>
              )}
            </View>
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate('Chat', { recipientName: journey.userName, journey })}
            style={[styles.chatPartnerBtn, { borderColor: theme.primary }]}>
            <Text style={[styles.chatPartnerText, { color: theme.primary }]}>Message</Text>
          </TouchableOpacity>
        </View>

        {/* Capacity / Contribution / Item details */}
        <View style={[styles.detailsCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {journey.vehicleDetails && (
            <>
              <View style={styles.detailItemRow}>
                <Text style={styles.detailItemIcon}>💺</Text>
                <Text style={[styles.detailItemText, { color: theme.textPrimary }]}>
                  {journey.vehicleDetails.availableSeats} seats available
                </Text>
              </View>
              <View style={styles.detailItemRow}>
                <Text style={styles.detailItemIcon}>💰</Text>
                <Text style={[styles.detailItemText, { color: theme.textPrimary }]}>
                  ₹{journey.vehicleDetails.travelContribution ?? journey.vehicleDetails.contribution ?? 50} suggested contribution
                </Text>
              </View>
            </>
          )}

          {journey.itemDetails && (
            <>
              <View style={styles.detailItemRow}>
                <Text style={styles.detailItemIcon}>📦</Text>
                <Text style={[styles.detailItemText, { color: theme.textPrimary }]}>
                  {journey.itemDetails.itemName || journey.itemDetails.item} ({journey.itemDetails.itemSize || journey.itemDetails.size})
                </Text>
              </View>
              <View style={styles.detailItemRow}>
                <Text style={styles.detailItemIcon}>💵</Text>
                <Text style={[styles.detailItemText, { color: theme.textPrimary }]}>
                  ₹{journey.itemDetails.suggestedTip} suggested tip
                </Text>
              </View>
              {journey.itemDetails.description ? (
                <Text style={[styles.itemDescriptionText, { color: theme.textSecondary }]}>
                  "{journey.itemDetails.description}"
                </Text>
              ) : null}
            </>
          )}

          {journey.companionPreference && (
            <View style={styles.detailItemRow}>
              <Text style={styles.detailItemIcon}>👥</Text>
              <Text style={[styles.detailItemText, { color: theme.textPrimary }]}>
                Companion preference: {journey.companionPreference}
              </Text>
            </View>
          )}
        </View>

        {/* Match Breakdown Section matching Reference Screen 15 */}
        <View style={[styles.matchCard, { backgroundColor: isDark ? '#0A2B23' : '#E6F7F4', borderColor: theme.primary }]}>
          <View style={styles.matchHeader}>
            <Text style={[styles.matchScoreBig, { color: theme.primary }]}>
              ✓ {matchPercentage}% Cooperation Match
            </Text>
          </View>
          <View style={styles.matchReasons}>
            {reasons.slice(0, 3).map((r, i) => (
              <View key={i} style={styles.reasonRow}>
                <Text style={[styles.reasonCheck, { color: theme.primary }]}>✓</Text>
                <Text style={[styles.reasonText, { color: theme.textSecondary }]}>{r}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Primary Action Button */}
        <Button
          title={requestSent ? 'Request Pending' : getActionLabel()}
          onPress={handleSendRequest}
          disabled={requestSent}
          variant="primary"
          size="large"
          style={styles.requestBtn}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  chatHeaderBtn: {
    padding: 6,
  },
  chatHeaderIcon: {
    fontSize: 20,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  mainInfoCard: {
    borderRadius: Radius.lg,
    padding: 16,
    borderWidth: 1,
    marginBottom: 14,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  typeText: {
    fontSize: Typography.fontSizes.xs + 1,
    fontWeight: Typography.fontWeights.bold,
  },
  timeBadgeText: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.medium,
  },
  routeBigText: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.extrabold,
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  arrow: {
    fontWeight: '400',
  },
  meetingPointRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  meetingIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  meetingText: {
    fontSize: Typography.fontSizes.sm,
  },
  boldText: {
    fontWeight: Typography.fontWeights.bold,
  },
  travelerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.lg,
    padding: 14,
    borderWidth: 1,
    marginBottom: 14,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
  },
  travelerInfo: {
    flex: 1,
  },
  travelerRole: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  travelerName: {
    fontSize: Typography.fontSizes.md + 1,
    fontWeight: Typography.fontWeights.bold,
    marginTop: 2,
  },
  trustBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
    gap: 6,
  },
  trustScoreText: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.semibold,
  },
  verifiedBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: Radius.full,
  },
  verifiedCheck: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  chatPartnerBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  chatPartnerText: {
    fontSize: Typography.fontSizes.xs + 1,
    fontWeight: Typography.fontWeights.bold,
  },
  detailsCard: {
    borderRadius: Radius.lg,
    padding: 14,
    borderWidth: 1,
    marginBottom: 14,
  },
  detailItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailItemIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  detailItemText: {
    fontSize: Typography.fontSizes.sm + 1,
    fontWeight: Typography.fontWeights.medium,
  },
  itemDescriptionText: {
    fontSize: Typography.fontSizes.sm,
    fontStyle: 'italic',
    marginTop: 2,
    marginLeft: 26,
  },
  matchCard: {
    borderRadius: Radius.lg,
    padding: 14,
    borderWidth: 1.2,
    marginBottom: 20,
  },
  matchHeader: {
    marginBottom: 8,
  },
  matchScoreBig: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.extrabold,
  },
  matchReasons: {
    marginTop: 4,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  reasonCheck: {
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 6,
  },
  reasonText: {
    fontSize: Typography.fontSizes.sm,
  },
  requestBtn: {
    marginBottom: 10,
  },
});
