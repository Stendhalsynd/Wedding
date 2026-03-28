import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Star, Filter, ArrowUp, ArrowDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type SortKey = 'status' | 'rentalFee' | 'mealFee' | 'mealScore' | 'parkingScore' | 'atmosphereScore' | 'trafficScore' | 'brideRoomScore' | 'virginRoadScore' | 'ceilingHeightScore' | 'restroomScore' | 'flowScore';
type SortOrder = 'asc' | 'desc' | null;

export default function CompareView() {
  const [halls, setHalls] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState<SortKey | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
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
          const validHalls = hallsData.filter(h => h.name !== '새 웨딩홀' || h.rentalFee || h.mealFee);
          setHalls(validHalls);
        });
      }
    });
    return () => unsubscribeUser();
  }, [user]);

  const handleSort = (key: SortKey) => {
    if (sortBy === key) {
      if (sortOrder === 'asc') setSortOrder('desc');
      else if (sortOrder === 'desc') {
        setSortOrder(null);
        setSortBy(null);
      }
    } else {
      setSortBy(key);
      setSortOrder('asc');
    }
  };

  const getFilteredAndSortedHalls = () => {
    let result = [...halls];

    if (filterStatus !== 'all') {
      result = result.filter(h => h.status === filterStatus);
    }

    if (sortBy && sortOrder) {
      result.sort((a, b) => {
        let valA = a[sortBy];
        let valB = b[sortBy];

        if (sortBy === 'status') {
          const statusOrder: Record<string, number> = { planned: 1, visited: 2, contracted: 3 };
          valA = statusOrder[valA || 'planned'];
          valB = statusOrder[valB || 'planned'];
        } else {
          valA = valA || 0;
          valB = valB || 0;
        }

        return sortOrder === 'asc' ? valA - valB : valB - valA;
      });
    }

    return result;
  };

  const displayHalls = getFilteredAndSortedHalls();

  const renderScore = (score: number) => {
    if (!score) return <span className="text-slate-300">-</span>;
    return (
      <div className="flex items-center justify-center gap-1">
        <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
        <span className="font-bold">{score}</span>
      </div>
    );
  };

  const renderStatus = (status: string) => {
    switch(status) {
      case 'visited': return <span className="text-blue-500 font-bold text-xs">투어완료</span>;
      case 'contracted': return <span className="text-rose-500 font-bold text-xs">계약완료</span>;
      default: return <span className="text-slate-500 font-bold text-xs">방문예정</span>;
    }
  };

  const SortIcon = ({ field }: { field: SortKey }) => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' ? <ArrowUp className="h-3 w-3 ml-1" /> : <ArrowDown className="h-3 w-3 ml-1" />;
  };

  const rows = [
    { key: 'status', label: '상태', sortable: true },
    { key: 'rentalFee', label: '대관료', sortable: true },
    { key: 'mealFee', label: '식대', sortable: true },
    { key: 'mealScore', label: '식사', sortable: true },
    { key: 'parkingScore', label: '주차', sortable: true },
    { key: 'trafficScore', label: '교통', sortable: true },
    { key: 'atmosphereScore', label: '분위기', sortable: true },
    { key: 'brideRoomScore', label: '신부대기실', sortable: true },
    { key: 'virginRoadScore', label: '버진로드', sortable: true },
    { key: 'ceilingHeightScore', label: '층고', sortable: true },
    { key: 'restroomScore', label: '화장실', sortable: true },
    { key: 'flowScore', label: '동선', sortable: true }
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="p-6 pb-4 shrink-0">
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">웨딩홀 비교</h1>
        <p className="text-sm text-slate-500 mt-1">한눈에 보는 우리의 웨딩홀 후보</p>
      </div>

      {/* Filter */}
      <div className="px-6 mb-6 flex items-center gap-2 overflow-x-auto hide-scrollbar shrink-0">
        <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
          {['all', 'planned', 'visited', 'contracted'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                filterStatus === status ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              {status === 'all' ? '전체' : status === 'planned' ? '방문예정' : status === 'visited' ? '투어완료' : '계약완료'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-x-auto px-6 pb-32 hide-scrollbar">
        {displayHalls.length === 0 ? (
          <div className="clay-card p-8 flex flex-col items-center justify-center text-slate-400 text-center h-64">
            <p>비교할 웨딩홀이 없습니다.</p>
          </div>
        ) : (
          <div className="flex gap-4 min-w-max">
            {/* Row Headers */}
            <div className="flex flex-col w-28 shrink-0">
              {/* Header Spacer */}
              <div className="h-16 mb-4" />
              <div className="flex flex-col gap-3">
                {rows.map(row => (
                  <button
                    key={row.key}
                    disabled={!row.sortable}
                    onClick={() => row.sortable && handleSort(row.key as SortKey)}
                    className={`h-12 flex items-center px-3 rounded-xl text-xs font-bold transition-all ${
                      sortBy === row.key ? 'bg-rose-100 text-rose-600 shadow-sm' : 'text-slate-500 hover:bg-slate-100'
                    } ${!row.sortable ? 'cursor-default' : ''}`}
                  >
                    {row.label}
                    {row.sortable && <SortIcon field={row.key as SortKey} />}
                  </button>
                ))}
              </div>
            </div>

            {/* Hall Columns */}
            {displayHalls.map(hall => {
              const selectedHall = hall.halls && hall.halls.length > 0 
                ? hall.halls[hall.selectedHallIndex || 0] 
                : { name: hall.subHallName || '홀 미지정', time: hall.weddingTime || '시간 미정', rentalFee: hall.rentalFee, mealFee: hall.mealFee, guaranteedGuests: hall.guaranteedGuests };

              return (
                <div key={hall.id} className="flex flex-col w-40 shrink-0">
                  {/* Hall Header */}
                  <button 
                    onClick={() => navigate(`/hall/${hall.id}`)}
                    className="h-16 flex flex-col items-center justify-center text-center border-b-2 border-rose-200 mb-4 px-2 active:scale-95 transition-transform"
                  >
                    <span className="font-bold text-slate-800 text-sm truncate w-full">{hall.name}</span>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400">
                      <span className="truncate">{selectedHall.name}</span>
                      {selectedHall.time && <span>• {selectedHall.time}</span>}
                    </div>
                  </button>
                  
                  <div className="flex flex-col gap-3">
                    <div className="clay-card h-12 flex items-center justify-center bg-white">
                      {renderStatus(hall.status)}
                    </div>
                    <div className="clay-card h-12 flex items-center justify-center bg-white text-sm font-bold text-slate-700">
                      {selectedHall.rentalFee ? `${selectedHall.rentalFee}만` : '-'}
                    </div>
                    <div className="clay-card h-12 flex items-center justify-center bg-white text-sm font-bold text-slate-700">
                      {selectedHall.mealFee ? `${selectedHall.mealFee}만` : '-'}
                    </div>
                    <div className="clay-card h-12 flex items-center justify-center bg-white">
                      {renderScore(hall.mealScore)}
                    </div>
                    <div className="clay-card h-12 flex items-center justify-center bg-white">
                      {renderScore(hall.parkingScore)}
                    </div>
                    <div className="clay-card h-12 flex items-center justify-center bg-white">
                      {renderScore(hall.trafficScore)}
                    </div>
                    <div className="clay-card h-12 flex items-center justify-center bg-white">
                      {renderScore(hall.atmosphereScore)}
                    </div>
                    <div className="clay-card h-12 flex items-center justify-center bg-white">
                      {renderScore(hall.brideRoomScore)}
                    </div>
                    <div className="clay-card h-12 flex items-center justify-center bg-white">
                      {renderScore(hall.virginRoadScore)}
                    </div>
                    <div className="clay-card h-12 flex items-center justify-center bg-white">
                      {renderScore(hall.ceilingHeightScore)}
                    </div>
                    <div className="clay-card h-12 flex items-center justify-center bg-white">
                      {renderScore(hall.restroomScore)}
                    </div>
                    <div className="clay-card h-12 flex items-center justify-center bg-white">
                      {renderScore(hall.flowScore)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
