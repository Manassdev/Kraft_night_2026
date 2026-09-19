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
import { RequestCard } from '../components/RequestCard';
import { useJourney } from '../context/JourneyContext';

interface RequestsScreenProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
  };
}

export const RequestsScreen: React.FC<RequestsScreenProps> = ({ navigation }) => {
  const { requests, currentUser, acceptRequest, rejectRequest } = useJourney();
  const [activeTab, setActiveTab] = useState<'incoming' | 'outgoing'>('incoming');

  const incomingRequests = requests.filter(
    r => r.receiverId === currentUser?.id || r.receiverName === currentUser?.name
  );

  const outgoingRequests = requests.filter(
    r => r.senderId === currentUser?.id || r.senderName === currentUser?.name
  );

  const handleAccept = (reqId: string) => {
    const session = acceptRequest(reqId);
    if (session) {
      Alert.alert(
        'Request Accepted! 🟢',
        'Cooperation journey is now active. Opening active journey dashboard...',
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
    Alert.alert('Decline Request', 'Are you sure you want to decline this cooperation request?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Decline',
        style: 'destructive',
        onPress: () => rejectRequest(reqId),
      },
    ]);
  };

  const currentList = activeTab === 'incoming' ? incomingRequests : outgoingRequests;
  const pendingIncomingCount = incomingRequests.filter(r => r.status === 'pending').length;

  return (
    <View style={styles.container}>
      <Header
        title="Cooperation Requests"
        subtitle="Review and manage journey exchange requests"
      />

      {/* Tabs */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          onPress={() => setActiveTab('incoming')}
          style={[styles.tab, activeTab === 'incoming' && styles.tabActive]}>
          <Text
            style={[styles.tabText, activeTab === 'incoming' && styles.tabTextActive]}>
            Incoming Requests
          </Text>
          {pendingIncomingCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{pendingIncomingCount}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('outgoing')}
          style={[styles.tab, activeTab === 'outgoing' && styles.tabActive]}>
          <Text
            style={[styles.tabText, activeTab === 'outgoing' && styles.tabTextActive]}>
            Outgoing Requests ({outgoingRequests.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <ScrollView contentContainerStyle={styles.content}>
        {currentList.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyTitle}>
              No {activeTab} requests at the moment
            </Text>
            <Text style={styles.emptySubtitle}>
              {activeTab === 'incoming'
                ? 'When another traveler finds your journey compatible, their cooperation request will appear here.'
                : 'Explore nearby journeys and send cooperation requests to share rides or carry items.'}
            </Text>
            {activeTab === 'outgoing' && (
              <TouchableOpacity
                onPress={() => navigation.navigate('Explore')}
                style={styles.exploreBtn}>
                <Text style={styles.exploreBtnText}>Explore Available Journeys</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          currentList.map(req => (
            <RequestCard
              key={req.id}
              request={req}
              isIncoming={activeTab === 'incoming'}
              onAccept={() => handleAccept(req.id)}
              onReject={() => handleReject(req.id)}
              onOpenActive={() => navigation.navigate('ActiveJourney')}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#2563EB',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#2563EB',
    fontWeight: '700',
  },
  badge: {
    backgroundColor: '#DC2626',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
    marginLeft: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  content: {
    padding: 16,
    paddingBottom: 30,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  exploreBtn: {
    marginTop: 18,
    backgroundColor: '#2563EB',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  exploreBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});
