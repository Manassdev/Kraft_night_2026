import React, { useState } from 'react';
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
  isUnread?: boolean;
}

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({
  navigation,
}) => {
  const { requests, currentUser } = useJourney();
  const { theme, isDark } = useTheme();
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  // Generate real notifications from actual requests and user status
  const notifications: NotificationItem[] = [];

  requests.forEach(r => {
    // Incoming request notification — pending ones are unread
    if (r.receiverId === currentUser?.id || r.receiverName === currentUser?.name) {
      if (r.status === 'pending') {
        notifications.push({
          id: `notif_req_${r.id}`,
          icon: '📬',
          title: 'New journey request',
          subtitle: `${r.senderName} wants to join your ${r.journeyFrom} → ${r.journeyTo} journey.`,
          time: r.createdAt || 'Recently',
          targetScreen: 'Requests',
          isUnread: true,
        });
      } else if (r.status === 'accepted') {
        notifications.push({
          id: `notif_acc_in_${r.id}`,
          icon: '🤝',
          title: 'Request accepted',
          subtitle: `You accepted ${r.senderName}'s request for ${r.journeyFrom} → ${r.journeyTo}.`,
          time: r.createdAt || 'Recently',
          targetScreen: 'ActiveJourney',
        });
      }
    }

    // Outgoing request notifications
    if (r.senderId === currentUser?.id || r.senderName === currentUser?.name) {
      if (r.status === 'accepted') {
        notifications.push({
          id: `notif_acc_${r.id}`,
          icon: '✅',
          title: 'Your request was accepted!',
          subtitle: `${r.receiverName} accepted your request for ${r.journeyFrom} → ${r.journeyTo}.`,
          time: 'Recently',
          targetScreen: 'ActiveJourney',
          isUnread: true,
        });
      } else if (r.status === 'rejected') {
        notifications.push({
          id: `notif_rej_${r.id}`,
          icon: '❌',
          title: 'Request declined',
          subtitle: `${r.receiverName} declined your request for ${r.journeyFrom} → ${r.journeyTo}.`,
          time: r.createdAt || 'Recently',
          targetScreen: 'Explore',
        });
      }
    }
  });

  const handlePress = (item: NotificationItem) => {
    // Mark as read
    setReadIds(prev => new Set([...prev, item.id]));
    if (item.targetScreen) {
      navigation.navigate(item.targetScreen, item.targetParams);
    }
  };

  const unreadCount = notifications.filter(n => n.isUnread && !readIds.has(n.id)).length;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header
        title={unreadCount > 0 ? `Notifications (${unreadCount})` : 'Notifications'}
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
          notifications.map(item => {
            const isRead = readIds.has(item.id) || !item.isUnread;
            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.8}
                onPress={() => handlePress(item)}
                style={[
                  styles.notifCard,
                  {
                    backgroundColor: isRead
                      ? theme.card
                      : isDark ? '#0A2520' : '#F0FDF9',
                    borderColor: isRead ? theme.cardBorder : theme.primary + '44',
                  },
                ]}>
                {/* Icon circle */}
                <View style={[styles.iconCircle, { backgroundColor: isDark ? '#142938' : '#E6F7F4' }]}>
                  <Text style={styles.iconText}>{item.icon}</Text>
                </View>

                {/* Text content */}
                <View style={styles.textCol}>
                  <View style={styles.titleRow}>
                    <Text style={[styles.notifTitle, { color: theme.textPrimary }]} numberOfLines={1}>
                      {item.title}
                    </Text>
                    {!isRead && (
                      <View style={[styles.unreadDot, { backgroundColor: theme.primary }]} />
                    )}
                  </View>
                  <Text style={[styles.notifSub, { color: theme.textSecondary }]} numberOfLines={2}>
                    {item.subtitle}
                  </Text>
                  <Text style={[styles.notifTime, { color: theme.textMuted }]}>
                    {item.time}
                  </Text>
                </View>

                {/* Right chevron */}
                {item.targetScreen && (
                  <Text style={[styles.chevron, { color: theme.textMuted }]}>›</Text>
                )}
              </TouchableOpacity>
            );
          })
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
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginBottom: 10,
    gap: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconText: {
    fontSize: 20,
  },
  textCol: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  notifTitle: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.bold,
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    flexShrink: 0,
  },
  notifSub: {
    fontSize: Typography.fontSizes.xs,
    lineHeight: 16,
    marginBottom: 4,
  },
  notifTime: {
    fontSize: 10,
  },
  chevron: {
    fontSize: 20,
    fontWeight: '700',
    flexShrink: 0,
  },
});
