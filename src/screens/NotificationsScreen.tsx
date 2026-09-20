import React from 'react';
import {
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

interface NotificationsScreenProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
    goBack: () => void;
  };
}

interface NotificationItem {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  time: string;
  targetScreen?: string;
  targetParams?: any;
}

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({
  navigation,
}) => {
  const { requests, currentUser } = useJourney();
  const { theme, isDark } = useTheme();

  // Generate real notifications from actual requests and user status
  const notifications: NotificationItem[] = [];

  requests.forEach(r => {
    // Incoming request notification
    if (r.receiverId === currentUser?.id || r.receiverName === currentUser?.name) {
      if (r.status === 'pending') {
        notifications.push({
          id: `notif_req_${r.id}`,
          icon: '📬',
          title: 'New journey request',
          subtitle: `${r.senderName} requested to join your ${r.journeyFrom} → ${r.journeyTo} journey.`,
          time: r.createdAt || 'Recently',
          targetScreen: 'Requests',
        });
      }
    }

    // Outgoing request notification
    if (r.senderId === currentUser?.id || r.senderName === currentUser?.name) {
      if (r.status === 'accepted') {
        notifications.push({
          id: `notif_acc_${r.id}`,
          icon: '✓',
          title: 'Your request was accepted!',
          subtitle: `${r.receiverName} accepted your request for ${r.journeyFrom} → ${r.journeyTo}.`,
          time: 'Recently',
          targetScreen: 'ActiveJourney',
        });
      }
    }
  });

  const handlePress = (item: NotificationItem) => {
    if (item.targetScreen) {
      navigation.navigate(item.targetScreen, item.targetParams);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header
        title="Notifications"
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
              No notifications yet
            </Text>
            <Text style={[styles.emptySub, { color: theme.textSecondary }]}>
              When fellow travelers send requests or accept your journeys, updates will appear here.
            </Text>
          </View>
        ) : (
          notifications.map(item => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.8}
              onPress={() => handlePress(item)}
              style={[styles.notifCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
              <View style={[styles.iconCircle, { backgroundColor: isDark ? '#142938' : '#E6F7F4' }]}>
                <Text style={[styles.iconText, { color: theme.primary }]}>{item.icon}</Text>
              </View>

              <View style={styles.textCol}>
                <Text style={[styles.notifTitle, { color: theme.textPrimary }]}>{item.title}</Text>
                <Text style={[styles.notifSub, { color: theme.textSecondary }]}>{item.subtitle}</Text>
                <Text style={[styles.notifTime, { color: theme.textMuted }]}>{item.time}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
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
    padding: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
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
  notifCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginBottom: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  iconText: {
    fontSize: Typography.fontSizes.base,
  },
  textCol: {
    flex: 1,
  },
  notifTitle: {
    fontSize: Typography.fontSizes.sm + 0.5,
    fontWeight: Typography.fontWeights.bold,
    marginBottom: 3,
  },
  notifSub: {
    fontSize: Typography.fontSizes.xs,
    lineHeight: 16,
    marginBottom: 4,
  },
  notifTime: {
    fontSize: 10,
  },
});
