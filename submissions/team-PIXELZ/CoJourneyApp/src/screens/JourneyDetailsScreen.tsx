import React, { useState } from 'react';
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
import { TrustCard } from '../components/TrustCard';
import { useJourney } from '../context/JourneyContext';
import { Journey } from '../types';

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
  const { journeys, sendRequest, toggleTrustedPerson, isTrusted, users } = useJourney();
  const journey: Journey = route?.params?.journey || journeys[0];
  const matchPercentage = route?.params?.matchPercentage ?? 92;
  const reasons = route?.params?.reasons || [
    'Same destination corridor',
    '80% route overlap',
    '15 min time window',
    'Verified user',
  ];

  const targetUser = users[journey.userId] || {
    id: journey.userId,
    name: journey.userName,
    trustScore: journey.userTrustScore,
    verified: journey.userVerified,
    completedJourneys: 8,
    cooperationHistoryCount: 6,
    ratingsAverage: 4.9,
    ratingsCount: 8,
    safetyScore: 10,
    email: 'user@cojourney.app',
    gender: 'Female' as const,
  };

  const userIsTrusted = isTrusted(journey.userId);
  const [requestSent, setRequestSent] = useState(false);
  const meta = getCooperationMeta(journey.cooperationType);

  const getActionLabel = () => {
    switch (journey.cooperationType) {
      case 'carry_along':
        return 'Request Carry';
      case 'share_vehicle':
        return 'Request Seat';
      case 'daily_walk':
        return 'Request Walk Companion';
      case 'join_journey':
      default:
        return 'Request to Join';
    }
  };

  const handleSendRequest = () => {
    sendRequest(journey);
    setRequestSent(true);
    Alert.alert(
      'Request Sent Successfully',
      `Your cooperation request has been dispatched to ${journey.userName}. You can manage all incoming and outgoing requests in the Requests tab.`,
      [
        { text: 'View Requests', onPress: () => navigation.navigate('Requests') },
        { text: 'OK' },
      ]
    );
  };

  const handleSafetyAction = (action: 'report' | 'block') => {
    Alert.alert(
      action === 'report' ? 'Report Submitted' : 'User Blocked',
      action === 'report'
        ? 'Thank you for keeping our community safe. Our moderation team has logged this report for review.'
        : `${journey.userName} has been removed from your discovery feed.`
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title="Journey Details"
        subtitle={`${meta.icon} ${meta.label}`}
        onBack={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity
            onPress={() => toggleTrustedPerson(targetUser)}
            style={[styles.trustChip, userIsTrusted && styles.trustChipActive]}>
            <Text style={[styles.trustChipText, userIsTrusted && styles.trustChipTextActive]}>
              {userIsTrusted ? '★ Trusted' : '☆ Mark Trusted'}
            </Text>
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Route Card Header */}
        <View style={styles.routeCard}>
          <View style={styles.routeHeaderRow}>
            <View style={[styles.modeBadge, { backgroundColor: meta.bg }]}>
              <Text style={[styles.modeBadgeText, { color: meta.color }]}>
                {meta.icon} {meta.label}
              </Text>
            </View>
            <View style={styles.timeBadge}>
              <Text style={styles.timeText}>🕒 {journey.time}</Text>
            </View>
          </View>

          <View style={styles.routePoints}>
            <View style={styles.pointRow}>
              <Text style={styles.dotGreen}>🟢</Text>
              <View style={styles.pointInfo}>
                <Text style={styles.pointLabel}>DEPARTURE</Text>
                <Text style={styles.pointValue}>{journey.from}</Text>
              </View>
            </View>

            <View style={styles.routeLine} />

            <View style={styles.pointRow}>
              <Text style={styles.dotRed}>🏁</Text>
              <View style={styles.pointInfo}>
                <Text style={styles.pointLabel}>DESTINATION</Text>
                <Text style={styles.pointValue}>{journey.to}</Text>
              </View>
            </View>
          </View>

          {journey.meetingPoint && (
            <View style={styles.meetingPointBox}>
              <Text style={styles.meetingPointLabel}>Meeting Point:</Text>
              <Text style={styles.meetingPointVal}>{journey.meetingPoint}</Text>
            </View>
          )}

          {journey.notes && (
            <Text style={styles.notesText}>"{journey.notes}"</Text>
          )}
        </View>

        {/* Mode Specific Feature Box */}
        {journey.vehicleDetails && (
          <View style={styles.featureBox}>
            <Text style={styles.featureTitle}>🚗 Vehicle Details</Text>
            <View style={styles.featureGrid}>
              <View style={styles.featureCol}>
                <Text style={styles.featureLabel}>Vehicle</Text>
                <Text style={styles.featureVal}>{journey.vehicleDetails.vehicleType}</Text>
              </View>
              <View style={styles.featureCol}>
                <Text style={styles.featureLabel}>Available Seats</Text>
                <Text style={styles.featureVal}>{journey.vehicleDetails.availableSeats} seats</Text>
              </View>
              <View style={styles.featureCol}>
                <Text style={styles.featureLabel}>Contribution</Text>
                <Text style={styles.featureValHighlight}>
                  ₹{journey.vehicleDetails.travelContribution}/person
                </Text>
              </View>
            </View>
            <Text style={styles.noPaymentDisclaimer}>
              * Fair fuel sharing contribution. Direct cooperation between travelers.
            </Text>
          </View>
        )}

        {journey.itemDetails && (
          <View style={styles.featureBox}>
            <Text style={styles.featureTitle}>📦 Permitted Item to Carry</Text>
            <View style={styles.featureGrid}>
              <View style={styles.featureCol}>
                <Text style={styles.featureLabel}>Item</Text>
                <Text style={styles.featureVal}>{journey.itemDetails.item}</Text>
              </View>
              <View style={styles.featureCol}>
                <Text style={styles.featureLabel}>Package Size</Text>
                <Text style={styles.featureVal}>{journey.itemDetails.size}</Text>
              </View>
              <View style={styles.featureCol}>
                <Text style={styles.featureLabel}>Suggested Tip</Text>
                <Text style={styles.featureValHighlight}>
                  ₹{journey.itemDetails.suggestedTip}
                </Text>
              </View>
            </View>
            <Text style={styles.itemDescText}>{journey.itemDetails.description}</Text>
            <View style={styles.permittedNotice}>
              <Text style={styles.permittedCheck}>✓</Text>
              <Text style={styles.permittedNoticeText}>
                Verified small legal document/parcel. No prohibited items.
              </Text>
            </View>
          </View>
        )}

        {/* Algorithmic Cooperation Match Section */}
        <View style={styles.matchContainer}>
          <View style={styles.matchScoreRow}>
            <Text style={styles.matchScoreIcon}>🎯</Text>
            <Text style={styles.matchScoreText}>
              {matchPercentage}% Cooperation Match
            </Text>
          </View>
          <View style={styles.reasonsList}>
            {reasons.map((r, i) => (
              <View key={i} style={styles.reasonRow}>
                <Text style={styles.greenCheck}>✓</Text>
                <Text style={styles.reasonText}>{r}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* User Profile & Trust Score Card */}
        <Text style={styles.sectionHeader}>Traveler Reputation</Text>
        <TrustCard user={targetUser} showBreakdown={true} />

        {/* Primary Action Button */}
        <Button
          title={requestSent ? 'Request Pending...' : getActionLabel()}
          onPress={handleSendRequest}
          disabled={requestSent}
          variant="primary"
          size="large"
          icon="🤝"
          style={styles.requestBtn}
        />

        {/* Safety Tools: Report / Block */}
        <View style={styles.safetyRow}>
          <TouchableOpacity
            onPress={() => handleSafetyAction('report')}
            style={styles.safetyAction}>
            <Text style={styles.safetyActionText}>🚩 Report Journey</Text>
          </TouchableOpacity>
          <Text style={styles.safetyDot}>•</Text>
          <TouchableOpacity
            onPress={() => handleSafetyAction('block')}
            style={styles.safetyAction}>
            <Text style={styles.safetyActionText}>🚫 Block User</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 16,
    paddingBottom: 34,
  },
  trustChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
  },
  trustChipActive: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
  },
  trustChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  trustChipTextActive: {
    color: '#B45309',
    fontWeight: '700',
  },
  routeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
    elevation: 2,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  routeHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  modeBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  timeBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  timeText: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '600',
  },
  routePoints: {
    marginBottom: 10,
  },
  pointRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dotGreen: {
    fontSize: 14,
    marginRight: 10,
  },
  dotRed: {
    fontSize: 14,
    marginRight: 10,
  },
  pointInfo: {
    flex: 1,
  },
  pointLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  pointValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  routeLine: {
    width: 2,
    height: 18,
    backgroundColor: '#CBD5E1',
    marginLeft: 7,
    marginVertical: 2,
  },
  meetingPointBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 8,
    marginTop: 6,
  },
  meetingPointLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  meetingPointVal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 2,
  },
  notesText: {
    marginTop: 10,
    fontSize: 13,
    fontStyle: 'italic',
    color: '#475569',
  },
  featureBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 10,
  },
  featureGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  featureCol: {
    flex: 1,
  },
  featureLabel: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 2,
  },
  featureVal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  featureValHighlight: {
    fontSize: 14,
    fontWeight: '800',
    color: '#16A34A',
  },
  noPaymentDisclaimer: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 10,
    fontStyle: 'italic',
  },
  itemDescText: {
    fontSize: 12,
    color: '#475569',
    marginTop: 8,
  },
  permittedNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  permittedCheck: {
    color: '#16A34A',
    fontWeight: '900',
    marginRight: 6,
    fontSize: 14,
  },
  permittedNoticeText: {
    fontSize: 11,
    color: '#166534',
    flex: 1,
  },
  matchContainer: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1.5,
    borderColor: '#86EFAC',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  matchScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  matchScoreIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  matchScoreText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#15803D',
  },
  reasonsList: {
    gap: 4,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  sectionHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  requestBtn: {
    marginTop: 4,
    marginBottom: 16,
  },
  safetyRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 10,
  },
  safetyAction: {
    padding: 6,
  },
  safetyActionText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  safetyDot: {
    color: '#CBD5E1',
  },
});
