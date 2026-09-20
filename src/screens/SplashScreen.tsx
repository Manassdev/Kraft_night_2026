import React, { useEffect } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { CoJourneyLogo } from '../components/CoJourneyLogo';
import { useJourney } from '../context/JourneyContext';

interface SplashScreenProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
    reset?: (screen: string) => void;
  };
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ navigation }) => {
  const { currentUser } = useJourney();

  const navigate = navigation.navigate;

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentUser) {
        navigate('Home');
      } else {
        navigate('Onboarding');
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [currentUser, navigate]);

  const handlePress = () => {
    if (currentUser) {
      navigation.navigate('Home');
    } else {
      navigation.navigate('Onboarding');
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={handlePress}
      style={styles.container}>
      {/* Center Brand Identity */}
      <View style={styles.centerContent}>
        <CoJourneyLogo size="large" showText={true} showTagline={true} />
      </View>

      {/* Subtle curved background graphic in Teal */}
      <View style={styles.bottomWaveContainer}>
        <View style={styles.waveLayerOne} />
        <View style={styles.waveLayerTwo} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    paddingHorizontal: 30,
  },
  bottomWaveContainer: {
    position: 'absolute',
    bottom: -60,
    left: -40,
    right: -40,
    height: 180,
    zIndex: 1,
  },
  waveLayerOne: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 130,
    backgroundColor: '#E6F7F4',
    borderTopLeftRadius: 260,
    borderTopRightRadius: 200,
    opacity: 0.85,
    transform: [{ scaleX: 1.2 }],
  },
  waveLayerTwo: {
    position: 'absolute',
    bottom: -15,
    left: -20,
    right: -20,
    height: 110,
    backgroundColor: '#CCF2EB',
    borderTopLeftRadius: 180,
    borderTopRightRadius: 280,
    opacity: 0.9,
    transform: [{ scaleX: 1.1 }],
  },
});
