import React, { useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button } from '../components/Button';
import { Header } from '../components/Header';
import { useJourney } from '../context/JourneyContext';

interface ActiveJourneyScreenProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
    goBack: () => void;
  };
}

export const ActiveJourneyScreen: React.FC<ActiveJourneyScreenProps> = ({
  navigation,
}) => {
  const {
    activeJourney,
    currentUser,
    completeActiveJourney,
    submitRating,
  } = useJourney();

  // Active Journey session fallback if opened directly
  const session = activeJourney || {
    id: 'active_demo',
    journeyId: 'journey_1',
    from: 'College',
    to: 'Kollam',
    time: '5:00 PM',
    cooperationType: 'share_vehicle' as const,
    meetingPoint: 'College Gate 1',
    status: 'in_progress' as const,
    startedAt: '10 mins ago',
    participants: [
      {
        id: currentUser?.id || 'user_rahul',
        name: currentUser?.name || 'Rahul',
        trustScore: currentUser?.trustScore || 92,
        verified: true,
        role: 'creator' as const,
      },
      {
        id: 'user_anjali',
        name: 'Anjali',
        trustScore: 94,
        verified: true,
        role: 'cooperator' as const,
      },
    ],
  };

  const partner =
    session.participants.find(p => p.id !== currentUser?.id) ||
    session.participants[1] || {
      id: 'user_anjali',
      name: 'Anjali',
      trustScore: 94,
      verified: true,
    };

  // State for Rating Modal
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState('Great cooperation! Very punctual, friendly, and reliable.');

  // State for Simulated Emergency Modal
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);

  const handleShareJourney = async () => {
    try {
      await Share.share({
        message: `I'm currently cooperating on a CoJourney with ${partner.name}: ${session.from} → ${session.to}. Meeting point: ${session.meetingPoint}. Live cooperation tracking link: https://cojourney.app/live/${session.id}`,
      });
    } catch {
      Alert.alert('Journey Link Copied', 'Cooperation status copied to clipboard.');
    }
  };

  const handleCompleteJourney = () => {
    completeActiveJourney();
    setShowRatingModal(true);
  };

  const handleSubmitRating = () => {
    submitRating(partner.id, stars, comment);
    setShowRatingModal(false);
    Alert.alert(
      'Cooperation Rating Saved! ⭐',
      `Thank you for rating ${partner.name}. Your feedback helps update community trust scores!`,
      [
        {
          text: 'View Updated Profile',
          onPress: () => navigation.navigate('Profile'),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title="Active Cooperation"
        subtitle="CoJourney in progress"
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Active Banner */}
        <View style={styles.activeBanner}>
          <View style={styles.statusRow}>
            <View style={styles.liveIndicator}>
              <View style={styles.pulseDot} />
              <Text style={styles.liveText}>🟢 ACTIVE JOURNEY</Text>
            </View>
            <Text style={styles.startedText}>Started {session.startedAt}</Text>
          </View>

          <Text style={styles.routeHeading}>
            {session.from} <Text style={styles.arrow}>→</Text> {session.to}
          </Text>

          {/* Participants */}
          <View style={styles.participantsBox}>
            <Text style={styles.participantsLabel}>COOPERATING TOGETHER:</Text>
            <View style={styles.participantsRow}>
              <Text style={styles.participantName}>
                👤 {session.participants.map(p => p.name).join(' + ')}
              </Text>
            </View>
          </View>

          <View style={styles.meetingBox}>
            <Text style={styles.meetingLabel}>📍 Meeting Point:</Text>
            <Text style={styles.meetingValue}>{session.meetingPoint}</Text>
          </View>
        </View>

        {/* Map Placeholder Graphic */}
        <View style={styles.mapCard}>
          <View style={styles.mapGraphic}>
            <Text style={styles.mapPinA}>📍</Text>
            <View style={styles.mapRouteLine} />
            <Text style={styles.mapVehicleIcon}>🚗</Text>
            <View style={styles.mapRouteLine} />
            <Text style={styles.mapPinB}>🏁</Text>
          </View>
          <Text style={styles.mapRouteLabels}>
            {session.from} •••••••••• {session.to}
          </Text>
          <Text style={styles.mapPlaceholderNote}>
            🗺️ Stylized route overview (Real-time GPS disabled for hackathon privacy)
          </Text>
        </View>

        {/* Cooperator Info Card */}
        <View style={styles.cooperatorCard}>
          <Text style={styles.cooperatorTitle}>Your Journey Partner</Text>
          <View style={styles.cooperatorRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{partner.name.charAt(0)}</Text>
            </View>
            <View style={styles.cooperatorMeta}>
              <View style={styles.cooperatorNameRow}>
                <Text style={styles.cooperatorName}>{partner.name}</Text>
                {partner.verified && (
                  <View style={styles.verifiedBadge}>
                    <Text style={styles.verifiedText}>✓</Text>
                  </View>
                )}
              </View>
              <Text style={styles.trustScoreText}>
                Community Trust Score: <Text style={styles.boldScore}>{partner.trustScore}/100</Text>
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <Button
            title="Complete Journey"
            onPress={handleCompleteJourney}
            variant="success"
            size="large"
            icon="🏁"
            style={styles.actionBtn}
          />

          <View style={styles.secondaryActionsRow}>
            <Button
              title="Share Journey"
              onPress={handleShareJourney}
              variant="outline"
              size="medium"
              icon="🔗"
              style={styles.secondaryBtn}
            />
            <Button
              title="🚨 Emergency"
              onPress={() => setShowEmergencyModal(true)}
              variant="danger"
              size="medium"
              style={styles.secondaryBtn}
            />
          </View>
        </View>
      </ScrollView>

      {/* Simulated Emergency Modal */}
      <Modal
        visible={showEmergencyModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEmergencyModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.emergencyIcon}>🚨</Text>
            <Text style={styles.emergencyTitle}>Simulated Emergency Assist</Text>
            <Text style={styles.emergencyDesc}>
              This is a demonstration UI for the hackathon. In a live deployment, this notifies emergency contacts with your live journey route.
            </Text>

            <View style={styles.emergencyActionList}>
              <TouchableOpacity
                onPress={() => {
                  Alert.alert('Emergency Simulation', 'Simulated quick call to campus security & family contacts dispatched.');
                  setShowEmergencyModal(false);
                }}
                style={styles.emergencyCallBtn}>
                <Text style={styles.emergencyCallBtnText}>📞 Call Campus Security (Demo)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  Alert.alert('Safety Alert Sent', 'Simulated safety SMS sent to trusted circle.');
                  setShowEmergencyModal(false);
                }}
                style={styles.emergencySmsBtn}>
                <Text style={styles.emergencySmsBtnText}>📲 Send SOS to Trusted People</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => setShowEmergencyModal(false)}
              style={styles.closeModalBtn}>
              <Text style={styles.closeModalText}>Cancel / Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Rating Modal after Journey Completion */}
      <Modal
        visible={showRatingModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowRatingModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.ratingModalEmoji}>🌟</Text>
            <Text style={styles.ratingModalTitle}>How was your cooperation?</Text>
            <Text style={styles.ratingModalSubtitle}>
              Rate your journey experience with {partner.name}. Ratings contribute to their Community Trust Score.
            </Text>

            {/* 1-5 Star Selector */}
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map(star => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setStars(star)}
                  style={styles.starBtn}>
                  <Text style={[styles.starIcon, stars >= star && styles.starIconActive]}>
                    ★
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.starLabel}>
              {stars === 5
                ? 'Outstanding Cooperation!'
                : stars === 4
                ? 'Great Journey'
                : stars === 3
                ? 'Good Experience'
                : 'Needs Improvement'}
            </Text>

            <Text style={styles.commentLabel}>Feedback / Cooperation Note:</Text>
            <TextInput
              placeholder="e.g. Reliable, punctual, helpful, safe driving..."
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={3}
              value={comment}
              onChangeText={setComment}
              style={styles.commentInput}
            />

            <Button
              title="Submit Rating & Update Trust"
              onPress={handleSubmitRating}
              variant="primary"
              size="large"
              style={styles.submitRatingBtn}
            />
          </View>
        </View>
      </Modal>
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
    paddingBottom: 30,
  },
  activeBanner: {
    backgroundColor: '#064E3B',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    elevation: 3,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34D399',
    marginRight: 6,
  },
  liveText: {
    color: '#A7F3D0',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  startedText: {
    color: '#6EE7B7',
    fontSize: 11,
  },
  routeHeading: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  arrow: {
    color: '#34D399',
  },
  participantsBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
  },
  participantsLabel: {
    color: '#A7F3D0',
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 2,
  },
  participantsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  meetingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  meetingLabel: {
    color: '#A7F3D0',
    fontSize: 12,
    fontWeight: '600',
    marginRight: 6,
  },
  meetingValue: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  mapCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    alignItems: 'center',
  },
  mapGraphic: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 16,
  },
  mapPinA: {
    fontSize: 24,
  },
  mapRouteLine: {
    flex: 1,
    height: 3,
    backgroundColor: '#3B82F6',
    marginHorizontal: 8,
  },
  mapVehicleIcon: {
    fontSize: 20,
  },
  mapPinB: {
    fontSize: 24,
  },
  mapRouteLabels: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 6,
  },
  mapPlaceholderNote: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
  },
  cooperatorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  cooperatorTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 10,
  },
  cooperatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  cooperatorMeta: {
    flex: 1,
  },
  cooperatorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cooperatorName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  verifiedBadge: {
    backgroundColor: '#22C55E',
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  verifiedText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  trustScoreText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  boldScore: {
    color: '#0F172A',
    fontWeight: '700',
  },
  actionsContainer: {
    gap: 12,
  },
  actionBtn: {
    width: '100%',
  },
  secondaryActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  secondaryBtn: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  emergencyIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  emergencyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#DC2626',
    textAlign: 'center',
  },
  emergencyDesc: {
    fontSize: 13,
    color: '#475569',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
    lineHeight: 18,
  },
  emergencyActionList: {
    width: '100%',
    gap: 10,
  },
  emergencyCallBtn: {
    backgroundColor: '#DC2626',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  emergencyCallBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  emergencySmsBtn: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
    borderColor: '#FCA5A5',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  emergencySmsBtnText: {
    color: '#DC2626',
    fontWeight: '700',
    fontSize: 14,
  },
  closeModalBtn: {
    marginTop: 16,
    padding: 8,
  },
  closeModalText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
  },
  ratingModalEmoji: {
    fontSize: 44,
    marginBottom: 8,
  },
  ratingModalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
  ratingModalSubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
    lineHeight: 18,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  starBtn: {
    padding: 4,
  },
  starIcon: {
    fontSize: 36,
    color: '#CBD5E1',
  },
  starIconActive: {
    color: '#F59E0B',
  },
  starLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#D97706',
    marginBottom: 16,
  },
  commentLabel: {
    alignSelf: 'flex-start',
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  commentInput: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    padding: 12,
    fontSize: 13,
    color: '#0F172A',
    textAlignVertical: 'top',
    marginBottom: 18,
  },
  submitRatingBtn: {
    width: '100%',
  },
});
