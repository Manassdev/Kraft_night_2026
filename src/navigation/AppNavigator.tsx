import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BackHandler,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useJourney } from '../context/JourneyContext';
import { ActiveJourneyScreen } from '../screens/ActiveJourneyScreen';
import { CarryItemScreen } from '../screens/CarryItemScreen';
import { ChatScreen } from '../screens/ChatScreen';
import { CreateJourneyScreen } from '../screens/CreateJourneyScreen';
import { ExploreScreen } from '../screens/ExploreScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { JourneyCompletedScreen } from '../screens/JourneyCompletedScreen';
import { JourneyDetailsScreen } from '../screens/JourneyDetailsScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { MatchingScreen } from '../screens/MatchingScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { RequestsScreen } from '../screens/RequestsScreen';
import { SplashScreen } from '../screens/SplashScreen';
import { TrustedPeopleScreen } from '../screens/TrustedPeopleScreen';
import { VehicleShareScreen } from '../screens/VehicleShareScreen';
import { useTheme } from '../theme/ThemeContext';
import { Radius, Typography } from '../theme/theme';
import { CooperationType, Journey } from '../types';

export type ScreenName =
  | 'Splash'
  | 'Onboarding'
  | 'Login'
  | 'Register'
  | 'Home'
  | 'Explore'
  | 'CreateJourney'
  | 'Matching'
  | 'JourneyDetails'
  | 'CarryItem'
  | 'VehicleShare'
  | 'Requests'
  | 'ActiveJourney'
  | 'Profile'
  | 'TrustedPeople'
  | 'Notifications'
  | 'Chat'
  | 'JourneyCompleted';

interface ScreenParams {
  recipientName?: string;
  journey?: Journey;
  journeyId?: string;
  targetJourney?: Journey;
  mode?: CooperationType;
  destination?: string;
  matchPercentage?: number;
  reasons?: string[];
  journeyFrom?: string;
  journeyTo?: string;
  partnerName?: string;
  partnerId?: string;
  email?: string;
}

interface NavigationStackItem {
  screen: ScreenName;
  params?: ScreenParams;
}

