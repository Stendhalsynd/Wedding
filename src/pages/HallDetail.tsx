import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, onSnapshot, updateDoc, deleteDoc, serverTimestamp, collection, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { ArrowLeft, Trash2, Sparkles, MapPin, Star, Calendar as CalendarIcon, Clock, Plus } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import Markdown from 'react-markdown';
import { User } from 'firebase/auth';
import AuthorAvatar from '../components/AuthorAvatar';
import { toAuthorDisplay, UserRole } from '../utils/profileRules';

function TimePickerModal({ isOpen, onClose, onSelect, initialTime }: { isOpen: boolean, onClose: () => void, onSelect: (time: string) => void, initialTime: string }) {
  const [hour, setHour] = useState(initialTime ? initialTime.split(':')[0] : '12');
  const [minute, setMinute] = useState(initialTime ? initialTime.split(':')[1] : '00');

  if (!isOpen) return null;

  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutes = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0'));

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
      <div className="clay-card bg-slate-100 w-full max-w-xs p-6 space-y-6 animate-in fade-in zoom-in duration-200 border border-white/40 shadow-2xl">
        <h3 className="text-lg font-bold text-slate-800 text-center">예식 시간 선택</h3>
        
        <div className="flex justify-center items-center gap-4">
          <div className="flex flex-col items-center gap-2">
            <label className="text-xs font-bold text-slate-400">시</label>
            <select 
              value={hour} 
              onChange={(e) => setHour(e.target.value)}
              className="clay-input p-3 text-lg font-bold text-slate-700 focus:outline-none bg-white shadow-inner border border-slate-200"
            >
              {hours.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>
          <span className="text-2xl font-bold text-slate-400 mt-6">:</span>
          <div className="flex flex-col items-center gap-2">
            <label className="text-xs font-bold text-slate-400">분</label>
            <select 
              value={minute} 
              onChange={(e) => setMinute(e.target.value)}
              className="clay-input p-3 text-lg font-bold text-slate-700 focus:outline-none bg-white shadow-inner border border-slate-200"
            >
              {minutes.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-3 clay-btn bg-white text-slate-600 font-bold border border-slate-200 hover:bg-slate-50"
          >
            취소
          </button>
          <button 
            onClick={() => {
              onSelect(`${hour}:${minute}`);
              onClose();
            }}
            className="flex-1 py-3 clay-btn !bg-rose-500 text-white font-bold shadow-lg shadow-rose-200 active:scale-95 transition-all"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "삭제", 
  cancelText = "취소",
  isDestructive = true
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  onConfirm: () => void, 
  title: string, 
  message: string,
  confirmText?: string,
  cancelText?: string,
  isDestructive?: boolean
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
      <div className="clay-card bg-slate-100 w-full max-w-xs p-6 space-y-6 animate-in fade-in zoom-in duration-200 border border-white/40 shadow-2xl">
        <div className="space-y-2 text-center">
          <h3 className="text-lg font-bold text-slate-800">{title}</h3>
          <p className="text-sm text-slate-500 leading-relaxed">{message}</p>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-3 clay-btn bg-white text-slate-600 font-bold border border-slate-200 hover:bg-slate-50"
          >
            {cancelText}
          </button>
          <button 
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 py-3 clay-btn font-bold text-white shadow-lg active:scale-95 transition-all ${
              isDestructive ? '!bg-rose-500 shadow-rose-200' : '!bg-slate-800 shadow-slate-200'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

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

export default function HallDetail({ user, coupleId, isConnected }: { user: User, coupleId: string, isConnected: boolean }) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [hall, setHall] = useState<any>(null);
  const [localName, setLocalName] = useState('');
  const [localSubHallName, setLocalSubHallName] = useState('');
  const [localNotes, setLocalNotes] = useState('');
  const [selectedHallIndex, setSelectedHallIndex] = useState(0);
  const [authorProfile, setAuthorProfile] = useState<{ displayName?: string; role?: UserRole | null; profileImageUrl?: string | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<{ 
    isOpen: boolean, 
    title: string, 
    message: string, 
    onConfirm: () => void 
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });
  const [alertConfig, setAlertConfig] = useState<{ 
    isOpen: boolean, 
    title: string, 
    message: string 
  }>({ isOpen: false, title: '', message: '' });
  const dateInputRef = useRef<HTMLInputElement>(null);

  const showConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmConfig({ isOpen: true, title, message, onConfirm });
  };

  const showAlert = (title: string, message: string) => {
    setAlertConfig({ isOpen: true, title, message });
  };

  useEffect(() => {
    if (!id) return;
    const docRef = doc(db, 'weddingHalls', id);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists() && docSnap.data().coupleId === coupleId) {
        const data = docSnap.data();
        
        // Migrate old data structure to new one if necessary
        const halls = data.halls || [{
          name: data.subHallName || '메인홀',
          time: data.weddingTime || '',
          rentalFee: data.rentalFee || 0,
          mealFee: data.mealFee || 0,
          guaranteedGuests: data.guaranteedGuests || 0
        }];
        
        const updatedData = { ...data, halls };
        setHall({ id: docSnap.id, ...updatedData });
        setLocalName(data.name || '');
        
        const currentIndex = data.selectedHallIndex !== undefined ? data.selectedHallIndex : 0;
        setSelectedHallIndex(currentIndex);
        setLocalSubHallName(halls[currentIndex]?.name || '');
        setLocalNotes(data.notes || '');
      } else {
        navigate('/');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [id, coupleId, navigate]);

  useEffect(() => {
    if (!hall?.authorId) {
      setAuthorProfile(null);
      return;
    }

    let isCancelled = false;

    const loadAuthorProfile = async () => {
      const userSnap = await getDoc(doc(db, 'users', hall.authorId));
      if (!userSnap.exists()) {
        if (!isCancelled) {
          setAuthorProfile(null);
        }
        return;
      }

      const data = userSnap.data();
      if (!isCancelled) {
        setAuthorProfile({
          displayName: data.displayName,
          role: data.role ?? null,
          profileImageUrl: data.profileImageUrl ?? null,
        });
      }
    };

    loadAuthorProfile();

    return () => {
      isCancelled = true;
    };
  }, [hall?.authorId]);

  const handleChange = async (field: string, value: any) => {
    if (!id) return;
    setHall((prev: any) => ({ ...prev, [field]: value }));
    try {
      await updateDoc(doc(db, 'weddingHalls', id), {
        [field]: value,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
      // Revert local state on error
      const docRef = doc(db, 'weddingHalls', id);
      onSnapshot(docRef, (snap) => {
        if (snap.exists()) setHall({ id: snap.id, ...snap.data() });
      });
    }
  };

  const handleNameBlur = async () => {
    if (!id || localName === hall.name) return;
    // Update local state immediately to prevent reset
    setHall((prev: any) => ({ ...prev, name: localName }));
    try {
      await updateDoc(doc(db, 'weddingHalls', id), {
        name: localName,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error updating name:", error);
      setLocalName(hall.name || '');
    }
  };

  const handleHallChange = async (hallField: string, value: any) => {
    if (!id || !hall) return;
    
    const updatedHalls = [...hall.halls];
    updatedHalls[selectedHallIndex] = {
      ...updatedHalls[selectedHallIndex],
      [hallField]: value
    };
    
    setHall((prev: any) => ({ ...prev, halls: updatedHalls }));
    
    try {
      await updateDoc(doc(db, 'weddingHalls', id), {
        halls: updatedHalls,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error(`Error updating hall ${hallField}:`, error);
    }
  };

  const handleSubHallNameBlur = async () => {
    if (!id || !hall || localSubHallName === hall.halls[selectedHallIndex].name) return;
    
    const updatedHalls = [...hall.halls];
    updatedHalls[selectedHallIndex] = {
      ...updatedHalls[selectedHallIndex],
      name: localSubHallName
    };
    
    // Update local state immediately to prevent reset
    setHall((prev: any) => ({ ...prev, halls: updatedHalls }));
    
    try {
      await updateDoc(doc(db, 'weddingHalls', id), {
        halls: updatedHalls,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error updating subHallName:", error);
      setLocalSubHallName(hall.halls[selectedHallIndex].name || '');
    }
  };

  const handleSelectHall = async (index: number) => {
    if (!id) return;
    setSelectedHallIndex(index);
    setLocalSubHallName(hall.halls[index].name || '');
    try {
      await updateDoc(doc(db, 'weddingHalls', id), {
        selectedHallIndex: index,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error updating selectedHallIndex:", error);
    }
  };

  const handleAddHallToArray = async () => {
    if (!id || !hall) return;
    const newHall = {
      name: `새 홀 ${hall.halls.length + 1}`,
      time: '',
      rentalFee: 0,
      mealFee: 0,
      guaranteedGuests: 0
    };
    const updatedHalls = [...hall.halls, newHall];
    const newIndex = updatedHalls.length - 1;
    
    try {
      await updateDoc(doc(db, 'weddingHalls', id), {
        halls: updatedHalls,
        selectedHallIndex: newIndex,
        updatedAt: serverTimestamp()
      });
      setSelectedHallIndex(newIndex);
      setLocalSubHallName(newHall.name);
    } catch (error) {
      console.error("Error adding hall to array:", error);
      showAlert("오류", "홀 추가 중 오류가 발생했습니다.");
    }
  };

  const handleDeleteHallFromArray = async (index: number) => {
    if (!id || !hall || hall.halls.length <= 1) return;
    
    showConfirm(
      "홀 삭제",
      "이 홀 정보를 삭제하시겠습니까?",
      async () => {
        const updatedHalls = hall.halls.filter((_: any, i: number) => i !== index);
        const newIndex = Math.min(selectedHallIndex, updatedHalls.length - 1);
        
        try {
          await updateDoc(doc(db, 'weddingHalls', id), {
            halls: updatedHalls,
            selectedHallIndex: newIndex,
            updatedAt: serverTimestamp()
          });
          setSelectedHallIndex(newIndex);
          setLocalSubHallName(updatedHalls[newIndex].name);
        } catch (error) {
          console.error("Error deleting hall from array:", error);
          showAlert("오류", "삭제 중 오류가 발생했습니다.");
        }
      }
    );
  };

  const handleNotesBlur = async () => {
    if (!id || localNotes === hall.notes) return;
    try {
      await updateDoc(doc(db, 'weddingHalls', id), {
        notes: localNotes,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error updating notes:", error);
      setLocalNotes(hall.notes || '');
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    showConfirm(
      "웨딩홀 삭제",
      "정말 삭제하시겠습니까? 이 웨딩홀의 모든 정보가 영구적으로 삭제됩니다.",
      async () => {
        try {
          await deleteDoc(doc(db, 'weddingHalls', id));
          navigate('/');
        } catch (error) {
          console.error("Error deleting hall:", error);
          showAlert("오류", "삭제 중 오류가 발생했습니다.");
        }
      }
    );
  };

  const renderStarRating = (field: string, label: string) => {
    const score = hall[field] || 0;
    return (
      <div className="flex items-center justify-between py-2">
        <label className="text-sm font-bold text-slate-600">{label}</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => handleChange(field, star)}
              className={`p-1.5 rounded-lg transition-all ${
                score >= star ? 'text-rose-500 scale-110' : 'text-slate-200'
              }`}
            >
              <Star className={`h-5 w-5 ${score >= star ? 'fill-rose-500' : ''}`} />
            </button>
          ))}
        </div>
      </div>
    );
  };

  const handleAddAnotherHall = async () => {
    // This is now replaced by handleAddHallToArray for multiple halls in one record.
    // But if the user wants to add a completely different wedding hall, we keep it.
    if (!hall) return;
    try {
      const newDocRef = doc(collection(db, 'weddingHalls'));
      const newHallData = {
        id: newDocRef.id,
        name: '새 웨딩홀',
        location: '',
        status: 'planned',
        coupleId: coupleId,
        authorId: user.uid,
        authorName: user.displayName || '나',
        halls: [{
          name: '메인홀',
          time: '',
          rentalFee: 0,
          mealFee: 0,
          guaranteedGuests: 0
        }],
        selectedHallIndex: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        mealScore: 0,
        parkingScore: 0,
        trafficScore: 0,
        atmosphereScore: 0,
        brideRoomScore: 0,
        virginRoadScore: 0,
        ceilingHeightScore: 0,
        restroomScore: 0,
        flowScore: 0,
        notes: ''
      };
      await setDoc(newDocRef, newHallData);
      navigate(`/hall/${newDocRef.id}`);
    } catch (error) {
      console.error("Error adding another hall:", error);
      showAlert("오류", "추가 중 오류가 발생했습니다.");
    }
  };

  const openDatePicker = () => {
    if (!dateInputRef.current) return;
    try {
      dateInputRef.current.click();
    } catch (e) {
      console.error("Date picker error:", e);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading...</div>;
  if (!hall) return null;

  const authorDisplay = toAuthorDisplay({
    authorName: authorProfile?.displayName || hall.authorName,
    userRole: authorProfile?.role ?? null,
    profileImageUrl: authorProfile?.profileImageUrl,
  });

  return (
    <div className="bg-slate-50 min-h-screen pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-slate-50/80 backdrop-blur-md z-10 px-4 py-4 flex items-center justify-between border-b border-white/50">
        <button onClick={() => navigate('/')} className="p-2 clay-btn text-slate-600">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-bold text-slate-800 truncate px-4 flex-1 text-center">
          {localName || '새 웨딩홀'}
        </h1>
        <div className="flex gap-2">
          <button onClick={handleAddAnotherHall} className="p-2 clay-btn text-rose-500 flex items-center gap-1 px-3">
            <Plus className="h-4 w-4" />
            <span className="text-xs font-bold">베뉴 추가</span>
          </button>
          <button onClick={handleDelete} className="p-2 clay-btn text-slate-400">
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Hall Selector */}
      <div className="px-6 py-4 overflow-x-auto flex items-center gap-3 no-scrollbar">
        {hall.halls.map((h: any, index: number) => (
          <div key={index} className="relative group flex-shrink-0">
            <button
              onClick={() => handleSelectHall(index)}
              className={`px-5 py-2.5 rounded-2xl text-sm font-bold transition-all whitespace-nowrap ${
                selectedHallIndex === index
                  ? 'bg-rose-400 text-white shadow-lg shadow-rose-200'
                  : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {h.name || `홀 ${index + 1}`}
            </button>
            {hall.halls.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteHallFromArray(index);
                }}
                className="absolute -top-2 -right-2 w-5 h-5 bg-slate-400 text-white rounded-full flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
              >
                ×
              </button>
            )}
          </div>
        ))}
        <button
          onClick={handleAddHallToArray}
          className="flex-shrink-0 w-10 h-10 rounded-2xl bg-white border-2 border-dashed border-slate-200 text-slate-400 flex items-center justify-center hover:border-rose-300 hover:text-rose-400 transition-all"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      <div className="p-6 space-y-8 pt-0">
        <div className="clay-card p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AuthorAvatar display={authorDisplay} />
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">추가한 사람</p>
              <p className="text-sm font-bold text-slate-700">{authorDisplay.label || authorDisplay.name}</p>
            </div>
          </div>
          {!authorDisplay.label && (
            <span className="text-xs text-slate-400">역할 미설정</span>
          )}
        </div>

        {/* Status Segmented Control */}
        <div className="clay-card p-2 flex gap-2">
          {['planned', 'visited', 'contracted'].map((status) => {
            const labels: Record<string, string> = {
              planned: '방문예정',
              visited: '투어완료',
              contracted: '계약완료'
            };
            const isActive = (hall.status || 'planned') === status;
            return (
              <button
                key={status}
                onClick={() => handleChange('status', status)}
                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                  isActive ? 'bg-rose-400 text-white shadow-inner' : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                {labels[status]}
              </button>
            );
          })}
        </div>

        {/* Basic Info */}
        <section className="space-y-5">
          <h2 className="text-lg font-bold text-slate-800 pl-2 border-l-4 border-rose-400">기본 정보</h2>
          
          <div className="clay-card p-5 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">웨딩홀 이름</label>
              <input 
                className="w-full clay-input p-4 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-rose-400/50"
                value={localName} 
                onChange={(e) => setLocalName(e.target.value)} 
                onBlur={handleNameBlur}
                placeholder="예: 신도림 테크노마트 웨딩시티"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">홀 이름</label>
                <input 
                  className="w-full clay-input p-4 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-rose-400/50"
                  value={localSubHallName} 
                  onChange={(e) => setLocalSubHallName(e.target.value)} 
                  onBlur={handleSubHallNameBlur}
                  placeholder="예: 그랜드볼룸"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">예식 시간</label>
                <div 
                  className="w-full clay-input p-4 text-slate-800 font-medium flex items-center justify-between cursor-pointer"
                  onClick={() => setIsTimePickerOpen(true)}
                >
                  <span className={hall.halls[selectedHallIndex].time ? 'text-slate-800' : 'text-slate-400'}>
                    {hall.halls[selectedHallIndex].time || '-- : --'}
                  </span>
                  <Clock className="h-5 w-5 text-rose-400" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">위치/주소</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input 
                  className="w-full clay-input p-4 pl-12 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-rose-400/50"
                  value={hall.location || ''} 
                  onChange={(e) => handleChange('location', e.target.value)} 
                  placeholder="예: 서울 구로구 새말로 97"
                />
              </div>
              {hall.location && (
                <div className="mt-3 w-full h-40 rounded-2xl overflow-hidden border-4 border-white shadow-sm">
                  <iframe
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.google.com/maps?q=${encodeURIComponent(hall.location)}&output=embed`}
                  ></iframe>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">방문/예식 날짜</label>
              <div 
                className="w-full clay-input p-4 text-slate-800 font-medium flex items-center justify-between cursor-pointer"
                onClick={openDatePicker}
              >
                <span className={hall.visitDate ? 'text-slate-800' : 'text-slate-400'}>
                  {hall.visitDate ? new Date(hall.visitDate).toLocaleDateString() : '날짜를 선택하세요'}
                </span>
                <CalendarIcon className="h-5 w-5 text-rose-400" />
                <input 
                  ref={dateInputRef}
                  type="date"
                  className="absolute opacity-0 pointer-events-none"
                  value={hall.visitDate ? hall.visitDate.split('T')[0] : ''} 
                  onChange={(e) => handleChange('visitDate', e.target.value ? new Date(e.target.value).toISOString() : null)} 
                />
              </div>
            </div>
          </div>
        </section>

        <TimePickerModal 
          isOpen={isTimePickerOpen}
          onClose={() => setIsTimePickerOpen(false)}
          onSelect={(time) => handleHallChange('time', time)}
          initialTime={hall.halls[selectedHallIndex].time}
        />

        {/* Estimate Info */}
        <section className="space-y-5">
          <h2 className="text-lg font-bold text-slate-800 pl-2 border-l-4 border-rose-400">견적 정보 ({hall.halls[selectedHallIndex].name})</h2>
          
          <div className="clay-card p-5 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex justify-between">
                <span>대관료</span>
                <span className="text-rose-500">{hall.halls[selectedHallIndex].rentalFee ? `${hall.halls[selectedHallIndex].rentalFee} 만원` : '입력 안됨'}</span>
              </label>
              <input 
                type="range" min="0" max="800" step="10"
                className="w-full accent-rose-400"
                value={hall.halls[selectedHallIndex].rentalFee || 0} 
                onChange={(e) => handleHallChange('rentalFee', Number(e.target.value))} 
              />
              <div className="flex justify-between text-xs text-slate-400">
                <span>0</span><span>800</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex justify-between">
                <span>식대 (1인)</span>
                <span className="text-rose-500">{hall.halls[selectedHallIndex].mealFee ? `${hall.halls[selectedHallIndex].mealFee} 만원` : '입력 안됨'}</span>
              </label>
              <input 
                type="range" min="0" max="7.5" step="0.1"
                className="w-full accent-rose-400"
                value={hall.halls[selectedHallIndex].mealFee || 0} 
                onChange={(e) => handleHallChange('mealFee', Number(e.target.value))} 
              />
              <div className="flex justify-between text-xs text-slate-400">
                <span>0</span><span>7.5</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex justify-between">
                <span>보증인원</span>
                <span className="text-rose-500">{hall.halls[selectedHallIndex].guaranteedGuests ? `${hall.halls[selectedHallIndex].guaranteedGuests} 명` : '입력 안됨'}</span>
              </label>
              <input 
                type="range" min="0" max="300" step="10"
                className="w-full accent-rose-400"
                value={hall.halls[selectedHallIndex].guaranteedGuests || 0} 
                onChange={(e) => handleHallChange('guaranteedGuests', Number(e.target.value))} 
              />
              <div className="flex justify-between text-xs text-slate-400">
                <span>0</span><span>300</span>
              </div>
            </div>
          </div>
        </section>

        {/* Ratings */}
        <section className="space-y-5">
          <h2 className="text-lg font-bold text-slate-800 pl-2 border-l-4 border-rose-400">항목별 평가</h2>
          
          <div className="clay-card p-5 space-y-2 divide-y divide-slate-100">
            {renderStarRating('mealScore', '식사 만족도')}
            {renderStarRating('parkingScore', '주차 편의성')}
            {renderStarRating('trafficScore', '교통 및 접근성')}
            {renderStarRating('atmosphereScore', '홀 분위기')}
            {renderStarRating('brideRoomScore', '신부대기실')}
            {renderStarRating('virginRoadScore', '버진로드')}
            {renderStarRating('ceilingHeightScore', '층고')}
            {renderStarRating('restroomScore', '화장실 청결도')}
            {renderStarRating('flowScore', '방문객 동선')}
          </div>
        </section>

        {/* Notes */}
        <section className="space-y-5">
          <h2 className="text-lg font-bold text-slate-800 pl-2 border-l-4 border-rose-400">상세 메모</h2>
          
          <div className="clay-card p-5">
            <textarea 
              className="w-full clay-input p-4 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-rose-400/50 min-h-[150px] resize-none"
              value={localNotes} 
              onChange={(e) => setLocalNotes(e.target.value)} 
              onBlur={handleNotesBlur}
              placeholder="투어 중 느낀 점, 장단점, 특이사항을 자유롭게 적어주세요."
            />
          </div>
        </section>

      </div>

      <ConfirmModal 
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
      />

      <AlertModal 
        isOpen={alertConfig.isOpen}
        onClose={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))}
        title={alertConfig.title}
        message={alertConfig.message}
      />
    </div>
  );
}
