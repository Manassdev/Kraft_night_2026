import React from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Header } from '../components/Header';
import { useJourney } from '../context/JourneyContext';
import { useTheme } from '../theme/ThemeContext';
import { Radius, Typography } from '../theme/theme';
import { TRUST_SCORE_DISCLAIMER, calculateTrustBreakdown } from '../utils/trustScore';

interface ProfileScreenProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
  };
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { currentUser, logout } = useJourney();
  const { theme, isDark, toggleTheme } = useTheme();

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out of CoJourney?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: () => {
          logout();
          navigation.navigate('Login');
        },
      },
    ]);
  };

  if (!currentUser) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Header title="Profile" />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 }}>
          <Text style={{ fontSize: 50, marginBottom: 16 }}>👤</Text>
          <Text
            style={{
              fontSize: Typography.fontSizes.xl,
              fontWeight: 'bold',
              color: theme.textPrimary,
              marginBottom: 8,
              textAlign: 'center',
            }}>
            Sign In to CoJourney
          </Text>
          <Text
            style={{
              fontSize: Typography.fontSizes.sm,
              color: theme.textSecondary,
              textAlign: 'center',
              lineHeight: 22,
              marginBottom: 24,
            }}>
            Connect with your email or magic link to view your Cooperation Score, journey history, and trusted network.
          </Text>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.navigate('Login')}
            style={{
              backgroundColor: theme.primary,
              paddingVertical: 14,
              paddingHorizontal: 32,
              borderRadius: Radius.full,
              width: '100%',
              alignItems: 'center',
            }}>
            <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: Typography.fontSizes.base }}>
              Sign In / Register
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const user = currentUser;
  const breakdown = calculateTrustBreakdown(user);
  const verificationWidth = `${(breakdown.verification / 30) * 100}%`;
  const journeysWidth = `${(breakdown.completedJourneys / 25) * 100}%`;
  const cooperationWidth = `${(breakdown.cooperationHistory / 20) * 100}%`;
  const ratingsWidth = `${(breakdown.ratings / 15) * 100}%`;
  const safetyWidth = `${(breakdown.safetyRecord / 10) * 100}%`;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header
        title="Profile"
        rightAction={
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Text style={[styles.logoutText, { color: theme.danger }]}>Log Out</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* User Card matching Reference Screen 19 */}
        <View style={styles.userSection}>
          <View style={[styles.avatarLarge, { backgroundColor: isDark ? '#1C3147' : '#E6F7F4', borderColor: theme.primary }]}>
            <Text style={[styles.avatarLargeText, { color: theme.primary }]}>{(user.name || '?').charAt(0)}</Text>
          </View>
          <Text style={[styles.userName, { color: theme.textPrimary }]}>{user.name || 'Traveler'}</Text>
          {user.verified && (
            <View style={[styles.verifiedPill, { backgroundColor: isDark ? '#064E3B' : '#DCFCE7' }]}>
              <Text style={[styles.verifiedText, { color: theme.success }]}>✓ Verified</Text>
            </View>
          )}
        </View>

        {/* Big Cooperation Score Card matching Reference Screen 19 */}
        <View style={[styles.coopScoreCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <View style={[styles.scoreCircle, { backgroundColor: isDark ? '#0A2B23' : '#E6F7F4', borderColor: theme.primary }]}>
            <Text style={[styles.scoreNumber, { color: theme.primary }]}>{user.trustScore}</Text>
            <Text style={[styles.scoreDenom, { color: theme.primary }]}>/100</Text>
          </View>
          <Text style={[styles.scoreLabel, { color: theme.primary }]}>Cooperation Score</Text>
          <Text style={[styles.scoreDesc, { color: theme.textSecondary }]}>
            {user.trustScore >= 90 ? '🌟 Excellent cooperator' : user.trustScore >= 70 ? '👍 Good cooperator' : '📈 Building trust'}
          </Text>
        </View>

        {/* 3 Stats Row matching Reference Screen 19 */}
        <View style={[styles.statsRow, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <View style={styles.statBox}>
            <Text style={[styles.statVal, { color: theme.textPrimary }]}>{user.completedJourneys || 0}</Text>
            <Text style={[styles.statTitle, { color: theme.textSecondary }]}>Completed{'\n'}Journeys</Text>
          </View>

          <View style={[styles.statBox, styles.statBoxBorder, { borderLeftColor: theme.border, borderRightColor: theme.border }]}>
            <Text style={[styles.statVal, { color: theme.textPrimary }]}>{user.cooperationHistoryCount || 0}</Text>
            <Text style={[styles.statTitle, { color: theme.textSecondary }]}>Cooperations</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={[styles.statVal, { color: theme.textPrimary }]}>{user.ratingsAverage || 0} ★</Text>
            <Text style={[styles.statTitle, { color: theme.textSecondary }]}>Rating</Text>
          </View>
        </View>

        {/* Trust Breakdown Progress Bars matching Reference Screen 19 */}
        <View style={[styles.breakdownCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <Text style={[styles.breakdownHeader, { color: theme.textPrimary }]}>Trust breakdown</Text>

          {/* 1. Verification */}
          <View style={styles.barItem}>
            <View style={styles.barLabelRow}>
              <Text style={[styles.barTitle, { color: theme.textSecondary }]}>Verification</Text>
              <Text style={[styles.barScore, { color: theme.textPrimary }]}>{breakdown.verification}/30</Text>
            </View>
            <View style={[styles.barTrack, { backgroundColor: theme.borderLight }]}>
              <View style={[styles.barProgress, { width: verificationWidth, backgroundColor: theme.primary }]} />
            </View>
          </View>

          {/* 2. Journeys */}
          <View style={styles.barItem}>
            <View style={styles.barLabelRow}>
              <Text style={[styles.barTitle, { color: theme.textSecondary }]}>Journeys</Text>
              <Text style={[styles.barScore, { color: theme.textPrimary }]}>{breakdown.completedJourneys}/25</Text>
            </View>
            <View style={[styles.barTrack, { backgroundColor: theme.borderLight }]}>
              <View style={[styles.barProgress, { width: journeysWidth, backgroundColor: theme.primary }]} />
            </View>
          </View>

          {/* 3. Cooperation */}
          <View style={styles.barItem}>
            <View style={styles.barLabelRow}>
              <Text style={[styles.barTitle, { color: theme.textSecondary }]}>Cooperation</Text>
              <Text style={[styles.barScore, { color: theme.textPrimary }]}>{breakdown.cooperationHistory}/20</Text>
            </View>
            <View style={[styles.barTrack, { backgroundColor: theme.borderLight }]}>
              <View style={[styles.barProgress, { width: cooperationWidth, backgroundColor: theme.primary }]} />
            </View>
          </View>

          {/* 4. Ratings */}
          <View style={styles.barItem}>
            <View style={styles.barLabelRow}>
              <Text style={[styles.barTitle, { color: theme.textSecondary }]}>Ratings</Text>
              <Text style={[styles.barScore, { color: theme.textPrimary }]}>{breakdown.ratings}/15</Text>
            </View>
            <View style={[styles.barTrack, { backgroundColor: theme.borderLight }]}>
              <View style={[styles.barProgress, { width: ratingsWidth, backgroundColor: theme.primary }]} />
            </View>
          </View>

          {/* 5. Safety */}
          <View style={styles.barItem}>
            <View style={styles.barLabelRow}>
              <Text style={[styles.barTitle, { color: theme.textSecondary }]}>Safety</Text>
              <Text style={[styles.barScore, { color: theme.textPrimary }]}>{breakdown.safetyRecord}/10</Text>
            </View>
            <View style={[styles.barTrack, { backgroundColor: theme.borderLight }]}>
              <View style={[styles.barProgress, { width: safetyWidth, backgroundColor: theme.primary }]} />
            </View>
          </View>
        </View>

        {/* Informational Disclaimer */}
        <View style={[styles.disclaimerCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.disclaimerText, { color: theme.textSecondary }]}>
            ℹ️ {TRUST_SCORE_DISCLAIMER}
          </Text>
        </View>

        {/* Menu Links matching Reference Screen 19 */}
        <View style={[styles.menuCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('TrustedPeople')}
            style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <Text style={styles.menuIcon}>🛡️</Text>
              <Text style={[styles.menuText, { color: theme.textPrimary }]}>Trusted People</Text>
            </View>
            <Text style={[styles.menuChevron, { color: theme.textMuted }]}>›</Text>
          </TouchableOpacity>

          <View style={[styles.menuDivider, { backgroundColor: theme.borderLight }]}>
            <View />
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Explore')}
            style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <Text style={styles.menuIcon}>⏱</Text>
              <Text style={[styles.menuText, { color: theme.textPrimary }]}>Journey History</Text>
            </View>
            <Text style={[styles.menuChevron, { color: theme.textMuted }]}>›</Text>
          </TouchableOpacity>

          <View style={[styles.menuDivider, { backgroundColor: theme.borderLight }]}>
            <View />
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Notifications')}
            style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <Text style={styles.menuIcon}>🔔</Text>
              <Text style={[styles.menuText, { color: theme.textPrimary }]}>Notifications</Text>
            </View>
            <Text style={[styles.menuChevron, { color: theme.textMuted }]}>›</Text>
          </TouchableOpacity>

          <View style={[styles.menuDivider, { backgroundColor: theme.borderLight }]}>
            <View />
          </View>

          {/* Dark Mode Theme Toggle Row */}
          <View style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <Text style={styles.menuIcon}>{isDark ? '🌙' : '☀️'}</Text>
              <Text style={[styles.menuText, { color: theme.textPrimary }]}>Dark Mode</Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: '#CBD5E1', true: theme.primary }}
              thumbColor="#FFFFFF"
            />
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
  logoutBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  logoutText: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 36,
  },
  userSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  avatarLargeText: {
    fontSize: 26,
    fontWeight: '800',
  },
  userName: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.extrabold,
  },
  verifiedPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.full,
    marginTop: 4,
  },
  verifiedText: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.bold,
  },
  coopScoreCard: {
    alignItems: 'center',
    borderRadius: Radius.xl,
    padding: 18,
    borderWidth: 1,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#00A884',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  scoreCircle: {
    width: 74,
    height: 74,
    borderRadius: 37,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  scoreNumber: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  scoreLabel: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 4,
  },
  scoreDenom: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: '600',
    opacity: 0.7,
  },
  scoreDesc: {
    fontSize: Typography.fontSizes.xs,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    borderRadius: Radius.xl,
    borderWidth: 1,
    paddingVertical: 14,
    marginBottom: 18,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statBoxBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
  },
  statVal: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.extrabold,
  },
  statTitle: {
    fontSize: Typography.fontSizes.xs,
    textAlign: 'center',
    marginTop: 3,
  },
  breakdownCard: {
    borderRadius: Radius.xl,
    padding: 18,
    borderWidth: 1,
    marginBottom: 16,
  },
  breakdownHeader: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.bold,
    marginBottom: 14,
  },
  barItem: {
    marginBottom: 12,
  },
  barLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  barTitle: {
    fontSize: Typography.fontSizes.xs + 1,
    fontWeight: Typography.fontWeights.medium,
  },
  barScore: {
    fontSize: Typography.fontSizes.xs + 1,
    fontWeight: Typography.fontWeights.bold,
  },
  barTrack: {
    height: 7,
    borderRadius: 4,
    overflow: 'hidden',
  },
  barProgress: {
    height: '100%',
    borderRadius: 4,
  },
  disclaimerCard: {
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: 12,
    marginBottom: 18,
  },
  disclaimerText: {
    fontSize: Typography.fontSizes.xs,
    lineHeight: 16,
  },
  menuCard: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    paddingVertical: 6,
    marginBottom: 18,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  menuText: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.semibold,
  },
  menuChevron: {
    fontSize: 20,
    fontWeight: '400',
  },
  menuDivider: {
    height: 1,
    marginHorizontal: 16,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: Radius.lg,
    borderWidth: 1,
    gap: 8,
  },
  switchLabel: {
    fontSize: Typography.fontSizes.xs + 1,
    fontWeight: Typography.fontWeights.bold,
    marginRight: 4,
  },
  switchChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  switchChipActive: {},
  switchChipText: {
    fontSize: Typography.fontSizes.xs,
    color: '#64748B',
  },
  switchChipTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
