import React, { useState } from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button } from '../components/Button';
import { Typography } from '../theme/theme';
import { useTheme } from '../theme/ThemeContext';

const { width } = Dimensions.get('window');

interface OnboardingScreenProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
  };
}

interface OnboardingSlide {
  id: number;
  emojiGraphic: string;
  badgeType: 'walk' | 'vehicle' | 'trust';
  title: string;
  subtitle: string;
}

const SLIDES: OnboardingSlide[] = [
  {
    id: 1,
    emojiGraphic: '🚶‍♂️🎒🗺️',
    badgeType: 'walk',
    title: 'Already going\nsomewhere?',
    subtitle: 'Your journey may be useful to someone else.',
  },
  {
    id: 2,
    emojiGraphic: '🚗📦🤝',
    badgeType: 'vehicle',
    title: 'Travel together.\nCarry along.\nShare a seat.',
    subtitle: 'Small journeys can create big cooperation.',
  },
  {
    id: 3,
    emojiGraphic: '🛡️✓⭐',
    badgeType: 'trust',
    title: 'Cooperate\nwith trust.',
    subtitle: 'Verification + ratings + journey history.',
  },
];

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { theme, isDark } = useTheme();

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      navigation.navigate('Login');
    }
  };

  const handleSkip = () => {
    navigation.navigate('Login');
  };

  const currentSlide = SLIDES[currentIndex];
  const isLast = currentIndex === SLIDES.length - 1;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Top Header with Skip option */}
      <View style={styles.topHeader}>
        <View style={styles.headerSpacer} />
        {!isLast ? (
          <TouchableOpacity onPress={handleSkip} style={styles.skipBtn}>
            <Text style={[styles.skipText, { color: theme.textSecondary }]}>Skip</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.headerSpacer} />
        )}
      </View>

      {/* Slide Visual Illustration Container */}
      <View style={styles.illustrationArea}>
        <View style={styles.circleBackdrop}>
          <View style={styles.innerCircle}>
            {/* Visual layered scene representation */}
            <View style={styles.illustrationScene}>
              {currentSlide.badgeType === 'walk' && (
                <View style={styles.badgeRow}>
                  <View style={[styles.avatarPill, styles.avatarPillGreen]}>
                    <Text style={styles.avatarPillEmoji}>🚶</Text>
                  </View>
                  <View style={styles.travelerDottedLine} />
                  <View style={[styles.avatarPill, styles.avatarPillTeal]}>
                    <Text style={styles.avatarPillEmoji}>📍</Text>
                  </View>
                </View>
              )}

              {currentSlide.badgeType === 'vehicle' && (
                <View style={styles.badgeRow}>
                  <View style={[styles.avatarPill, styles.avatarPillBlue]}>
                    <Text style={styles.avatarPillEmoji}>🚗</Text>
                  </View>
                  <View style={styles.travelerDottedLine} />
                  <View style={[styles.avatarPill, styles.avatarPillAmber]}>
                    <Text style={styles.avatarPillEmoji}>📦</Text>
                  </View>
                </View>
              )}

              {currentSlide.badgeType === 'trust' && (
                <View style={styles.badgeRow}>
                  <View style={[styles.avatarPill, styles.avatarPillShield]}>
                    <Text style={styles.avatarPillEmoji}>🛡️</Text>
                  </View>
                  <View style={styles.travelerDottedLine} />
                  <View style={[styles.avatarPill, styles.avatarPillGreen]}>
                    <Text style={styles.avatarPillEmoji}>✓</Text>
                  </View>
                </View>
              )}

              <Text style={styles.mainIllustrationEmoji}>
                {currentSlide.emojiGraphic}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Text Area */}
      <View style={styles.textArea}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>{currentSlide.title}</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{currentSlide.subtitle}</Text>
      </View>

      {/* Bottom Area: Dots + Button */}
      <View style={styles.bottomArea}>
        {/* Pagination Dots */}
        <View style={styles.paginationRow}>
          {SLIDES.map((_, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => setCurrentIndex(i)}
              style={[
                styles.dot,
                { backgroundColor: currentIndex === i ? '#00A884' : isDark ? '#334155' : '#CBD5E1' },
                currentIndex === i && styles.dotActive,
              ]}
            />
          ))}
        </View>

        {/* Action Button: Arrow on slides 1-2, "Get Started" on slide 3 */}
        {isLast ? (
          <Button
            title="Get Started"
            onPress={handleNext}
            variant="primary"
            size="large"
            style={styles.getStartedButton}
          />
        ) : (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleNext}
            style={styles.nextCircleButton}>
            <Text style={styles.nextArrowText}>→</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    height: 44,
  },
  headerSpacer: {
    width: 40,
  },
  skipBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  skipText: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.semibold,
  },
  illustrationArea: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  circleBackdrop: {
    width: width * 0.72,
    height: width * 0.72,
    borderRadius: (width * 0.72) / 2,
    backgroundColor: '#E6F7F4',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  innerCircle: {
    width: width * 0.58,
    height: width * 0.58,
    borderRadius: (width * 0.58) / 2,
    backgroundColor: '#CCF2EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationScene: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatarPill: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  avatarPillGreen: {
    backgroundColor: '#DCFCE7',
  },
  avatarPillTeal: {
    backgroundColor: '#E6F7F4',
  },
  avatarPillBlue: {
    backgroundColor: '#E0F2FE',
  },
  avatarPillAmber: {
    backgroundColor: '#FEF3C7',
  },
  avatarPillShield: {
    backgroundColor: '#CCF2EB',
  },
  avatarPillEmoji: {
    fontSize: 22,
  },
  travelerDottedLine: {
    width: 36,
    height: 2,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#00A884',
    marginHorizontal: 8,
  },
  mainIllustrationEmoji: {
    fontSize: 48,
    letterSpacing: 8,
  },
  textArea: {
    paddingHorizontal: 32,
    alignItems: 'center',
    minHeight: 140,
    justifyContent: 'center',
  },
  title: {
    fontSize: Typography.fontSizes.display,
    fontWeight: Typography.fontWeights.extrabold,
    textAlign: 'center',
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: Typography.fontSizes.md,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 22,
    paddingHorizontal: 12,
  },
  bottomArea: {
    paddingHorizontal: 28,
    paddingBottom: 24,
    alignItems: 'center',
    minHeight: 100,
    justifyContent: 'center',
  },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 24,
    backgroundColor: '#00A884',
  },
  dotInactive: {
    width: 8,
    backgroundColor: '#CBD5E1',
  },
  nextCircleButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#00A884',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#00A884',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  nextArrowText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 28,
  },
  getStartedButton: {
    width: '100%',
  },
});
