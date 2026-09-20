import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Radius } from '../theme/theme';
import { JourneyRequest } from '../types';
import { getCooperationMeta } from './JourneyCard';

interface RequestCardProps {
  request: JourneyRequest;
  isIncoming: boolean;
  onAccept?: () => void;
  onReject?: () => void;
  onOpenActive?: () => void;
  onPress?: () => void;
}

export const RequestCard: React.FC<RequestCardProps> = ({
  request,
  isIncoming,
  onAccept,
  onReject,
  onOpenActive,
  onPress,
}) => {
  const { theme, isDark } = useTheme();
  const meta = getCooperationMeta(request.requestType);

  const getStatusColors = (status: string) => {
    switch (status) {
      case 'accepted':
        return { bg: isDark ? '#064E3B' : '#DCFCE7', text: theme.success };
      case 'rejected':
        return { bg: isDark ? '#7F1D1D' : '#FEE2E2', text: theme.danger };
      case 'completed':
        return { bg: isDark ? '#1E293B' : '#F1F5F9', text: theme.textSecondary };
      default:
        return { bg: isDark ? '#78350F' : '#FEF3C7', text: theme.warning };
    }
  };

  const statusColors = getStatusColors(request.status);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>

      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.userRow}>
          <View style={[styles.avatar, { backgroundColor: isDark ? '#1C3147' : '#E6F7F4' }]}>
            <Text style={[styles.avatarText, { color: theme.primary }]}>
              {(isIncoming ? request.senderName : request.receiverName).charAt(0)}
            </Text>
          </View>
          <View>
            <View style={styles.nameRow}>
              <Text style={[styles.userName, { color: theme.textPrimary }]}>
                {isIncoming ? request.senderName : request.receiverName}
              </Text>
              {request.senderVerified && (
                <View style={[styles.verifiedDot, { backgroundColor: theme.success }]}>
                  <Text style={styles.verifiedText}>✓</Text>
                </View>
              )}
            </View>
            <Text style={[styles.trustText, { color: theme.textSecondary }]}>
              Trust Score: <Text style={{ fontWeight: '700', color: theme.textPrimary }}>{request.senderTrustScore}</Text>/100
            </Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
          <Text style={[styles.statusText, { color: statusColors.text }]}>
            {request.status === 'accepted' ? '🟢 Accepted'
              : request.status === 'rejected' ? '🔴 Rejected'
              : request.status === 'completed' ? '⚪ Completed'
              : '🟡 Pending'}
          </Text>
        </View>
      </View>

      {/* Journey Info */}
      <View style={styles.content}>
        <View style={[styles.journeyInfoBox, { backgroundColor: theme.surface }]}>
          <View style={styles.typeRow}>
            <Text style={[styles.typeText, { color: meta.color }]}>
              {meta.icon} {meta.label}
            </Text>
            <Text style={[styles.timeText, { color: theme.textSecondary }]}>🕒 {request.journeyTime}</Text>
          </View>
          <Text style={[styles.routeText, { color: theme.textPrimary }]}>
            {request.journeyFrom} <Text style={{ color: theme.textMuted }}>→</Text> {request.journeyTo}
          </Text>
        </View>

        {request.message ? (
          <View style={[styles.messageBox, { backgroundColor: isDark ? '#0A2B23' : '#F0FDF4' }]}>
            <Text style={[styles.messageText, { color: isDark ? theme.primary : '#0D6E5B' }]}>"{request.message}"</Text>
          </View>
        ) : null}
      </View>

      {/* Actions */}
      {isIncoming && request.status === 'pending' && (
        <View style={styles.actionsRow}>
          <TouchableOpacity onPress={onAccept} style={[styles.acceptButton, { backgroundColor: theme.primary }]}>
            <Text style={styles.acceptText}>Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onReject} style={[styles.rejectButton, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.rejectText, { color: theme.textSecondary }]}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}

      {request.status === 'accepted' && (
        <View style={styles.activeJourneyPrompt}>
          <TouchableOpacity onPress={onOpenActive} style={[styles.activeButton, { backgroundColor: isDark ? '#0A2B23' : '#E6F7F4', borderColor: isDark ? '#0D3A2F' : '#B2EBF2' }]}>
            <Text style={[styles.activeButtonText, { color: theme.primary }]}>
              🟢 Cooperation Active — View Journey
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.xl,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  avatarText: { fontWeight: '700', fontSize: 16 },
  nameRow: { flexDirection: 'row', alignItems: 'center' },
  userName: { fontSize: 15, fontWeight: '700' },
  verifiedDot: { width: 14, height: 14, borderRadius: 7, alignItems: 'center', justifyContent: 'center', marginLeft: 4 },
  verifiedText: { color: '#FFFFFF', fontSize: 9, fontWeight: '900' },
  trustText: { fontSize: 11, marginTop: 2 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.full },
  statusText: { fontSize: 11, fontWeight: '700' },
  content: { marginBottom: 6 },
  journeyInfoBox: { borderRadius: Radius.md, padding: 10, marginBottom: 8 },
  typeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  typeText: { fontSize: 12, fontWeight: '700' },
  timeText: { fontSize: 12, fontWeight: '500' },
  routeText: { fontSize: 14, fontWeight: '700' },
  messageBox: { borderRadius: Radius.sm, padding: 8, marginBottom: 8 },
  messageText: { fontSize: 12, fontStyle: 'italic' },
  actionsRow: { flexDirection: 'row', gap: 10, marginTop: 6 },
  acceptButton: { flex: 1, paddingVertical: 10, borderRadius: Radius.md, alignItems: 'center' },
  acceptText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  rejectButton: { flex: 1, borderWidth: 1, paddingVertical: 10, borderRadius: Radius.md, alignItems: 'center' },
  rejectText: { fontWeight: '700', fontSize: 13 },
  activeJourneyPrompt: { marginTop: 6 },
  activeButton: { borderWidth: 1, paddingVertical: 10, borderRadius: Radius.md, alignItems: 'center' },
  activeButtonText: { fontWeight: '700', fontSize: 13 },
});
