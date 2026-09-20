import React, { useEffect } from 'react';
import { StyleSheet, TouchableOpacity, View, Text } from 'react-native';
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
    }, 2200);
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
    <TouchableOpacity activeOpacity={1} onPress={handlePress} style={styles.container}>
      {/* Background gradient layers */}
      <View style={styles.bgTop} />
      <View style={styles.bgBottom} />

      {/* Center brand */}
      <View style={styles.centerContent}>
        <CoJourneyLogo size="large" showText={true} showTagline={true} dark={true} />
        <Text style={styles.taglineExtra}>Different Paths. A Kinder Journey.</Text>
      </View>

      {/* Decorative wave bottom */}
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
    backgroundColor: '#0B1522',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  bgTop: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#00A884',
    opacity: 0.08,
  },
  bgBottom: {
    position: 'absolute',
    bottom: 60,
    left: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: '#00A884',
    opacity: 0.06,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    paddingHorizontal: 30,
  },
  taglineExtra: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
    letterSpacing: 0.3,
  },
  bottomWaveContainer: {
    position: 'absolute',
    bottom: -50,
    left: -40,
    right: -40,
    height: 160,
    zIndex: 1,
  },
  waveLayerOne: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
    backgroundColor: '#00A884',
    borderTopLeftRadius: 260,
    borderTopRightRadius: 200,
    opacity: 0.18,
    transform: [{ scaleX: 1.2 }],
  },
  waveLayerTwo: {
    position: 'absolute',
    bottom: -15,
    left: -20,
    right: -20,
    height: 100,
    backgroundColor: '#00A884',
    borderTopLeftRadius: 180,
    borderTopRightRadius: 280,
    opacity: 0.1,
    transform: [{ scaleX: 1.1 }],
  },
});
