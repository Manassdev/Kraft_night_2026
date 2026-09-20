import React, { useState } from 'react';
import {
  Alert,
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
import { useJourney } from '../context/JourneyContext';
import { useTheme } from '../theme/ThemeContext';
import { Radius, Typography } from '../theme/theme';
interface LoginScreenProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
  };
}
export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const { login } = useJourney();
  const { theme, isDark } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [usePasswordLogin, setUsePasswordLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const handleMagicLinkLogin = async () => {
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login(email.trim());
      setMagicLinkSent(true);
      Alert.alert(
        'Magic Link Sent',
        `A secure login link has been sent to ${email.trim()}. Tap the link in your email to open CoJourney and log in.`,
        [{ text: 'OK' }]
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to send magic link. Please check your email.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordLogin = async () => {
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    if (!password) {
      setError('Please enter your password');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const success = await login(email.trim(), undefined, password);
      if (success) {
        navigation.navigate('Home');
      } else {
        setError('Invalid credentials. Please check and try again.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        {/* Top Logo */}
        <View style={styles.logoWrapper}>
          <CoJourneyLogo size="medium" showText={true} dark={isDark} />
        </View>

        {/* Header Titles */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>Welcome back 👋</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Login to your CoJourney account
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Input
            label="Email"
            leftIcon="✉️"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          {usePasswordLogin && (
            <Input
              label="Password"
              leftIcon="🔒"
              rightIcon={showPassword ? '👁️' : '👁️‍🗨️'}
              onRightIconPress={() => setShowPassword(!showPassword)}
              placeholder="••••••••"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
          )}

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {magicLinkSent && (
            <View style={[styles.successBox, { backgroundColor: isDark ? '#064E3B' : '#DCFCE7' }]}>
              <Text style={[styles.successText, { color: isDark ? '#34D399' : '#15803D' }]}>
                ✓ Magic Link sent! Open the email on this device to continue.
              </Text>
            </View>
          )}

          {/* Primary Action Button */}
          {usePasswordLogin ? (
            <Button
              title={loading ? 'Logging in...' : 'Login with Password'}
              onPress={handlePasswordLogin}
              variant="primary"
              size="large"
              disabled={loading}
              style={styles.loginBtn}
            />
          ) : (
            <Button
              title={loading ? 'Sending Magic Link...' : 'Send Magic Link'}
              onPress={handleMagicLinkLogin}
              variant="primary"
              size="large"
              disabled={loading}
              style={styles.loginBtn}
            />
          )}

          {/* Toggle Password Login */}
        <TouchableOpacity
  onPress={() => navigation.navigate('Home')}
  style={{
    marginTop: 16,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
  }}
>
  <Text style={{ color: '#111827', fontWeight: '600' }}>
    Continue with Demo Account
  </Text>
</TouchableOpacity>

          {/* Footer - Create account */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.textSecondary }]}>
              Don't have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={[styles.createAccountText, { color: theme.primary }]}>Create account</Text>
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
  successBox: {
    padding: 12,
    borderRadius: Radius.md,
    marginBottom: 16,
    alignItems: 'center',
  },
  successText: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.semibold,
    textAlign: 'center',
  },
  loginBtn: {
    marginTop: 6,
    marginBottom: 14,
  },
  toggleAuthMode: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 6,
  },
  toggleAuthModeText: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.semibold,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: Typography.fontSizes.base,
  },
  createAccountText: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.bold,
  },
});
