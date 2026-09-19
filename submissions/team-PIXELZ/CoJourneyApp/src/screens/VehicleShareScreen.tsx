import React, { useState } from 'react';
import {
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
import { VehicleType } from '../types';

interface VehicleShareScreenProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
    goBack: () => void;
  };
}

export const VehicleShareScreen: React.FC<VehicleShareScreenProps> = ({ navigation }) => {
  const { journeys, createJourney } = useJourney();
  const [showPostForm, setShowPostForm] = useState(false);

  // Form State
  const [from, setFrom] = useState('College');
  const [to, setTo] = useState('Kollam');
  const [time, setTime] = useState('5:00 PM');
  const [vehicleType, setVehicleType] = useState<VehicleType>('Car');
  const [availableSeats, setAvailableSeats] = useState('2');
  const [contribution, setContribution] = useState('50');

  const vehicleJourneys = journeys.filter(j => j.cooperationType === 'share_vehicle');

  const handlePostVehicle = () => {
    const created = createJourney({
      from: from.trim(),
      to: to.trim(),
      time: time.trim(),
      cooperationType: 'share_vehicle',
      vehicleDetails: {
        vehicleType,
        availableSeats: parseInt(availableSeats, 10) || 1,
        travelContribution: parseInt(contribution, 10) || 0,
      },
    });

    setShowPostForm(false);
    navigation.navigate('Matching', { targetJourney: created });
  };

  return (
    <View style={styles.container}>
      <Header
        title="Share Vehicle"
        subtitle="Offer empty seats on your scheduled trip"
        onBack={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity
            onPress={() => setShowPostForm(!showPostForm)}
            style={styles.toggleBtn}>
            <Text style={styles.toggleBtnText}>
              {showPostForm ? '✕ Close' : '+ Offer Seats'}
            </Text>
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Banner */}
        <View style={styles.banner}>
          <Text style={styles.bannerIcon}>🚗</Text>
          <View style={styles.bannerTextCol}>
            <Text style={styles.bannerTitle}>Cooperative Seat Sharing</Text>
            <Text style={styles.bannerSubtitle}>
              Traveling by car or bike anyway? Help fellow commuters and share fuel costs cooperatively.
            </Text>
          </View>
        </View>

        {/* Post Form */}
        {showPostForm && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Offer Seats on Your Route</Text>

            <Input
              label="Starting From"
              placeholder="e.g. College Main Gate"
              value={from}
              onChangeText={setFrom}
            />

            <Input
              label="Going To"
              placeholder="e.g. Kollam / Town"
              value={to}
              onChangeText={setTo}
            />

            <Input
              label="Departure Time"
              placeholder="e.g. 5:00 PM"
              value={time}
              onChangeText={setTime}
            />

            <Text style={styles.fieldLabel}>Vehicle Type</Text>
            <View style={styles.chipsRow}>
              {(['Car', 'Two-wheeler', 'Auto'] as VehicleType[]).map(vt => (
                <TouchableOpacity
                  key={vt}
                  onPress={() => setVehicleType(vt)}
                  style={[styles.chip, vehicleType === vt && styles.chipActive]}>
                  <Text
                    style={[styles.chipText, vehicleType === vt && styles.chipTextActive]}>
                    {vt}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Input
              label="Available Seats"
              placeholder="2"
              keyboardType="numeric"
              value={availableSeats}
              onChangeText={setAvailableSeats}
            />

            <Input
              label="Travel Contribution (₹/person)"
              placeholder="50"
              keyboardType="numeric"
              value={contribution}
              onChangeText={setContribution}
              hint="Fair fuel sharing token. Direct peer settlement; NO payment gateway."
            />

            <Button
              title="Publish Seats & Find Travelers"
              onPress={handlePostVehicle}
              variant="primary"
              size="large"
              style={styles.submitBtn}
            />
          </View>
        )}

        {/* Available Vehicle Shares Feed */}
        <Text style={styles.feedHeader}>Available Vehicle Shares</Text>
        {vehicleJourneys.map(journey => (
          <JourneyCard
            key={journey.id}
            journey={journey}
            onPress={() => navigation.navigate('JourneyDetails', { journey })}
            onActionPress={() => navigation.navigate('JourneyDetails', { journey })}
            actionLabel="Request Seat"
          />
        ))}
      </ScrollView>
    </View>
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
    flexDirection: 'row',
    backgroundColor: '#DBEAFE',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    alignItems: 'center',
  },
  bannerIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  bannerTextCol: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E3A8A',
  },
  bannerSubtitle: {
    fontSize: 12,
    color: '#1E40AF',
    marginTop: 2,
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
  formTitle: {
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
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
  },
  chipActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  chipText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#2563EB',
    fontWeight: '700',
  },
  submitBtn: {
    marginTop: 6,
  },
  feedHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 10,
  },
});
