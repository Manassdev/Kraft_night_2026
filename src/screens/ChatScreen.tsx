import React, { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useJourney } from '../context/JourneyContext';
import { socketService, SocketChatMessage } from '../services/socket';
import { useTheme } from '../theme/ThemeContext';
import { Radius, Typography } from '../theme/theme';
import { Journey } from '../types';

interface ChatScreenProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
    goBack: () => void;
  };
  route?: {
    params?: {
      recipientName?: string;
      journey?: Journey;
      journeyId?: string;
    };
  };
}

interface ChatMessage {
  id: string;
  sender: 'incoming' | 'outgoing';
  text: string;
  time: string;
  senderName?: string;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({
  navigation,
  route,
}) => {
  const { currentUser } = useJourney();
  const { theme, isDark } = useTheme();

  const journey = route?.params?.journey;
  const journeyId = journey?.id || route?.params?.journeyId || 'general_chat';
  const recipientName =
    route?.params?.recipientName || journey?.userName || 'Traveler';

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const scrollRef = useRef<React.ComponentRef<typeof ScrollView>>(null);

  // Connect to Socket.IO room for this journey
  useEffect(() => {
    if (!currentUser?.id) {
      return;
    }

    socketService.joinJourney(journeyId, currentUser.id);

    // Listen for incoming messages from other participants
    socketService.onMessage((msg: SocketChatMessage) => {
      if (msg && msg.journeyId === journeyId) {
        const isSelf = msg.userId === currentUser?.id;
        const chatMsg: ChatMessage = {
          id: msg.id || `msg_${Date.now()}`,
          sender: isSelf ? 'outgoing' : 'incoming',
          text: msg.message || '',
          time: msg.timestamp
            ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : 'Just now',
          senderName: msg.senderName,
        };
        setMessages(prev => {
          if (prev.some(m => m.id === chatMsg.id)) return prev;
          return [...prev, chatMsg];
        });
        requestAnimationFrame(() => {
          scrollRef.current?.scrollToEnd({ animated: true });
        });
      }
    });

    socketService.onChatHistory(data => {
      if (data && data.journeyId === journeyId && Array.isArray(data.messages)) {
        const history: ChatMessage[] = data.messages.map(m => ({
          id: m.id || `msg_${String(m.timestamp ?? '')}`,
          sender: m.userId === currentUser?.id ? 'outgoing' : 'incoming',
          text: m.message,
          time: m.timestamp
            ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : 'Earlier',
          senderName: m.senderName,
        }));
        setMessages(history);
        requestAnimationFrame(() => {
          scrollRef.current?.scrollToEnd({ animated: false });
        });
      }
    });

    return () => {
      socketService.removeListeners();
    };
  }, [journeyId, currentUser?.id]);

  const handleSend = () => {
    if (!inputMessage.trim()) return;

    const textToSend = inputMessage.trim();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const localMsgId = `local_${Date.now()}`;

    const newMsg: ChatMessage = {
      id: localMsgId,
      sender: 'outgoing',
      text: textToSend,
      time: timeStr,
      senderName: currentUser?.name || 'You',
    };

    setMessages(prev => [...prev, newMsg]);
    setInputMessage('');

    if (currentUser?.id) {
      socketService.sendMessage(
        journeyId,
        currentUser.id,
        textToSend,
        currentUser.name
      );
    }

    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.headerBg, borderBottomColor: theme.border }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.backBtn}>
          <Text style={[styles.backArrow, { color: theme.textPrimary }]}>←</Text>
        </TouchableOpacity>

        <View style={[styles.avatar, { backgroundColor: isDark ? '#1C3147' : '#E6F7F4', borderColor: theme.primary }]}>
          <Text style={[styles.avatarText, { color: theme.primary }]}>
            {recipientName.charAt(0)}
          </Text>
        </View>

        <View style={styles.headerTitleCol}>
          <View style={styles.nameRow}>
            <Text style={[styles.headerName, { color: theme.textPrimary }]}>{recipientName}</Text>
          </View>
          <Text style={[styles.headerSubtitle, { color: theme.primary }]}>
            {journey ? `${journey.from} → ${journey.to}` : 'Live Journey Chat'}
          </Text>
        </View>

