import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';

interface VenueFormData {
  venue_name: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
}

interface VenueFormProps {
  onSubmit: (venueData: VenueFormData) => void;
  initialData?: VenueFormData;
}

export default function VenueForm({ onSubmit, initialData }: VenueFormProps) {
  const [venueName, setVenueName] = useState(initialData?.venue_name || '');
  const [street, setStreet] = useState(initialData?.address?.street || '');
  const [city, setCity] = useState(initialData?.address?.city || '');
  const [state, setState] = useState(initialData?.address?.state || '');
  const [zip, setZip] = useState(initialData?.address?.zip || '');

  const handleSubmit = () => {
    if (!venueName.trim()) {
      Alert.alert('Error', 'Please enter venue name');
      return;
    }

    if (!street.trim() || !city.trim() || !state.trim() || !zip.trim()) {
      Alert.alert('Error', 'Please enter a venue name');
      return;
    }

    const venueData: VenueFormData = {
      venue_name: venueName.trim(),
      address: {
        street: street.trim(),
        city: city.trim(),
        state: state.trim(),
        zip: zip.trim(),
      },
    };

    onSubmit(venueData);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SEARCH</Text>

      <View style={styles.inputGroup}>
        <TextInput
          style={styles.input}
          value={venueName}
          onChangeText={setVenueName}
          placeholder="Enter venue name"
          placeholderTextColor="#999"
        />
      </View>


      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Save Venue Information</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    elevation: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#E8886B',
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
    color: '#555',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    color: '#333',
  },
  row: {
    flexDirection: 'row',
  },
  submitButton: {
    backgroundColor: '#E8886B',
    padding: 15,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
