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
import { Header } from '../components/Header';
import { Input } from '../components/Input';
import { JourneyCard } from '../components/JourneyCard';
import { useJourney } from '../context/JourneyContext';
import { ItemSize } from '../types';

interface CarryItemScreenProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
    goBack: () => void;
  };
}

export const CarryItemScreen: React.FC<CarryItemScreenProps> = ({ navigation }) => {
  const { journeys, createJourney } = useJourney();
  const [showPostForm, setShowPostForm] = useState(false);

  // Form state
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [itemName, setItemName] = useState('');
  const [description, setDescription] = useState('');
  const [size, setSize] = useState<ItemSize>('Book / Document');
  const [suggestedTip, setSuggestedTip] = useState('');
  const [isPermitted, setIsPermitted] = useState(true);

  const carryJourneys = journeys.filter(j => j.cooperationType === 'carry_along');

  const handlePostCarry = async () => {
    if (!isPermitted) {
      Alert.alert(
        'Permitted Items Only',
        'CoJourney strictly permits small non-hazardous documents and parcels.'
      );
      return;
    }

    const created = await createJourney({
      from: from.trim(),
      to: to.trim(),
      time: '9:00 AM',
      cooperationType: 'carry_along',
      meetingPoint: `${from} Gate`,
      itemDetails: {
        item: itemName.trim(),
        description: description.trim(),
        size,
        suggestedTip: parseInt(suggestedTip, 10) || 20,
        isPermitted,
      },
    });

    if (!created) {
      Alert.alert('Unable to post', 'Please sign in and try again.');
      return;
    }

    setShowPostForm(false);
    navigation.navigate('Matching', { journeyId: created.id, journey: created });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}>
      <Header
        title="Carry Along Hub"
        subtitle="Deliver small permitted items along existing journeys"
        onBack={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity
            onPress={() => setShowPostForm(!showPostForm)}
            style={styles.toggleBtn}>
            <Text style={styles.toggleBtnText}>
              {showPostForm ? '✕ Close' : '+ Post Item'}
            </Text>
          </TouchableOpacity>
        }
      />

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        {/* Innovation Banner */}
        <View style={styles.banner}>
          <Text style={styles.bannerBadge}>🌟 KEY INNOVATION</Text>
          <Text style={styles.bannerTitle}>Journey Exchange: Carry Along</Text>
          <Text style={styles.bannerText}>
            "Already travelling somewhere? Carry a small permitted document or package for a student or neighbor on your way."
          </Text>
        </View>

        {/* Permitted Guidelines Box */}
        <View style={styles.guidelinesBox}>
          <Text style={styles.guidelinesTitle}>🛡️ Permitted Item Guidelines</Text>
          <Text style={styles.guidelinesItem}>✓ Permitted: Study materials, sealed envelopes, books, keys, small parcels</Text>
          <Text style={styles.guidelinesProhibited}>
            ✕ Strictly Prohibited: Weapons, drugs, hazardous chemicals, cash, illegal or suspicious items
          </Text>
        </View>

        {/* Post Form (if active) */}
        {showPostForm && (
          <View style={styles.formCard}>
            <Text style={styles.formHeader}>Post a Carry Along Request</Text>

            <Input
              label="Pickup From"
              placeholder="e.g. Railway Station / City Center"
              value={from}
              onChangeText={setFrom}
            />

            <Input
              label="Deliver To"
              placeholder="e.g. College / Campus Admin"
              value={to}
              onChangeText={setTo}
            />

            <Input
              label="Item Name"
              placeholder="e.g. Lab Manual / Document Envelope"
              value={itemName}
              onChangeText={setItemName}
            />

            <Input
              label="Item Description"
              placeholder="Brief details about the parcel"
              value={description}
              onChangeText={setDescription}
            />

            <Text style={styles.fieldLabel}>Package Size</Text>
            <View style={styles.chipsRow}>
              {(['Small Envelope', 'Book / Document', 'Pocket Parcel', 'Medium Box'] as ItemSize[]).map(sz => (
                <TouchableOpacity
                  key={sz}
                  onPress={() => setSize(sz)}
                  style={[styles.chip, size === sz && styles.chipActive]}>
                  <Text style={[styles.chipText, size === sz && styles.chipTextActive]}>
                    {sz}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Input
              label="Suggested Community Tip (₹)"
              placeholder="25"
              keyboardType="numeric"
              value={suggestedTip}
              onChangeText={setSuggestedTip}
              hint="Suggested token of appreciation. No payment gateway required."
            />

            <TouchableOpacity
              onPress={() => setIsPermitted(!isPermitted)}
              style={styles.checkboxRow}>
              <View style={[styles.checkbox, isPermitted && styles.checkboxActive]}>
                {isPermitted && <Text style={styles.checkText}>✓</Text>}
              </View>
              <Text style={styles.checkboxLabel}>
                I confirm this is a permitted, safe personal item.
              </Text>
            </TouchableOpacity>

            <Button
              title="Find Travelers Along Route"
              onPress={handlePostCarry}
              variant="primary"
              size="large"
              style={styles.submitBtn}
            />
          </View>
        )}

        {/* Active Carry Along Listings */}
        <Text style={styles.feedHeader}>Available Carry Along Journeys</Text>
        {carryJourneys.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyText}>No carry requests right now</Text>
          </View>
        ) : (
          carryJourneys.map(journey => (
            <JourneyCard
              key={journey.id}
              journey={journey}
              onPress={() => navigation.navigate('JourneyDetails', { journey })}
              onActionPress={() => navigation.navigate('JourneyDetails', { journey })}
              actionLabel="Offer to Carry This Item"
            />
          ))
        )}
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
    paddingBottom: 30,
  },
  toggleBtn: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  toggleBtnText: {
    color: '#1D4ED8',
    fontSize: 12,
    fontWeight: '700',
  },
  banner: {
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: 14,
  },
  bannerBadge: {
    color: '#B45309',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  bannerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#92400E',
  },
  bannerText: {
    fontSize: 13,
    color: '#78350F',
    marginTop: 4,
    lineHeight: 18,
  },
  guidelinesBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  guidelinesTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 4,
  },
  guidelinesItem: {
    fontSize: 11,
    color: '#16A34A',
    lineHeight: 16,
  },
  guidelinesProhibited: {
    fontSize: 11,
    color: '#DC2626',
    marginTop: 3,
    lineHeight: 16,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginBottom: 16,
  },
  formHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
  },
  chipActive: {
    backgroundColor: '#FEF3C7',
    borderColor: '#D97706',
  },
  chipText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#92400E',
    fontWeight: '700',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  checkboxActive: {
    backgroundColor: '#16A34A',
    borderColor: '#16A34A',
  },
  checkText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 12,
  },
  checkboxLabel: {
    fontSize: 12,
    color: '#334155',
    flex: 1,
  },
  submitBtn: {
    marginTop: 4,
  },
  feedHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 10,
  },
  emptyState: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  emptyText: {
    color: '#64748B',
    fontSize: 13,
  },
});
