import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const PLACES_KEY = Constants.expoConfig?.extra?.googlePlacesKey;
const API_URL = 'https://happymapper.vercel.app';

export default function SearchAndUpload() {
  const [apiKey] = useState(String(PLACES_KEY || ""));
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  // Get user location for form
  const getCurrentLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log("Did not get user's location, using default in LA")
        setUserLocation({lon: -118.243683, lat: 34.052235});
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setUserLocation({ 
        lon: location.coords.longitude,
        lat: location.coords.latitude, 
      });
    } catch (error) {
      console.error('Error getting location:', error);
      setUserLocation({ lon: -118.243683, lat: 34.052235 });
    }
  };

  // Open camera to take photo
  const takePhoto = async () => {
    const { status } = await ImagePicker.getCameraPermissionsAsync();
    if (status !== 'granted') {
      const { newStatus } = await ImagePicker.requestCameraPermissionsAsync();

      if ( newStatus !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera permission');
        return;
      }
      
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  // Pick image from gallery 
const pickImage = async () => {
  // Check current permission status first (faster)
  let { status } = await ImagePicker.getMediaLibraryPermissionsAsync();
  
  // Only request if not granted
  if (status !== 'granted') {
    const { status: newStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (newStatus !== 'granted') {
      Alert.alert('Permission needed', 'Please grant media library permission');
      return;
    }
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    quality: 1,
  });

  if (!result.canceled && result.assets[0]) {
    setSelectedImage(result.assets[0].uri);
  }
};

  // Parse Google Places response into VenueFormData format
  const parseVenueData = (placeData) => {
    const venue_name = placeData.structured_formatting?.main_text || placeData.description || '';
    const addressComponents = placeData.terms || [];
    
    // Extract address components from terms array
    let street = '';
    let city = '';
    let state = '';
    let zip = '';

    // Try to extract from structured data first
    if (placeData.description) {
      const addressParts = placeData.description.split(', ');
      if (addressParts.length >= 3) {
        street = addressParts[0] || '';
        city = addressParts[1] || '';
        const stateZip = addressParts[2]?.split(' ') || [];
        state = stateZip[0] || '';
        zip = stateZip[1] || '';
      }
    }

    // Fallback to terms array if description parsing fails
    if (!street && addressComponents.length > 0) {
      street = addressComponents[0].value || '';
    }
    if (!city && addressComponents.length > 1) {
      city = addressComponents[addressComponents.length - 3]?.value || '';
    }
    if (!state && addressComponents.length > 2) {
      state = addressComponents[addressComponents.length - 2]?.value || '';
    }
    if (!zip && addressComponents.length > 1) {
      zip = addressComponents[addressComponents.length - 1]?.value || '';
    }

    return {
      venue_name,
      address: {
        street,
        city,
        state,
        zip
      }
    };
  };

  // Handles submit 
  const handleSubmit = async () => {
    if (!selectedVenue) {
      Alert.alert('Error', 'Please select a venue first');
      return;
    }

    if (!selectedImage) {
      Alert.alert('Error', 'Please take or select a menu image');
      return;
    }

    setUploading(true);

    try {
      // Parse venue data into correct format
      const venueData = parseVenueData(selectedVenue);
      console.log('Parsed venue data:', venueData);

      const formData = new FormData();
      formData.append('venue_name', venueData.venue_name);
      formData.append('venue_address', JSON.stringify(venueData.address));

      // Add image
      const filename = selectedImage.split('/').pop() || 'menu.jpg';
      const fileType = filename.split('.').pop();
      formData.append('image', {
        uri: selectedImage,
        name: filename,
        type: `image/${fileType}`,
      });

      const uploadResponse = await fetch(`${API_URL}/upload-deal`, {
        method: 'POST',
        body: formData,
      });

      const result = await uploadResponse.json();
      
      if (result.success) {
        // Track in user's addedDeals
        const currentUser = auth().currentUser;
        if (currentUser) {
          try {
            const userRef = firestore().collection('user_data').doc(currentUser.uid);
            await userRef.update({
              addedDeals: firestore.FieldValue.arrayUnion(result.document_id),
            });
          } catch (error) {
            console.error('Error tracking user deal:', error);
          }
        }

        Alert.alert(
          'Success!',
          'Deal uploaded successfully!\nThanks for sharing!',
          [
            {
              text: 'Upload Another',
              onPress: () => {
                setSelectedVenue(null);
                setSelectedImage(null);
              },
            },
            { text: 'OK' },
          ]
        );
      } else {
        Alert.alert('Error', result.error || 'Upload failed');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      Alert.alert('Error', `Failed to upload: ${error.message || 'Check your connection and try again.'}`);
    } finally {
      setUploading(false);
    }
  };

  if (uploading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E8886B" />
        <Text style={styles.loadingText}>Uploading deal data...</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider style={styles.screen}>
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>Add Deal at Venue</Text>
      </View>

      <View style={styles.body}>
        {/* Search Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Select Venue</Text>
          <View style={styles.searchBlock}>
            <Ionicons name="search" size={20} color="#E8886B" style={styles.searchIcon} />
            <GooglePlacesAutocomplete
              placeholder="Search for venues..."
              fetchDetails
              onPress={(data, details = null) => {
                console.log("Selected:", data);
                console.log("Details:", details);
                setSelectedVenue(data);
                if (!userLocation) {
                  getCurrentLocation();
                }
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
              debounce={300}
              minLength={2}
              styles={{
                container: { flex: 0 },
                textInputContainer: {
                  backgroundColor: "transparent",
                  borderTopWidth: 0,
                  borderBottomWidth: 0,
                  padding: 0,
                },
                textInput: {
                  height: 52,
                  borderRadius: 12,
                  fontSize: 16,
                  backgroundColor: "#fff",
                  borderWidth: 1,
                  borderColor: "#ddd",
                  color: "#333",
                  paddingLeft: 44,
                  paddingRight: 14,
                  elevation: 2,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.12,
                  shadowRadius: 2,
                },
                listView: {
                  position: "absolute",
                  top: 60,
                  left: 0,
                  right: 0,
                  backgroundColor: "#fff",
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: "#eee",
                  elevation: 3,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.08,
                  shadowRadius: 4,
                  zIndex: 999,
                  overflow: "hidden",
                },
                row: {
                  paddingVertical: 14,
                  paddingHorizontal: 14,
                  backgroundColor: "#fff",
                  flexDirection: "row",
                  alignItems: "center",
                },
                separator: {
                  height: 1,
                  backgroundColor: "#f0f0f0",
                },
                description: {
                  fontSize: 15,
                  color: "#333",
                },
              }}
              renderRow={(data) => {
                const primary =
                  data.structured_formatting?.main_text ||
                  data.description ||
                  data.name ||
                  "";

                const secondary =
                  data.structured_formatting?.secondary_text || "";

                return (
                  <View style={styles.rowInner}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.primaryText} numberOfLines={1}>
                        {primary}
                      </Text>
                      {!!secondary && (
                        <Text style={styles.secondaryText} numberOfLines={1}>
                          {secondary}
                        </Text>
                      )}
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#999" />
                  </View>
                );
              }}
            />
          </View>
          
          {selectedVenue && (
            <View style={styles.selectedVenue}>
              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
              <Text style={styles.selectedVenueText}>
                {selectedVenue.structured_formatting?.main_text || selectedVenue.description}
              </Text>
            </View>
          )}
        </View>

        {/* Image Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Upload Menu Image</Text>
          
          {!selectedImage ? (
            <View style={styles.imageUploadSection}>
              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.cameraButton} onPress={takePhoto}>
                  <Text style={styles.cameraIcon}>📷</Text>
                  <Text style={styles.buttonText}>Camera</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.galleryButton} onPress={pickImage}>
                  <Text style={styles.galleryIcon}>🖼️</Text>
                  <Text style={styles.buttonText}>Gallery</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.imagePreview}>
              <Text style={styles.imageLabel}>Menu Image:</Text>
              <View style={styles.imageContainer}>
                <Text style={styles.imageFileName}>{selectedImage.split('/').pop()}</Text>
                <TouchableOpacity 
                  style={styles.changeImageButton} 
                  onPress={() => setSelectedImage(null)}
                >
                  <Ionicons name="refresh" size={16} color="#E8886B" />
                  <Text style={styles.changeImageText}>Change</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Submit Button */}
        <TouchableOpacity 
          style={[
            styles.submitButton, 
            (!selectedVenue || !selectedImage) && styles.submitButtonDisabled
          ]} 
          onPress={handleSubmit}
          disabled={!selectedVenue || !selectedImage || uploading}
        >
          <Ionicons name="cloud-upload" size={20} color="#fff" />
          <Text style={styles.submitButtonText}>Submit Deal</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F5EBE0",
  },
  headerBar: {
    paddingTop: 50,
    paddingBottom: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "500",
    color: "#E8886B",
  },
  body: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  searchBlock: {
    position: "relative",
    zIndex: 10,
  },
  searchIcon: {
    position: "absolute",
    left: 14,
    top: 16,
    zIndex: 20,
    pointerEvents: "none",
  },
  rowInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    width: "100%",
  },
  primaryText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "600",
  },
  secondaryText: {
    marginTop: 2,
    fontSize: 13,
    color: "#777",
  },
  selectedVenue: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E8",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    gap: 8,
  },
  selectedVenueText: {
    fontSize: 14,
    color: "#2E7D32",
    fontWeight: "500",
  },
  imageUploadSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    elevation: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 15,
  },
  cameraButton: {
    flex: 1,
    backgroundColor: '#E8886B',
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderRadius: 16,
    alignItems: 'center',
  },
  galleryButton: {
    flex: 1,
    backgroundColor: '#D4A08B',
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderRadius: 16,
    alignItems: 'center',
  },
  cameraIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  galleryIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  imagePreview: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  imageLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  imageContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  imageFileName: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
    flex: 1,
    marginRight: 12,
  },
  changeImageButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#FFF3E0",
    borderRadius: 6,
  },
  changeImageText: {
    fontSize: 12,
    color: "#E8886B",
    fontWeight: "500",
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#E8886B",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 20,
  },
  submitButtonDisabled: {
    backgroundColor: "#CCC",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5EBE0",
    gap: 16,
  },
  loadingText: {
    color: "#E8886B",
    fontSize: 18,
    fontWeight: "600",
  },
});
