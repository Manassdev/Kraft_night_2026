import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Radius, Typography } from '../theme/theme';
import { MatchResult } from '../types';
import { getCooperationMeta } from './JourneyCard';

interface MatchCardProps {
  match: MatchResult;
  onPress: () => void;
  onRequest: () => void;
}

export const MatchCard: React.FC<MatchCardProps> = ({ match, onPress, onRequest }) => {
  const { theme, isDark } = useTheme();
  const { journey, matchPercentage, reasons } = match;
  const meta = getCooperationMeta(journey.cooperationType);

  const iconBg = isDark
    ? journey.cooperationType === 'daily_walk' ? '#0E2820'
    : journey.cooperationType === 'carry_along' ? '#261F12'
    : journey.cooperationType === 'share_vehicle' ? '#102538'
    : '#221838'
    : meta.bg;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>

      {/* Match Header */}
      <View style={[styles.matchHeader, { backgroundColor: isDark ? '#0A2B23' : '#E6F7F4', borderBottomColor: isDark ? '#0D3A2F' : '#CCF2EB' }]}>
        <View style={styles.matchBadge}>
          <Text style={styles.matchBadgeIcon}>🎯</Text>
          <Text style={[styles.matchBadgeText, { color: theme.primary }]}>
            {matchPercentage}% Match
          </Text>
        </View>
        <View style={[styles.typeBadge, { backgroundColor: iconBg }]}>
          <Text style={[styles.typeText, { color: meta.color }]}>
            {meta.icon} {meta.label}
          </Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.contentSection}>
        <View style={styles.userRow}>
          <View style={[styles.avatar, { backgroundColor: isDark ? '#1C3147' : '#E6F7F4' }]}>
            <Text style={[styles.avatarText, { color: theme.primary }]}>
              {journey.userName.charAt(0)}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <View style={styles.nameRow}>
              <Text style={[styles.userName, { color: theme.textPrimary }]}>{journey.userName}</Text>
              {journey.userVerified && (
                <View style={[styles.verifiedDot, { backgroundColor: theme.success }]}>
                  <Text style={styles.verifiedText}>✓</Text>
                </View>
              )}
            </View>
            <Text style={[styles.trustText, { color: theme.textSecondary }]}>
              Trust Score: <Text style={{ fontWeight: '700', color: theme.textPrimary }}>{journey.userTrustScore}/100</Text>
            </Text>
          </View>
          <View style={[styles.timeBadge, { backgroundColor: isDark ? '#1C2E42' : '#F1F5F9' }]}>
            <Text style={[styles.timeBadgeText, { color: theme.textSecondary }]}>🕒 {journey.time}</Text>
          </View>
        </View>

        <View style={[styles.routeBox, { backgroundColor: theme.surface }]}>
          <Text style={[styles.routeText, { color: theme.textPrimary }]}>
            {journey.from} <Text style={{ color: theme.textMuted }}>→</Text> {journey.to}
          </Text>
        </View>

        {journey.vehicleDetails && (
          <Text style={[styles.subDetail, { color: theme.textSecondary }]}>
            🚗 {journey.vehicleDetails.vehicleType} • {journey.vehicleDetails.availableSeats} seats • ₹{journey.vehicleDetails.travelContribution}/person
          </Text>
        )}

        {journey.itemDetails && (
          <Text style={[styles.subDetail, { color: theme.textSecondary }]}>
            📦 {journey.itemDetails.item || journey.itemDetails.itemName} • Tip: ₹{journey.itemDetails.suggestedTip}
          </Text>
        )}

        <View style={[styles.reasonsContainer, { backgroundColor: isDark ? '#0B1F2E' : '#F9FAFB' }]}>
          <Text style={[styles.reasonsTitle, { color: theme.textPrimary }]}>Why you match:</Text>
          {reasons.slice(0, 4).map((r, i) => (
            <View key={i} style={styles.reasonRow}>
              <Text style={[styles.greenCheck, { color: theme.primary }]}>✓</Text>
              <Text style={[styles.reasonText, { color: theme.textSecondary }]}>{r}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actionsRow}>
        <TouchableOpacity onPress={onPress} style={[styles.detailsButton, { backgroundColor: isDark ? '#1C3147' : '#E6F7F4', borderColor: isDark ? '#1E4060' : '#B2EBF2' }]}>
          <Text style={[styles.detailsButtonText, { color: theme.primary }]}>Details</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onRequest} style={[styles.requestButton, { backgroundColor: theme.primary }]}>
          <Text style={styles.requestButtonText}>Request Cooperation</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  matchHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  matchBadge: { flexDirection: 'row', alignItems: 'center' },
  matchBadgeIcon: { fontSize: 16, marginRight: 6 },
  matchBadgeText: { fontSize: 14, fontWeight: '800' },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.sm },
  typeText: { fontSize: 11, fontWeight: '700' },
  contentSection: { padding: 16 },
  userRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  avatarText: { fontWeight: '700', fontSize: 16 },
  userInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center' },
  userName: { fontSize: Typography.fontSizes.md, fontWeight: '700' },
  verifiedDot: { width: 14, height: 14, borderRadius: 7, alignItems: 'center', justifyContent: 'center', marginLeft: 4 },
  verifiedText: { color: '#FFFFFF', fontSize: 9, fontWeight: '900' },
  trustText: { fontSize: Typography.fontSizes.xs },
  timeBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.xs + 2 },
  timeBadgeText: { fontSize: 12, fontWeight: '600' },
  routeBox: { borderRadius: Radius.sm, padding: 8, marginBottom: 8 },
  routeText: { fontSize: Typography.fontSizes.md, fontWeight: '700' },
  subDetail: { fontSize: 12, marginBottom: 8 },
  reasonsContainer: { borderRadius: Radius.sm, padding: 10, marginTop: 4 },
  reasonsTitle: { fontSize: 12, fontWeight: '700', marginBottom: 4 },
  reasonRow: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
  greenCheck: { fontWeight: '900', marginRight: 6, fontSize: 13 },
  reasonText: { fontSize: 12 },
  actionsRow: { flexDirection: 'row', paddingHorizontal: 16, paddingBottom: 16, gap: 10 },
  detailsButton: { flex: 1, borderWidth: 1, paddingVertical: 10, borderRadius: Radius.md, alignItems: 'center' },
  detailsButtonText: { fontWeight: '700', fontSize: 13 },
  requestButton: { flex: 2, paddingVertical: 10, borderRadius: Radius.md, alignItems: 'center' },
  requestButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
});
