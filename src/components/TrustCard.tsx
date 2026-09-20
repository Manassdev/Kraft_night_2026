import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, Radius, Typography } from '../theme/theme';
import { User } from '../types';
import { calculateTrustBreakdown, TRUST_SCORE_DISCLAIMER } from '../utils/trustScore';

interface TrustCardProps {
  user: Partial<User>;
  showBreakdown?: boolean;
}

export const TrustCard: React.FC<TrustCardProps> = ({
  user,
  showBreakdown = true,
}) => {
  const [expanded, setExpanded] = useState(false);
  const breakdown = calculateTrustBreakdown(user);

  const getLabelBadge = (label: string) => {
    switch (label) {
      case 'Trusted':
        return { bg: Colors.primaryLight, text: Colors.primaryDark, icon: '🛡️' };
      case 'Verified':
        return { bg: '#E0F2FE', text: '#0369A1', icon: '✓' };
      default:
        return { bg: '#F1F5F9', text: '#475569', icon: '🌱' };
    }
  };

  const badge = getLabelBadge(breakdown.label);

  const breakdownItems = [
    { label: 'Identity Verification', score: breakdown.verification, max: 30, icon: '🆔' },
    { label: 'Completed Journeys', score: breakdown.completedJourneys, max: 25, icon: '🚗' },
    { label: 'Cooperation History', score: breakdown.cooperationHistory, max: 20, icon: '🤝' },
    { label: 'Ratings & Feedback', score: breakdown.ratings, max: 15, icon: '⭐' },
    { label: 'Community Safety Record', score: breakdown.safetyRecord, max: 10, icon: '🛡️' },
  ];

  return (
    <View style={styles.card}>
      {/* Top Banner */}
      <View style={styles.scoreRow}>
        <View style={styles.scoreCircle}>
          <Text style={styles.scoreNumber}>{breakdown.total}</Text>
          <Text style={styles.scoreMax}>/100</Text>
        </View>

        <View style={styles.scoreMeta}>
          <View style={styles.badgeRow}>
            <Text style={styles.trustTitle}>Trust Score</Text>
            <View style={[styles.labelBadge, { backgroundColor: badge.bg }]}>
              <Text style={[styles.labelText, { color: badge.text }]}>
                {badge.icon} {breakdown.label}
              </Text>
            </View>
          </View>
          <Text style={styles.subScoreText}>
            Based on completed journeys, verification & ratings
          </Text>
        </View>
      </View>

      {/* Safety Disclaimer */}
      <View style={styles.disclaimerBox}>
        <Text style={styles.disclaimerText}>
          ⚠️ <Text style={styles.disclaimerBold}>Note:</Text> {TRUST_SCORE_DISCLAIMER}
        </Text>
      </View>

      {/* Toggle Breakdown */}
      {showBreakdown && (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setExpanded(!expanded)}
          style={styles.expandButton}>
          <Text style={styles.expandButtonText}>
            {expanded ? '▲ Hide Trust Breakdown' : '▼ View 5-Factor Trust Breakdown'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Detailed Breakdown */}
      {showBreakdown && expanded && (
        <View style={styles.breakdownContainer}>
          {breakdownItems.map((item, index) => (
            <View key={index} style={styles.breakdownItem}>
              <View style={styles.breakdownHeader}>
                <Text style={styles.itemTitle}>
                  {item.icon} {item.label}
                </Text>
                <Text style={styles.itemScore}>
                  {item.score} / {item.max} pts
                </Text>
              </View>
              <View style={styles.barBg}>
                <View
                  style={[
                    styles.barFill,
                    { width: `${Math.round((item.score / item.max) * 100)}%` },
                  ]}
                />
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
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg,
    padding: 16,
    borderWidth: 1.2,
    borderColor: Colors.border,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  scoreCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: Colors.primaryLight,
    borderWidth: 2.5,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  scoreNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.primaryDark,
    lineHeight: 26,
  },
  scoreMax: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  scoreMeta: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  trustTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginRight: 8,
  },
  labelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
  },
  labelText: {
    fontSize: 11,
    fontWeight: '700',
  },
  subScoreText: {
    fontSize: Typography.fontSizes.xs + 1,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  disclaimerBox: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: Radius.sm,
    padding: 8,
    marginBottom: 10,
  },
  disclaimerText: {
    fontSize: 11,
    color: '#92400E',
    lineHeight: 15,
  },
  disclaimerBold: {
    fontWeight: '700',
  },
  expandButton: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  expandButtonText: {
    fontSize: 12,
    color: Colors.primaryDark,
    fontWeight: '600',
  },
  breakdownContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  breakdownItem: {
    marginBottom: 10,
  },
  breakdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemTitle: {
    fontSize: 12,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  itemScore: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  barBg: {
    height: 6,
    backgroundColor: Colors.borderLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
});
