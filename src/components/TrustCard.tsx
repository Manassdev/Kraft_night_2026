import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Radius, Typography } from '../theme/theme';
import { User } from '../types';
import { calculateTrustBreakdown, TRUST_SCORE_DISCLAIMER } from '../utils/trustScore';

interface TrustCardProps {
  user: Partial<User>;
  showBreakdown?: boolean;
}

export const TrustCard: React.FC<TrustCardProps> = ({ user, showBreakdown = true }) => {
  const { theme, isDark } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const breakdown = calculateTrustBreakdown(user);

  const getLabelColors = (label: string) => {
    switch (label) {
      case 'Trusted':
        return { bg: isDark ? '#064E3B' : '#DCFCE7', text: theme.success, icon: '🛡️' };
      case 'Verified':
        return { bg: isDark ? '#0C4A6E' : '#E0F2FE', text: isDark ? '#38BDF8' : '#0369A1', icon: '✓' };
      default:
        return { bg: isDark ? '#1E293B' : '#F1F5F9', text: theme.textSecondary, icon: '🌱' };
    }
  };

  const badge = getLabelColors(breakdown.label);

  const breakdownItems = [
    { label: 'Identity Verification', score: breakdown.verification, max: 30, icon: '🆔' },
    { label: 'Completed Journeys', score: breakdown.completedJourneys, max: 25, icon: '🚗' },
    { label: 'Cooperation History', score: breakdown.cooperationHistory, max: 20, icon: '🤝' },
    { label: 'Ratings & Feedback', score: breakdown.ratings, max: 15, icon: '⭐' },
    { label: 'Community Safety Record', score: breakdown.safetyRecord, max: 10, icon: '🛡️' },
  ];

  return (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
      {/* Score Row */}
      <View style={styles.scoreRow}>
        <View style={[styles.scoreCircle, { backgroundColor: isDark ? '#0A2B23' : '#E6F7F4', borderColor: theme.primary }]}>
          <Text style={[styles.scoreNumber, { color: theme.primary }]}>{breakdown.total}</Text>
          <Text style={[styles.scoreMax, { color: theme.textSecondary }]}>/100</Text>
        </View>
        <View style={styles.scoreMeta}>
          <View style={styles.badgeRow}>
            <Text style={[styles.trustTitle, { color: theme.textPrimary }]}>Trust Score</Text>
            <View style={[styles.labelBadge, { backgroundColor: badge.bg }]}>
              <Text style={[styles.labelText, { color: badge.text }]}>
                {badge.icon} {breakdown.label}
              </Text>
            </View>
          </View>
          <Text style={[styles.subScoreText, { color: theme.textSecondary }]}>
            Based on journeys, verification & ratings
          </Text>
        </View>
      </View>

      {/* Disclaimer */}
      <View style={[styles.disclaimerBox, { backgroundColor: isDark ? '#1C1408' : '#FFFBEB', borderColor: isDark ? '#78350F' : '#FDE68A' }]}>
        <Text style={[styles.disclaimerText, { color: isDark ? '#FCD34D' : '#92400E' }]}>
          ⚠️ <Text style={styles.disclaimerBold}>Note:</Text> {TRUST_SCORE_DISCLAIMER}
        </Text>
      </View>

      {/* Toggle */}
      {showBreakdown && (
        <TouchableOpacity activeOpacity={0.7} onPress={() => setExpanded(!expanded)} style={styles.expandButton}>
          <Text style={[styles.expandButtonText, { color: theme.primary }]}>
            {expanded ? '▲ Hide Trust Breakdown' : '▼ View 5-Factor Trust Breakdown'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Breakdown */}
      {showBreakdown && expanded && (
        <View style={[styles.breakdownContainer, { borderTopColor: theme.border }]}>
          {breakdownItems.map((item, index) => (
            <View key={index} style={styles.breakdownItem}>
              <View style={styles.breakdownHeader}>
                <Text style={[styles.itemTitle, { color: theme.textPrimary }]}>{item.icon} {item.label}</Text>
                <Text style={[styles.itemScore, { color: theme.textPrimary }]}>{item.score} / {item.max} pts</Text>
              </View>
              <View style={[styles.barBg, { backgroundColor: isDark ? '#1E293B' : '#E2E8F0' }]}>
                <View style={[styles.barFill, { width: `${Math.round((item.score / item.max) * 100)}%`, backgroundColor: theme.primary }]} />
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.xl,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  scoreRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  scoreCircle: {
    width: 68, height: 68, borderRadius: 34,
    borderWidth: 2.5, alignItems: 'center', justifyContent: 'center', marginRight: 14,
  },
  scoreNumber: { fontSize: 22, fontWeight: '800', lineHeight: 26 },
  scoreMax: { fontSize: 10, fontWeight: '600' },
  scoreMeta: { flex: 1 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  trustTitle: { fontSize: 17, fontWeight: '700', marginRight: 8 },
  labelBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.sm },
  labelText: { fontSize: 11, fontWeight: '700' },
  subScoreText: { fontSize: Typography.fontSizes.xs + 1, lineHeight: 16 },
  disclaimerBox: { borderWidth: 1, borderRadius: Radius.sm, padding: 8, marginBottom: 10 },
  disclaimerText: { fontSize: 11, lineHeight: 15 },
  disclaimerBold: { fontWeight: '700' },
  expandButton: { alignItems: 'center', paddingVertical: 6 },
  expandButtonText: { fontSize: 12, fontWeight: '600' },
  breakdownContainer: { marginTop: 10, paddingTop: 10, borderTopWidth: 1 },
  breakdownItem: { marginBottom: 10 },
  breakdownHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  itemTitle: { fontSize: 12, fontWeight: '600' },
  itemScore: { fontSize: 12, fontWeight: '700' },
  barBg: { height: 6, borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3 },
});
