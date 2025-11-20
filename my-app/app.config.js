export default {
  expo: {
    name: 'happymapper',
    owner: 'team-atlas',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'myapp',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.happymapper.app',
      googleServicesFile: process.env.GOOGLE_SERVICE_INFO_PLIST, // file env var path
      infoPlist: { ITSAppUsesNonExemptEncryption: false },
      config: {
        googleMapsApiKey: process.env.IOS_GOOGLE_MAPS_KEY, // optional env
      },
    },
    android: {
      package: 'com.happymapper.app',
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      minSdkVersion: 23,
      googleServicesFile: process.env.GOOGLE_SERVICES_JSON, // file env var path
      config: {
        googleMaps: { apiKey: process.env.ANDROID_GOOGLE_MAPS_KEY }, // optional env
      },
    },
    web: { output: 'static', favicon: './assets/images/favicon.png' },
    plugins: [
      'expo-router',
      ['expo-splash-screen', {
        image: './assets/images/splash-icon.png',
        imageWidth: 200,
        resizeMode: 'contain',
        backgroundColor: '#ffffff',
        dark: { backgroundColor: '#000000' },
      }],
      ['@react-native-firebase/app', {
        androidGoogleServicesFile: process.env.GOOGLE_SERVICES_JSON,
        iosGoogleServicesFile: process.env.GOOGLE_SERVICE_INFO_PLIST,
      }],
    ],
    experiments: { typedRoutes: true, reactCompiler: true },
    extra: {
      apiBaseUrl: 'http://192.168.1.20:5000',
      router: {},
      eas: { projectId: 'c2fd428d-835a-4f18-a590-8389062c3fd3' },
    },
  },
};

