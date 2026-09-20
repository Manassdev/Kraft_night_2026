import React, { useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button } from '../components/Button';
import { Header } from '../components/Header';
import { useJourney } from '../context/JourneyContext';
import { useTheme } from '../theme/ThemeContext';
import { Radius, Typography } from '../theme/theme';

interface ActiveJourneyScreenProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
    goBack: () => void;
  };
}

export const ActiveJourneyScreen: React.FC<ActiveJourneyScreenProps> = ({
  navigation,
}) => {
  const { activeJourney, currentUser, completeActiveJourney } = useJourney();
  const { theme, isDark } = useTheme();
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);

  if (!activeJourney) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Header title="ACTIVE JOURNEY" onBack={() => navigation.goBack()} />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 }}>
          <Text style={{ fontSize: 48, marginBottom: 14 }}>🚀</Text>
          <Text style={{ fontSize: Typography.fontSizes.lg, fontWeight: 'bold', color: theme.textPrimary, marginBottom: 8, textAlign: 'center' }}>
            No Active Journey
          </Text>
          <Text style={{ fontSize: Typography.fontSizes.sm, color: theme.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: 24 }}>
            You do not have a journey session in progress. Accept or start a journey cooperation to track live travel here.
          </Text>
          <Button
            title="Explore Journeys"
            onPress={() => navigation.navigate('Explore')}
            variant="primary"
          />
        </View>
      </View>
    );
  }

  const session = activeJourney;
  const partner =
    session.participants.find(p => p.id !== currentUser?.id) ||
    session.participants[0] || {
      id: 'partner',
      name: 'Cooperating Partner',
      trustScore: 70,
      verified: true,
      role: 'cooperator' as const,
    };

  const handleShareJourney = async () => {
    try {
      await Share.share({
        message: `I'm on a CoJourney from ${session.from} to ${session.to} with ${partner.name}. Safe travel cooperation!`,
      });
    } catch {
      // Ignored
    }
  };

  const handleComplete = () => {
    completeActiveJourney();
    navigation.navigate('JourneyCompleted', {
      journeyFrom: session.from,
      journeyTo: session.to,
      partnerName: partner.name,
      partnerId: partner.id,
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header
        title="ACTIVE JOURNEY"
        onBack={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity
            onPress={() => navigation.navigate('Chat', { recipientName: partner.name })}
            style={styles.chatActionBtn}>
            <Text style={styles.chatActionIcon}>💬</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Main Route Card matching Reference Screen 17 */}
        <View style={[styles.journeyCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <View style={styles.cardHeaderRow}>
            <View style={[styles.modeIconBox, { backgroundColor: isDark ? '#102538' : '#EBF6FC' }]}>
              <Text style={styles.modeIcon}>🚗</Text>
            </View>
            <View style={styles.routeCol}>
              <Text style={[styles.routeTitle, { color: theme.textPrimary }]}>
                {session.from} <Text style={[styles.arrow, { color: theme.textMuted }]}>→</Text> {session.to}
              </Text>
              <Text style={[styles.routeTime, { color: theme.textSecondary }]}>Today • {session.time}</Text>
            </View>
          </View>

          {/* Journey Active Pill */}
          <View style={styles.activePillContainer}>
            <View style={[styles.activePill, { backgroundColor: isDark ? '#064E3B' : '#DCFCE7' }]}>
              <View style={[styles.pulseDot, { backgroundColor: theme.success }]} />
              <Text style={[styles.activePillText, { color: theme.successText }]}>Journey Active</Text>
            </View>
          </View>

          {/* Participants */}
          <View style={styles.participantsSection}>
            <Text style={[styles.sectionHeader, { color: theme.textPrimary }]}>Participants</Text>
            <View style={styles.participantsRow}>
              {/* Participant 1: Current User */}
              <View style={styles.participantItem}>
                <View style={[styles.avatar, { backgroundColor: isDark ? '#1C3147' : '#E6F7F4' }]}>
                  <Text style={[styles.avatarText, { color: theme.primary }]}>
                    {(currentUser?.name || 'You').charAt(0)}
                  </Text>
                </View>
                <Text style={[styles.participantName, { color: theme.textPrimary }]}>{currentUser?.name || 'You'}</Text>
                <Text style={[styles.participantRole, { color: theme.textSecondary }]}>You</Text>
              </View>

              {/* Participant 2: Partner */}
              <View style={styles.participantItem}>
                <View style={[styles.avatar, { backgroundColor: isDark ? '#2D2010' : '#FEF3C7' }]}>
                  <Text style={[styles.avatarText, { color: theme.warning }]}>{partner.name.charAt(0)}</Text>
                </View>
                <Text style={[styles.participantName, { color: theme.textPrimary }]}>{partner.name}</Text>
                <Text style={[styles.participantRole, { color: theme.textSecondary }]}>
                  {session.cooperationType === 'share_vehicle' ? 'Driver' : 'Partner'}
                </Text>
              </View>
            </View>
          </View>

          {/* Meeting Point */}
          <View style={[styles.meetingPointBox, { backgroundColor: theme.surface }]}>
            <Text style={[styles.meetingPointLabel, { color: theme.textMuted }]}>Meeting point</Text>
            <Text style={[styles.meetingPointVal, { color: theme.textPrimary }]}>{session.meetingPoint}</Text>
          </View>
        </View>

        {/* 3 Action Buttons matching Reference Screen 17 */}
        <View style={styles.actionsContainer}>
          <Button
            title="Share Journey"
            onPress={handleShareJourney}
            variant="outline"
            size="large"
            style={styles.actionBtn}
          />

          <Button
            title="🚨 Emergency"
            onPress={() => setShowEmergencyModal(true)}
            variant="danger"
            size="large"
            style={styles.emergencyBtn}
          />

          <Button
            title="Complete Journey"
            onPress={handleComplete}
            variant="outline"
            size="large"
            style={styles.actionBtn}
          />
        </View>
      </ScrollView>

      {/* Simulated Emergency Modal */}
      <Modal
        visible={showEmergencyModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEmergencyModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Text style={styles.modalEmergencyIcon}>🚨</Text>
            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Safety Alert SOS</Text>
            <Text style={[styles.modalDesc, { color: theme.textSecondary }]}>
              In live emergency, this triggers instant safety alerts to your trusted circle and shares your real-time GPS coordinates.
            </Text>

            <TouchableOpacity
              onPress={() => {
                Alert.alert('Emergency SOS', 'Your safety contacts have been notified with your current coordinates.');
                setShowEmergencyModal(false);
              }}
              style={[styles.sosConfirmBtn, { backgroundColor: theme.danger }]}>
              <Text style={styles.sosConfirmText}>Send SOS to Trusted People</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowEmergencyModal(false)}
              style={[styles.sosCancelBtn, { backgroundColor: theme.surface }]}>
              <Text style={[styles.sosCancelText, { color: theme.textPrimary }]}>Cancel / Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  chatActionBtn: {
    padding: 6,
  },
  chatActionIcon: {
    fontSize: 20,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  journeyCard: {
    borderRadius: Radius.lg,
    padding: 18,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    marginBottom: 24,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  modeIconBox: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  modeIcon: {
    fontSize: 22,
  },
  routeCol: {
    flex: 1,
  },
  routeTitle: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
  },
  arrow: {
    fontWeight: '400',
  },
  routeTime: {
    fontSize: Typography.fontSizes.xs + 1,
    marginTop: 2,
  },
  activePillContainer: {
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  activePillText: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.bold,
  },
  participantsSection: {
    marginBottom: 18,
  },
  sectionHeader: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.bold,
    marginBottom: 10,
  },
  participantsRow: {
    flexDirection: 'row',
    gap: 20,
  },
  participantItem: {
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  avatarText: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
  },
  participantName: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.bold,
  },
  participantRole: {
    fontSize: Typography.fontSizes.xs,
    marginTop: 1,
  },
  meetingPointBox: {
    borderRadius: Radius.md,
    padding: 12,
  },
  meetingPointLabel: {
    fontSize: Typography.fontSizes.xs,
    marginBottom: 2,
  },
  meetingPointVal: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.bold,
  },
  actionsContainer: {
    gap: 12,
  },
  actionBtn: {},
  emergencyBtn: {},
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    borderRadius: Radius.xl,
    padding: 24,
    alignItems: 'center',
  },
  modalEmergencyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalDesc: {
    fontSize: Typography.fontSizes.sm,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  sosConfirmBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: Radius.md,
    alignItems: 'center',
    marginBottom: 10,
  },
  sosConfirmText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: Typography.fontSizes.base,
  },
  sosCancelBtn: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  sosCancelText: {
    fontWeight: '600',
    fontSize: Typography.fontSizes.sm,
  },
});
