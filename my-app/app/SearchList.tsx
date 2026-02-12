import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import Constants from "expo-constants";

// imoport key from .env -> app.config.js -> SearchList.tsx
const PLACES_KEY = Constants.expoConfig?.extra?.googlePlacesKey


// Set up geolocation service
if (typeof navigator !== 'undefined' && !navigator.geolocation) {
  navigator.geolocation = require('react-native-geolocation-service');
}

const SearchList = () => {
  const [apiKey] = useState(PLACES_KEY || '');
  
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Search Venues</Text>

      {/*REMOVE DEBUG BEFORE PRODUCTION*/}
      <Text style={styles.debugInfo}>
        API Key: {apiKey ? 'Available' : 'Missing'} ({apiKey?.length} chars)
      </Text>
      
      <GooglePlacesAutocomplete
        placeholder='Search for places, restaurants, etc.'
        onPress={(data, details = null) => {
          console.log('Selected place:', data);
          console.log('Place details:', details);
        }}
        onFail={(error) => {
          console.error('Google Places API Error:', error);
          console.log('Error details:', JSON.stringify(error, null, 2));
        }}
        onNotFound={() => {
          console.log('No results found');
        }}
        onTimeout={() => {
          console.log('Request timeout');
        }}
        query={{
          key: apiKey,
          language: 'en',
          types: 'establishment',
          components: 'country:us',
        }}
        fetchDetails={true}
        currentLocation={true}
        currentLocationLabel='Current location'
        nearbyPlacesAPI='GooglePlacesSearch'
        debounce={300}
        minLength={2}
        enablePoweredByContainer={false}
        keyboardShouldPersistTaps='handled'
        styles={{
          textInput: {
            height: 50,
            borderRadius: 8,
            fontSize: 16,
            backgroundColor: '#fff',
            borderWidth: 1,
            borderColor: '#ddd',
            color: '#333',
            paddingHorizontal: 15,
            elevation: 2,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.2,
            shadowRadius: 2,
          },
          container: {
            flex: 1,
            backgroundColor: '#F5EBE0',
            paddingHorizontal: 20,
            paddingTop: 10,
          },
          listView: {
            backgroundColor: '#fff',
            borderRadius: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
            marginTop: 10,
          },
          row: {
            backgroundColor: '#fff',
            padding: 15,
            minHeight: 50,
            flexDirection: 'row',
            alignItems: 'center',
            borderBottomWidth: 0.5,
            borderBottomColor: '#eee',
          },
          separator: {
            height: 0.5,
            backgroundColor: '#e5e5e5',
          },
          loader: {
            flexDirection: 'row',
            justifyContent: 'flex-end',
            height: 50,
            padding: 10,
          },
          poweredContainer: {
            display: 'none',
          },
        }}
        predefinedPlacesAlwaysVisible={false}
        renderRow={(data) => (
          <View style={styles.rowContainer}>
            <View style={styles.textContainer}>
              <Text style={styles.primaryText}>{data.description || data.name}</Text>
              {data.structured_formatting?.secondary_text && (
                <Text style={styles.secondaryText}>
                  {data.structured_formatting.secondary_text}
                </Text>
              )}
            </View>
          </View>
        )}
        renderDescription={(data) => data.description || ''}
        renderLeftButton={() => null}
        renderRightButton={() => null}
      />
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
    fontWeight: '500',
    textAlign: 'center',
    padding: 50,
    color: '#E8886B',
    backgroundColor: '#F5EBE0',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  debugInfo: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    padding: 5,
    backgroundColor: '#fff0f0',
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
  },
  textContainer: {
    flex: 1,
  },
  primaryText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  secondaryText: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  searchButton: {
    marginLeft: 8,
    backgroundColor: '#E8886B',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  }
});

export default SearchList;
