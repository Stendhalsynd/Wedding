import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function MapView() {
  const [halls, setHalls] = useState<any[]>([]);
  const [selectedHall, setSelectedHall] = useState<any | null>(null);
  const user = auth.currentUser;
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    const unsubscribeUser = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
      if (docSnap.exists()) {
        const coupleId = docSnap.data().coupleId || user.uid;
        const q = query(collection(db, 'weddingHalls'), where('coupleId', '==', coupleId));
        onSnapshot(q, (snapshot) => {
          const hallsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
          const hallsWithLocation = hallsData.filter(h => h.location);
          setHalls(hallsWithLocation);
          if (hallsWithLocation.length > 0 && !selectedHall) {
            setSelectedHall(hallsWithLocation[0]);
          }
        });
      }
    });
    return () => unsubscribeUser();
  }, [user]);

  return (
    <div className="min-h-full flex flex-col bg-slate-50 pt-fixed-page-header">
      <div className="fixed inset-x-0 top-0 z-20">
        <div className="mx-auto max-w-md border-b border-white/40 bg-slate-50/95 px-6 pb-4 pt-safe-top backdrop-blur-md">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-800">지도 뷰</h1>
            <p className="mt-1 text-sm text-slate-500">우리의 웨딩홀 위치를 확인하세요</p>
          </div>
        </div>
      </div>

      <div className="flex flex-1 min-h-0 flex-col gap-4 px-6 pb-safe-nav">
        {halls.length === 0 ? (
          <div className="clay-card p-8 flex flex-col items-center justify-center text-slate-400 text-center h-64">
            <MapPin className="h-10 w-10 mb-4 text-slate-300" />
            <p>위치가 등록된 웨딩홀이 없습니다.</p>
            <p className="text-sm mt-1">웨딩홀 상세 페이지에서 위치를 입력해주세요.</p>
          </div>
        ) : (
          <div className="flex flex-1 min-h-0 flex-col gap-4">
            <div className="clay-card p-2 flex gap-2 overflow-x-auto hide-scrollbar shrink-0">
              {halls.map(hall => (
                <button
                  key={hall.id}
                  onClick={() => setSelectedHall(hall)}
                  className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                    selectedHall?.id === hall.id ? 'bg-rose-400 text-white shadow-inner' : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  {hall.name || '새 웨딩홀'}
                </button>
              ))}
            </div>

            {selectedHall && (
              <div className="relative flex flex-1 min-h-[28rem] flex-col">
                <div className="absolute inset-0 overflow-hidden rounded-[2rem] border-4 border-white bg-slate-100 shadow-[8px_8px_16px_rgba(0,0,0,0.05),-8px_-8px_16px_rgba(255,255,255,0.8)]">
                  <iframe
                    className="absolute inset-0 h-full w-full"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.google.com/maps?q=${encodeURIComponent(selectedHall.location)}&output=embed`}
                  ></iframe>
                </div>

                <div className="pointer-events-none absolute inset-0 z-10">
                  <button
                    onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedHall.location)}`, '_blank', 'noopener,noreferrer')}
                    className="pointer-events-auto absolute left-4 top-4 rounded-2xl border border-white/80 bg-white/95 px-4 py-3 text-sm font-bold text-blue-600 shadow-lg shadow-slate-200"
                  >
                    지도에서 열기
                  </button>

                  <button
                    onClick={() => navigate(`/hall/${selectedHall.id}`)}
                    className="pointer-events-auto absolute inset-x-0 bottom-0 rounded-[2rem] border border-white/70 bg-slate-50/96 p-5 text-left shadow-[0_-12px_24px_rgba(15,23,42,0.08)] backdrop-blur-md active:scale-[0.98] transition-transform"
                  >
                    <h3 className="font-bold text-slate-800">{selectedHall.name}</h3>
                    <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                      <MapPin className="h-3 w-3" />
                      {selectedHall.location}
                    </p>
                    {selectedHall.halls && selectedHall.halls.length > 0 && (
                      <p className="mt-1 text-[10px] font-bold text-rose-400">
                        {selectedHall.halls[selectedHall.selectedHallIndex || 0].name} ({selectedHall.halls[selectedHall.selectedHallIndex || 0].time})
                      </p>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
