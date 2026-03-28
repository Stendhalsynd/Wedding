import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { ChevronLeft, Box, Camera, Info } from 'lucide-react';
import { Pannellum } from 'pannellum-react';
import '@google/model-viewer';

export default function VirtualPreview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [hall, setHall] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'360' | 'ar'>('360');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchHall = async () => {
      const docRef = doc(db, 'weddingHalls', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setHall(docSnap.data());
      }
      setLoading(false);
    };
    fetchHall();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-rose-200 rounded-full mb-4"></div>
          <p className="text-slate-400 font-medium">가상 공간 준비 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-white overflow-hidden">
      {/* Header */}
      <div className="p-4 flex items-center justify-between z-50 bg-slate-900/50 backdrop-blur-md">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <div className="text-center">
          <h1 className="text-sm font-bold truncate max-w-[200px]">{hall?.name || '웨딩홀'}</h1>
          <p className="text-[10px] text-slate-400">가상 인테리어 미리보기</p>
        </div>
        <div className="w-10"></div>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-slate-800/50 mx-6 my-4 rounded-xl z-50">
        <button
          onClick={() => setActiveTab('360')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === '360' ? 'bg-rose-500 text-white shadow-lg' : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          <Box className="h-4 w-4" />
          360° 투어
        </button>
        <button
          onClick={() => setActiveTab('ar')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'ar' ? 'bg-rose-500 text-white shadow-lg' : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          <Camera className="h-4 w-4" />
          AR 모드
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 relative">
        {activeTab === '360' ? (
          <div className="w-full h-full">
            <Pannellum
              width="100%"
              height="100%"
              image="https://pannellum.org/images/alma.jpg"
              pitch={10}
              yaw={180}
              hfov={110}
              autoLoad
              onLoad={() => console.log("Panorama loaded")}
            >
              <Pannellum.Hotspot
                type="info"
                pitch={11}
                yaw={-167}
                text="메인 무대 및 버진로드"
              />
              <Pannellum.Hotspot
                type="info"
                pitch={31}
                yaw={-107}
                text="샹들리에 조명"
              />
            </Pannellum>
            
            <div className="absolute bottom-24 left-6 right-6 p-4 bg-black/40 backdrop-blur-sm rounded-2xl border border-white/10">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold">360° 가상 투어</p>
                  <p className="text-[10px] text-slate-300 mt-1 leading-relaxed">
                    화면을 드래그하여 홀 내부를 자유롭게 둘러보세요. 실제 예식 분위기를 미리 체험할 수 있습니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center">
            {/* @ts-ignore */}
            <model-viewer
              src="https://modelviewer.dev/shared-assets/models/Astronaut.glb"
              ios-src=""
              alt="A 3D model of a wedding hall element"
              shadow-intensity="1"
              camera-controls
              auto-rotate
              ar
              ar-modes="webxr scene-viewer quick-look"
              style={{ width: '100%', height: '100%', backgroundColor: 'transparent' }}
            >
              <button slot="ar-button" className="absolute bottom-32 left-1/2 -translate-x-1/2 bg-rose-500 text-white px-6 py-3 rounded-full font-bold shadow-xl flex items-center gap-2 active:scale-95 transition-transform">
                <Camera className="h-5 w-5" />
                내 방에 배치해보기 (AR)
              </button>
              
              <div id="ar-prompt" className="absolute bottom-48 left-1/2 -translate-x-1/2 opacity-0 transition-opacity">
                <img src="https://modelviewer.dev/shared-assets/icons/hand.png" alt="AR prompt" className="w-12 h-12 animate-bounce" />
              </div>
            {/* @ts-ignore */}
            </model-viewer>

            <div className="absolute bottom-24 left-6 right-6 p-4 bg-black/40 backdrop-blur-sm rounded-2xl border border-white/10">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold">AR 가상 배치</p>
                  <p className="text-[10px] text-slate-300 mt-1 leading-relaxed">
                    AR 버튼을 눌러 실제 공간에 웨딩홀의 주요 장식이나 홀 구조를 배치해보세요. (지원 기기 필요)
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation Spacer */}
      <div className="h-20 shrink-0"></div>
    </div>
  );
}
