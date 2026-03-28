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
    <div className="min-h-full flex flex-col bg-slate-50">
      <div className="sticky top-0 z-20 mb-4 border-b border-white/40 bg-slate-50/95 px-6 pb-4 pt-safe-top backdrop-blur-md shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">지도 뷰</h1>
          <p className="text-sm text-slate-500 mt-1">우리의 웨딩홀 위치를 확인하세요</p>
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
              <div className="flex flex-1 min-h-0 flex-col gap-4">
                <div className="clay-card flex-1 min-h-[18rem] overflow-hidden border-4 border-white">
                  <iframe
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.google.com/maps?q=${encodeURIComponent(selectedHall.location)}&output=embed`}
                  ></iframe>
                </div>

                <button
                  onClick={() => navigate(`/hall/${selectedHall.id}`)}
                  className="clay-card w-full shrink-0 border border-white/70 p-4 text-left active:scale-[0.98] transition-transform"
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
            )}
          </div>
        )}
      </div>
    </div>
  );
}
