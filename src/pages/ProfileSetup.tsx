import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { DEFAULT_PROFILE_IMAGES } from '../constants/profileImages';
import { Sparkles, Loader2 } from 'lucide-react';

export default function ProfileSetup() {
  const [role, setRole] = useState<'bride' | 'groom' | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const user = auth.currentUser;

  const handleComplete = async () => {
    if (!user || !role) return;
    setLoading(true);
    try {
      const profileImageUrl = DEFAULT_PROFILE_IMAGES[role];
      await updateDoc(doc(db, 'users', user.uid), {
        role,
        profileImageUrl,
      });
      navigate('/');
    } catch (error) {
      console.error("Error setting up profile:", error);
      // Even if update fails, we should still try to navigate
      await updateDoc(doc(db, 'users', user.uid), {
        role,
      });
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const skipSetup = async () => {
    if (!user) return;
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="clay-card w-full max-w-md p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-slate-800">환영합니다!</h1>
          <p className="text-slate-500">당신의 역할을 선택해주세요.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setRole('bride')}
            className={`clay-btn p-6 flex flex-col items-center gap-3 transition-all ${
              role === 'bride' ? 'bg-rose-50 ring-2 ring-rose-400' : 'bg-white'
            }`}
          >
            <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
              <img 
                src={DEFAULT_PROFILE_IMAGES.bride} 
                alt="Bride" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="font-bold text-slate-700">예신</span>
          </button>

          <button
            onClick={() => setRole('groom')}
            className={`clay-btn p-6 flex flex-col items-center gap-3 transition-all ${
              role === 'groom' ? 'bg-blue-50 ring-2 ring-blue-400' : 'bg-white'
            }`}
          >
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
              <img 
                src={DEFAULT_PROFILE_IMAGES.groom} 
                alt="Groom" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="font-bold text-slate-700">예랑</span>
          </button>
        </div>

        <div className="space-y-3 pt-4">
          <button
            onClick={handleComplete}
            disabled={!role || loading}
            className="w-full py-4 clay-btn !bg-rose-500 text-white font-bold shadow-lg shadow-rose-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                시작하기
              </>
            )}
          </button>
          
          <button
            onClick={skipSetup}
            disabled={loading}
            className="w-full py-3 text-slate-400 text-sm font-medium hover:text-slate-600 transition-colors"
          >
            나중에 설정하기
          </button>
        </div>
      </div>
    </div>
  );
}
