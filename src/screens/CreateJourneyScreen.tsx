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
import { useTheme } from '../theme/ThemeContext';
import { Radius, Typography } from '../theme/theme';
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
  const { theme, isDark } = useTheme();

  // If a mode was passed from home, start with that form, otherwise show selection (Screen 9)
  const [selectedMode, setSelectedMode] = useState<CooperationType | null>(
    route?.params?.mode || null
  );

  // Common Fields
  const [from, setFrom] = useState('');
  const [to, setTo] = useState(route?.params?.destination || '');
  const [time, setTime] = useState('');
  const [error, setError] = useState('');

  // Daily Walk Fields
  const [companionPreference, setCompanionPreference] = useState<CompanionPreference>('Any');

  // Carry Along Fields
  const [itemType, setItemType] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [itemSize, setItemSize] = useState<ItemSize>('Book / Document');
  const [suggestedTip, setSuggestedTip] = useState('');
  const [isPermitted, setIsPermitted] = useState(true);

  // Share Vehicle Fields
  const [vehicleType, setVehicleType] = useState<VehicleType>('Car');
  const [seats, setSeats] = useState(2);
  const [contribution, setContribution] = useState('');

  // Join Journey Fields
  const [travelType, setTravelType] = useState<TravelType>('Car');

  const handleCreate = async () => {
    if (!from.trim() || !to.trim()) {
      setError('Please provide origin and destination points');
      return;
    }

    if (selectedMode === 'carry_along' && !isPermitted) {
      Alert.alert(
        'Permitted Items Only',
        'CoJourney requires confirmation that the item is permitted and non-hazardous.'
      );
      return;
    }

    const created = await createJourney({
      from: from.trim(),
      to: to.trim(),
      time: time.trim() || '5:00 PM',
      cooperationType: selectedMode || 'share_vehicle',
      meetingPoint: `${from.trim()} Main Gate`,
      companionPreference: selectedMode === 'daily_walk' ? companionPreference : undefined,
      travelType: selectedMode === 'join_journey' ? travelType : undefined,
      vehicleDetails:
        selectedMode === 'share_vehicle'
          ? {
              vehicleType,
              availableSeats: seats,
              travelContribution: parseInt(contribution, 10) || 50,
              contribution: parseInt(contribution, 10) || 50,
            }
          : undefined,
      itemDetails:
        selectedMode === 'carry_along'
          ? {
              itemName: itemType,
              itemDescription,
              itemSize,
              suggestedTip: parseInt(suggestedTip, 10) || 20,
              isPermitted,
            }
          : undefined,
    });

    if (!created) {
      setError('Unable to create journey. Please sign in and try again.');
      return;
    }

    navigation.navigate('Matching', { journeyId: created.id, journey: created });
  };

  // Screen 9: Selection Screen if no mode chosen yet
  if (!selectedMode) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Header title="Create Journey" onBack={() => navigation.goBack()} />

        <ScrollView
          contentContainerStyle={styles.selectionContent}
          showsVerticalScrollIndicator={false}>
          <Text style={[styles.selectionTitle, { color: theme.textPrimary }]}>How do you want to cooperate?</Text>

          {/* Daily Walk Card */}
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => setSelectedMode('daily_walk')}
            style={[
              styles.largeModeCard,
              {
                backgroundColor: isDark ? '#0E2820' : theme.walkBg,
                borderColor: isDark ? '#064E3B' : theme.walkBorder,
              },
            ]}>
            <View style={[styles.largeIconCircle, { backgroundColor: isDark ? '#064E3B' : '#D1FADF' }]}>
              <Text style={styles.largeModeIcon}>🚶</Text>
            </View>
            <View style={styles.largeModeTextCol}>
              <Text style={[styles.largeModeTitle, { color: theme.textPrimary }]}>Daily Walk</Text>
              <Text style={[styles.largeModeDesc, { color: theme.textSecondary }]}>Find someone going your way</Text>
            </View>
          </TouchableOpacity>

          {/* Carry Along Card */}
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => setSelectedMode('carry_along')}
            style={[
              styles.largeModeCard,
              {
                backgroundColor: isDark ? '#261F12' : theme.carryBg,
                borderColor: isDark ? '#78350F' : theme.carryBorder,
              },
            ]}>
            <View style={[styles.largeIconCircle, { backgroundColor: isDark ? '#78350F' : '#FEF0C7' }]}>
              <Text style={styles.largeModeIcon}>📦</Text>
            </View>
            <View style={styles.largeModeTextCol}>
              <Text style={[styles.largeModeTitle, { color: theme.textPrimary }]}>Carry Along</Text>
              <Text style={[styles.largeModeDesc, { color: theme.textSecondary }]}>Carry a small permitted item</Text>
            </View>
          </TouchableOpacity>

          {/* Share Vehicle Card */}
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => setSelectedMode('share_vehicle')}
            style={[
              styles.largeModeCard,
              {
                backgroundColor: isDark ? '#102538' : theme.shareVehicleBg,
                borderColor: isDark ? '#075985' : theme.shareVehicleBorder,
              },
            ]}>
            <View style={[styles.largeIconCircle, { backgroundColor: isDark ? '#0C4A6E' : '#D1E9FF' }]}>
              <Text style={styles.largeModeIcon}>🚗</Text>
            </View>
            <View style={styles.largeModeTextCol}>
              <Text style={[styles.largeModeTitle, { color: theme.textPrimary }]}>Share Vehicle</Text>
              <Text style={[styles.largeModeDesc, { color: theme.textSecondary }]}>Share available seats</Text>
            </View>
          </TouchableOpacity>

          {/* Join Journey Card */}
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => setSelectedMode('join_journey')}
            style={[
              styles.largeModeCard,
              {
                backgroundColor: isDark ? '#221838' : theme.joinJourneyBg,
                borderColor: isDark ? '#5B21B6' : theme.joinJourneyBorder,
              },
            ]}>
            <View style={[styles.largeIconCircle, { backgroundColor: isDark ? '#4C1D95' : '#E9D7FE' }]}>
              <Text style={styles.largeModeIcon}>🤝</Text>
            </View>
            <View style={styles.largeModeTextCol}>
              <Text style={[styles.largeModeTitle, { color: theme.textPrimary }]}>Join Journey</Text>
              <Text style={[styles.largeModeDesc, { color: theme.textSecondary }]}>Travel together</Text>
            </View>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // Get screen title for the chosen mode
  const getHeaderTitle = () => {
    switch (selectedMode) {
      case 'daily_walk':
        return 'Create Daily Walk';
      case 'carry_along':
        return 'Create Carry Along';
      case 'share_vehicle':
        return 'Create Share Vehicle';
      case 'join_journey':
        return 'Create Join Journey';
      default:
        return 'Create Journey';
    }
  };

  const getButtonTitle = () => {
    switch (selectedMode) {
      case 'carry_along':
        return 'Create Carry Request';
      case 'join_journey':
        return 'Find Matches';
      default:
        return 'Create Journey';
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: theme.background }]}>
      <Header
        title={getHeaderTitle()}
        onBack={() => setSelectedMode(null)}
      />

      <ScrollView
        contentContainerStyle={styles.formScrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        {/* Screen 11: Alert for Carry Along */}
        {selectedMode === 'carry_along' && (
          <View style={[styles.carryAlert, { backgroundColor: isDark ? '#261F12' : theme.carryBg, borderColor: isDark ? '#78350F' : theme.carryBorder }]}>
            <Text style={styles.carryAlertIcon}>ℹ️</Text>
            <Text style={[styles.carryAlertText, { color: theme.carryOrange }]}>
              Only permitted, small items are allowed.
            </Text>
          </View>
        )}

        <Input
          label="From"
          placeholder="e.g. College"
          value={from}
          onChangeText={setFrom}
        />

        <Input
          label="To"
          placeholder="e.g. Kollam"
          value={to}
          onChangeText={setTo}
        />

        <Input
          label={selectedMode === 'share_vehicle' ? 'Departure' : selectedMode === 'join_journey' ? 'Travel time' : 'Time'}
          placeholder="5:00 PM"
          rightIcon="🕒"
          value={time}
          onChangeText={setTime}
        />

        {/* SCREEN 10: Daily Walk Specific Fields */}
        {selectedMode === 'daily_walk' && (
          <View style={styles.fieldSection}>
            <Text style={[styles.fieldLabel, { color: theme.textPrimary }]}>Companion preference</Text>
            <View style={styles.selectorRow}>
              {(['Any', 'Female only', 'Same college'] as CompanionPreference[]).map(cp => (
                <TouchableOpacity
                  key={cp}
                  onPress={() => setCompanionPreference(cp)}
                  style={[
                    styles.selectorChip,
                    { backgroundColor: theme.surface, borderColor: theme.border },
                    companionPreference === cp && [
                      styles.selectorChipActive,
                      { backgroundColor: theme.primaryLight, borderColor: theme.primary },
                    ],
                  ]}>
                  <Text
                    style={[
                      styles.selectorChipText,
                      { color: theme.textSecondary },
                      companionPreference === cp && [
                        styles.selectorChipTextActive,
                        { color: theme.primaryDark },
                      ],
                    ]}>
                    {cp}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* SCREEN 11: Carry Along Specific Fields */}
        {selectedMode === 'carry_along' && (
          <>
            <Input
              label="What are you carrying?"
              placeholder="e.g. Document, Keys, Small Item"
              value={itemType}
              onChangeText={setItemType}
            />

            <Input
              label="Description"
              placeholder="Assignment documents"
              value={itemDescription}
              onChangeText={setItemDescription}
            />

            <View style={styles.fieldSection}>
              <Text style={[styles.fieldLabel, { color: theme.textPrimary }]}>Size</Text>
              <View style={styles.selectorRow}>
                {(['Book / Document', 'Small Packet', 'Keys / Wallet'] as ItemSize[]).map(sz => (
                  <TouchableOpacity
                    key={sz}
                    onPress={() => setItemSize(sz)}
                    style={[
                      styles.selectorChip,
                      { backgroundColor: theme.surface, borderColor: theme.border },
                      itemSize === sz && [
                        styles.selectorChipActive,
                        { backgroundColor: theme.primaryLight, borderColor: theme.primary },
                      ],
                    ]}>
                    <Text
                      style={[
                        styles.selectorChipText,
                        { color: theme.textSecondary },
                        itemSize === sz && [
                          styles.selectorChipTextActive,
                          { color: theme.primaryDark },
                        ],
                      ]}>
                      {sz}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <Input
              label="Suggested tip"
              placeholder="20"
              leftIcon="₹"
              keyboardType="numeric"
              value={suggestedTip}
              onChangeText={setSuggestedTip}
            />

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setIsPermitted(!isPermitted)}
              style={styles.checkboxRow}>
              <View
                style={[
                  styles.checkbox,
                  { borderColor: theme.border, backgroundColor: isDark ? theme.card : '#FFFFFF' },
                  isPermitted && [styles.checkboxActive, { backgroundColor: theme.primary, borderColor: theme.primary }],
                ]}>
                {isPermitted && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={[styles.checkboxLabel, { color: theme.textPrimary }]}>This item is permitted</Text>
            </TouchableOpacity>
          </>
        )}

        {/* SCREEN 12: Share Vehicle Specific Fields */}
        {selectedMode === 'share_vehicle' && (
          <>
            <View style={styles.fieldSection}>
              <Text style={[styles.fieldLabel, { color: theme.textPrimary }]}>Vehicle</Text>
              <View style={styles.selectorRow}>
                {(['Car', 'Two-wheeler', 'Auto'] as VehicleType[]).map(vt => (
                  <TouchableOpacity
                    key={vt}
                    onPress={() => setVehicleType(vt)}
                    style={[
                      styles.selectorChip,
                      { backgroundColor: theme.surface, borderColor: theme.border },
                      vehicleType === vt && [
                        styles.selectorChipActive,
                        { backgroundColor: theme.primaryLight, borderColor: theme.primary },
                      ],
                    ]}>
                    <Text
                      style={[
                        styles.selectorChipText,
                        { color: theme.textSecondary },
                        vehicleType === vt && [
                          styles.selectorChipTextActive,
                          { color: theme.primaryDark },
                        ],
                      ]}>
                      {vt === 'Car' ? '🚗 Car' : vt === 'Two-wheeler' ? '🛵 Bike' : '🛺 Auto'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.fieldSection}>
              <Text style={[styles.fieldLabel, { color: theme.textPrimary }]}>Available seats</Text>
              <View style={[styles.counterRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <TouchableOpacity
                  onPress={() => setSeats(Math.max(1, seats - 1))}
                  style={[styles.counterBtn, { backgroundColor: isDark ? theme.card : '#FFFFFF', borderColor: theme.border }]}>
                  <Text style={[styles.counterBtnText, { color: theme.textPrimary }]}>−</Text>
                </TouchableOpacity>
                <Text style={[styles.counterValue, { color: theme.textPrimary }]}>{seats}</Text>
                <TouchableOpacity
                  onPress={() => setSeats(Math.min(6, seats + 1))}
                  style={[styles.counterBtn, { backgroundColor: isDark ? theme.card : '#FFFFFF', borderColor: theme.border }]}>
                  <Text style={[styles.counterBtnText, { color: theme.textPrimary }]}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Input
              label="Travel contribution"
              placeholder="50"
              leftIcon="₹"
              hint="Fair fuel sharing token. Direct peer settlement."
              keyboardType="numeric"
              value={contribution}
              onChangeText={setContribution}
            />
          </>
        )}

        {/* SCREEN 13: Join Journey Specific Fields */}
        {selectedMode === 'join_journey' && (
          <View style={styles.fieldSection}>
            <Text style={[styles.fieldLabel, { color: theme.textPrimary }]}>Travel type</Text>
            <View style={styles.selectorRow}>
              {(['Car', 'Bus', 'Bike', 'Walk'] as TravelType[]).map(tt => (
                <TouchableOpacity
                  key={tt}
                  onPress={() => setTravelType(tt)}
                  style={[
                    styles.selectorChip,
                    { backgroundColor: theme.surface, borderColor: theme.border },
                    travelType === tt && [
                      styles.selectorChipActive,
                      { backgroundColor: theme.primaryLight, borderColor: theme.primary },
                    ],
                  ]}>
                  <Text
                    style={[
                      styles.selectorChipText,
                      { color: theme.textSecondary },
                      travelType === tt && [
                        styles.selectorChipTextActive,
                        { color: theme.primaryDark },
                      ],
                    ]}>
                    {tt}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Button
          title={getButtonTitle()}
          onPress={handleCreate}
          variant="primary"
          size="large"
          style={styles.createBtn}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  selectionContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  selectionTitle: {
    fontSize: Typography.fontSizes.xxl,
    fontWeight: Typography.fontWeights.extrabold,
    letterSpacing: -0.4,
    marginBottom: 20,
  },
  largeModeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.lg,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  largeIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  largeModeIcon: {
    fontSize: 26,
  },
  largeModeTextCol: {
    flex: 1,
  },
  largeModeTitle: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
  },
  largeModeDesc: {
    fontSize: Typography.fontSizes.sm,
    marginTop: 2,
  },
  formScrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 36,
  },
  carryAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: 12,
    marginBottom: 16,
  },
  carryAlertIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  carryAlertText: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.semibold,
  },
  fieldSection: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.semibold,
    marginBottom: 8,
  },
  selectorRow: {
    flexDirection: 'row',
    gap: 10,
  },
  selectorChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectorChipActive: {},
  selectorChipText: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.medium,
  },
  selectorChipTextActive: {
    fontWeight: Typography.fontWeights.bold,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    justifyContent: 'space-between',
    width: 160,
  },
  counterBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterBtnText: {
    fontSize: 20,
    fontWeight: '700',
  },
  counterValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 4,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkboxActive: {},
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  checkboxLabel: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.medium,
  },
  errorText: {
    fontSize: Typography.fontSizes.sm,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 12,
  },
  createBtn: {
    marginTop: 8,
  },
});
