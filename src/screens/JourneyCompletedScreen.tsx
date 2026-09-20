import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button } from '../components/Button';
import { useJourney } from '../context/JourneyContext';
import { useTheme } from '../theme/ThemeContext';
import { Radius, Typography } from '../theme/theme';

interface JourneyCompletedScreenProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
    reset?: (screen: string) => void;
  };
  route?: {
    params?: {
      journeyFrom?: string;
      journeyTo?: string;
      partnerName?: string;
      partnerId?: string;
    };
  };
}

export const JourneyCompletedScreen: React.FC<JourneyCompletedScreenProps> = ({
  navigation,
  route,
}) => {
  const { submitRating } = useJourney();
  const { theme, isDark } = useTheme();
  const journeyFrom = route?.params?.journeyFrom || 'Origin';
  const journeyTo = route?.params?.journeyTo || 'Destination';
  const partnerName = route?.params?.partnerName || 'Fellow Traveler';
  const partnerId = route?.params?.partnerId || '';

  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    submitRating(partnerId, stars, comment);
    Alert.alert(
      'Rating Submitted! ⭐',
      `Thank you for rating ${partnerName}. Your cooperation score and feedback have been updated.`,
      [
        {
          text: 'View Profile',
          onPress: () => navigation.navigate('Profile'),
        },
        {
          text: 'Go to Home',
          onPress: () => navigation.navigate('Home'),
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        {/* Celebration Illustration Scene matching Reference Screen 18 */}
        <View style={[styles.illustrationCircle, { backgroundColor: isDark ? '#0A2B23' : '#E6F7F4', borderColor: theme.primary }]}>
          <Text style={styles.celebrationEmoji}>🎉🙌✨</Text>
        </View>

        {/* Heading */}
        <Text style={[styles.title, { color: theme.textPrimary }]}>Journey Completed 🎉</Text>

        {/* Route info */}
        <Text style={[styles.routeText, { color: theme.primary }]}>
          {journeyFrom} <Text style={[styles.arrow, { color: theme.textMuted }]}>→</Text> {journeyTo}
        </Text>
        <Text style={[styles.partnerText, { color: theme.textSecondary }]}>
          You cooperated with <Text style={[styles.boldPartner, { color: theme.textPrimary }]}>{partnerName}</Text>.
        </Text>

        {/* Rating Card */}
        <View style={[styles.ratingCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <Text style={[styles.ratingPrompt, { color: theme.textPrimary }]}>How was your experience?</Text>

          {/* 5 Stars Selector */}
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map(starIndex => (
              <TouchableOpacity
                key={starIndex}
                activeOpacity={0.7}
                onPress={() => setStars(starIndex)}
                style={styles.starBtn}>
                <Text
                  style={[
                    styles.starIcon,
                    stars >= starIndex ? { color: '#F59E0B' } : { color: theme.border },
                  ]}>
                  ★
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Comment Box */}
          <View style={styles.commentContainer}>
            <Text style={[styles.commentLabel, { color: theme.textSecondary }]}>Add a comment</Text>
            <TextInput
              placeholder="Great journey!"
              placeholderTextColor={theme.textMuted}
              value={comment}
              onChangeText={setComment}
              underlineColorAndroid="transparent"
              textAlignVertical="top"
              style={[styles.commentInput, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }]}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Submit Button */}
          <Button
            title="Submit Rating"
            onPress={handleSubmit}
            variant="primary"
            size="large"
            style={styles.submitBtn}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 36,
    paddingBottom: 36,
    alignItems: 'center',
    minHeight: '100%',
  },
  illustrationCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 2,
  },
  celebrationEmoji: {
    fontSize: 40,
  },
  title: {
    fontSize: Typography.fontSizes.display - 4,
    fontWeight: Typography.fontWeights.extrabold,
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  routeText: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
    marginTop: 8,
  },
  arrow: {},
  partnerText: {
    fontSize: Typography.fontSizes.sm + 1,
    marginTop: 4,
    marginBottom: 24,
  },
  boldPartner: {
    fontWeight: Typography.fontWeights.bold,
  },
  ratingCard: {
    width: '100%',
    borderRadius: Radius.xl,
    padding: 20,
    borderWidth: 1,
    elevation: 3,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  ratingPrompt: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.bold,
    textAlign: 'center',
    marginBottom: 16,
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 20,
  },
  starBtn: {
    padding: 4,
  },
  starIcon: {
    fontSize: 34,
  },
  commentContainer: {
    marginBottom: 20,
  },
  commentLabel: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.medium,
    marginBottom: 6,
  },
  commentInput: {
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: Typography.fontSizes.base,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  submitBtn: {
    width: '100%',
  },
});
