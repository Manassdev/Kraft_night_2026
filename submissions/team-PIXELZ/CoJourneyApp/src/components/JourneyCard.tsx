import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CooperationType, Journey } from '../types';

interface JourneyCardProps {
  journey: Journey;
  matchPercentage?: number;
  reasons?: string[];
  onPress?: () => void;
  onActionPress?: () => void;
  actionLabel?: string;
}

export const getCooperationMeta = (type: CooperationType) => {
  switch (type) {
    case 'daily_walk':
      return { label: 'Daily Walk', icon: '🚶', color: '#16A34A', bg: '#DCFCE7' };
    case 'carry_along':
      return { label: 'Carry Along', icon: '📦', color: '#D97706', bg: '#FEF3C7' };
    case 'share_vehicle':
      return { label: 'Share Vehicle', icon: '🚗', color: '#2563EB', bg: '#DBEAFE' };
    case 'join_journey':
      return { label: 'Join Journey', icon: '🤝', color: '#7C3AED', bg: '#EDE9FE' };
    default:
      return { label: 'Journey', icon: '🧭', color: '#475569', bg: '#F1F5F9' };
  }
};

export const JourneyCard: React.FC<JourneyCardProps> = ({
  journey,
  matchPercentage,
  reasons,
  onPress,
  onActionPress,
  actionLabel,
}) => {
  const meta = getCooperationMeta(journey.cooperationType);

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={styles.card}>
      {/* Top row: User info & Trust score */}
      <View style={styles.topRow}>
        <View style={styles.userRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{journey.userName.charAt(0)}</Text>
          </View>
          <View>
            <View style={styles.nameRow}>
              <Text style={styles.userName}>{journey.userName}</Text>
              {journey.userVerified && (
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedText}>✓</Text>
                </View>
              )}
            </View>
            <Text style={styles.trustScoreText}>
              Trust Score: <Text style={styles.boldScore}>{journey.userTrustScore}</Text>/100
            </Text>
          </View>
        </View>

        <View style={[styles.typeBadge, { backgroundColor: meta.bg }]}>
          <Text style={[styles.typeBadgeText, { color: meta.color }]}>
            {meta.icon} {meta.label}
          </Text>
        </View>
      </View>

      {/* Route & Time */}
      <View style={styles.routeContainer}>
        <View style={styles.routeTextRow}>
          <Text style={styles.locationText}>{journey.from}</Text>
          <Text style={styles.arrow}> → </Text>
          <Text style={styles.locationText}>{journey.to}</Text>
        </View>
        <View style={styles.timeRow}>
          <Text style={styles.timeIcon}>🕒</Text>
          <Text style={styles.timeText}>{journey.time}</Text>
        </View>
      </View>

      {/* Mode specifics */}
      {journey.vehicleDetails && (
        <View style={styles.detailRow}>
          <Text style={styles.detailTag}>
            💺 {journey.vehicleDetails.availableSeats} seats available
          </Text>
          <Text style={styles.detailTag}>
            💰 Suggested contribution: ₹{journey.vehicleDetails.travelContribution}/person
          </Text>
        </View>
      )}

      {journey.itemDetails && (
        <View style={styles.detailRow}>
          <Text style={styles.detailTag}>
            📦 {journey.itemDetails.item} ({journey.itemDetails.size})
          </Text>
          <Text style={styles.detailTag}>
            💵 Suggested tip: ₹{journey.itemDetails.suggestedTip}
          </Text>
        </View>
      )}

      {journey.companionPreference && (
        <View style={styles.detailRow}>
          <Text style={styles.detailTag}>
            👥 Preference: {journey.companionPreference} companion
          </Text>
        </View>
      )}

      {journey.travelType && !journey.vehicleDetails && (
        <View style={styles.detailRow}>
          <Text style={styles.detailTag}>
            🚀 Mode: {journey.travelType}
          </Text>
        </View>
      )}

      {/* Match percentage & reasons */}
      {typeof matchPercentage === 'number' && (
        <View style={styles.matchBanner}>
          <View style={styles.matchHeaderRow}>
            <Text style={styles.matchPercentageText}>
              🎯 {matchPercentage}% Cooperation Match
            </Text>
          </View>
          {reasons && reasons.length > 0 && (
            <View style={styles.reasonsList}>
              {reasons.slice(0, 3).map((r, i) => (
                <Text key={i} style={styles.reasonItem}>
                  ✓ {r}
                </Text>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Optional Card Bottom Action */}
      {onActionPress && (
        <TouchableOpacity
          onPress={onActionPress}
          style={styles.actionButton}>
          <Text style={styles.actionButtonText}>
            {actionLabel || 'View & Cooperate'}
          </Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  verifiedBadge: {
    backgroundColor: '#22C55E',
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 5,
  },
  verifiedText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  trustScoreText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  boldScore: {
    fontWeight: '700',
    color: '#0F172A',
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  routeContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  routeTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  arrow: {
    fontSize: 15,
    color: '#64748B',
    fontWeight: '700',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  timeIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  timeText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
  },
  detailRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  detailTag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    fontSize: 12,
    color: '#334155',
    fontWeight: '500',
  },
  matchBanner: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 10,
    padding: 10,
    marginTop: 4,
  },
  matchHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  matchPercentageText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#15803D',
  },
  reasonsList: {
    marginTop: 4,
  },
  reasonItem: {
    fontSize: 11,
    color: '#166534',
    marginTop: 2,
  },
  actionButton: {
    marginTop: 10,
    backgroundColor: '#2563EB',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
});
