import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, Radius } from '../theme/theme';
import { MatchResult } from '../types';
import { getCooperationMeta } from './JourneyCard';

interface MatchCardProps {
  match: MatchResult;
  onPress: () => void;
  onRequest: () => void;
}

export const MatchCard: React.FC<MatchCardProps> = ({
  match,
  onPress,
  onRequest,
}) => {
  const { journey, matchPercentage, reasons } = match;
  const meta = getCooperationMeta(journey.cooperationType);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={styles.card}>
      {/* Match Header */}
      <View style={styles.matchHeader}>
        <View style={styles.matchBadge}>
          <Text style={styles.matchBadgeIcon}>🎯</Text>
          <Text style={styles.matchBadgeText}>
            {matchPercentage}% Cooperation Match
          </Text>
        </View>
        <View style={[styles.typeBadge, { backgroundColor: meta.bg }]}>
          <Text style={[styles.typeText, { color: meta.color }]}>
            {meta.icon} {meta.label}
          </Text>
        </View>
      </View>

      {/* User and Route Info */}
      <View style={styles.contentSection}>
        <View style={styles.userRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{journey.userName.charAt(0)}</Text>
          </View>
          <View style={styles.userInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.userName}>{journey.userName}</Text>
              {journey.userVerified && (
                <View style={styles.verifiedDot}>
                  <Text style={styles.verifiedText}>✓</Text>
                </View>
              )}
            </View>
            <Text style={styles.trustText}>
              Trust Score: <Text style={styles.boldTrust}>{journey.userTrustScore}/100</Text>
            </Text>
          </View>
          <View style={styles.timeBadge}>
            <Text style={styles.timeBadgeText}>🕒 {journey.time}</Text>
          </View>
        </View>

        <View style={styles.routeBox}>
          <Text style={styles.routeText}>
            {journey.from} <Text style={styles.arrow}>→</Text> {journey.to}
          </Text>
        </View>

        {journey.vehicleDetails && (
          <Text style={styles.subDetail}>
            🚗 {journey.vehicleDetails.vehicleType} • {journey.vehicleDetails.availableSeats} seats • ₹{journey.vehicleDetails.travelContribution}/person
          </Text>
        )}

        {journey.itemDetails && (
          <Text style={styles.subDetail}>
            📦 {journey.itemDetails.item} • Suggested tip: ₹{journey.itemDetails.suggestedTip}
          </Text>
        )}

        {/* Reasons */}
        <View style={styles.reasonsContainer}>
          <Text style={styles.reasonsTitle}>Why you match:</Text>
          {reasons.slice(0, 4).map((r, i) => (
            <View key={i} style={styles.reasonRow}>
              <Text style={styles.greenCheck}>✓</Text>
              <Text style={styles.reasonText}>{r}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          onPress={onPress}
          style={styles.detailsButton}>
          <Text style={styles.detailsButtonText}>Details</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onRequest}
          style={styles.requestButton}>
          <Text style={styles.requestButtonText}>Request Cooperation</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: '#CCF2EB',
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  matchHeader: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#CCF2EB',
  },
  matchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  matchBadgeIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  matchBadgeText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  typeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  contentSection: {
    padding: 16,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  userInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  verifiedDot: {
    backgroundColor: Colors.success,
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  verifiedText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  trustText: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  boldTrust: {
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  timeBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.xs + 2,
  },
  timeBadgeText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  routeBox: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.sm,
    padding: 8,
    marginBottom: 8,
  },
  routeText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  arrow: {
    color: Colors.textSecondary,
  },
  subDetail: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  reasonsContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: Radius.sm,
    padding: 10,
    marginTop: 4,
  },
  reasonsTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  greenCheck: {
    color: Colors.primary,
    fontWeight: '900',
    marginRight: 6,
    fontSize: 13,
  },
  reasonText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  actionsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 10,
  },
  detailsButton: {
    flex: 1,
    backgroundColor: Colors.primaryLight,
    borderWidth: 1,
    borderColor: '#B2EBF2',
    paddingVertical: 10,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  detailsButtonText: {
    color: Colors.primaryDark,
    fontWeight: '700',
    fontSize: 13,
  },
  requestButton: {
    flex: 2,
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  requestButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});
