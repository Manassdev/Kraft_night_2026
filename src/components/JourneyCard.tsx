import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Colors, Radius, Typography } from '../theme/theme';
import { CooperationType, Journey } from '../types';

interface JourneyCardProps {
  journey: Journey;
  matchPercentage?: number;
  reasons?: string[];
  onPress?: () => void;
  onActionPress?: () => void;
  actionLabel?: string;
  showFullDetails?: boolean;
}

export const getCooperationMeta = (type: CooperationType) => {
  switch (type) {
    case 'daily_walk':
      return {
        label: 'Daily Walk',
        icon: '🚶',
        color: Colors.walkGreen,
        bg: Colors.walkBg,
      };
    case 'carry_along':
      return {
        label: 'Carry Along',
        icon: '📦',
        color: Colors.carryOrange,
        bg: Colors.carryBg,
      };
    case 'share_vehicle':
      return {
        label: 'Share Vehicle',
        icon: '🚗',
        color: Colors.shareVehicleBlue,
        bg: Colors.shareVehicleBg,
      };
    case 'join_journey':
      return {
        label: 'Join Journey',
        icon: '🤝',
        color: Colors.joinJourneyPurple,
        bg: Colors.joinJourneyBg,
      };
    default:
      return {
        label: 'Journey',
        icon: '🧭',
        color: Colors.primary,
        bg: Colors.primaryLight,
      };
  }
};

export const JourneyCard: React.FC<JourneyCardProps> = ({
  journey,
  matchPercentage = 92,
  reasons,
  onPress,
  onActionPress,
  actionLabel = 'View',
  showFullDetails = false,
}) => {
  const { theme, isDark } = useTheme();
  const meta = getCooperationMeta(journey.cooperationType);

  const iconBg = isDark
    ? journey.cooperationType === 'daily_walk'
      ? '#0E2820'
      : journey.cooperationType === 'carry_along'
      ? '#261F12'
      : journey.cooperationType === 'share_vehicle'
      ? '#102538'
      : '#221838'
    : meta.bg;

  const getSubtitle = () => {
    if (journey.vehicleDetails) {
      return `${journey.time} • ${journey.vehicleDetails.availableSeats} seats available`;
    }
    if (journey.itemDetails) {
      const name = journey.itemDetails.itemName || journey.itemDetails.item || 'Document';
      const size = journey.itemDetails.itemSize || journey.itemDetails.size || 'Small';
      return `${journey.time} • ${name} • ${size}`;
    }
    if (journey.companionPreference) {
      return `${journey.time} • ${journey.companionPreference} companion`;
    }
    return `${journey.time} • ${meta.label}`;
  };

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: theme.cardBorder,
        },
      ]}>
      <View style={styles.cardMainRow}>
        {/* Left: Mode icon box */}
        <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
          <Text style={styles.modeIcon}>{meta.icon}</Text>
        </View>

        {/* Center: Route, mode, timing & badges */}
        <View style={styles.centerContent}>
          <View style={styles.routeRow}>
            <Text style={[styles.routeText, { color: theme.textPrimary }]} numberOfLines={1}>
              {journey.from} <Text style={[styles.arrow, { color: theme.textMuted }]}>→</Text> {journey.to}
            </Text>
          </View>

          <Text style={[styles.subtitleText, { color: theme.textSecondary }]} numberOfLines={1}>
            {getSubtitle()}
          </Text>

          {/* Badges: Match % & Trust */}
          <View style={styles.badgesRow}>
            <View style={[styles.matchPill, { backgroundColor: isDark ? '#0A2B23' : '#E6F7F4' }]}>
              <Text style={[styles.matchPillCheck, { color: theme.primary }]}>✓</Text>
              <Text style={[styles.matchPillText, { color: theme.primary }]}>{matchPercentage}% Match</Text>
            </View>

            <View style={[styles.trustPill, { backgroundColor: isDark ? '#1C2E42' : '#F1F5F9' }]}>
              <Text style={[styles.trustPillIcon, { color: theme.warning }]}>★</Text>
              <Text style={[styles.trustPillText, { color: theme.textSecondary }]}>{journey.userTrustScore} Trust</Text>
            </View>
          </View>
        </View>

        {/* Right: View Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onActionPress || onPress}
          style={[styles.viewButton, { backgroundColor: theme.primary }]}>
          <Text style={styles.viewButtonText}>{actionLabel}</Text>
        </TouchableOpacity>
      </View>

      {/* Expanded view for details/reasons if requested */}
      {showFullDetails && reasons && reasons.length > 0 && (
        <View style={[styles.reasonsContainer, { borderTopColor: theme.borderLight }]}>
          {reasons.slice(0, 2).map((r, i) => (
            <View key={i} style={styles.reasonRow}>
              <Text style={[styles.reasonCheck, { color: theme.primary }]}>✓</Text>
              <Text style={[styles.reasonText, { color: theme.textSecondary }]}>{r}</Text>
            </View>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  cardMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  modeIcon: {
    fontSize: 20,
  },
  centerContent: {
    flex: 1,
    marginRight: 8,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  routeText: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.bold,
  },
  arrow: {
    fontWeight: '400',
    marginHorizontal: 2,
  },
  subtitleText: {
    fontSize: Typography.fontSizes.xs + 1,
    marginBottom: 6,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  matchPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  matchPillCheck: {
    fontSize: 9,
    fontWeight: 'bold',
    marginRight: 3,
  },
  matchPillText: {
    fontSize: Typography.fontSizes.xs - 1,
    fontWeight: Typography.fontWeights.bold,
  },
  trustPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  trustPillIcon: {
    fontSize: 9,
    marginRight: 3,
  },
  trustPillText: {
    fontSize: Typography.fontSizes.xs - 1,
    fontWeight: Typography.fontWeights.semibold,
  },
  viewButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewButtonText: {
    color: '#FFFFFF',
    fontSize: Typography.fontSizes.xs + 1,
    fontWeight: Typography.fontWeights.bold,
  },
  reasonsContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  reasonCheck: {
    fontSize: 10,
    fontWeight: 'bold',
    marginRight: 6,
  },
  reasonText: {
    fontSize: Typography.fontSizes.xs,
  },
});
