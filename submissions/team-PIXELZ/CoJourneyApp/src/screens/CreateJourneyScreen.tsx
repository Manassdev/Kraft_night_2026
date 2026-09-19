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
import { useJourney } from '../context/JourneyContext';
import {
  CompanionPreference,
  CooperationType,
  ItemSize,
  TravelType,
  VehicleType,
} from '../types';

interface CreateJourneyScreenProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
    goBack: () => void;
  };
  route?: {
    params?: {
      mode?: CooperationType;
      destination?: string;
    };
  };
}

export const CreateJourneyScreen: React.FC<CreateJourneyScreenProps> = ({
  navigation,
  route,
}) => {
  const { createJourney } = useJourney();
  const initialMode = route?.params?.mode || 'share_vehicle';
  const initialDest = route?.params?.destination || 'Kollam';

  const [mode, setMode] = useState<CooperationType>(initialMode);
  const [from, setFrom] = useState('College');
  const [to, setTo] = useState(initialDest);
  const [time, setTime] = useState('5:00 PM');
  const [meetingPoint, setMeetingPoint] = useState('College Gate 1');
  const [notes, setNotes] = useState('');

  // Daily Walk field
  const [companionPref, setCompanionPref] = useState<CompanionPreference>('Any');

  // Share Vehicle fields
  const [vehicleType, setVehicleType] = useState<VehicleType>('Car');
  const [availableSeats, setAvailableSeats] = useState('2');
  const [travelContribution, setTravelContribution] = useState('50');

  // Carry Along fields
  const [itemName, setItemName] = useState('Document Folder');
  const [itemDescription, setItemDescription] = useState('Sealed academic papers for department');
  const [itemSize, setItemSize] = useState<ItemSize>('Book / Document');
  const [suggestedTip, setSuggestedTip] = useState('20');
  const [isPermitted, setIsPermitted] = useState(true);

  // Join Journey fields
  const [travelType, setTravelType] = useState<TravelType>('Car');

  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!from.trim() || !to.trim()) {
      setError('Please provide both departure and destination points');
      return;
    }

    if (mode === 'carry_along' && !isPermitted) {
      Alert.alert(
        'Permitted Items Only',
        'CoJourney strictly permits only small legal, non-hazardous personal items. Please confirm to proceed.'
      );
      return;
    }

    const newJourney = createJourney({
      from: from.trim(),
      to: to.trim(),
      time: time.trim() || '5:00 PM',
      cooperationType: mode,
      meetingPoint: meetingPoint.trim() || `${from} Gate`,
      notes: notes.trim(),
      companionPreference: mode === 'daily_walk' ? companionPref : undefined,
      travelType: mode === 'join_journey' ? travelType : undefined,
      vehicleDetails:
        mode === 'share_vehicle'
          ? {
              vehicleType,
              availableSeats: parseInt(availableSeats, 10) || 1,
              travelContribution: parseInt(travelContribution, 10) || 0,
            }
          : undefined,
      itemDetails:
        mode === 'carry_along'
          ? {
              item: itemName.trim() || 'Small Item',
              description: itemDescription.trim(),
              size: itemSize,
              suggestedTip: parseInt(suggestedTip, 10) || 0,
              isPermitted,
            }
          : undefined,
    });

    // Navigate to matching screen to show instant rule-based matches
    navigation.navigate('Matching', { targetJourney: newJourney });
  };

  const modeOptions: { id: CooperationType; label: string; icon: string }[] = [
    { id: 'daily_walk', label: 'Daily Walk', icon: '🚶' },
    { id: 'carry_along', label: 'Carry Along', icon: '📦' },
    { id: 'share_vehicle', label: 'Share Vehicle', icon: '🚗' },
    { id: 'join_journey', label: 'Join Journey', icon: '🤝' },
  ];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}>
      <Header
        title="Create Journey"
        subtitle="Make your existing journey useful to others"
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Mode Selector */}
        <Text style={styles.sectionHeader}>Choose Cooperation Mode</Text>
        <View style={styles.modeSelectorRow}>
          {modeOptions.map(opt => (
            <TouchableOpacity
              key={opt.id}
              activeOpacity={0.8}
              onPress={() => setMode(opt.id)}
              style={[
                styles.modeOption,
                mode === opt.id && styles.modeOptionActive,
              ]}>
              <Text style={styles.modeOptionIcon}>{opt.icon}</Text>
              <Text
                style={[
                  styles.modeOptionLabel,
                  mode === opt.id && styles.modeOptionLabelActive,
                ]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Common Journey Route Fields */}
        <View style={styles.formCard}>
          <Text style={styles.cardHeader}>Journey Route & Schedule</Text>

          <Input
            label="Departure Point (From)"
            leftIcon="📍"
            placeholder="e.g. College / Campus Gate"
            value={from}
            onChangeText={t => {
              setFrom(t);
              setError('');
            }}
          />

          <Input
            label="Destination (To)"
            leftIcon="🏁"
            placeholder="e.g. Kollam / Town / Station"
            value={to}
            onChangeText={t => {
              setTo(t);
              setError('');
            }}
          />

          <Input
            label="Travel Time"
            leftIcon="🕒"
            placeholder="e.g. 5:00 PM"
            value={time}
            onChangeText={setTime}
          />

          <Input
            label="Meeting Point"
            leftIcon="🤝"
            placeholder="e.g. College Gate 1 / Bus Stop"
            value={meetingPoint}
            onChangeText={setMeetingPoint}
          />

          {/* Mode-Specific Fields */}

          {/* 1. Daily Walk */}
          {mode === 'daily_walk' && (
            <View style={styles.modeSpecificBox}>
              <Text style={styles.subHeader}>🚶 Daily Walk Preferences</Text>
              <Text style={styles.fieldLabel}>Companion Preference</Text>
              <View style={styles.radioRow}>
                {(['Any', 'Male', 'Female'] as CompanionPreference[]).map(pref => (
                  <TouchableOpacity
                    key={pref}
                    onPress={() => setCompanionPref(pref)}
                    style={[
                      styles.choiceChip,
                      companionPref === pref && styles.choiceChipActive,
                    ]}>
                    <Text
                      style={[
                        styles.choiceText,
                        companionPref === pref && styles.choiceTextActive,
                      ]}>
                      {pref}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* 2. Carry Along */}
          {mode === 'carry_along' && (
            <View style={styles.modeSpecificBox}>
              <Text style={styles.subHeader}>📦 Carry Along Item Details</Text>
              <Text style={styles.coopNotice}>
                Help deliver a small permitted item along your existing journey route.
              </Text>

              <Input
                label="Item Name"
                placeholder="e.g. Sealed Lab Notes / Document Envelope"
                value={itemName}
                onChangeText={setItemName}
              />

              <Input
                label="Item Description"
                placeholder="Brief description of the package"
                value={itemDescription}
                onChangeText={setItemDescription}
              />

              <Text style={styles.fieldLabel}>Package Size</Text>
              <View style={styles.radioRow}>
                {(
                  [
                    'Small Envelope',
                    'Book / Document',
                    'Pocket Parcel',
                    'Medium Box',
                  ] as ItemSize[]
                ).map(sz => (
                  <TouchableOpacity
                    key={sz}
                    onPress={() => setItemSize(sz)}
                    style={[
                      styles.choiceChip,
                      itemSize === sz && styles.choiceChipActive,
                    ]}>
                    <Text
                      style={[
                        styles.choiceText,
                        itemSize === sz && styles.choiceTextActive,
                      ]}>
                      {sz}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Input
                label="Suggested Tip (₹)"
                leftIcon="💵"
                placeholder="20"
                keyboardType="numeric"
                value={suggestedTip}
                onChangeText={setSuggestedTip}
                hint="Suggested contribution only. No payment gateway required."
              />

              {/* Permitted confirmation checkbox */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setIsPermitted(!isPermitted)}
                style={styles.checkboxRow}>
                <View
                  style={[
                    styles.checkboxBox,
                    isPermitted && styles.checkboxBoxChecked,
                  ]}>
                  {isPermitted && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.checkboxLabel}>
                  I confirm this is a <Text style={styles.bold}>small permitted item</Text>. No
                  hazardous, illegal, or dangerous goods.
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* 3. Share Vehicle */}
          {mode === 'share_vehicle' && (
            <View style={styles.modeSpecificBox}>
              <Text style={styles.subHeader}>🚗 Vehicle Sharing Details</Text>

              <Text style={styles.fieldLabel}>Vehicle Type</Text>
              <View style={styles.radioRow}>
                {(['Car', 'Two-wheeler', 'Auto'] as VehicleType[]).map(vt => (
                  <TouchableOpacity
                    key={vt}
                    onPress={() => setVehicleType(vt)}
                    style={[
                      styles.choiceChip,
                      vehicleType === vt && styles.choiceChipActive,
                    ]}>
                    <Text
                      style={[
                        styles.choiceText,
                        vehicleType === vt && styles.choiceTextActive,
                      ]}>
                      {vt}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Input
                label="Available Seats"
                leftIcon="💺"
                placeholder="2"
                keyboardType="numeric"
                value={availableSeats}
                onChangeText={setAvailableSeats}
              />

              <Input
                label="Suggested Travel Contribution (₹/person)"
                leftIcon="💰"
                placeholder="50"
                keyboardType="numeric"
                value={travelContribution}
                onChangeText={setTravelContribution}
                hint="Fair fuel sharing contribution. Cash/direct cooperation only."
              />
            </View>
          )}

          {/* 4. Join Journey */}
          {mode === 'join_journey' && (
            <View style={styles.modeSpecificBox}>
              <Text style={styles.subHeader}>🤝 Join Journey Details</Text>
              <Text style={styles.fieldLabel}>Travel Type</Text>
              <View style={styles.radioRow}>
                {(['Car', 'Bus', 'Bike', 'Walk', 'Other'] as TravelType[]).map(tt => (
                  <TouchableOpacity
                    key={tt}
                    onPress={() => setTravelType(tt)}
                    style={[
                      styles.choiceChip,
                      travelType === tt && styles.choiceChipActive,
                    ]}>
                    <Text
                      style={[
                        styles.choiceText,
                        travelType === tt && styles.choiceTextActive,
                      ]}>
                      {tt}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <Input
            label="Additional Notes (Optional)"
            placeholder="e.g. Taking the bypass route; luggage space available"
            multiline
            numberOfLines={2}
            value={notes}
            onChangeText={setNotes}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Button
            title="Publish Journey & Find Matches"
            onPress={handleSubmit}
            variant="primary"
            size="large"
            icon="🎯"
            style={styles.submitBtn}
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
    paddingBottom: 40,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 10,
  },
  modeSelectorRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  modeOption: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    elevation: 1,
  },
  modeOptionActive: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  modeOptionIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  modeOptionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
    textAlign: 'center',
  },
  modeOptionLabelActive: {
    color: '#2563EB',
    fontWeight: '700',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  cardHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 14,
  },
  modeSpecificBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  subHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 6,
  },
  coopNotice: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 12,
    lineHeight: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
    marginTop: 6,
  },
  radioRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  choiceChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  choiceChipActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  choiceText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  choiceTextActive: {
    color: '#2563EB',
    fontWeight: '700',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingVertical: 4,
  },
  checkboxBox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkboxBoxChecked: {
    backgroundColor: '#16A34A',
    borderColor: '#16A34A',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 12,
    color: '#334155',
    lineHeight: 16,
  },
  bold: {
    fontWeight: '700',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 12,
    marginBottom: 10,
    textAlign: 'center',
  },
  submitBtn: {
    marginTop: 8,
  },
});
