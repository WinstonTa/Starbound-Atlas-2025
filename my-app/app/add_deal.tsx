import { CameraView, useCameraPermissions } from "expo-camera";
import { useRef, useState } from "react";
import { View, Text, Button, Image, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { testUpload } from "../src/api";

export default function AddDealScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [uploading, setUploading] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [result, setResult] = useState<boolean | null>(null);
  const cameraRef = useRef<CameraView>(null);

  if (!permission) return <View />;

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="Grant permission" />
      </View>
    );
  }

  const takePhoto = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      setPhotoUri(photo.uri);
      console.log("Photo saved at:", photo.uri);
    }
  };

  const onConfirm = async () => {
    if (!photoUri) return;
    try {
      setUploading(true);
      const success = await testUpload(photoUri);
      setResult(success);
      Alert.alert("Upload", success ? "Upload successful!" : "Upload failed");
    } catch (e: any) {
      Alert.alert("Upload failed", e.message ?? "Unknown error");
    } finally {
      setUploading(false);
    }
  };

  if (uploading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={styles.loadingText}>Uploading deal data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titleText}> Snap the Deal! </Text>
      {photoUri ? (
        <>
          <Image source={{ uri: photoUri }} style={styles.preview} />
          <View style={styles.row}>
            <View style={styles.buttonWrap}>
              <Button title="Retake" onPress={() => setPhotoUri(null)} />
            </View>
            <View style={styles.buttonWrap}>
              <Button title="Confirm" onPress={onConfirm} />
            </View>
          </View>
          {result ? (
            <View style={styles.resultBox}>
              <Text style={styles.resultText}>{JSON.stringify(result, null, 2)}</Text>
            </View>
          ) : null}
        </>
      ) : (
        <>
          <CameraView ref={cameraRef} style={styles.camera} facing="back" />
          <View style={styles.captureButton}>
            <Button title="Take Photo" onPress={takePhoto} />
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#F4EAE1",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F4EAE1",
  },
  titleText: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: "500",
    textAlign: "center",
    paddingBottom:10,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: "500",
  },
  message: {
    textAlign: "center",
    paddingBottom: 10,
  },
  camera: {
    width: "90%",
    height: "70%",
    justifyContent: "center",
    alignSelf: "center",
  },
  preview: {
    width: "90%",
    height: "70%",
    justifyContent: "center",
    alignSelf: "center",
  },
  captureButton: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
  },
  row: {
    position: "absolute",
    bottom: 40,
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
  },
  buttonWrap: {
    marginHorizontal: 10,
  },
  resultBox: {
    position: "absolute",
    top: 60,
    left: 16,
    right: 16,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 12,
    borderRadius: 8,
  },
  resultText: {
    color: "white",
    fontFamily: "Courier",
  },
});