export const AppNavigator: React.FC = () => {
  const { requests, currentUser } = useJourney();
  const { theme, isDark, toggleTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const [currentTab, setCurrentTab] = useState<'Home' | 'Explore' | 'Requests' | 'Profile'>('Home');
  const [stack, setStack] = useState<NavigationStackItem[]>([
    { screen: 'Splash' },
  ]);
  // Android IME/keyboard insets can be reported as a large bottom inset.
  // Applying that to the screen root shifts/remounts focused TextInputs.
  const tabBarBottomInset = Math.min(insets.bottom, 34);

  const currentItem = stack[stack.length - 1] || { screen: 'Home' };
  const currentScreen = currentItem.screen;
  const currentParams = currentItem.params;

  // Incoming pending requests count for badge
  const pendingRequestsCount = requests.filter(
    r =>
      (r.receiverId === currentUser?.id || r.receiverName === currentUser?.name) &&
      r.status === 'pending'
  ).length;

  const navigate = useCallback((screen: string, params?: ScreenParams) => {
    if (screen === 'Home' || screen === 'Explore' || screen === 'Requests' || screen === 'Profile') {
      setCurrentTab(screen);
    }
    setStack(prev => [...prev, { screen: screen as ScreenName, params }]);
  }, []);

  const goBack = useCallback(() => {
    setStack(prev => {
      if (prev.length <= 1) {
        return prev;
      }
      const next = prev.slice(0, prev.length - 1);
      const top = next[next.length - 1];
      if (
        top &&
        (top.screen === 'Home' ||
          top.screen === 'Explore' ||
          top.screen === 'Requests' ||
          top.screen === 'Profile')
      ) {
        setCurrentTab(top.screen);
      }
      return next;
    });
  }, []);

  const reset = useCallback((screen: string) => {
    if (screen === 'Home' || screen === 'Explore' || screen === 'Requests' || screen === 'Profile') {
      setCurrentTab(screen);
    }
    setStack([{ screen: screen as ScreenName }]);
  }, []);

  // Android hardware back handler
  useEffect(() => {
    const onBackPress = () => {
      if (stack.length <= 1) {
        return false;
      }
      goBack();
      return true;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [stack.length, goBack]);

  const navigationProp = useMemo(
    () => ({
      navigate,
      goBack,
      reset,
    }),
    [navigate, goBack, reset],
  );

  const screenRoute = useMemo(() => ({ params: currentParams }), [currentParams]);

  // Tab switcher
  const handleTabPress = (tabName: 'Home' | 'Explore' | 'Requests' | 'Profile') => {
    setCurrentTab(tabName);
    setStack([{ screen: tabName }]);
  };

  const isMainTabScreen =
    currentScreen === 'Home' ||
    currentScreen === 'Explore' ||
    currentScreen === 'Requests' ||
    currentScreen === 'Profile';

  // Render current screen
  const renderScreen = () => {
    switch (currentScreen) {
      case 'Splash':
        return <SplashScreen navigation={navigationProp} />;
      case 'Onboarding':
        return <OnboardingScreen navigation={navigationProp} />;
      case 'Login':
        return <LoginScreen navigation={navigationProp} />;
      case 'Register':
        return <RegisterScreen navigation={navigationProp} />;
      case 'Home':
        return <HomeScreen navigation={navigationProp} />;
      case 'Explore':
        return <ExploreScreen navigation={navigationProp} />;
      case 'CreateJourney':
        return <CreateJourneyScreen navigation={navigationProp} route={screenRoute} />;
      case 'Matching':
        return <MatchingScreen navigation={navigationProp} route={screenRoute} />;
      case 'JourneyDetails':
        return <JourneyDetailsScreen navigation={navigationProp} route={screenRoute} />;
      case 'CarryItem':
        return <CarryItemScreen navigation={navigationProp} />;
      case 'VehicleShare':
        return <VehicleShareScreen navigation={navigationProp} />;
      case 'Requests':
        return <RequestsScreen navigation={navigationProp} />;
      case 'ActiveJourney':
        return <ActiveJourneyScreen navigation={navigationProp} />;
      case 'Profile':
        return <ProfileScreen navigation={navigationProp} />;
      case 'TrustedPeople':
        return <TrustedPeopleScreen navigation={navigationProp} />;
      case 'Notifications':
        return <NotificationsScreen navigation={navigationProp} />;
      case 'Chat':
        return <ChatScreen navigation={navigationProp} route={screenRoute} />;
      case 'JourneyCompleted':
        return <JourneyCompletedScreen navigation={navigationProp} route={screenRoute} />;
      default:
        return <HomeScreen navigation={navigationProp} />;
    }
  };

  return (
    <View style={[styles.safeArea, { backgroundColor: theme.background, paddingTop: insets.top }]}>
      <View style={styles.screenContainer}>{renderScreen()}</View>

      {/* Bottom Navigation Bar */}
      {isMainTabScreen && (
        <View
          style={[
            styles.bottomBar,
            {
              backgroundColor: theme.tabBarBg,
              borderTopColor: theme.tabBarBorder,
              paddingBottom: tabBarBottomInset,
            },
          ]}>
          {/* Home Tab */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => handleTabPress('Home')}
            style={styles.tabItem}>
            <Text style={[styles.tabIcon, { color: currentTab === 'Home' ? theme.primary : theme.textMuted }]}>
              🏠
            </Text>
            <Text style={[styles.tabText, { color: currentTab === 'Home' ? theme.primary : theme.textSecondary }, currentTab === 'Home' && styles.tabTextActive]}>
              Home
            </Text>
            {currentTab === 'Home' && <View style={[styles.activeDot, { backgroundColor: theme.primary }]} />}
          </TouchableOpacity>

          {/* Explore Tab */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => handleTabPress('Explore')}
            style={styles.tabItem}>
            <Text style={[styles.tabIcon, { color: currentTab === 'Explore' ? theme.primary : theme.textMuted }]}>
              🧭
            </Text>
            <Text style={[styles.tabText, { color: currentTab === 'Explore' ? theme.primary : theme.textSecondary }, currentTab === 'Explore' && styles.tabTextActive]}>
              Explore
            </Text>
            {currentTab === 'Explore' && <View style={[styles.activeDot, { backgroundColor: theme.primary }]} />}
          </TouchableOpacity>

          {/* Center Create FAB */}
          <View style={styles.createTabWrapper}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => navigate('CreateJourney', {})}
              style={[styles.createFAB, { backgroundColor: theme.primary }]}>
              <Text style={styles.createFABText}>+</Text>
            </TouchableOpacity>
            <Text style={[styles.createLabel, { color: theme.textSecondary }]}>Create</Text>
          </View>

          {/* Requests Tab */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => handleTabPress('Requests')}
            style={styles.tabItem}>
            <View style={styles.iconWithBadge}>
              <Text style={[styles.tabIcon, { color: currentTab === 'Requests' ? theme.primary : theme.textMuted }]}>
                📬
              </Text>
              {pendingRequestsCount > 0 && (
                <View style={[styles.badge, { backgroundColor: theme.danger }]}>
                  <Text style={styles.badgeText}>{pendingRequestsCount}</Text>
                </View>
              )}
            </View>
            <Text style={[styles.tabText, { color: currentTab === 'Requests' ? theme.primary : theme.textSecondary }, currentTab === 'Requests' && styles.tabTextActive]}>
              Requests
            </Text>
            {currentTab === 'Requests' && <View style={[styles.activeDot, { backgroundColor: theme.primary }]} />}
          </TouchableOpacity>

          {/* Profile Tab */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => handleTabPress('Profile')}
            style={styles.tabItem}>
            <Text style={[styles.tabIcon, { color: currentTab === 'Profile' ? theme.primary : theme.textMuted }]}>
              👤
            </Text>
            <Text style={[styles.tabText, { color: currentTab === 'Profile' ? theme.primary : theme.textSecondary }, currentTab === 'Profile' && styles.tabTextActive]}>
              Profile
            </Text>
            {currentTab === 'Profile' && <View style={[styles.activeDot, { backgroundColor: theme.primary }]} />}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  screenContainer: {
    flex: 1,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 8,
    paddingBottom: 10,
    paddingHorizontal: 4,
    elevation: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
    position: 'relative',
  },
  iconWithBadge: {
    position: 'relative',
  },
  tabIcon: {
    fontSize: 22,
  },
  tabText: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 3,
    letterSpacing: 0.1,
  },
  tabTextActive: {
    fontWeight: '700',
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 3,
  },
  createTabWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 72,
  },
  createFAB: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#00A884',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    marginTop: -18,
  },
  createFABText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 32,
    marginTop: -2,
  },
  createLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -10,
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1,
    minWidth: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
});

