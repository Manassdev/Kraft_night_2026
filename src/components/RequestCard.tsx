import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, Radius } from '../theme/theme';
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
  const meta = getCooperationMeta(request.requestType);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return { label: 'Accepted', bg: Colors.primaryLight, text: Colors.primaryDark };
      case 'rejected':
        return { label: 'Rejected', bg: Colors.dangerLight, text: Colors.dangerText };
      case 'completed':
        return { label: 'Completed', bg: '#F1F5F9', text: Colors.textSecondary };
      default:
        return { label: 'Pending', bg: Colors.warningLight, text: Colors.warningText };
    }
  };

  const statusMeta = getStatusBadge(request.status);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={styles.card}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.userRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(isIncoming ? request.senderName : request.receiverName).charAt(0)}
            </Text>
          </View>
          <View>
            <View style={styles.nameRow}>
              <Text style={styles.userName}>
                {isIncoming ? request.senderName : request.receiverName}
              </Text>
              {request.senderVerified && (
                <View style={styles.verifiedDot}>
                  <Text style={styles.verifiedText}>✓</Text>
                </View>
              )}
            </View>
            <Text style={styles.trustText}>
              Trust Score: <Text style={styles.boldTrust}>{request.senderTrustScore}</Text>/100
            </Text>
          </View>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: statusMeta.bg }]}>
          <Text style={[styles.statusText, { color: statusMeta.text }]}>
            {statusMeta.label}
          </Text>
        </View>
      </View>

      {/* Cooperation Type & Journey Route */}
      <View style={styles.content}>
        <View style={styles.journeyInfoBox}>
          <View style={styles.typeRow}>
            <Text style={[styles.typeText, { color: meta.color }]}>
              {meta.icon} {meta.label}
            </Text>
            <Text style={styles.timeText}>🕒 {request.journeyTime}</Text>
          </View>
          <Text style={styles.routeText}>
            {request.journeyFrom} <Text style={styles.arrow}>→</Text> {request.journeyTo}
          </Text>
        </View>

        {request.message ? (
          <View style={styles.messageBox}>
            <Text style={styles.messageText}>"{request.message}"</Text>
          </View>
        ) : null}
      </View>

      {/* Actions */}
      {isIncoming && request.status === 'pending' && (
        <View style={styles.actionsRow}>
          <TouchableOpacity
            onPress={onAccept}
            style={styles.acceptButton}>
            <Text style={styles.acceptText}>Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onReject}
            style={styles.rejectButton}>
            <Text style={styles.rejectText}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}

      {request.status === 'accepted' && (
        <View style={styles.activeJourneyPrompt}>
          <TouchableOpacity
            onPress={onOpenActive}
            style={styles.activeButton}>
            <Text style={styles.activeButtonText}>
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
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
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
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  content: {
    marginBottom: 6,
  },
  journeyInfoBox: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.sm,
    padding: 10,
    marginBottom: 8,
  },
  typeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  timeText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  routeText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  arrow: {
    color: Colors.textSecondary,
  },
  messageBox: {
    backgroundColor: Colors.primaryUltraLight,
    borderRadius: Radius.sm,
    padding: 8,
    marginBottom: 8,
  },
  messageText: {
    fontSize: 12,
    color: Colors.primaryDark,
    fontStyle: 'italic',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  acceptText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  rejectButton: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 10,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  rejectText: {
    color: Colors.textSecondary,
    fontWeight: '700',
    fontSize: 13,
  },
  activeJourneyPrompt: {
    marginTop: 6,
  },
  activeButton: {
    backgroundColor: Colors.primaryLight,
    borderWidth: 1,
    borderColor: '#B2EBF2',
    paddingVertical: 10,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  activeButtonText: {
    color: Colors.primaryDark,
    fontWeight: '700',
    fontSize: 13,
  },
});
