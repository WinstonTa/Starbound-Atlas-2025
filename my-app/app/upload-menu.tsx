import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, TouchableOpacity, Image, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import VenueForm from '../components/VenueForm';

// For physical devices, use your computer's IP address
const API_URL = Platform.OS === 'web' ? 'http://localhost:5000' : 'http://192.168.1.15:5000';

export default function UploadMenuScreen() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedDocId, setUploadedDocId] = useState<string | null>(null);

  // 📸 Take photo using camera
  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera permission');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
      setUploadedDocId(null);
    }
  };

  // 🖼 Pick image from gallery
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant media library permission');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
      setUploadedDocId(null);
    }
  };

  // 🏠 Handle form submission
  const handleVenueSubmit = async (venueData: any) => {
    if (!selectedImage) {
      Alert.alert('Error', 'Please select or take a menu image first');
      return;
    }

    setUploading(true);
    console.log('Starting upload...');
    console.log('API URL:', API_URL);
    console.log('Venue Data:', venueData);

    try {
      const formData = new FormData();
      formData.append('venue_name', venueData.venue_name);
      formData.append('venue_address', JSON.stringify(venueData.address));

      if (Platform.OS === 'web') {
        const response = await fetch(selectedImage);
        const blob = await response.blob();
        formData.append('image', blob, 'menu.jpg');
      } else {
        const filename = selectedImage.split('/').pop() || 'menu.jpg';
        const fileType = filename.split('.').pop();

        // @ts-ignore
        formData.append('image', {
          uri: selectedImage,
          name: filename,
          type: `image/${fileType}`,
        });
      }

      const uploadResponse = await fetch(`${API_URL}/upload-menu`, {
        method: 'POST',
        body: formData,
      });

      const result = await uploadResponse.json();
      if (result.success) {
        setUploadedDocId(result.document_id);
        Alert.alert(
          'Success!',
          `Menu uploaded successfully!\nDocument ID: ${result.document_id}`,
          [
            {
              text: 'Upload Another',
              onPress: () => {
                setSelectedImage(null);
                setUploadedDocId(null);
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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Upload Menu</Text>
        <Text style={styles.subtitle}>
          Take a photo or select an image, then enter venue information
        </Text>

        {/* Camera & Gallery Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.button, { backgroundColor: '#34C759' }]} onPress={takePhoto}>
            <Text style={styles.buttonText}>📸 Take Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, { backgroundColor: '#007AFF' }]} onPress={pickImage}>
            <Text style={styles.buttonText}>🖼 From Gallery</Text>
          </TouchableOpacity>
        </View>

        {/* Image Preview */}
        {selectedImage && (
          <View style={styles.imagePreview}>
            <Image source={{ uri: selectedImage }} style={styles.image} />
          </View>
        )}

        {/* Venue Form */}
        {selectedImage && (
          <View style={styles.formContainer}>
            <VenueForm onSubmit={handleVenueSubmit} />
          </View>
        )}

        {/* Upload Status */}
        {uploading && (
          <View style={styles.uploadingContainer}>
            <Text style={styles.uploadingText}>Uploading and processing...</Text>
          </View>
        )}

        {uploadedDocId && (
          <View style={styles.successContainer}>
            <Text style={styles.successText}>✓ Upload successful!</Text>
            <Text style={styles.docIdText}>Document ID: {uploadedDocId}</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  imagePreview: {
    marginBottom: 20,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 300,
    resizeMode: 'contain',
  },
  formContainer: {
    marginBottom: 20,
  },
  uploadingContainer: {
    padding: 20,
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    marginTop: 10,
  },
  uploadingText: {
    color: '#856404',
    textAlign: 'center',
    fontSize: 16,
  },
  successContainer: {
    padding: 20,
    backgroundColor: '#d4edda',
    borderRadius: 8,
    marginTop: 10,
  },
  successText: {
    color: '#155724',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  docIdText: {
    color: '#155724',
    fontSize: 14,
    textAlign: 'center',
  },
});
