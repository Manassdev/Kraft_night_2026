import React, { useEffect } from 'react';
import { Linking, StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { JourneyProvider } from './src/context/JourneyContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { handleAuthUrl } from './src/services/auth';

const MainApp: React.FC = () => {
  const { isDark, theme } = useTheme();

  useEffect(() => {
    // Check if app was launched via deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleAuthUrl(url).catch((err: unknown) => {
          console.log('Initial URL auth error:', err);
        });
      }
    });

    // Listen for incoming deep link URLs while running
    const subscription = Linking.addEventListener('url', ({ url }) => {
      if (url) {
        handleAuthUrl(url).catch((err: unknown) => {
          console.log('Deep link auth error:', err);
        });
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <AppNavigator />
    </View>
  );
};

function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <JourneyProvider>
          <MainApp />
        </JourneyProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
