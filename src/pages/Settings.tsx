import { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { deleteField, doc, getDoc, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Link as LinkIcon, ChevronRight } from 'lucide-react';
import { DEFAULT_PROFILE_IMAGES } from '../constants/profileImages';
import { getResolvedProfileImageUrl } from '../utils/profileRules';
import { signOutEverywhere } from '../services/auth';

export default function SettingsView({ isConnected }: { isConnected: boolean }) {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const user = auth.currentUser;

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        setUserData(userDoc.data());
      }
    };
    fetchUserData();
  }, [user]);

  const handleRoleChange = async (newRole: 'bride' | 'groom') => {
    if (!user) return;
    setLoading(true);
    try {
      const profileImageUrl = DEFAULT_PROFILE_IMAGES[newRole];
      await updateDoc(doc(db, 'users', user.uid), {
        role: newRole,
        profileImageUrl,
        roleSetupDismissedAt: deleteField(),
      });
      setUserData({ ...userData, role: newRole, profileImageUrl });
    } catch (error) {
      console.error("Error updating role:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full bg-slate-50 pt-fixed-page-header">
      <div className="fixed inset-x-0 top-0 z-20">
        <div className="mx-auto max-w-md border-b border-white/40 bg-slate-50/95 px-6 pb-4 pt-safe-top backdrop-blur-md">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-800">설정</h1>
          </div>
        </div>
      </div>

      <div className="space-y-6 px-6 pb-safe-nav pt-6">
      {/* Profile Section */}
      <div className="clay-card p-6 space-y-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-inner">
              {(() => {
                const finalUrl = getResolvedProfileImageUrl({
                  role: userData?.role,
                  profileImageUrl: userData?.profileImageUrl,
                });

                if (finalUrl) {
                  return (
                    <img 
                      src={finalUrl} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  );
                }
                return <User className="w-10 h-10 text-slate-300" />;
              })()}
            </div>
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">{user?.displayName || '사용자'}</h2>
            <p className="text-sm text-slate-500">{user?.email}</p>
            {userData?.role && (
              <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                userData.role === 'bride' ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'
              }`}>
                {userData.role === 'bride' ? '예비신부 (예신)' : '예비신랑 (예랑)'}
              </span>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">역할 변경</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleRoleChange('bride')}
              disabled={loading}
              className={`py-3 px-4 rounded-2xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                userData?.role === 'bride' 
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-200' 
                  : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
              }`}
            >
              👰 예신
            </button>
            <button
              onClick={() => handleRoleChange('groom')}
              disabled={loading}
              className={`py-3 px-4 rounded-2xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                userData?.role === 'groom' 
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-200' 
                  : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
              }`}
            >
              🤵 예랑
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {!isConnected && (
          <button 
            onClick={() => navigate('/connect')}
            className="w-full clay-card p-5 flex items-center justify-between group active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500">
                <LinkIcon className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-slate-800">연인 연결</h3>
                <p className="text-xs text-slate-500">함께 웨딩홀을 비교해보세요</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-500 transition-colors" />
          </button>
        )}

        <div className="clay-card p-2">
          <button 
            onClick={signOutEverywhere}
            className="w-full p-4 flex items-center gap-4 text-rose-500 font-bold hover:bg-rose-50 rounded-2xl transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
              <LogOut className="w-5 h-5" />
            </div>
            로그아웃
          </button>
        </div>
      </div>
      </div>
    </div>
  );
}