        {journey && (
          <TouchableOpacity
            onPress={() => navigation.navigate('JourneyDetails', { journey })}
            style={styles.headerActionBtn}>
            <Text style={styles.headerActionIcon}>🗺️</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Messages Feed */}
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.messagesScroll}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="none"
        showsVerticalScrollIndicator={false}>
        {messages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>💬</Text>
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
              No messages yet
            </Text>
            <Text style={[styles.emptySub, { color: theme.textSecondary }]}>
              Say hello to {recipientName} to coordinate meeting points and travel timings!
            </Text>
          </View>
        ) : (
          messages.map(msg => {
            const isOutgoing = msg.sender === 'outgoing';
            return (
              <View
                key={msg.id}
                style={[
                  styles.messageRow,
                  isOutgoing ? styles.messageRowOutgoing : styles.messageRowIncoming,
                ]}>
                {!isOutgoing && (
                  <View style={[styles.avatarSmall, { backgroundColor: isDark ? '#1C3147' : '#E6F7F4' }]}>
                    <Text style={[styles.avatarSmallText, { color: theme.primary }]}>
                      {recipientName.charAt(0)}
                    </Text>
                  </View>
                )}

                <View
                  style={[
                    styles.bubble,
                    isOutgoing
                      ? [styles.bubbleOutgoing, { backgroundColor: isDark ? '#0D3A2F' : '#DCFCE7' }]
                      : [styles.bubbleIncoming, { backgroundColor: isDark ? '#132235' : '#F1F5F9' }],
                  ]}>
                  <Text
                    style={[
                      styles.messageText,
                      isOutgoing ? { color: theme.textPrimary } : { color: theme.textPrimary },
                    ]}>
                    {msg.text}
                  </Text>
                  <Text style={[styles.messageTimestamp, { color: theme.textMuted }]}>
                    {msg.time}
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Message Input Bar */}
      <View
        collapsable={false}
        style={[styles.inputBar, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
        <TextInput
          placeholder={`Message ${recipientName}...`}
          placeholderTextColor={theme.textMuted}
          value={inputMessage}
          onChangeText={setInputMessage}
          underlineColorAndroid="transparent"
          textAlignVertical="center"
          blurOnSubmit={false}
          autoCorrect={false}
          spellCheck={false}
          style={[styles.textInput, { color: theme.textPrimary, backgroundColor: theme.inputBg, borderColor: theme.border }]}
          multiline
          maxLength={500}
        />

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleSend}
          disabled={!inputMessage.trim()}
          style={[
            styles.sendBtn,
            { backgroundColor: inputMessage.trim() ? theme.primary : isDark ? '#1E293B' : '#E2E8F0' },
          ]}>
          <Text style={[styles.sendIcon, { color: inputMessage.trim() ? '#FFFFFF' : theme.textMuted }]}>
            ↑
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    marginRight: 10,
    padding: 4,
  },
  backArrow: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    marginRight: 10,
  },
  avatarText: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.bold,
  },
  headerTitleCol: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerName: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.bold,
  },
  headerSubtitle: {
    fontSize: Typography.fontSizes.xs,
    marginTop: 2,
    fontWeight: Typography.fontWeights.medium,
  },
  headerActionBtn: {
    padding: 8,
  },
  headerActionIcon: {
    fontSize: 20,
  },
  messagesScroll: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: Typography.fontSizes.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  messageRowOutgoing: {
    justifyContent: 'flex-end',
  },
  messageRowIncoming: {
    justifyContent: 'flex-start',
  },
  avatarSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginBottom: 2,
  },
  avatarSmallText: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.bold,
  },
  bubble: {
    maxWidth: '80%',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: Radius.lg,
  },
  bubbleOutgoing: {
    borderBottomRightRadius: Radius.xs,
  },
  bubbleIncoming: {
    borderBottomLeftRadius: Radius.xs,
  },
  messageText: {
    fontSize: Typography.fontSizes.sm + 0.5,
    lineHeight: 20,
  },
  messageTimestamp: {
    fontSize: 10,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderRadius: Radius.full,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: Typography.fontSizes.sm,
    marginRight: 10,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendIcon: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
