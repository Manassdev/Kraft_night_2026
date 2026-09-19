import React, { useEffect, useState } from 'react';
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
import { CreateJourneyScreen } from '../screens/CreateJourneyScreen';
import { ExploreScreen } from '../screens/ExploreScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { JourneyDetailsScreen } from '../screens/JourneyDetailsScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { MatchingScreen } from '../screens/MatchingScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { RequestsScreen } from '../screens/RequestsScreen';
import { VehicleShareScreen } from '../screens/VehicleShareScreen';

export type ScreenName =
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
  | 'Profile';

interface NavigationStackItem {
  screen: ScreenName;
  params?: any;
}

export const AppNavigator: React.FC = () => {
  const { requests, currentUser } = useJourney();
  const insets = useSafeAreaInsets();
  const [currentTab, setCurrentTab] = useState<'Home' | 'Explore' | 'Requests' | 'Profile'>('Home');
  const [stack, setStack] = useState<NavigationStackItem[]>([
    { screen: currentUser ? 'Home' : 'Login' },
  ]);

  const currentItem = stack[stack.length - 1] || { screen: 'Home' };
  const currentScreen = currentItem.screen;
  const currentParams = currentItem.params;

  // Incoming pending requests count for badge
  const pendingRequestsCount = requests.filter(
    r =>
      (r.receiverId === currentUser?.id || r.receiverName === currentUser?.name) &&
      r.status === 'pending'
  ).length;

  const navigate = (screen: string, params?: any) => {
    // If navigating to one of the main bottom tabs, set currentTab
    if (screen === 'Home' || screen === 'Explore' || screen === 'Requests' || screen === 'Profile') {
      setCurrentTab(screen as any);
    }
    setStack(prev => [...prev, { screen: screen as ScreenName, params }]);
  };

  const goBack = (): boolean => {
    if (stack.length > 1) {
      setStack(prev => {
        const next = prev.slice(0, prev.length - 1);
        const top = next[next.length - 1];
        if (top && (top.screen === 'Home' || top.screen === 'Explore' || top.screen === 'Requests' || top.screen === 'Profile')) {
          setCurrentTab(top.screen as any);
        }
        return next;
      });
      return true;
    }
    return false;
  };

  const reset = (screen: string) => {
    if (screen === 'Home' || screen === 'Explore' || screen === 'Requests' || screen === 'Profile') {
      setCurrentTab(screen as any);
    }
    setStack([{ screen: screen as ScreenName }]);
  };

  // Android hardware back handler
  useEffect(() => {
    const onBackPress = () => {
      if (stack.length > 1) {
        setStack(prev => {
          if (prev.length <= 1) return prev;
          const next = prev.slice(0, prev.length - 1);
          const top = next[next.length - 1];
          if (
            top &&
            (top.screen === 'Home' ||
              top.screen === 'Explore' ||
              top.screen === 'Requests' ||
              top.screen === 'Profile')
          ) {
            setCurrentTab(top.screen as any);
          }
          return next;
        });
        return true;
      }
      return false; // Exit app if at root
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [stack.length]);

  const navigationProp = {
    navigate,
    goBack: () => {
      goBack();
    },
    reset,
  };

  // Tab switcher
  const handleTabPress = (tabName: 'Home' | 'Explore' | 'Requests' | 'Profile') => {
    setCurrentTab(tabName);
    // Keep clean stack when switching tabs
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
      case 'Login':
        return <LoginScreen navigation={navigationProp} />;
      case 'Register':
        return <RegisterScreen navigation={navigationProp} />;
      case 'Home':
        return <HomeScreen navigation={navigationProp} />;
      case 'Explore':
        return <ExploreScreen navigation={navigationProp} />;
      case 'CreateJourney':
        return <CreateJourneyScreen navigation={navigationProp} route={{ params: currentParams }} />;
      case 'Matching':
        return <MatchingScreen navigation={navigationProp} route={{ params: currentParams }} />;
      case 'JourneyDetails':
        return <JourneyDetailsScreen navigation={navigationProp} route={{ params: currentParams }} />;
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
      default:
        return <HomeScreen navigation={navigationProp} />;
    }
  };

  return (
    <View style={[styles.safeArea, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.screenContainer}>{renderScreen()}</View>

      {/* Bottom Navigation Bar */}
      {isMainTabScreen && (
        <View style={styles.bottomBar}>
          <TouchableOpacity
            onPress={() => handleTabPress('Home')}
            style={styles.tabItem}>
            <Text style={[styles.tabIcon, currentTab === 'Home' && styles.tabIconActive]}>
              🏠
            </Text>
            <Text style={[styles.tabText, currentTab === 'Home' && styles.tabTextActive]}>
              Home
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleTabPress('Explore')}
            style={styles.tabItem}>
            <Text style={[styles.tabIcon, currentTab === 'Explore' && styles.tabIconActive]}>
              🧭
            </Text>
            <Text style={[styles.tabText, currentTab === 'Explore' && styles.tabTextActive]}>
              Explore
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleTabPress('Requests')}
            style={styles.tabItem}>
            <View>
              <Text style={[styles.tabIcon, currentTab === 'Requests' && styles.tabIconActive]}>
                📬
              </Text>
              {pendingRequestsCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{pendingRequestsCount}</Text>
                </View>
              )}
            </View>
            <Text style={[styles.tabText, currentTab === 'Requests' && styles.tabTextActive]}>
              Requests
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleTabPress('Profile')}
            style={styles.tabItem}>
            <Text style={[styles.tabIcon, currentTab === 'Profile' && styles.tabIconActive]}>
              👤
            </Text>
            <Text style={[styles.tabText, currentTab === 'Profile' && styles.tabTextActive]}>
              Profile
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  screenContainer: {
    flex: 1,
  },
  bottomBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingVertical: 6,
    paddingBottom: 8,
    elevation: 8,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  tabIcon: {
    fontSize: 20,
    opacity: 0.6,
  },
  tabIconActive: {
    opacity: 1,
  },
  tabText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
  },
  tabTextActive: {
    color: '#2563EB',
    fontWeight: '700',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -10,
    backgroundColor: '#DC2626',
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
