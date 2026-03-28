import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { Plus, MapPin, Users, Star, CreditCard, Utensils, Bus, Sparkles } from 'lucide-react';
import { User } from 'firebase/auth';

function AlertModal({ 
  isOpen, 
  onClose, 
  title, 
  message 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  title: string, 
  message: string 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
      <div className="clay-card bg-slate-100 w-full max-w-xs p-6 space-y-6 animate-in fade-in zoom-in duration-200 border border-white/40 shadow-2xl">
        <div className="space-y-2 text-center">
          <h3 className="text-lg font-bold text-slate-800">{title}</h3>
          <p className="text-sm text-slate-500 leading-relaxed">{message}</p>
        </div>
        
        <button 
          onClick={onClose}
          className="w-full py-3 clay-btn !bg-slate-800 text-white font-bold shadow-lg shadow-slate-200 active:scale-95 transition-all hover:bg-slate-900"
        >
          확인
        </button>
      </div>
    </div>
  );
}

export default function Dashboard({ user, coupleId, isConnected }: { user: User, coupleId: string, isConnected: boolean }) {
  const [halls, setHalls] = useState<any[]>([]);
  const [alertConfig, setAlertConfig] = useState<{ 
    isOpen: boolean, 
    title: string, 
    message: string 
  }>({ isOpen: false, title: '', message: '' });
  const navigate = useNavigate();

  const showAlert = (title: string, message: string) => {
    setAlertConfig({ isOpen: true, title, message });
  };

  useEffect(() => {
    const q = query(collection(db, 'weddingHalls'), where('coupleId', '==', coupleId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const hallsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      setHalls(hallsData.sort((a, b) => {
        const timeA = typeof a.createdAt?.toMillis === 'function' ? a.createdAt.toMillis() : 0;
        const timeB = typeof b.createdAt?.toMillis === 'function' ? b.createdAt.toMillis() : 0;
        return timeB - timeA;
      }));
    });
    return () => unsubscribe();
  }, [coupleId]);

  const handleAddHall = async () => {
    try {
      const newDocRef = doc(collection(db, 'weddingHalls'));
      await setDoc(newDocRef, {
        id: newDocRef.id,
        coupleId,
        authorId: user.uid,
        authorName: user.displayName || '나',
        name: '새 웨딩홀',
        status: 'planned',
        halls: [{
          name: '메인홀',
          time: '',
          rentalFee: 0,
          mealFee: 0,
          guaranteedGuests: 0
        }],
        selectedHallIndex: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      navigate(`/hall/${newDocRef.id}`);
    } catch (error) {
      console.error("Error adding hall:", error);
      showAlert("오류", "웨딩홀 추가 중 오류가 발생했습니다.");
    }
  };

  const groupedHalls = halls.reduce((acc, hall) => {
    const name = hall.name || '새 웨딩홀';
    if (!acc[name]) acc[name] = [];
    acc[name].push(hall);
    return acc;
  }, {} as Record<string, any[]>);

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'visited': return <span className="px-2 py-1 bg-blue-100 text-blue-700 text-[10px] rounded-full font-bold">투어완료</span>;
      case 'contracted': return <span className="px-2 py-1 bg-rose-100 text-rose-700 text-[10px] rounded-full font-bold">계약완료</span>;
      default: return <span className="px-2 py-1 bg-slate-200 text-slate-600 text-[10px] rounded-full font-bold">방문예정</span>;
    }
  };

  return (
    <div className="p-6 pb-32">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">웨딩홀 투어</h1>
          <p className="text-sm text-slate-500 mt-1">우리의 완벽한 베뉴 찾기</p>
        </div>
      </div>

      {!isConnected && (
        <div className="mb-6 p-4 clay-card bg-rose-50/50 text-sm text-slate-600">
          현재 혼자 기록 중입니다. 설정 탭에서 연인과 연결하면 서로의 기록을 함께 볼 수 있습니다.
        </div>
      )}

      <div className="space-y-6">
        {halls.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <div className="clay-card w-20 h-20 mx-auto flex items-center justify-center mb-4 bg-white">
              <MapPin className="h-8 w-8 text-slate-300" />
            </div>
            <p className="font-medium">아직 등록된 웨딩홀이 없습니다.</p>
            <p className="text-sm mt-1">아래 + 버튼을 눌러 시작하세요!</p>
          </div>
        ) : (
          halls.map(hall => {
            const selectedHall = hall.halls && hall.halls.length > 0 
              ? hall.halls[hall.selectedHallIndex || 0] 
              : { name: hall.subHallName || '홀 미지정', time: hall.weddingTime || '시간 미정', rentalFee: hall.rentalFee, mealFee: hall.mealFee, guaranteedGuests: hall.guaranteedGuests };

            return (
              <div 
                key={hall.id} 
                className="clay-card p-5 cursor-pointer active:scale-[0.98] transition-transform"
                onClick={() => navigate(`/hall/${hall.id}`)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                      {hall.authorName ? hall.authorName.charAt(0) : '나'}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-700">{hall.name || '새 웨딩홀'}</p>
                      <p className="text-[10px] text-slate-400">
                        {hall.visitDate ? new Date(hall.visitDate).toLocaleDateString() : '방문일 미정'}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(hall.status)}
                </div>
                
                <div className="flex flex-col gap-2 text-sm text-slate-500 mt-4 bg-slate-50/50 p-3 rounded-xl">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-600">{selectedHall.name}</span>
                    <span className="text-[10px] text-slate-400">{selectedHall.time}</span>
                  </div>
                  {hall.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-rose-400" />
                      <span className="truncate text-xs">{hall.location}</span>
                    </div>
                  )}
                  {selectedHall.guaranteedGuests > 0 && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-rose-400" />
                      <span className="text-xs">보증인원 {selectedHall.guaranteedGuests}명</span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mt-1 border-t border-slate-200/50 pt-3">
                    <div className="flex items-center gap-1.5">
                      <CreditCard className="h-3 w-3 text-slate-400" />
                      <div className="flex flex-col">
                        <span className="text-[8px] text-slate-400 leading-none mb-0.5">대관료</span>
                        <span className="text-[10px] font-bold text-slate-700">{selectedHall.rentalFee ? `${selectedHall.rentalFee}만` : '-'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Utensils className="h-3 w-3 text-slate-400" />
                      <div className="flex flex-col">
                        <span className="text-[8px] text-slate-400 leading-none mb-0.5">식대</span>
                        <span className="text-[10px] font-bold text-slate-700">{selectedHall.mealFee ? `${selectedHall.mealFee}만` : '-'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Bus className="h-3 w-3 text-slate-400" />
                      <div className="flex flex-col">
                        <span className="text-[8px] text-slate-400 leading-none mb-0.5">교통</span>
                        <div className="flex items-center gap-0.5">
                          <Star className="h-2 w-2 text-yellow-400 fill-yellow-400" />
                          <span className="text-[10px] font-bold text-slate-700">{hall.trafficScore || '-'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="h-3 w-3 text-slate-400" />
                      <div className="flex flex-col">
                        <span className="text-[8px] text-slate-400 leading-none mb-0.5">분위기</span>
                        <div className="flex items-center gap-0.5">
                          <Star className="h-2 w-2 text-yellow-400 fill-yellow-400" />
                          <span className="text-[10px] font-bold text-slate-700">{hall.atmosphereScore || '-'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <button 
        className="fixed bottom-24 right-6 w-14 h-14 bg-rose-500 text-white rounded-full shadow-[0_8px_16px_rgba(244,63,94,0.4)] flex items-center justify-center active:scale-90 transition-transform z-40"
        onClick={handleAddHall}
      >
        <Plus className="h-6 w-6" />
      </button>

      <AlertModal 
        isOpen={alertConfig.isOpen}
        onClose={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))}
        title={alertConfig.title}
        message={alertConfig.message}
      />
    </div>
  );
}
