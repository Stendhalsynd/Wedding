import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createAuthService,
  extractNativeGoogleTokens,
  isNativeAndroidPlatform,
} from '../../src/services/auth-core';

test('detects native Android only for Android native runtime', () => {
  assert.equal(isNativeAndroidPlatform('android', true), true);
  assert.equal(isNativeAndroidPlatform('android', false), false);
  assert.equal(isNativeAndroidPlatform('web', true), false);
});

test('extracts idToken and accessToken from native google sign-in result', () => {
  const tokens = extractNativeGoogleTokens({
    credential: {
      idToken: 'id-token',
      accessToken: 'access-token',
    },
  });

  assert.deepEqual(tokens, {
    idToken: 'id-token',
    accessToken: 'access-token',
  });
});

test('throws when native google sign-in result has no idToken', () => {
  assert.throws(
    () => extractNativeGoogleTokens({ credential: { accessToken: 'only-access-token' } }),
    /idToken/i,
  );
});

test('uses popup login on web runtime', async () => {
  const calls: string[] = [];
  const popupResult = { provider: 'popup' };

  const service = createAuthService({
    auth: { currentUser: null },
    getPlatform: () => 'web',
    isNativePlatform: () => false,
    nativeSignIn: async () => {
      calls.push('nativeSignIn');
      throw new Error('should not call native');
    },
    popupSignIn: async () => {
      calls.push('popupSignIn');
      return popupResult;
    },
    createProvider: () => ({} as any),
    createGoogleCredential: () => {
      calls.push('createGoogleCredential');
      return {};
    },
    signInWithFirebaseCredential: async () => {
      calls.push('signInWithFirebaseCredential');
      return { provider: 'credential' };
    },
    firebaseSignOut: async () => {
      calls.push('firebaseSignOut');
    },
    nativeSignOut: async () => {
      calls.push('nativeSignOut');
    },
  });

  const result = await service.signInWithGoogle();

  assert.equal(result, popupResult);
  assert.deepEqual(calls, ['popupSignIn']);
});

test('uses native Google login and Firebase credential sign-in on Android runtime', async () => {
  const calls: string[] = [];
  const firebaseResult = { provider: 'firebase-credential' };

  const service = createAuthService({
    auth: { currentUser: null },
    getPlatform: () => 'android',
    isNativePlatform: () => true,
    nativeSignIn: async () => {
      calls.push('nativeSignIn');
      return {
        credential: {
          idToken: 'android-id-token',
          accessToken: 'android-access-token',
        },
      };
    },
    popupSignIn: async () => {
      calls.push('popupSignIn');
      throw new Error('should not call popup');
    },
    createProvider: () => ({} as any),
    createGoogleCredential: (idToken, accessToken) => {
      calls.push('createGoogleCredential');
      return { idToken, accessToken };
    },
    signInWithFirebaseCredential: async (_auth, credential) => {
      calls.push('signInWithFirebaseCredential');
      assert.deepEqual(credential, {
        idToken: 'android-id-token',
        accessToken: 'android-access-token',
      });
      return firebaseResult;
    },
    firebaseSignOut: async () => {
      calls.push('firebaseSignOut');
    },
    nativeSignOut: async () => {
      calls.push('nativeSignOut');
    },
  });

  const result = await service.signInWithGoogle();

  assert.equal(result, firebaseResult);
  assert.deepEqual(calls, [
    'nativeSignIn',
    'createGoogleCredential',
    'signInWithFirebaseCredential',
  ]);
});

test('signs out from both native and firebase layers on Android', async () => {
  const calls: string[] = [];

  const service = createAuthService({
    auth: { currentUser: null },
    getPlatform: () => 'android',
    isNativePlatform: () => true,
    nativeSignIn: async () => ({ credential: { idToken: 'unused' } }),
    popupSignIn: async () => ({ provider: 'popup' }),
    createProvider: () => ({} as any),
    createGoogleCredential: () => ({}),
    signInWithFirebaseCredential: async () => ({ provider: 'firebase' }),
    firebaseSignOut: async () => {
      calls.push('firebaseSignOut');
    },
    nativeSignOut: async () => {
      calls.push('nativeSignOut');
    },
  });

  await service.signOutEverywhere();

  assert.deepEqual(calls.sort(), ['firebaseSignOut', 'nativeSignOut']);
});
