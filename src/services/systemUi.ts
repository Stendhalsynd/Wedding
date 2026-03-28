import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';

const ANDROID_STATUS_BAR_COLOR = '#f8fafc';

export async function configureSystemUi() {
  if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') {
    return;
  }

  try {
    await StatusBar.setOverlaysWebView({ overlay: false });
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: ANDROID_STATUS_BAR_COLOR });
  } catch (error) {
    console.error('Failed to configure Android system UI', error);
  }
}
