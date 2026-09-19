import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useJourney } from '../context/JourneyContext';

interface LoginScreenProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
  };
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const { login, switchDemoUser } = useJourney();
  const [email, setEmail] = useState('rahul@cojourney.app');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    login(email);
    navigation.navigate('Home');
  };

  const handleQuickDemo = (userKey: string) => {
    switchDemoUser(userKey);
    navigation.navigate('Home');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Brand Banner */}
        <View style={styles.brandContainer}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoIcon}>🤝</Text>
          </View>
          <Text style={styles.brandTitle}>CoJourney</Text>
          <Text style={styles.brandTagline}>
            "Your journey can help someone else's."
          </Text>
          <Text style={styles.brandSubtext}>
            We don't create new journeys. We make existing journeys useful to others.
          </Text>
        </View>

        {/* Login Form */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Welcome Back</Text>
          <Text style={styles.formSubtitle}>
            Log in to discover nearby cooperation opportunities
          </Text>

          <Input
            label="Email Address"
            leftIcon="✉️"
            placeholder="e.g. rahul@cojourney.app"
            value={email}
            onChangeText={t => {
              setEmail(t);
              setError('');
            }}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Input
            label="Password"
            leftIcon="🔒"
            placeholder="••••••••"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {error ? <Text style={styles.errorBanner}>{error}</Text> : null}

          <Button
            title="Log In"
            onPress={handleLogin}
            variant="primary"
            size="large"
            style={styles.loginButton}
          />

          <TouchableOpacity
            onPress={() => navigation.navigate('Register')}
            style={styles.registerLink}>
            <Text style={styles.registerLinkText}>
              New to CoJourney? <Text style={styles.registerLinkBold}>Create an account</Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* Quick Demo Switcher for Hackathon Judges */}
        <View style={styles.demoSection}>
          <Text style={styles.demoTitle}>⚡ Quick Demo Switcher (Hackathon):</Text>
          <View style={styles.demoButtonsRow}>
            <TouchableOpacity
              onPress={() => handleQuickDemo('user_rahul')}
              style={[styles.demoChip, styles.demoChipActive]}>
              <Text style={styles.demoChipText}>Rahul (Trust: 92)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleQuickDemo('user_anjali')}
              style={styles.demoChip}>
              <Text style={styles.demoChipText}>Anjali (Trust: 94)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleQuickDemo('user_arjun')}
              style={styles.demoChip}>
              <Text style={styles.demoChipText}>Arjun (Trust: 78)</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 20,
    justifyContent: 'center',
    minHeight: '100%',
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 10,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EFF6FF',
    borderWidth: 2,
    borderColor: '#BFDBFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  logoIcon: {
    fontSize: 32,
  },
  brandTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#1E3A8A',
    letterSpacing: -0.5,
  },
  brandTagline: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2563EB',
    marginTop: 4,
    textAlign: 'center',
  },
  brandSubtext: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 6,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 17,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 3,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  formSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 18,
    marginTop: 2,
  },
  loginButton: {
    marginTop: 8,
  },
  errorBanner: {
    color: '#DC2626',
    fontSize: 12,
    marginBottom: 10,
    textAlign: 'center',
  },
  registerLink: {
    marginTop: 16,
    alignItems: 'center',
  },
  registerLinkText: {
    fontSize: 13,
    color: '#64748B',
  },
  registerLinkBold: {
    color: '#2563EB',
    fontWeight: '700',
  },
  demoSection: {
    marginTop: 24,
    alignItems: 'center',
  },
  demoTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 8,
  },
  demoButtonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  demoChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  demoChipActive: {
    backgroundColor: '#DBEAFE',
    borderColor: '#3B82F6',
  },
  demoChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
  },
});
