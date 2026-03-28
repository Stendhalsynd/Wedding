import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication, type SignInResult } from '@capacitor-firebase/authentication';
import { GoogleAuthProvider, signInWithCredential, signInWithPopup, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { createAuthService, isNativeAndroidPlatform } from './auth-core';

const runtimeAuthService = createAuthService({
  auth,
  getPlatform: () => Capacitor.getPlatform(),
  isNativePlatform: () => Capacitor.isNativePlatform(),
  nativeSignIn: async () =>
    (await FirebaseAuthentication.signInWithGoogle({
      skipNativeAuth: true,
    })) as SignInResult,
  popupSignIn: signInWithPopup,
  createGoogleCredential: (idToken, accessToken) =>
    GoogleAuthProvider.credential(idToken, accessToken ?? undefined),
  signInWithFirebaseCredential: signInWithCredential,
  firebaseSignOut: signOut,
  nativeSignOut: async () => {
    await FirebaseAuthentication.signOut();
  },
  createProvider: () => new GoogleAuthProvider(),
});

export const isNativeAndroid = () =>
  isNativeAndroidPlatform(Capacitor.getPlatform(), Capacitor.isNativePlatform());

export const signInWithGoogle = () => runtimeAuthService.signInWithGoogle();

export const signOutEverywhere = () => runtimeAuthService.signOutEverywhere();
