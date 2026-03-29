import { useState } from 'react';
import { User } from 'firebase/auth';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, writeBatch, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { signOutEverywhere } from '../services/auth';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, Check, Link as LinkIcon } from 'lucide-react';

export default function ConnectCouple({ user }: { user: User }) {
  const [partnerCode, setPartnerCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const handleCopy = () => {
    navigator.clipboard.writeText(user.uid);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConnect = async () => {
    if (!partnerCode.trim()) {
      setError('초대 코드를 입력해주세요.');
      return;
    }
    if (partnerCode.trim() === user.uid) {
      setError('본인의 코드는 입력할 수 없습니다.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const partnerRef = doc(db, 'users', partnerCode.trim());
      const partnerSnap = await getDoc(partnerRef);

      if (!partnerSnap.exists()) {
        setError('유효하지 않은 코드입니다.');
        setLoading(false);
        return;
      }

      const partnerData = partnerSnap.data();
      if (partnerData.coupleId) {
        setError('상대방이 이미 다른 사람과 연결되어 있습니다.');
        setLoading(false);
        return;
      }

      // Create couple record
      const coupleId = [user.uid, partnerData.uid].sort().join('_');
      const coupleRef = doc(db, 'couples', coupleId);
      
      const batch = writeBatch(db);
      
      batch.set(coupleRef, {
        id: coupleId,
        user1Uid: user.uid,
        user2Uid: partnerData.uid,
        createdAt: serverTimestamp()
      });

      // Update both users
      batch.update(doc(db, 'users', user.uid), { coupleId });
      batch.update(partnerRef, { coupleId });

      // Migrate existing halls for user
      const myHallsSnap = await getDocs(query(collection(db, 'weddingHalls'), where('coupleId', '==', user.uid)));
      myHallsSnap.forEach(docSnap => {
        batch.update(docSnap.ref, { coupleId });
      });

      // Migrate existing halls for partner
      const partnerHallsSnap = await getDocs(query(collection(db, 'weddingHalls'), where('coupleId', '==', partnerData.uid)));
      partnerHallsSnap.forEach(docSnap => {
        batch.update(docSnap.ref, { coupleId });
      });

      await batch.commit();
      
      navigate('/');

    } catch (err) {
      console.error(err);
      if (typeof err === 'object' && err && 'code' in err && err.code === 'permission-denied') {
        setError('연결 권한이 거부되었습니다. 앱을 최신 버전으로 업데이트한 뒤 다시 시도해주세요.');
      } else {
        setError('연결 중 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col p-6">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate('/')}
          className="p-2 clay-btn text-slate-600 active:scale-90 transition-transform"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">연인과 연결하기</h1>
      </div>

      <div className="flex-1 flex flex-col gap-6 max-w-md mx-auto w-full">
        <div className="clay-card p-6 space-y-6">
          <div className="flex items-center justify-center w-16 h-16 mx-auto bg-rose-100 rounded-3xl mb-2">
            <LinkIcon className="h-8 w-8 text-rose-500" />
          </div>
          <p className="text-center text-sm text-slate-500 leading-relaxed">
            웨딩홀 투어 정보를 함께 관리하려면<br />연인과 계정을 연결해야 합니다.
          </p>

          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-400 ml-1 uppercase tracking-wider">내 초대 코드</label>
            <div className="flex gap-2">
              <div className="flex-1 clay-input p-4 text-sm font-mono text-slate-600 bg-slate-100/50 truncate">
                {user.uid}
              </div>
              <button 
                onClick={handleCopy}
                className={`p-4 clay-btn flex items-center justify-center min-w-[60px] ${copied ? "text-green-500" : "text-slate-400"}`}
              >
                {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
              </button>
            </div>
            <p className={`text-[10px] ml-1 transition-colors ${copied ? "text-green-500 font-bold" : "text-slate-400"}`}>
              {copied ? '초대 코드가 복사되었습니다.' : '이 코드를 연인에게 전달하세요.'}
            </p>
          </div>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-slate-100 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">또는</span>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-400 ml-1 uppercase tracking-wider">연인의 초대 코드 입력</label>
            <input 
              type="text"
              placeholder="전달받은 코드를 입력하세요" 
              value={partnerCode}
              onChange={(e) => setPartnerCode(e.target.value)}
              className="w-full clay-input p-4 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200 transition-all"
            />
            {error && <p className="text-[10px] ml-1 text-rose-500 font-bold">{error}</p>}
          </div>
        </div>

        <div className="space-y-3">
          <button 
            onClick={handleConnect} 
            disabled={loading} 
            className="w-full py-4 clay-btn !bg-rose-500 text-white font-bold shadow-lg shadow-rose-200 active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? '연결 중...' : '연결하기'}
          </button>
          <button 
            onClick={signOutEverywhere}
            className="w-full py-4 clay-btn text-slate-500 font-bold active:scale-95 transition-all"
          >
            로그아웃
          </button>
        </div>
      </div>
    </div>
  );
}
