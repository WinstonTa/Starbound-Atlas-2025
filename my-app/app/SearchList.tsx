import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { Ionicons } from '@expo/vector-icons';
import Constants from "expo-constants";


// get Places API key from .env -> app.config.js -> SearchList
const PLACES_KEY = Constants.expoConfig?.extra?.googlePlacesKey;


// get user's current location with react-native-geolocation-service
if (typeof navigator !== 'undefined' && !navigator.geolocation) {
  navigator.geolocation = require('react-native-geolocation-service');
}

const SearchIcon = () => (
  <View
    style={{
      position: "absolute",
      left: 30,
      top: 14,
      zIndex: 1,
      pointerEvents: "none",
    }}
  >
    <Ionicons name="search" size={20} color="#E8886B" />
  </View>
);


const SearchVenues = () => {
  const [apiKey] = useState(PLACES_KEY || '');

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Search Venues</Text>

      <View style={styles.searchBlock}>
        <SearchIcon />

        <GooglePlacesAutocomplete
          placeholder="Search for places, restaurants, etc."
          fetchDetails
          onPress={(data, details = null) => {
            console.log(data, details);
          }}
          query={{
            key: apiKey,
            language: "en",
            types: "establishment",
            components: "country:us",
          }}
          enablePoweredByContainer={false}
          keyboardShouldPersistTaps="handled"
          listViewDisplayed="auto"
          styles={{
            // IMPORTANT: don't let it take full screen height
            container: { flex: 0 },

            textInputContainer: { backgroundColor: "transparent" },

            textInput: {
              height: 50,
              borderRadius: 8,
              fontSize: 16,
              backgroundColor: "#fff",
              borderWidth: 1,
              borderColor: "#ddd",
              color: "#333",
              paddingLeft: 45,
              paddingRight: 15,
            },

            // overlay dropdown under the input
            listView: {
              position: "absolute",
              top: 60,            // slightly below the input (50 + margin)
              left: 0,
              right: 0,
              backgroundColor: "#fff",
              borderRadius: 8,
              elevation: 3,
              zIndex: 999,
            },

            row: {
              padding: 15,
              borderBottomWidth: 0.5,
              borderBottomColor: "#eee",
            },
          }}
        />
      </View>
    </View>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5EBE0',
  },
  header: {
    fontSize: 24,
    fontWeight: "500",
    textAlign: "center",
    paddingTop: 50,
    paddingBottom: 20,
    color: "#E8886B",
  },
  searchBlock: {
    paddingHorizontal: 20,
    zIndex: 10,
    position: "relative",
  },
  searchIconContainer: {
    justifyContent: 'center',
    left: 40,
    alignItems: 'center',
    paddingHorizontal: 5,
    height: '100%',
  },
  venueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  venueInfo: {
    flex: 1,
  },
  venueName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  venueAddress: {
    fontSize: 14,
    color: '#666',
  },
});

export default SearchVenues;
