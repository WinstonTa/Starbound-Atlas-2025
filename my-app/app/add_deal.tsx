import { CameraView, useCameraPermissions } from "expo-camera";
import { useRef, useState } from "react";
import { View, Text, Image, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { testUpload } from "../src/parse_deal";

export default function AddDealScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [uploading, setUploading] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [result, setResult] = useState<boolean | null>(null);
  const cameraRef = useRef<CameraView>(null);
  const insets = useSafeAreaInsets();

  if (!permission) return <View style={{ flex: 1 }} />;

  if (!permission.granted) {
    return (
      <LinearGradient colors={["#F8F4EF", "#EAEFF4"]} style={styles.container}>
        <View style={[styles.contentWrap, { paddingTop: insets.top + 24 }]}>
          <View style={styles.permissionCard}>
            <View style={styles.permissionIcon}>
              <MaterialCommunityIcons name="camera-outline" size={28} color="#0F172A" />
            </View>
            <Text style={styles.permissionTitle}>Camera access needed</Text>
            <Text style={styles.permissionBody}>
              We use your camera to capture menus and extract deals. You can change this anytime in settings.
            </Text>
            <TouchableOpacity style={styles.primaryButton} onPress={requestPermission}>
              <Text style={styles.primaryButtonText}>Enable camera</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
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
      <LinearGradient colors={["#F8F4EF", "#EAEFF4"]} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0F172A" />
        <Text style={styles.loadingText}>Uploading and parsing the menu...</Text>
        <Text style={styles.loadingSubtext}>This usually takes a few seconds.</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#F8F4EF", "#EAEFF4"]} style={styles.container}>
      <View style={[styles.contentWrap, { paddingTop: insets.top + 18, paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.header}>
          <Text style={styles.titleText}>Add a Deal</Text>
          <Text style={styles.subtitleText}>Snap a clear menu photo. We’ll extract the deals for you.</Text>
        </View>

        {photoUri ? (
          <View style={styles.previewWrap}>
            <Image source={{ uri: photoUri }} style={styles.preview} />
            <View style={styles.previewActions}>
              <TouchableOpacity style={styles.secondaryButton} onPress={() => setPhotoUri(null)}>
                <Text style={styles.secondaryButtonText}>Retake</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.primaryButton} onPress={onConfirm}>
                <Text style={styles.primaryButtonText}>Use Photo</Text>
              </TouchableOpacity>
            </View>
            {result ? (
              <View style={styles.resultBox}>
                <Text style={styles.resultText}>{JSON.stringify(result, null, 2)}</Text>
              </View>
            ) : null}
          </View>
        ) : (
          <View style={styles.cameraWrap}>
            <CameraView ref={cameraRef} style={styles.camera} facing="back" />
            <View style={styles.cameraOverlay}>
              <Text style={styles.cameraHint}>Keep the menu flat and well‑lit</Text>
            </View>
            <TouchableOpacity style={styles.captureButton} onPress={takePhoto}>
              <View style={styles.captureOuter}>
                <View style={styles.captureInner} />
              </View>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F4EF",
  },
  contentWrap: {
    flex: 1,
    paddingHorizontal: 18,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 13,
    color: "#5B6474",
  },
  header: {
    marginBottom: 16,
  },
  titleText: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0F172A",
    fontFamily: Platform.select({
      ios: "Georgia",
      android: "serif",
      default: "serif",
    }),
  },
  subtitleText: {
    marginTop: 6,
    fontSize: 14,
    color: "#5B6474",
  },
  cameraWrap: {
    flex: 1,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#D8DEE8",
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    position: "absolute",
    top: 12,
    left: 12,
    right: 12,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  cameraHint: {
    color: "#F8FAFC",
    fontSize: 12,
    textAlign: "center",
  },
  captureButton: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
  },
  captureOuter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(248, 250, 252, 0.08)",
  },
  captureInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#F8FAFC",
  },
  previewWrap: {
    flex: 1,
  },
  preview: {
    width: "100%",
    height: "65%",
    borderRadius: 20,
  },
  previewActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: "#0F172A",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: "#E2E8F0",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#0F172A",
    fontSize: 14,
    fontWeight: "700",
  },
  permissionCard: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E3E7EE",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
    elevation: 8,
  },
  permissionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  permissionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  permissionBody: {
    marginTop: 6,
    fontSize: 13,
    color: "#5B6474",
    marginBottom: 16,
  },
  resultBox: {
    marginTop: 16,
    backgroundColor: "#0F172A",
    padding: 12,
    borderRadius: 12,
  },
  resultText: {
    color: "white",
    fontFamily: Platform.select({
      ios: "Courier",
      android: "monospace",
      default: "monospace",
    }),
  },
});

