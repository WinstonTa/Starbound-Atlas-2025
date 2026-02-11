import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';

interface VenueFormData {
  venue_name: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  coordinates?: {
    lat: number;
    lon: number;
  };
  geoapify_place_id?: string;
}

interface VenueFormProps {
  onSubmit: (venueData: VenueFormData) => void;
  initialData?: VenueFormData;
  userLocation: { lon: number; lat: number };
}

export default function VenueForm({ onSubmit, initialData, userLocation }: VenueFormProps) {
  const [venueName, setVenueName] = useState(initialData?.venue_name || '');
  const [street, setStreet] = useState(initialData?.address?.street || '');
  const [city, setCity] = useState(initialData?.address?.city || '');
  const [state, setState] = useState(initialData?.address?.state || '');
  const [zip, setZip] = useState(initialData?.address?.zip || '');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const API_URL = 'https://happymapper.vercel.app';

  const handleSearch = async () => {
    if (!venueName.trim()) {
      Alert.alert('Error', 'Please enter venue name to search');
      return;
    }

    setSearching(true);
    try {
      const response = await fetch(
        `${API_URL}/search-restaurants-by-name?name=${encodeURIComponent(venueName)}&lon=${userLocation.lon}&lat=${userLocation.lat}&radius=1000000&limit=10`
      );
      
      const result = await response.json();
      
      if (result.success) {
        setSearchResults(result.data);
        setShowSearchResults(true);
      } else {
        Alert.alert('Error', result.error || 'Search failed');
      }
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Error', 'Failed to search for venues');
    } finally {
      setSearching(false);
    }
  };

  const handleSelectVenue = (venue: any) => {
    const venueData: VenueFormData = {
      venue_name: venue.venue_name,
      address: venue.address,
      coordinates: venue.coordinates,
      geoapify_place_id: venue.geoapify_place_id,
    };

    onSubmit(venueData);
  };

  const handleSubmit = () => {
    if (!venueName.trim()) {
      Alert.alert('Error', 'Please enter venue name');
      return;
    }

    if (!street.trim() || !city.trim() || !state.trim() || !zip.trim()) {
      Alert.alert('Error', 'Please enter complete address information');
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
      <Text style={styles.title}>Please enter the venue that this deal is from</Text>

      <View style={styles.inputGroup}>
        <TextInput
          style={styles.input}
          value={venueName}
          onChangeText={setVenueName}
          placeholder="Enter venue name"
          placeholderTextColor="#999"
        />
      </View>

      <TouchableOpacity 
        style={[styles.submitButton, searching && styles.disabledButton]} 
        onPress={handleSearch}
        disabled={searching}
      >
        {searching ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.submitButtonText}>Search</Text>
        )}
      </TouchableOpacity>

      {showSearchResults && searchResults.length > 0 && (
        <View style={styles.searchResultsContainer}>
          <Text style={styles.resultsTitle}>Select a venue:</Text>
          {searchResults.map((venue, index) => (
            <TouchableOpacity
              key={venue.geoapify_place_id || index}
              style={styles.venueItem}
              onPress={() => handleSelectVenue(venue)}
            >
              <Text style={styles.venueName}>{venue.venue_name}</Text>
              <Text style={styles.venueAddress}>{venue.formatted}</Text>
              <Text style={styles.venueDistance}>
                {venue.distance_meters ? `${Math.round(venue.distance_meters)}m away` : ''}
              </Text>
            </TouchableOpacity>
          ))}
          
          <TouchableOpacity 
            style={[styles.manualButton, styles.submitButton]} 
            onPress={handleSubmit}
          >
            <Text style={styles.submitButtonText}>Enter Manually</Text>
          </TouchableOpacity>
        </View>
      )}

      {showSearchResults && searchResults.length === 0 && (
        <View style={styles.noResultsContainer}>
          <Text style={styles.noResultsText}>No venues found. Please try a different search or enter manually.</Text>
          <TouchableOpacity 
            style={[styles.manualButton, styles.submitButton]} 
            onPress={handleSubmit}
          >
            <Text style={styles.submitButtonText}>Enter Manually</Text>
          </TouchableOpacity>
        </View>
      )}
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
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#E8886B',
  },
  inputGroup: {
    marginBottom: 15,
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
  disabledButton: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  searchResultsContainer: {
    marginTop: 20,
    maxHeight: 300,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  venueItem: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  venueName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  venueAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  venueDistance: {
    fontSize: 12,
    color: '#999',
  },
  manualButton: {
    marginTop: 15,
  },
  noResultsContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
  },
});
