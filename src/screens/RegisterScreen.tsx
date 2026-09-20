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
import { Input } from '../components/Input';
import { sendMagicLink } from '../services/auth';
import { useTheme } from '../theme/ThemeContext';
import { Typography } from '../theme/theme';

interface RegisterScreenProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
    goBack: () => void;
  };
}

type GenderOption = 'Male' | 'Female' | 'Prefer not to say';

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
 
  const { theme } = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
 const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<GenderOption>('Male');
  const [agreedGuidelines, setAgreedGuidelines] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
  if (!name.trim()) {
    setError('Please enter your full name');
    return;
  }

  if (!email.trim()) {
    setError('Please enter your email address');
    return;
  }

  if (!phone.trim()) {
    setError('Please enter your phone number');
    return;
  }

  if (!agreedGuidelines) {
    setError('Please agree to the community guidelines to proceed');
    return;
  }

  setLoading(true);
  setError('');

  try {
    await sendMagicLink(
      email.trim(),
      name.trim(),
      phone.trim(),
      gender === 'Prefer not to say' ? 'Other' : gender,
    );

    Alert.alert(
      'Check your email',
      `We sent a verification link to ${email.trim()}. Open the link to continue.`,
      [
        {
          text: 'OK',
          onPress: () =>
            navigation.navigate('Login', {
              email: email.trim(),
            }),
        },
      ],
    );
  } catch (err: unknown) {
    setError(err instanceof Error ? err.message : 'Unable to send verification email.');
  } finally {
    setLoading(false);
  }
};

  const handleShowGuidelines = () => {
    Alert.alert(
      'Community Guidelines',
      '1. CoJourney is built on mutual respect and shared journeys.\n2. Respect your fellow travelers at all times.\n3. Only carry verified, legal, and permitted items.\n4. Arrive at meeting points punctually.\n5. Keep cooperation safe and transparent.'
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        {/* Back Button */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.backBtn}>
          <Text style={[styles.backArrow, { color: theme.textPrimary }]}>←</Text>
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>Create your CoJourney account</Text>
        </View>

        {/* Form Fields matching Reference Screen 6 */}
        <View style={styles.form}>
          <Input
            label="Name"
            placeholder="Full name"
            value={name}
            onChangeText={setName}
          />

          <Input
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

         <Input
  label="Phone"
  placeholder="+91 9876543210"
  value={phone}
  onChangeText={setPhone}
  keyboardType="phone-pad"
/>

<Text
  style={{
    color: theme.textSecondary,
    fontSize: Typography.fontSizes.sm,
    marginBottom: 16,
  }}>
  We'll send a secure verification link to your email.
</Text>
          

          {/* Gender Selector with Radio Buttons */}
          <View style={styles.genderSection}>
            <Text style={[styles.genderLabel, { color: theme.textSecondary }]}>Gender</Text>
            <View style={styles.radioGroup}>
              {(['Male', 'Female', 'Prefer not to say'] as GenderOption[]).map(option => (
                <TouchableOpacity
                  key={option}
                  activeOpacity={0.8}
                  onPress={() => setGender(option)}
                  style={styles.radioButtonContainer}>
                  <View
                    style={[
                      styles.radioCircle,
                      { borderColor: theme.border },
                      gender === option && [styles.radioCircleSelected, { borderColor: theme.primary }],
                    ]}>
                    {gender === option && <View style={[styles.radioDot, { backgroundColor: theme.primary }]} />}
                  </View>
                  <Text
                    style={[
                      styles.radioLabel,
                      { color: theme.textSecondary },
                      gender === option && [styles.radioLabelSelected, { color: theme.textPrimary }],
                    ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Community Guidelines Checkbox */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setAgreedGuidelines(!agreedGuidelines)}
            style={styles.checkboxContainer}>
            <View
              style={[
                styles.checkbox,
                { borderColor: theme.border },
                agreedGuidelines && [styles.checkboxChecked, { backgroundColor: theme.primary, borderColor: theme.primary }],
              ]}>
              {agreedGuidelines && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <View style={styles.guidelinesTextWrapper}>
              <Text style={[styles.guidelinesText, { color: theme.textSecondary }]}>
                I agree to the{' '}
                <Text onPress={handleShowGuidelines} style={[styles.guidelinesLink, { color: theme.primary }]}>
                  community guidelines
                </Text>
              </Text>
            </View>
          </TouchableOpacity>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* Create Account CTA */}
          <Button
            title={loading ? 'Sending Link...' : 'Verify Email'}
            onPress={handleRegister}
            variant="primary"
            size="large"
            disabled={loading}
            style={styles.submitBtn}
          />

          {/* Footer - Login link */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.textSecondary }]}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={[styles.loginLinkText, { color: theme.primary }]}>Login</Text>
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
    paddingTop: 16,
    paddingBottom: 40,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginBottom: 8,
  },
  backArrow: {
    fontSize: 26,
    fontWeight: '300',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.extrabold,
    lineHeight: 28,
  },
  form: {
    width: '100%',
  },
  genderSection: {
    marginBottom: 16,
  },
  genderLabel: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.medium,
    marginBottom: 8,
  },
  radioGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 16,
  },
  radioButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  radioCircleSelected: {
    borderWidth: 2,
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  radioLabel: {
    fontSize: Typography.fontSizes.sm,
  },
  radioLabelSelected: {
    fontWeight: Typography.fontWeights.semibold,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkboxChecked: {},
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  guidelinesTextWrapper: {
    flex: 1,
  },
  guidelinesText: {
    fontSize: Typography.fontSizes.sm,
  },
  guidelinesLink: {
    fontWeight: Typography.fontWeights.semibold,
    textDecorationLine: 'underline',
  },
  errorText: {
    color: '#EF4444',
    fontSize: Typography.fontSizes.sm,
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: Typography.fontWeights.medium,
  },
  submitBtn: {
    marginTop: 8,
    marginBottom: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: Typography.fontSizes.base,
  },
  loginLinkText: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.bold,
  },
});
