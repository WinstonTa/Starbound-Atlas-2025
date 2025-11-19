import { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, TouchableOpacity, Image, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import VenueForm from '../components/VenueForm';

// FOR DEVELOPMENT USE YOUR OWN IP HERE
const API_URL = Platform.OS === 'web' ? 'http://localhost:5000' : 'https://lovably-trichogynial-alane.ngrok-free.dev';

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
    <View style={styles.wrapper}>
      <View style={styles.headerBar}>
        <Text style={styles.headerText}>HappyMapper</Text>
      </View>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Add Deal</Text>
          <Text style={styles.subtitle}>
            Capture the menu to add deals
          </Text>
        </View>

      {!selectedImage ? (
        <View style={styles.uploadSection}>
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
        <View style={styles.previewSection}>
          <View style={styles.imagePreview}>
            <Image source={{ uri: selectedImage }} style={styles.image} />
            <TouchableOpacity
              style={styles.changeButton}
              onPress={() => setSelectedImage(null)}
            >
              <Text style={styles.changeButtonText}>Change Photo</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formContainer}>
            <VenueForm onSubmit={handleVenueSubmit} />
          </View>
        </View>
      )}

      {uploading && (
        <View style={styles.uploadingContainer}>
          <View style={styles.spinner}>
            <Text style={styles.spinnerText}>⏳</Text>
          </View>
          <Text style={styles.uploadingText}>Processing your menu...</Text>
        </View>
      )}

      {uploadedDocId && (
        <View style={styles.successContainer}>
          <Text style={styles.successIcon}>✓</Text>
          <Text style={styles.successText}>Deal Added Successfully!</Text>
          <Text style={styles.docIdText}>ID: {uploadedDocId}</Text>
        </View>
      )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#F5EBE0',
  },
  headerBar: {
    backgroundColor: '#F5EBE0',
    paddingTop: 50,
    paddingBottom: 15,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 24,
    fontWeight: '300',
    color: '#E8886B',
    letterSpacing: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#F5EBE0',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#E8886B',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 17,
    color: '#A67B5B',
    lineHeight: 24,
    textAlign: 'center',
  },
  uploadSection: {
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
  previewSection: {
    gap: 20,
  },
  imagePreview: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 4,
  },
  image: {
    width: '100%',
    height: 350,
    resizeMode: 'cover',
  },
  changeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  changeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  formContainer: {
    marginBottom: 20,
  },
  uploadingContainer: {
    backgroundColor: '#FFF8E1',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    elevation: 2,
    marginTop: 20,
  },
  spinner: {
    marginBottom: 15,
  },
  spinnerText: {
    fontSize: 40,
  },
  uploadingText: {
    color: '#F57C00',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
  },
  successContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    elevation: 1,
    marginTop: 20,
    borderWidth: 2,
    borderColor: '#E8886B',
  },
  successIcon: {
    fontSize: 60,
    color: '#E8886B',
    marginBottom: 10,
  },
  successText: {
    color: '#E8886B',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  docIdText: {
    color: '#A67B5B',
    fontSize: 14,
    textAlign: 'center',
  },
});
