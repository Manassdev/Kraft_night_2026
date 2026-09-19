import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
  const { journey, matchPercentage, reasons, factors } = match;
  const meta = getCooperationMeta(journey.cooperationType);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={styles.card}>
      {/* High-visibility Match Header */}
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

        {/* Reasons Why this is a Strong Cooperation Match */}
        <View style={styles.reasonsContainer}>
          <Text style={styles.reasonsTitle}>Why this journey matches:</Text>
          {reasons.map((r, i) => (
            <View key={i} style={styles.reasonRow}>
              <Text style={styles.greenCheck}>✓</Text>
              <Text style={styles.reasonText}>{r}</Text>
            </View>
          ))}
        </View>

        {/* Factor Progress Indicators */}
        {factors && factors.length > 0 && (
          <View style={styles.factorsGrid}>
            {factors.slice(0, 3).map((f, i) => (
              <View key={i} style={styles.factorItem}>
                <Text style={styles.factorLabel}>{f.label}</Text>
                <View style={styles.factorBarBg}>
                  <View
                    style={[
                      styles.factorBarFill,
                      { width: `${Math.round((f.score / f.maxScore) * 100)}%` },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        )}
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
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#86EFAC',
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  matchHeader: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#DCFCE7',
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
    color: '#15803D',
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
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
    backgroundColor: '#2563EB',
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
    color: '#0F172A',
  },
  verifiedDot: {
    backgroundColor: '#22C55E',
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
    color: '#64748B',
  },
  boldTrust: {
    fontWeight: '700',
    color: '#0F172A',
  },
  timeBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  timeBadgeText: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '600',
  },
  routeBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
  routeText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  arrow: {
    color: '#64748B',
  },
  subDetail: {
    fontSize: 12,
    color: '#475569',
    marginBottom: 8,
  },
  reasonsContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 10,
    marginTop: 4,
  },
  reasonsTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 4,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  greenCheck: {
    color: '#16A34A',
    fontWeight: '900',
    marginRight: 6,
    fontSize: 13,
  },
  reasonText: {
    fontSize: 12,
    color: '#1F2937',
  },
  factorsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    gap: 8,
  },
  factorItem: {
    flex: 1,
  },
  factorLabel: {
    fontSize: 10,
    color: '#64748B',
    marginBottom: 3,
  },
  factorBarBg: {
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  factorBarFill: {
    height: '100%',
    backgroundColor: '#16A34A',
  },
  actionsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 10,
  },
  detailsButton: {
    flex: 1,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  detailsButtonText: {
    color: '#1D4ED8',
    fontWeight: '700',
    fontSize: 13,
  },
  requestButton: {
    flex: 2,
    backgroundColor: '#2563EB',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  requestButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});
