import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { handleFirestoreError, OperationType } from './utils/errorHandling';
import { getResolvedProfileImageUrl, shouldRequireRoleSetup } from './utils/profileRules';
import Splash from './pages/Splash';
import Login from './pages/Login';
import ProfileSetup from './pages/ProfileSetup';
import Dashboard from './pages/Dashboard';
import ConnectCouple from './pages/ConnectCouple';
import HallDetail from './pages/HallDetail';
import VirtualPreview from './pages/VirtualPreview';
import MapView from './pages/Map';
import CompareView from './pages/Compare';
import SettingsView from './pages/Settings';
import MobileLayout from './components/layout/MobileLayout';
import { configureSystemUi } from './services/systemUi';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [coupleId, setCoupleId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [needsRoleSetup, setNeedsRoleSetup] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    configureSystemUi();
  }, []);

  useEffect(() => {
    let unsubscribeUserDoc: () => void;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          const userSnap = await getDoc(userRef);
          
          if (!userSnap.exists()) {
            await setDoc(userRef, {
              uid: currentUser.uid,
              email: currentUser.email || '',
              displayName: currentUser.displayName || '',
              coupleId: null,
              role: null,
              roleSetupDismissedAt: null,
            });
          }

          unsubscribeUserDoc = onSnapshot(userRef, async (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data();
              setCoupleId(data.coupleId || null);
              setUserRole(data.role || null);
              setNeedsRoleSetup(shouldRequireRoleSetup(data));
              
              const resolvedProfileImageUrl = getResolvedProfileImageUrl({
                role: data.role,
                profileImageUrl: data.profileImageUrl,
              });
              if (resolvedProfileImageUrl && data.profileImageUrl !== resolvedProfileImageUrl) {
                await updateDoc(userRef, { profileImageUrl: resolvedProfileImageUrl });
              }
            }
            setLoading(false);
          }, (error) => {
            handleFirestoreError(error, OperationType.GET, `users/${currentUser.uid}`);
          });
        } catch (error) {
          console.error(error);
          setAuthError(error instanceof Error ? error.message : String(error));
          setLoading(false);
        }
      } else {
        setCoupleId(null);
        setUserRole(null);
        setNeedsRoleSetup(false);
        setLoading(false);
        if (unsubscribeUserDoc) unsubscribeUserDoc();
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeUserDoc) unsubscribeUserDoc();
    };
  }, []);

  if (authError) {
    return (
      <div className="flex h-screen items-center justify-center p-4 text-center">
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-destructive">데이터베이스 접근 오류</h2>
          <p className="text-sm text-muted-foreground max-w-md">{authError}</p>
          <button onClick={() => window.location.reload()} className="px-4 py-2 bg-primary text-primary-foreground rounded-md">새로고침</button>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
        <Routes>
          <Route path="/splash" element={<Splash />} />
          <Route 
            path="/login" 
            element={!user ? <Login /> : <Navigate to="/" replace />} 
          />
          <Route 
            path="/connect" 
            element={user ? <ConnectCouple user={user} /> : <Navigate to="/login" replace />} 
          />
          <Route 
            path="/profile-setup" 
            element={user ? <ProfileSetup /> : <Navigate to="/login" replace />} 
          />
          <Route 
            path="/hall/:id" 
            element={
              !user ? <Navigate to="/login" replace /> : 
              needsRoleSetup ? <Navigate to="/profile-setup" replace /> :
              <HallDetail user={user} coupleId={coupleId || user.uid} isConnected={!!coupleId} />
            } 
          />
          <Route 
            path="/hall/:id/preview" 
            element={
              !user ? <Navigate to="/login" replace /> : 
              needsRoleSetup ? <Navigate to="/profile-setup" replace /> :
              <VirtualPreview />
            } 
          />
          
          {/* Mobile Layout Routes */}
          <Route element={<MobileLayout />}>
            <Route 
              path="/" 
              element={
                !user ? <Navigate to="/splash" replace /> : 
                needsRoleSetup ? <Navigate to="/profile-setup" replace /> :
                <Dashboard user={user} coupleId={coupleId || user.uid} isConnected={!!coupleId} />
              } 
            />
            <Route 
              path="/map" 
              element={
                !user ? <Navigate to="/splash" replace /> : 
                needsRoleSetup ? <Navigate to="/profile-setup" replace /> :
                <MapView />
              } 
            />
            <Route 
              path="/compare" 
              element={
                !user ? <Navigate to="/splash" replace /> : 
                needsRoleSetup ? <Navigate to="/profile-setup" replace /> :
                <CompareView />
              } 
            />
            <Route 
              path="/settings" 
              element={
                !user ? <Navigate to="/splash" replace /> : 
                <SettingsView isConnected={!!coupleId} />
              } 
            />
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}
