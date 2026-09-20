import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Header } from '../components/Header';
import { useJourney } from '../context/JourneyContext';
import { useTheme } from '../theme/ThemeContext';
import { Radius, Typography } from '../theme/theme';

interface RequestsScreenProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
    goBack: () => void;
  };
}

export const RequestsScreen: React.FC<RequestsScreenProps> = ({ navigation }) => {
  const { requests, currentUser, acceptRequest, rejectRequest } = useJourney();
  const { theme, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<'incoming' | 'outgoing' | 'history'>('incoming');

  const incomingRequests = requests.filter(
    r => (r.receiverId === currentUser?.id || r.receiverName === currentUser?.name)
      && r.status === 'pending'
  );

  const outgoingRequests = requests.filter(
    r => (r.senderId === currentUser?.id || r.senderName === currentUser?.name)
      && r.status === 'pending'
  );

  // History: all resolved requests (accepted/rejected/completed)
  const historyRequests = requests.filter(
    r => (r.receiverId === currentUser?.id || r.receiverName === currentUser?.name ||
          r.senderId === currentUser?.id || r.senderName === currentUser?.name)
      && r.status !== 'pending'
  );

  const handleAccept = async (reqId: string) => {
    const session = await acceptRequest(reqId);
    if (session) {
      Alert.alert(
        'Request Accepted! 🟢',
        'Your journey cooperation is now active.',
        [
          {
            text: 'View Active Journey',
            onPress: () => navigation.navigate('ActiveJourney'),
          },
        ]
      );
    }
  };

  const handleReject = (reqId: string) => {
    rejectRequest(reqId);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header
        title="Requests"
        onBack={() => navigation.goBack()}
      />

      {/* 3-Tab Segmented Control: Incoming | Sent | History */}
      <View style={styles.segmentContainer}>
        <View style={[styles.segmentPillBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveTab('incoming')}
            style={[styles.segmentPill, activeTab === 'incoming' && [styles.segmentPillActive, { backgroundColor: theme.primary }]]}>
            <Text style={[styles.segmentText, { color: theme.textSecondary }, activeTab === 'incoming' && styles.segmentTextActive]}>
              Incoming {incomingRequests.length > 0 ? `(${incomingRequests.length})` : ''}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveTab('outgoing')}
            style={[styles.segmentPill, activeTab === 'outgoing' && [styles.segmentPillActive, { backgroundColor: theme.primary }]]}>
            <Text style={[styles.segmentText, { color: theme.textSecondary }, activeTab === 'outgoing' && styles.segmentTextActive]}>
              Sent {outgoingRequests.length > 0 ? `(${outgoingRequests.length})` : ''}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveTab('history')}
            style={[styles.segmentPill, activeTab === 'history' && [styles.segmentPillActive, { backgroundColor: theme.primary }]]}>
            <Text style={[styles.segmentText, { color: theme.textSecondary }, activeTab === 'history' && styles.segmentTextActive]}>
              History
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* INCOMING TAB */}
        {activeTab === 'incoming' && (
          <View style={styles.section}>
            {incomingRequests.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>📬</Text>
                <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>No incoming requests</Text>
                <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                  When other travelers want to cooperate on your journeys, they will appear here.
                </Text>
              </View>
            ) : (
              incomingRequests.map(req => (
                <View key={req.id} style={[styles.requestCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                  <View style={styles.cardHeader}>
                    <View style={[styles.avatar, { backgroundColor: isDark ? '#1C3147' : '#E6F7F4' }]}>
                      <Text style={[styles.avatarText, { color: theme.primary }]}>{req.senderName.charAt(0)}</Text>
                    </View>

                    <View style={styles.requestInfo}>
                      <Text style={[styles.requestTitleText, { color: theme.textPrimary }]}>
                        <Text style={[styles.senderNameBold, { color: theme.textPrimary }]}>{req.senderName}</Text> wants to join your{' '}
                        <Text style={[styles.routeHighlight, { color: theme.primary }]}>
                          {req.journeyFrom} → {req.journeyTo}
                        </Text>{' '}
                        journey
                      </Text>

                      <View style={styles.senderMetaRow}>
                        <Text style={[styles.senderTrustText, { color: theme.warning }]}>
                          ★ {req.senderTrustScore} Trust Score
                        </Text>
                        <Text style={[styles.requestTimeText, { color: theme.textMuted }]}>• {req.createdAt}</Text>
                      </View>
                    </View>
                  </View>

                  {req.message ? (
                    <View style={[styles.messageBox, { backgroundColor: theme.surface }]}>
                      <Text style={[styles.messageText, { color: theme.textSecondary }]}>"{req.message}"</Text>
                    </View>
                  ) : null}

                  {req.status === 'pending' ? (
                    <View style={styles.actionButtonsRow}>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => handleAccept(req.id)}
                        style={[styles.acceptBtn, { backgroundColor: theme.primary }]}>
                        <Text style={styles.acceptBtnText}>Accept</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => handleReject(req.id)}
                        style={[styles.rejectBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                        <Text style={[styles.rejectBtnText, { color: theme.textSecondary }]}>Reject</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.statusBadgeRow}>
                      <Text
                        style={[
                          styles.resolvedStatusText,
                          req.status === 'accepted' ? { color: theme.success } : { color: theme.danger },
                        ]}>
                        {req.status === 'accepted' ? '✓ Accepted' : '✕ Rejected'}
                      </Text>
                    </View>
                  )}
                </View>
              ))
            )}
          </View>
        )}

        {/* OUTGOING TAB */}
        {activeTab === 'outgoing' && (
          <View style={styles.section}>
            {outgoingRequests.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>🚀</Text>
                <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>No outgoing requests</Text>
                <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                  Explore journeys and tap 'Request to Join' or 'Carry Along' to start cooperating.
                </Text>
              </View>
            ) : (
              outgoingRequests.map(req => (
                <View key={req.id} style={[styles.outgoingCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                  <View style={styles.outgoingTopRow}>
                    <Text style={[styles.outgoingRoute, { color: theme.textPrimary }]}>
                      {req.journeyFrom} <Text style={[styles.arrow, { color: theme.textMuted }]}>→</Text> {req.journeyTo}
                    </Text>
                    <View
                      style={[
                        styles.statusPill,
                        req.status === 'accepted'
                          ? { backgroundColor: isDark ? '#064E3B' : '#DCFCE7' }
                          : req.status === 'rejected'
                          ? { backgroundColor: isDark ? '#7F1D1D' : '#FEE2E2' }
                          : { backgroundColor: isDark ? '#78350F' : '#FEF3C7' },
                      ]}>
                      <Text
                        style={[
                          styles.statusText,
                          req.status === 'accepted'
                            ? { color: theme.success }
                            : req.status === 'rejected'
                            ? { color: theme.danger }
                            : { color: theme.warning },
                        ]}>
                        {req.status === 'accepted' ? '🟢 Accepted' : req.status === 'rejected' ? '🔴 Rejected' : '🟡 Pending'}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.outgoingMeta, { color: theme.textSecondary }]}>
                    To: {req.receiverName} • {req.journeyTime}
                  </Text>
                </View>
              ))
            )}
          </View>
        )}

        {/* HISTORY TAB */}
        {activeTab === 'history' && (
          <View style={styles.section}>
            {historyRequests.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>📋</Text>
                <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>No history yet</Text>
                <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                  Accepted, rejected, and completed requests will appear here.
                </Text>
              </View>
            ) : (
              historyRequests.map(req => {
                const isIncoming = req.receiverId === currentUser?.id || req.receiverName === currentUser?.name;
                const otherName = isIncoming ? req.senderName : req.receiverName;
                const statusColor = req.status === 'accepted' ? theme.success
                  : req.status === 'rejected' ? theme.danger
                  : theme.textSecondary;
                const statusEmoji = req.status === 'accepted' ? '🟢'
                  : req.status === 'rejected' ? '🔴'
                  : '⚪';
                return (
                  <View key={req.id} style={[styles.requestCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                    <View style={styles.cardHeader}>
                      <View style={[styles.avatar, { backgroundColor: isDark ? '#1C3147' : '#E6F7F4' }]}>
                        <Text style={[styles.avatarText, { color: theme.primary }]}>{otherName.charAt(0)}</Text>
                      </View>
                      <View style={styles.requestInfo}>
                        <Text style={[styles.requestTitleText, { color: theme.textPrimary }]}>
                          <Text style={[styles.senderNameBold, { color: theme.textPrimary }]}>{otherName}</Text>
                          {' '}{isIncoming ? '→ you' : '← you'}{'\n'}
                          <Text style={[styles.routeHighlight, { color: theme.primary }]}>
                            {req.journeyFrom} → {req.journeyTo}
                          </Text>
                        </Text>
                        <View style={styles.senderMetaRow}>
                          <Text style={[styles.resolvedStatusText, { color: statusColor }]}>
                            {statusEmoji} {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                          </Text>
                          <Text style={[styles.requestTimeText, { color: theme.textMuted }]}>
                            • {req.journeyTime}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}

        {/* Journey Status Legend */}
        <View style={[styles.legendCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.legendTitle, { color: theme.textPrimary }]}>Journey Status</Text>
          <View style={styles.legendItem}>
            <Text style={styles.legendIcon}>🟡</Text>
            <Text style={[styles.legendText, { color: theme.textSecondary }]}>Pending</Text>
          </View>
          <View style={styles.legendItem}>
            <Text style={styles.legendIcon}>🟢</Text>
            <Text style={[styles.legendText, { color: theme.textSecondary }]}>Accepted</Text>
          </View>
          <View style={styles.legendItem}>
            <Text style={styles.legendIcon}>🔴</Text>
            <Text style={[styles.legendText, { color: theme.textSecondary }]}>Rejected</Text>
          </View>
          <View style={styles.legendItem}>
            <Text style={styles.legendIcon}>⚪</Text>
            <Text style={[styles.legendText, { color: theme.textSecondary }]}>Completed</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  segmentContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  segmentPillBox: {
    flexDirection: 'row',
    borderRadius: Radius.full,
    padding: 4,
    borderWidth: 1,
  },
  segmentPill: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: Radius.full,
  },
  segmentPillActive: {},
  segmentText: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.semibold,
  },
  segmentTextActive: {
    color: '#FFFFFF',
    fontWeight: Typography.fontWeights.bold,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 20,
  },
  requestCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.bold,
  },
  requestInfo: {
    flex: 1,
  },
  requestTitleText: {
    fontSize: Typography.fontSizes.sm + 1,
    lineHeight: 18,
  },
  senderNameBold: {
    fontWeight: Typography.fontWeights.bold,
  },
  routeHighlight: {
    fontWeight: Typography.fontWeights.bold,
  },
  senderMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  senderTrustText: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.semibold,
  },
  requestTimeText: {
    fontSize: Typography.fontSizes.xs,
    marginLeft: 6,
  },
  messageBox: {
    borderRadius: Radius.sm,
    padding: 8,
    marginTop: 10,
  },
  messageText: {
    fontSize: Typography.fontSizes.xs + 1,
    fontStyle: 'italic',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 10,
  },
  acceptBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptBtnText: {
    color: '#FFFFFF',
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.bold,
  },
  rejectBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectBtnText: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.semibold,
  },
  statusBadgeRow: {
    marginTop: 10,
    alignItems: 'flex-end',
  },
  resolvedStatusText: {
    fontSize: Typography.fontSizes.xs + 1,
    fontWeight: Typography.fontWeights.bold,
  },
  outgoingCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  outgoingTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  outgoingRoute: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.bold,
  },
  arrow: {
    fontWeight: '400',
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  statusText: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.bold,
  },
  outgoingMeta: {
    fontSize: Typography.fontSizes.xs + 1,
  },
  legendCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: 14,
    marginTop: 8,
  },
  legendTitle: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.bold,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  legendIcon: {
    fontSize: 12,
    marginRight: 8,
  },
  legendText: {
    fontSize: Typography.fontSizes.sm,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: Typography.fontSizes.base + 1,
    fontWeight: Typography.fontWeights.bold,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: Typography.fontSizes.xs + 1,
    textAlign: 'center',
    lineHeight: 18,
  },
});
