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
import { Header } from '../components/Header';
import { Input } from '../components/Input';
import { useJourney } from '../context/JourneyContext';

interface RegisterScreenProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
    goBack: () => void;
  };
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const { register } = useJourney();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [error, setError] = useState('');

  const handleRegister = () => {
    if (!name.trim() || !email.trim()) {
      setError('Please provide your name and email');
      return;
    }
    register(name.trim(), email.trim(), gender, phone);
    navigation.navigate('Home');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}>
      <Header title="Join CoJourney" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>Cooperative Journey Community</Text>
          <Text style={styles.bannerSubtitle}>
            Help someone along your daily route. Safe, verified, and community-driven.
          </Text>
        </View>

        <View style={styles.card}>
          <Input
            label="Full Name"
            leftIcon="👤"
            placeholder="e.g. Vikram Sharma"
            value={name}
            onChangeText={t => {
              setName(t);
              setError('');
            }}
          />

          <Input
            label="Email Address"
            leftIcon="✉️"
            placeholder="e.g. vikram@example.com"
            value={email}
            onChangeText={t => {
              setEmail(t);
              setError('');
            }}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input
            label="Password"
            leftIcon="🔒"
            placeholder="Choose a password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <Input
            label="Phone Number (Optional)"
            leftIcon="📱"
            placeholder="+91 98765 00000"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            hint="Used for simulated SMS community verification badge"
          />

          {/* Gender Selector */}
          <Text style={styles.genderLabel}>Gender (for companion preference matching)</Text>
          <View style={styles.genderRow}>
            {(['Male', 'Female', 'Other'] as const).map(g => (
              <TouchableOpacity
                key={g}
                onPress={() => setGender(g)}
                style={[styles.genderChip, gender === g && styles.genderChipActive]}>
                <Text
                  style={[
                    styles.genderChipText,
                    gender === g && styles.genderChipTextActive,
                  ]}>
                  {g}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Trust Guarantee Note */}
          <View style={styles.trustBadgeNotice}>
            <Text style={styles.trustBadgeIcon}>🛡️</Text>
            <View style={styles.trustBadgeContent}>
              <Text style={styles.trustBadgeTitle}>Instant Starter Trust: 70/100</Text>
              <Text style={styles.trustBadgeDesc}>
                All new accounts receive a starter trust score to safely begin cooperating.
              </Text>
            </View>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Button
            title="Create CoJourney Account"
            onPress={handleRegister}
            variant="primary"
            size="large"
            style={styles.submitButton}
          />
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
  content: {
    padding: 16,
  },
  banner: {
    marginBottom: 16,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  bannerSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    lineHeight: 18,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  genderLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  genderChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  genderChipActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  genderChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  genderChipTextActive: {
    color: '#2563EB',
    fontWeight: '700',
  },
  trustBadgeNotice: {
    flexDirection: 'row',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  trustBadgeIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  trustBadgeContent: {
    flex: 1,
  },
  trustBadgeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#15803D',
  },
  trustBadgeDesc: {
    fontSize: 11,
    color: '#166534',
    marginTop: 2,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 12,
    marginBottom: 10,
    textAlign: 'center',
  },
  submitButton: {
    marginTop: 6,
  },
});
