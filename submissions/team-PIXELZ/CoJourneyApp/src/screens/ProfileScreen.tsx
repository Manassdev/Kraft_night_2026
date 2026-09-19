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
import { JourneyCard } from '../components/JourneyCard';
import { TrustCard } from '../components/TrustCard';
import { useJourney } from '../context/JourneyContext';

interface ProfileScreenProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
  };
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const {
    currentUser,
    journeys,
    ratings,
    trustedList,
    toggleTrustedPerson,
    logout,
    switchDemoUser,
  } = useJourney();

  const [activeSection, setActiveSection] = useState<'journeys' | 'trusted' | 'ratings' | 'preferences'>('journeys');

  const user = currentUser || {
    id: 'user_rahul',
    name: 'Rahul',
    email: 'rahul@cojourney.app',
    gender: 'Male' as const,
    trustScore: 92,
    verified: true,
    completedJourneys: 8,
    cooperationHistoryCount: 6,
    ratingsAverage: 4.9,
    ratingsCount: 8,
    safetyScore: 10,
    phone: '+91 98765 43210',
  };

  const myJourneys = journeys.filter(j => j.userId === user.id);
  const myRatings = ratings.filter(r => r.toUserId === user.id);

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

  return (
    <View style={styles.container}>
      <Header
        title="My Profile"
        subtitle="CoJourney community reputation & activity"
        rightAction={
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Text style={styles.logoutBtnText}>Log Out</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile Card */}
        <View style={styles.profileHeaderCard}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarLargeText}>{user.name.charAt(0)}</Text>
          </View>
          <View style={styles.nameContainer}>
            <View style={styles.nameBadgeRow}>
              <Text style={styles.userName}>{user.name}</Text>
              {user.verified && (
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedCheck}>✓ Verified</Text>
                </View>
              )}
            </View>
            <Text style={styles.emailText}>{user.email}</Text>
            <Text style={styles.roleTag}>Cooperation Community Member</Text>
          </View>
        </View>

        {/* Quick Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{user.completedJourneys}</Text>
            <Text style={styles.statLabel}>Journeys Completed</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>⭐ {user.ratingsAverage}</Text>
            <Text style={styles.statLabel}>{user.ratingsCount} Ratings</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{trustedList.length}</Text>
            <Text style={styles.statLabel}>Trusted People</Text>
          </View>
        </View>

        {/* 100-Point Trust Score Card with Breakdown */}
        <TrustCard user={user} showBreakdown={true} />

        {/* Section Tabs */}
        <View style={styles.sectionTabsRow}>
          {[
            { id: 'journeys', label: `My Journeys (${myJourneys.length})` },
            { id: 'trusted', label: `Trusted (${trustedList.length})` },
            { id: 'ratings', label: `Ratings (${myRatings.length})` },
            { id: 'preferences', label: 'Preferences' },
          ].map(sec => (
            <TouchableOpacity
              key={sec.id}
              onPress={() => setActiveSection(sec.id as any)}
              style={[
                styles.sectionTab,
                activeSection === sec.id && styles.sectionTabActive,
              ]}>
              <Text
                style={[
                  styles.sectionTabText,
                  activeSection === sec.id && styles.sectionTabTextActive,
                ]}>
                {sec.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 1. My Journeys Section */}
        {activeSection === 'journeys' && (
          <View style={styles.sectionContainer}>
            {myJourneys.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyIcon}>🚗</Text>
                <Text style={styles.emptyTitle}>You have not created any journeys yet</Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('CreateJourney')}
                  style={styles.createBtn}>
                  <Text style={styles.createBtnText}>+ Post a Journey</Text>
                </TouchableOpacity>
              </View>
            ) : (
              myJourneys.map(journey => (
                <JourneyCard
                  key={journey.id}
                  journey={journey}
                  onPress={() => navigation.navigate('JourneyDetails', { journey })}
                />
              ))
            )}
          </View>
        )}

        {/* 2. Trusted People Section */}
        {activeSection === 'trusted' && (
          <View style={styles.sectionContainer}>
            <Text style={styles.trustedDesc}>
              Users you mark as trusted receive higher matching affinity and quick verification indicators.
            </Text>

            {trustedList.map(item => (
              <View key={item.id} style={styles.trustedCard}>
                <View style={styles.trustedLeft}>
                  <View style={styles.trustedAvatar}>
                    <Text style={styles.trustedAvatarText}>
                      {item.trustedUserName.charAt(0)}
                    </Text>
                  </View>
                  <View>
                    <View style={styles.trustedNameRow}>
                      <Text style={styles.trustedName}>{item.trustedUserName}</Text>
                      {item.verified && (
                        <View style={styles.trustedDot}>
                          <Text style={styles.trustedDotCheck}>✓</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.trustedScore}>
                      Trust Score: <Text style={styles.bold}>{item.trustedUserScore}/100</Text>
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() =>
                    toggleTrustedPerson({
                      id: item.trustedUserId,
                      name: item.trustedUserName,
                    })
                  }
                  style={styles.removeTrustedBtn}>
                  <Text style={styles.removeTrustedText}>Remove</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* 3. Ratings & Reviews Section */}
        {activeSection === 'ratings' && (
          <View style={styles.sectionContainer}>
            {myRatings.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>No ratings received yet</Text>
              </View>
            ) : (
              myRatings.map(rating => (
                <View key={rating.id} style={styles.ratingCard}>
                  <View style={styles.ratingCardHeader}>
                    <Text style={styles.ratingFrom}>From: {rating.fromUserName}</Text>
                    <Text style={styles.ratingStars}>{'★'.repeat(rating.stars)}</Text>
                  </View>
                  <Text style={styles.ratingComment}>"{rating.comment}"</Text>
                  <Text style={styles.ratingDate}>{rating.createdAt}</Text>
                </View>
              ))
            )}
          </View>
        )}

        {/* 4. Preferences Section */}
        {activeSection === 'preferences' && (
          <View style={styles.prefCard}>
            <Text style={styles.prefHeading}>Cooperation Preferences</Text>
            <View style={styles.prefRow}>
              <Text style={styles.prefLabel}>Gender</Text>
              <Text style={styles.prefValue}>{user.gender}</Text>
            </View>
            <View style={styles.prefRow}>
              <Text style={styles.prefLabel}>Preferred Modes</Text>
              <Text style={styles.prefValue}>Daily Walk, Carry Along, Share Vehicle</Text>
            </View>
            <View style={styles.prefRow}>
              <Text style={styles.prefLabel}>Community Status</Text>
              <Text style={styles.prefValue}>Verified Campus Traveler</Text>
            </View>
          </View>
        )}

        {/* Switch Account Quick Option for Demonstration */}
        <View style={styles.demoSwitchCard}>
          <Text style={styles.demoSwitchTitle}>Switch Demo Persona</Text>
          <View style={styles.demoSwitchButtons}>
            <TouchableOpacity
              onPress={() => switchDemoUser('user_rahul')}
              style={[styles.switchChip, user.id === 'user_rahul' && styles.switchChipActive]}>
              <Text style={styles.switchChipText}>Rahul (92)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => switchDemoUser('user_anjali')}
              style={[styles.switchChip, user.id === 'user_anjali' && styles.switchChipActive]}>
              <Text style={styles.switchChipText}>Anjali (94)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => switchDemoUser('user_arjun')}
              style={[styles.switchChip, user.id === 'user_arjun' && styles.switchChipActive]}>
              <Text style={styles.switchChipText}>Arjun (78)</Text>
            </TouchableOpacity>
          </View>
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
  logoutBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  logoutBtnText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '700',
  },
  profileHeaderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
    elevation: 2,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  avatarLarge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarLargeText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
  },
  nameContainer: {
    flex: 1,
  },
  nameBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  verifiedBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  verifiedCheck: {
    color: '#15803D',
    fontSize: 11,
    fontWeight: '700',
  },
  emailText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  roleTag: {
    fontSize: 11,
    color: '#2563EB',
    fontWeight: '600',
    marginTop: 3,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  statLabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    textAlign: 'center',
  },
  sectionTabsRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 4,
    marginBottom: 14,
  },
  sectionTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  sectionTabActive: {
    backgroundColor: '#FFFFFF',
    elevation: 1,
  },
  sectionTabText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  sectionTabTextActive: {
    color: '#2563EB',
    fontWeight: '700',
  },
  sectionContainer: {
    marginBottom: 16,
  },
  trustedDesc: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 12,
    lineHeight: 16,
  },
  trustedCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  trustedLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trustedAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  trustedAvatarText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  trustedNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trustedName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  trustedDot: {
    backgroundColor: '#22C55E',
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  trustedDotCheck: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  trustedScore: {
    fontSize: 11,
    color: '#64748B',
  },
  bold: {
    fontWeight: '700',
    color: '#0F172A',
  },
  removeTrustedBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
  },
  removeTrustedText: {
    fontSize: 11,
    color: '#EF4444',
    fontWeight: '600',
  },
  ratingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  ratingCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  ratingFrom: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  ratingStars: {
    color: '#F59E0B',
    fontSize: 13,
    letterSpacing: 2,
  },
  ratingComment: {
    fontSize: 12,
    color: '#475569',
    fontStyle: 'italic',
    lineHeight: 16,
  },
  ratingDate: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 4,
  },
  prefCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  prefHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  prefRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  prefLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  prefValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 6,
  },
  emptyTitle: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 13,
    color: '#64748B',
  },
  createBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  demoSwitchCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 10,
  },
  demoSwitchTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 8,
  },
  demoSwitchButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  switchChip: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  switchChipActive: {
    backgroundColor: '#DBEAFE',
    borderColor: '#3B82F6',
  },
  switchChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1E293B',
  },
});
