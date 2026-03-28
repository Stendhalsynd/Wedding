import { type GoogleAuthProvider, type Auth, type UserCredential } from 'firebase/auth';

export interface NativeGoogleTokens {
  idToken: string;
  accessToken?: string;
}

export interface NativeGoogleSignInResultLike {
  credential?: {
    idToken?: string;
    accessToken?: string;
  } | null;
}

export interface AuthServiceDependencies<TAuth = Auth, TResult = UserCredential> {
  auth: TAuth;
  getPlatform: () => string;
  isNativePlatform: () => boolean;
  nativeSignIn: () => Promise<NativeGoogleSignInResultLike>;
  popupSignIn: (auth: TAuth, provider: GoogleAuthProvider) => Promise<TResult>;
  createGoogleCredential: (idToken: string, accessToken?: string | null) => unknown;
  signInWithFirebaseCredential: (auth: TAuth, credential: unknown) => Promise<TResult>;
  firebaseSignOut: (auth: TAuth) => Promise<void>;
  nativeSignOut: () => Promise<void>;
  createProvider: () => GoogleAuthProvider;
}

export const isNativeAndroidPlatform = (platform: string, nativePlatform: boolean) =>
  platform === 'android' && nativePlatform;

export const extractNativeGoogleTokens = (result: NativeGoogleSignInResultLike): NativeGoogleTokens => {
  const idToken = result.credential?.idToken;
  if (!idToken) {
    throw new Error('Native Google sign-in did not return an idToken.');
  }

  return {
    idToken,
    accessToken: result.credential?.accessToken,
  };
};

export const createAuthService = <TAuth = Auth, TResult = UserCredential>(
  dependencies: AuthServiceDependencies<TAuth, TResult>,
) => {
  const isNativeAndroid = () =>
    isNativeAndroidPlatform(dependencies.getPlatform(), dependencies.isNativePlatform());

  const signInWithGoogle = async () => {
    if (!isNativeAndroid()) {
      return dependencies.popupSignIn(dependencies.auth, dependencies.createProvider());
    }

    const nativeResult = await dependencies.nativeSignIn();
    const { idToken, accessToken } = extractNativeGoogleTokens(nativeResult);
    const credential = dependencies.createGoogleCredential(idToken, accessToken ?? null);
    return dependencies.signInWithFirebaseCredential(dependencies.auth, credential);
  };

  const signOutEverywhere = async () => {
    if (!isNativeAndroid()) {
      await dependencies.firebaseSignOut(dependencies.auth);
      return;
    }

    await Promise.allSettled([
      dependencies.nativeSignOut(),
      dependencies.firebaseSignOut(dependencies.auth),
    ]);
  };

  return {
    isNativeAndroid,
    signInWithGoogle,
    signOutEverywhere,
  };
};
