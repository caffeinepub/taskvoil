import type { CapacitorConfig } from "@capacitor/cli";

/**
 * TaskVoilà — Capacitor configuration
 *
 * This file prepares the project for native iOS/Android packaging via Capacitor.
 * To activate native builds:
 *   1. npm install @capacitor/core @capacitor/ios @capacitor/android @capacitor/cli
 *   2. npx cap add ios
 *   3. npx cap add android
 *   4. Update `server.url` below with your deployed ICP canister URL
 *   5. npx cap sync
 *   6. Open Xcode (iOS) or Android Studio (Android) to build & submit to stores
 */
const config: CapacitorConfig = {
  appId: "xyz.taskvoila.app",
  appName: "TaskVoilà",
  webDir: "dist",

  // Live-reload from hosted ICP canister (update with your deployed URL)
  server: {
    url: "https://controlled-lavender-mlq-draft.caffeine.xyz",
    cleartext: false,
  },

  plugins: {
    // Push notifications (requires Firebase config for Android)
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },

    // Geolocation — uses native GPS when running as native app
    Geolocation: {
      // permissions handled at runtime
    },

    // Local notifications
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#1a73e8",
      sound: "beep.wav",
    },

    // Splash screen
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#0f172a",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      iosSpinnerStyle: "small",
      spinnerColor: "#f59e0b",
    },

    // Status bar (iOS/Android)
    StatusBar: {
      style: "DARK",
      backgroundColor: "#0f172a",
    },
  },

  // iOS-specific
  ios: {
    contentInset: "always",
    allowsLinkPreview: false,
    scrollEnabled: true,
    limitsNavigationsToAppBoundDomains: true,
  },

  // Android-specific
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
};

export default config;
