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
import { CoJourneyLogo } from '../components/CoJourneyLogo';
import { Input } from '../components/Input';
import { useTheme } from '../theme/ThemeContext';
import { Radius, Typography } from '../theme/theme';

interface LoginScreenProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
  };
}

const DEMO_EMAIL = 'demo@cojourney.app';
const DEMO_PASSWORD = 'demo123';

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSignIn = () => {
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }
    if (!password) {
      setError('Please enter your password');
      return;
    }
    setError('');
    navigation.navigate('Home');
  };

  const handleDemoLogin = () => {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    setError('');
    navigation.navigate('Home');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>

        {/* Logo */}
        <View style={styles.logoWrapper}>
          <CoJourneyLogo size="medium" showText={true} dark={isDark} />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>Welcome back 👋</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Sign in to your CoJourney account
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Input
            label="Email"
            leftIcon="✉️"
            placeholder="you@example.com"
            value={email}
            onChangeText={text => { setEmail(text); setError(''); }}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Input
            label="Password"
            leftIcon="🔒"
            rightIcon={showPassword ? '👁️' : '👁️‍🗨️'}
            onRightIconPress={() => setShowPassword(v => !v)}
            placeholder="••••••••"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={text => { setPassword(text); setError(''); }}
          />

          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : null}

          {/* Sign In */}
          <Button
            title="Sign In"
            onPress={handleSignIn}
            variant="primary"
            size="large"
            style={styles.signInBtn}
          />

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            <Text style={[styles.dividerLabel, { color: theme.textMuted }]}>or</Text>
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
          </View>

          {/* Demo User */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleDemoLogin}
            style={[
              styles.demoBtn,
              { backgroundColor: isDark ? '#1C2E42' : '#F0FDF9', borderColor: theme.primary + '55' },
            ]}>
            <Text style={[styles.demoBtnTitle, { color: theme.primary }]}>🚀 Demo User</Text>
            <Text style={[styles.demoBtnSub, { color: theme.textSecondary }]}>
              {DEMO_EMAIL} · {DEMO_PASSWORD}
            </Text>
          </TouchableOpacity>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.textSecondary }]}>
              Don't have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={[styles.registerLink, { color: theme.primary }]}>Sign up</Text>
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
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 36,
    paddingBottom: 40,
  },
  logoWrapper: {
    alignItems: 'center',
    marginBottom: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  title: {
    fontSize: Typography.fontSizes.xxl,
    fontWeight: Typography.fontWeights.extrabold,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: Typography.fontSizes.base,
    marginTop: 6,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  errorText: {
    color: '#EF4444',
    fontSize: Typography.fontSizes.sm,
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: Typography.fontWeights.medium,
  },
  signInBtn: {
    marginTop: 6,
    marginBottom: 20,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerLabel: {
    fontSize: Typography.fontSizes.xs,
  },
  demoBtn: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    alignItems: 'center',
    marginBottom: 24,
  },
  demoBtnTitle: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.bold,
    marginBottom: 2,
  },
  demoBtnSub: {
    fontSize: Typography.fontSizes.xs,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: Typography.fontSizes.base,
  },
  registerLink: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.bold,
  },
});
