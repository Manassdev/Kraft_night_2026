import React, { useState } from 'react';
import {
  Modal,
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
import { TrustedConnection } from '../types';

interface TrustedPeopleScreenProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
    goBack: () => void;
  };
}

export const TrustedPeopleScreen: React.FC<TrustedPeopleScreenProps> = ({
  navigation,
}) => {
  const { trustedList } = useJourney();
  const { theme, isDark } = useTheme();
  const [selectedPerson, setSelectedPerson] = useState<TrustedConnection | null>(null);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header
        title="Trusted Connections"
        subtitle="People you've cooperated with"
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {trustedList.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🛡️</Text>
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
              No trusted connections yet
            </Text>
            <Text style={[styles.emptySub, { color: theme.textSecondary }]}>
              When you complete journeys and cooperate with fellow travelers, they will appear in your trusted connections.
            </Text>
          </View>
        ) : (
          trustedList.map(person => (
            <View
              key={person.id}
              style={[
                styles.personCard,
                { backgroundColor: theme.card, borderColor: theme.cardBorder },
              ]}>
              <View
                style={[
                  styles.avatar,
                  { backgroundColor: isDark ? '#1C3147' : '#E6F7F4' },
                ]}>
                <Text style={[styles.avatarText, { color: theme.primary }]}>
                  {person.trustedUserName.charAt(0)}
                </Text>
              </View>

              <View style={styles.personInfo}>
                <Text style={[styles.personName, { color: theme.textPrimary }]}>
                  {person.trustedUserName}
                </Text>
                <View style={styles.statsRow}>
                  <Text style={[styles.trustScoreText, { color: theme.warning }]}>
                    ★ {person.trustedUserScore} Trust Score
                  </Text>
                  {person.verified && (
                    <Text style={[styles.verifiedText, { color: theme.success }]}>
                      • Verified
                    </Text>
                  )}
                </View>
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setSelectedPerson(person)}
                style={[styles.viewProfileBtn, { borderColor: theme.primary }]}>
                <Text style={[styles.viewProfileText, { color: theme.primary }]}>
                  View
                </Text>
              </TouchableOpacity>
            </View>
          ))
        )}

        {/* Safety Note */}
        <View
          style={[
            styles.noteBox,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}>
          <Text style={[styles.noteText, { color: theme.textSecondary }]}>
            🛡️ Trusted Connections are travelers you have completed journeys with and rated positively. You receive priority matching for shared routes.
          </Text>
        </View>
      </ScrollView>

      {/* View Profile Modal */}
      <Modal
        visible={!!selectedPerson}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedPerson(null)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.card }]}>
            {selectedPerson && (
              <>
                <View
                  style={[
                    styles.modalAvatar,
                    { backgroundColor: isDark ? '#1C3147' : '#E6F7F4' },
                  ]}>
                  <Text style={[styles.modalAvatarText, { color: theme.primary }]}>
                    {selectedPerson.trustedUserName.charAt(0)}
                  </Text>
                </View>
                <Text style={[styles.modalName, { color: theme.textPrimary }]}>
                  {selectedPerson.trustedUserName}
                </Text>
                {selectedPerson.verified && (
                  <View
                    style={[
                      styles.modalBadge,
                      { backgroundColor: isDark ? '#064E3B' : '#DCFCE7' },
                    ]}>
                    <Text style={[styles.modalBadgeText, { color: theme.success }]}>
                      ✓ Community Verified
                    </Text>
                  </View>
                )}

                <View
                  style={[
                    styles.modalScoreCard,
                    { backgroundColor: isDark ? '#0A2B23' : '#E6F7F4' },
                  ]}>
                  <Text style={[styles.modalScoreBig, { color: theme.primary }]}>
                    {selectedPerson.trustedUserScore}
                  </Text>
                  <Text style={[styles.modalScoreLabel, { color: theme.primary }]}>
                    Cooperation Score
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => {
                    const person = selectedPerson;
                    setSelectedPerson(null);
                    navigation.navigate('Chat', { recipientName: person.trustedUserName });
                  }}
                  style={[styles.modalChatBtn, { backgroundColor: theme.primary }]}>
                  <Text style={styles.modalChatBtnText}>Chat with {selectedPerson.trustedUserName}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setSelectedPerson(null)}
                  style={styles.modalCloseBtn}>
                  <Text style={[styles.modalCloseText, { color: theme.textSecondary }]}>Close</Text>
                </TouchableOpacity>
              </>
            )}
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: Typography.fontSizes.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
  personCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginBottom: 12,
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
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
  },
  personInfo: {
    flex: 1,
  },
  personName: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.bold,
    marginBottom: 2,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trustScoreText: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.semibold,
  },
  verifiedText: {
    fontSize: Typography.fontSizes.xs,
    marginLeft: 6,
    fontWeight: Typography.fontWeights.semibold,
  },
  viewProfileBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  viewProfileText: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.bold,
  },
  noteBox: {
    padding: 14,
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginTop: 16,
  },
  noteText: {
    fontSize: Typography.fontSizes.xs,
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    padding: 24,
    alignItems: 'center',
  },
  modalAvatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  modalAvatarText: {
    fontSize: Typography.fontSizes.xxl,
    fontWeight: Typography.fontWeights.bold,
  },
  modalName: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.bold,
    marginBottom: 6,
  },
  modalBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
    marginBottom: 16,
  },
  modalBadgeText: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.bold,
  },
  modalScoreCard: {
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: Radius.lg,
    alignItems: 'center',
    marginBottom: 20,
  },
  modalScoreBig: {
    fontSize: 32,
    fontWeight: '900',
  },
  modalScoreLabel: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.bold,
    textTransform: 'uppercase',
  },
  modalChatBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: Radius.full,
    alignItems: 'center',
    marginBottom: 12,
  },
  modalChatBtnText: {
    color: '#FFFFFF',
    fontWeight: Typography.fontWeights.bold,
    fontSize: Typography.fontSizes.base,
  },
  modalCloseBtn: {
    paddingVertical: 8,
  },
  modalCloseText: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.semibold,
  },
});
