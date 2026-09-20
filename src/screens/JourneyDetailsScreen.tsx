import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button } from '../components/Button';
import { Header } from '../components/Header';
import { getCooperationMeta } from '../components/JourneyCard';
import { useJourney } from '../context/JourneyContext';
import { useTheme } from '../theme/ThemeContext';
import { Radius, Typography } from '../theme/theme';
import { Journey, JourneyView } from '../types';

interface JourneyDetailsScreenProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
    goBack: () => void;
  };
  route?: {
    params?: {
      journey?: Journey;
      matchPercentage?: number;
      reasons?: string[];
    };
  };
}

export const JourneyDetailsScreen: React.FC<JourneyDetailsScreenProps> = ({
  navigation,
  route,
}) => {
  const { journeys, currentUser, requests, sendRequest, startJourney, recordView, getJourneyViewers } = useJourney();
  const { theme, isDark } = useTheme();

  const journey: Journey | undefined = route?.params?.journey || journeys[0];
  const matchPercentage = route?.params?.matchPercentage ?? 90;
  const reasons = route?.params?.reasons || ['Route overlap', 'Compatible schedule', 'Verified user'];

  const [requestSent, setRequestSent] = useState(false);
  const [startingJourney, setStartingJourney] = useState(false);
  const [viewCount, setViewCount] = useState(0);
  const [viewers, setViewers] = useState<JourneyView[]>([]);
  const [showViewers, setShowViewers] = useState(false);
  const [isStarted, setIsStarted] = useState(false);

  const isOwner = !!(currentUser && journey && currentUser.id === journey.userId);

  // Check if current user is an accepted participant
  const isAcceptedParticipant = !!(
    currentUser &&
    journey &&
    requests.some(
      r =>
        r.journeyId === journey.id &&
        r.status === 'accepted' &&
        (r.senderId === currentUser.id || r.receiverId === currentUser.id)
    )
  );

  const journeyIsActive =
    journey?.status === 'active' || journey?.status === 'in_progress' as any;

  const canViewDetails = isOwner || isAcceptedParticipant || !journeyIsActive;

  // Check if owner has at least one accepted request for this journey
  const hasAcceptedRequest = !!(
    journey &&
    requests.some(r => r.journeyId === journey.id && r.status === 'accepted')
  );

  // Record view and load viewer data on mount
  const loadViewData = useCallback(async () => {
    if (!journey) return;

    if (!isOwner && currentUser?.id) {
      await recordView(journey.id);
    }

    if (isOwner) {
      const viewerList = await getJourneyViewers(journey.id);
      setViewers(viewerList);
      setViewCount(viewerList.length);
    }
  }, [journey?.id, isOwner, currentUser?.id]);

  useEffect(() => {
    loadViewData();
  }, [loadViewData]);

  if (!journey) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Header title="Journey Details" onBack={() => navigation.goBack()} />
        <View style={styles.emptyCenter}>
          <Text style={styles.emptyEmoji}>🗺️</Text>
          <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>Journey Not Found</Text>
          <Text style={[styles.emptySub, { color: theme.textSecondary }]}>
            This journey might have been completed or is no longer available.
          </Text>
          <Button title="Back to Journeys" onPress={() => navigation.goBack()} variant="primary" />
        </View>
      </View>
    );
  }

  // Privacy Guard — active journey, unauthorized viewer
  if (journeyIsActive && !canViewDetails) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Header title="Journey Details" onBack={() => navigation.goBack()} />
        <View style={styles.emptyCenter}>
          <Text style={[styles.lockIcon]}>🔒</Text>
          <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>Journey Already Started</Text>
          <Text style={[styles.emptySub, { color: theme.textSecondary }]}>
            This journey is now in progress and is no longer available for new participants.
          </Text>
          <Button title="Explore Other Journeys" onPress={() => navigation.navigate('Explore')} variant="primary" />
        </View>
      </View>
    );
  }

  const meta = getCooperationMeta(journey.cooperationType);

  const getActionLabel = () => {
    switch (journey.cooperationType) {
      case 'carry_along': return 'Request Carry';
      case 'share_vehicle': return 'Request to Join';
      case 'daily_walk': return 'Request Walk Companion';
      default: return 'Request to Join';
    }
  };

  const handleSendRequest = () => {
    sendRequest(journey);
    setRequestSent(true);
    Alert.alert(
      'Request Sent',
      `Your request to cooperate was sent to ${journey.userName}. You can view status in Requests or start a chat.`,
      [
        { text: 'Chat Now', onPress: () => navigation.navigate('Chat', { recipientName: journey.userName, journey }) },
        { text: 'View Requests', onPress: () => navigation.navigate('Requests') },
      ]
    );
  };

  const handleStartJourney = async () => {
    if (!journey) return;
    setStartingJourney(true);
    const success = await startJourney(journey.id);
    setStartingJourney(false);
    if (success) {
      setIsStarted(true);
      Alert.alert(
        '🚀 Journey Started!',
        'Your journey is now active. It has been removed from public discovery.',
        [{ text: 'Go to Active Journey', onPress: () => navigation.navigate('ActiveJourney') }]
      );
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    try {
      const diff = Date.now() - new Date(dateStr).getTime();
      const mins = Math.floor(diff / 60000);
      if (mins < 1) return 'Just now';
      if (mins < 60) return `${mins}m ago`;
      const hrs = Math.floor(mins / 60);
      if (hrs < 24) return `${hrs}h ago`;
      return `${Math.floor(hrs / 24)}d ago`;
    } catch {
      return 'Recently';
    }
  };

  const iconBg = isDark
    ? journey.cooperationType === 'daily_walk' ? '#0E2820'
    : journey.cooperationType === 'carry_along' ? '#261F12'
    : journey.cooperationType === 'share_vehicle' ? '#102538'
    : '#221838'
    : meta.bg;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header
        title={`${journey.from} → ${journey.to}`}
        onBack={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity
            onPress={() => navigation.navigate('Chat', { recipientName: journey.userName, journey })}
            style={styles.chatHeaderBtn}>
            <Text style={styles.chatHeaderIcon}>💬</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ── Main Info Card ── */}
        <View style={[styles.mainInfoCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <View style={styles.badgeRow}>
            <View style={[styles.typeBadge, { backgroundColor: iconBg }]}>
              <Text style={[styles.typeText, { color: meta.color }]}>{meta.icon} {meta.label}</Text>
            </View>
            <Text style={[styles.timeBadgeText, { color: theme.textSecondary }]}>Today • {journey.time}</Text>
          </View>

          <Text style={[styles.routeBigText, { color: theme.textPrimary }]}>
            {journey.from} <Text style={{ color: theme.textMuted, fontWeight: '400' }}>→</Text> {journey.to}
          </Text>

          {journey.meetingPoint && (
            <View style={styles.meetingPointRow}>
              <Text style={styles.meetingIcon}>📍</Text>
              <Text style={[styles.meetingText, { color: theme.textSecondary }]}>
                Meeting point: <Text style={[styles.boldText, { color: theme.textPrimary }]}>{journey.meetingPoint}</Text>
              </Text>
            </View>
          )}

          {/* Active status pill */}
          {journeyIsActive && (isOwner || isAcceptedParticipant) && (
            <View style={[styles.activePill, { backgroundColor: isDark ? '#064E3B' : '#DCFCE7' }]}>
              <View style={[styles.pulseDot, { backgroundColor: theme.success }]} />
              <Text style={[styles.activePillText, { color: theme.success }]}>Journey In Progress</Text>
            </View>
          )}
        </View>

        {/* ── Owner-only: View Count + Who Viewed ── */}
        {isOwner && (
          <View style={[styles.viewersCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <TouchableOpacity
              style={styles.viewersHeader}
              onPress={() => setShowViewers(!showViewers)}
              activeOpacity={0.7}>
              <View style={styles.viewersLeft}>
                <Text style={styles.viewersEye}>👁</Text>
                <Text style={[styles.viewersCount, { color: theme.textPrimary }]}>
                  {viewCount} {viewCount === 1 ? 'person' : 'people'} viewed this journey
                </Text>
              </View>
              <Text style={[styles.viewersChevron, { color: theme.textMuted }]}>
                {showViewers ? '▲' : '▼'}
              </Text>
            </TouchableOpacity>

            {showViewers && viewers.length > 0 && (
              <View style={[styles.viewersList, { borderTopColor: theme.border }]}>
                {viewers.slice(0, 8).map(v => (
                  <View key={v.id} style={styles.viewerItem}>
                    <View style={[styles.viewerAvatar, { backgroundColor: isDark ? '#1C3147' : '#E6F7F4' }]}>
                      <Text style={[styles.viewerAvatarText, { color: theme.primary }]}>
                        {v.viewerName.charAt(0)}
                      </Text>
                    </View>
                    <View style={styles.viewerInfo}>
                      <Text style={[styles.viewerName, { color: theme.textPrimary }]}>{v.viewerName}</Text>
                      <Text style={[styles.viewerTime, { color: theme.textMuted }]}>{formatTimeAgo(v.viewedAt)}</Text>
                    </View>
                    {v.viewerVerified && (
                      <View style={[styles.viewerVerified, { backgroundColor: isDark ? '#064E3B' : '#DCFCE7' }]}>
                        <Text style={[styles.viewerVerifiedText, { color: theme.success }]}>✓</Text>
                      </View>
                    )}
                  </View>
                ))}
                {viewers.length === 0 && (
                  <Text style={[styles.noViewersText, { color: theme.textMuted }]}>No one has viewed this yet.</Text>
                )}
              </View>
            )}

            {showViewers && viewers.length === 0 && (
              <Text style={[styles.noViewersText, { color: theme.textMuted, padding: 12 }]}>
                No views recorded yet.
              </Text>
            )}
          </View>
        )}

        {/* ── Traveler Card ── */}
        <View style={[styles.travelerCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <View style={[styles.avatar, { backgroundColor: isDark ? '#1C3147' : '#E6F7F4' }]}>
            <Text style={[styles.avatarText, { color: theme.primary }]}>{journey.userName.charAt(0)}</Text>
          </View>
          <View style={styles.travelerInfo}>
            <Text style={[styles.travelerRole, { color: theme.textMuted }]}>
              {journey.cooperationType === 'share_vehicle' ? 'Driver' : 'Traveler'}
            </Text>
            <Text style={[styles.travelerName, { color: theme.textPrimary }]}>{journey.userName}</Text>
            <View style={styles.trustBadgeRow}>
              <Text style={[styles.trustScoreText, { color: theme.warning }]}>★ {journey.userTrustScore} Trust Score</Text>
              {journey.userVerified && (
                <View style={[styles.verifiedBadge, { backgroundColor: isDark ? '#064E3B' : '#DCFCE7' }]}>
                  <Text style={[styles.verifiedCheck, { color: theme.success }]}>✓ Verified</Text>
                </View>
              )}
            </View>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('Chat', { recipientName: journey.userName, journey })}
            style={[styles.chatPartnerBtn, { borderColor: theme.primary }]}>
            <Text style={[styles.chatPartnerText, { color: theme.primary }]}>Message</Text>
          </TouchableOpacity>
        </View>

        {/* ── Details Card ── */}
        {(journey.vehicleDetails || journey.itemDetails || journey.companionPreference) && (
          <View style={[styles.detailsCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            {journey.vehicleDetails && (
              <>
                <View style={styles.detailItemRow}>
                  <Text style={styles.detailItemIcon}>💺</Text>
                  <Text style={[styles.detailItemText, { color: theme.textPrimary }]}>
                    {journey.vehicleDetails.availableSeats} seats available
                  </Text>
                </View>
                <View style={styles.detailItemRow}>
                  <Text style={styles.detailItemIcon}>💰</Text>
                  <Text style={[styles.detailItemText, { color: theme.textPrimary }]}>
                    ₹{journey.vehicleDetails.travelContribution ?? journey.vehicleDetails.contribution ?? 50} suggested contribution
                  </Text>
                </View>
              </>
            )}
            {journey.itemDetails && (
              <>
                <View style={styles.detailItemRow}>
                  <Text style={styles.detailItemIcon}>📦</Text>
                  <Text style={[styles.detailItemText, { color: theme.textPrimary }]}>
                    {journey.itemDetails.itemName || journey.itemDetails.item} ({journey.itemDetails.itemSize || journey.itemDetails.size})
                  </Text>
                </View>
                <View style={styles.detailItemRow}>
                  <Text style={styles.detailItemIcon}>💵</Text>
                  <Text style={[styles.detailItemText, { color: theme.textPrimary }]}>
                    ₹{journey.itemDetails.suggestedTip} suggested tip
                  </Text>
                </View>
                {journey.itemDetails.description ? (
                  <Text style={[styles.itemDescriptionText, { color: theme.textSecondary }]}>
                    "{journey.itemDetails.description}"
                  </Text>
                ) : null}
              </>
            )}
            {journey.companionPreference && (
              <View style={styles.detailItemRow}>
                <Text style={styles.detailItemIcon}>👥</Text>
                <Text style={[styles.detailItemText, { color: theme.textPrimary }]}>
                  Companion preference: {journey.companionPreference}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* ── Match Card ── */}
        <View style={[styles.matchCard, { backgroundColor: isDark ? '#0A2B23' : '#E6F7F4', borderColor: theme.primary }]}>
          <Text style={[styles.matchScoreBig, { color: theme.primary }]}>✓ {matchPercentage}% Cooperation Match</Text>
          <View style={styles.matchReasons}>
            {reasons.slice(0, 3).map((r, i) => (
              <View key={i} style={styles.reasonRow}>
                <Text style={[styles.reasonCheck, { color: theme.primary }]}>✓</Text>
                <Text style={[styles.reasonText, { color: theme.textSecondary }]}>{r}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Owner-only: Start Journey ── */}
        {isOwner && !journeyIsActive && !isStarted && hasAcceptedRequest && (
          <Button
            title={startingJourney ? 'Starting...' : '🚀 Start Journey'}
            onPress={handleStartJourney}
            disabled={startingJourney}
            loading={startingJourney}
            variant="success"
            size="large"
            style={styles.startBtn}
          />
        )}

        {/* ── Primary Action (non-owner, non-active) ── */}
        {!isOwner && !journeyIsActive && (
          <Button
            title={requestSent ? '✓ Request Pending' : getActionLabel()}
            onPress={handleSendRequest}
            disabled={requestSent}
            variant="primary"
            size="large"
            style={styles.requestBtn}
          />
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  chatHeaderBtn: { padding: 6 },
  chatHeaderIcon: { fontSize: 20 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32 },
  emptyCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  lockIcon: { fontSize: 56, marginBottom: 12 },
  emptyTitle: { fontSize: Typography.fontSizes.lg, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  emptySub: { fontSize: Typography.fontSizes.sm, textAlign: 'center', marginBottom: 20, lineHeight: 20 },

  mainInfoCard: {
    borderRadius: Radius.xl, padding: 18, borderWidth: 1, marginBottom: 14,
    elevation: 2, shadowColor: '#0F172A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6,
  },
  badgeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  typeBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: Radius.full },
  typeText: { fontSize: Typography.fontSizes.xs + 1, fontWeight: Typography.fontWeights.bold },
  timeBadgeText: { fontSize: Typography.fontSizes.sm, fontWeight: Typography.fontWeights.medium },
  routeBigText: { fontSize: Typography.fontSizes.xl, fontWeight: Typography.fontWeights.extrabold, marginBottom: 8, letterSpacing: -0.3 },
  meetingPointRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  meetingIcon: { fontSize: 14, marginRight: 6 },
  meetingText: { fontSize: Typography.fontSizes.sm },
  boldText: { fontWeight: Typography.fontWeights.bold },
  activePill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full, alignSelf: 'flex-start', marginTop: 10 },
  pulseDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  activePillText: { fontSize: Typography.fontSizes.xs + 1, fontWeight: Typography.fontWeights.bold },

  viewersCard: {
    borderRadius: Radius.xl, borderWidth: 1, marginBottom: 14,
    overflow: 'hidden',
  },
  viewersHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14 },
  viewersLeft: { flexDirection: 'row', alignItems: 'center' },
  viewersEye: { fontSize: 16, marginRight: 8 },
  viewersCount: { fontSize: Typography.fontSizes.sm, fontWeight: Typography.fontWeights.semibold },
  viewersChevron: { fontSize: 14 },
  viewersList: { borderTopWidth: 1, paddingHorizontal: 14, paddingBottom: 10 },
  viewerItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  viewerAvatar: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  viewerAvatarText: { fontSize: 14, fontWeight: '700' },
  viewerInfo: { flex: 1 },
  viewerName: { fontSize: Typography.fontSizes.sm, fontWeight: Typography.fontWeights.semibold },
  viewerTime: { fontSize: 11, marginTop: 1 },
  viewerVerified: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: Radius.full },
  viewerVerifiedText: { fontSize: 10, fontWeight: '700' },
  noViewersText: { textAlign: 'center', fontSize: Typography.fontSizes.sm, paddingVertical: 8 },

  travelerCard: {
    flexDirection: 'row', alignItems: 'center', borderRadius: Radius.xl, padding: 14, borderWidth: 1, marginBottom: 14,
  },
  avatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText: { fontSize: Typography.fontSizes.lg, fontWeight: Typography.fontWeights.bold },
  travelerInfo: { flex: 1 },
  travelerRole: { fontSize: Typography.fontSizes.xs, fontWeight: Typography.fontWeights.medium, textTransform: 'uppercase', letterSpacing: 0.5 },
  travelerName: { fontSize: Typography.fontSizes.md + 1, fontWeight: Typography.fontWeights.bold, marginTop: 2 },
  trustBadgeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 3, gap: 6 },
  trustScoreText: { fontSize: Typography.fontSizes.xs, fontWeight: Typography.fontWeights.semibold },
  verifiedBadge: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: Radius.full },
  verifiedCheck: { fontSize: 9, fontWeight: 'bold' },
  chatPartnerBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full, borderWidth: 1 },
  chatPartnerText: { fontSize: Typography.fontSizes.xs + 1, fontWeight: Typography.fontWeights.bold },

  detailsCard: { borderRadius: Radius.xl, padding: 14, borderWidth: 1, marginBottom: 14 },
  detailItemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  detailItemIcon: { fontSize: 16, marginRight: 10 },
  detailItemText: { fontSize: Typography.fontSizes.sm + 1, fontWeight: Typography.fontWeights.medium },
  itemDescriptionText: { fontSize: Typography.fontSizes.sm, fontStyle: 'italic', marginTop: 2, marginLeft: 26 },

  matchCard: { borderRadius: Radius.xl, padding: 16, borderWidth: 1.2, marginBottom: 20 },
  matchScoreBig: { fontSize: Typography.fontSizes.base, fontWeight: Typography.fontWeights.extrabold, marginBottom: 8 },
  matchReasons: {},
  reasonRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  reasonCheck: { fontSize: 12, fontWeight: 'bold', marginRight: 6 },
  reasonText: { fontSize: Typography.fontSizes.sm },

  startBtn: { marginBottom: 12 },
  requestBtn: { marginBottom: 10 },
});
