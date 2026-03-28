/// <reference types="@capacitor-firebase/authentication" />
/// <reference types="@capacitor/status-bar" />

import type { CapacitorConfig } from '@capacitor/cli';

type WeddingCapacitorConfig = CapacitorConfig & {
  bundledWebRuntime: boolean;
};

const config: WeddingCapacitorConfig = {
  appId: 'com.jwjh.wedding',
  appName: 'Wedding Tour',
  webDir: 'dist',
  bundledWebRuntime: false,
  plugins: {
    FirebaseAuthentication: {
      skipNativeAuth: true,
      providers: ['google.com'],
    },
    StatusBar: {
      overlaysWebView: false,
      style: 'DARK',
      backgroundColor: '#f8fafc',
    },
  },
};

export default config;
