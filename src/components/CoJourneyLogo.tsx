import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../theme/theme';

interface CoJourneyLogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  showTagline?: boolean;
  dark?: boolean;
}

export const CoJourneyLogo: React.FC<CoJourneyLogoProps> = ({
  size = 'medium',
  showText = true,
  showTagline = false,
  dark = false,
}) => {
  const isLarge = size === 'large';
  const isSmall = size === 'small';

  const logoDimension = isLarge ? 90 : isSmall ? 44 : 64;
  const borderRadius = isLarge ? 22 : isSmall ? 12 : 16;

  const titleSizeStyle = isLarge
    ? styles.titleLarge
    : isSmall
    ? styles.titleSmall
    : styles.titleMedium;

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.imageWrapper,
          {
            width: logoDimension,
            height: logoDimension,
            borderRadius,
          },
          dark ? styles.wrapperDark : styles.wrapperLight,
        ]}>
        <Image
          source={require('../assets/logo.png')}
          style={[
            styles.logoImage,
            {
              width: logoDimension,
              height: logoDimension,
              borderRadius,
            },
          ]}
          resizeMode="cover"
        />
      </View>

      {showText && (
        <Text
          style={[
            styles.title,
            titleSizeStyle,
            dark ? styles.textWhite : styles.textDark,
          ]}>
          Co<Text style={styles.journeyAccent}>Journey</Text>
        </Text>
      )}

      {showTagline && (
        <Text
          style={[
            styles.tagline,
            dark ? styles.taglineDark : styles.taglineLight,
          ]}>
          Your journey can help someone else's.
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageWrapper: {
    overflow: 'hidden',
    elevation: 6,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  wrapperLight: {
    backgroundColor: '#0B1522',
  },
  wrapperDark: {
    backgroundColor: '#132235',
  },
  logoImage: {
    borderRadius: 16,
  },
  title: {
    fontWeight: '800',
    letterSpacing: -0.5,
    marginTop: 10,
  },
  titleSmall: {
    fontSize: 16,
  },
  titleMedium: {
    fontSize: 22,
  },
  titleLarge: {
    fontSize: 28,
  },
  textWhite: {
    color: '#FFFFFF',
  },
  textDark: {
    color: Colors.textPrimary,
  },
  journeyAccent: {
    color: Colors.primary,
  },
  tagline: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 6,
    textAlign: 'center',
    letterSpacing: 0.1,
  },
  taglineLight: {
    color: Colors.textSecondary,
  },
  taglineDark: {
    color: '#94A3B8',
  },
});
