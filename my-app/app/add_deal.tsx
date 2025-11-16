import { CameraView, useCameraPermissions } from "expo-camera";
import { View, Text, Button, StyleSheet, Image } from "react-native";
import { useState, useRef } from "react";

export default function AddDealScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);

  // wait for permissions to pop up
  if (!permission) {
    return <View />;
  }

  // ask user for camera permission
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="Grant permission" />
      </View>
    );
  }

  const takePhoto = async() => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      setPhotoUri(photo.uri);
      console.log("Photo saved at:", photo.uri);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}> Snap the Deal! </Text>

      {/*take photo and display*/}
      {photoUri ? (
        <Image source={{ uri: photoUri }} style={styles.preview} />
      ) : (
        <CameraView ref={cameraRef} style={styles.camera} facing="back" />
      )}
  
      {/* button to take photo with */}
      <View style={styles.buttonContainer}>
        <Button
          title={photoUri ? "Retake" : "Take Photo"}
          onPress={() => {
            if (photoUri) setPhotoUri(null);
            else takePhoto();
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", backgroundColor: '#F4EAE1', },
  title: { textAlign: 'center', paddingBottom: 10, fontSize: 30},
  message: { textAlign: "center", paddingBottom: 10 },
  camera: { width: '90%', height: '70%', justifyContent: 'center', alignSelf: 'center',},
  preview: { width: '90%', height: '70%', justifyContent: 'center', alignSelf: 'center',},
  buttonContainer: { position: "absolute", bottom: 40, alignSelf: "center" },
});
