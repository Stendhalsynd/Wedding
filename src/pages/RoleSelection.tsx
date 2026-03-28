import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { GoogleGenAI } from "@google/genai";
import { Loader2, Heart } from 'lucide-react';

export default function RoleSelection() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const user = auth.currentUser;

  const generateProfileImage = async (role: 'bride' | 'groom') => {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const prompt = role === 'bride' 
      ? "A cute, minimalist 3D character illustration of a bride wearing a simple white wedding dress and a small veil, soft pastel colors, claymorphism style, white background, circular profile picture style"
      : "A cute, minimalist 3D character illustration of a groom wearing a simple black tuxedo and a bow tie, soft pastel colors, claymorphism style, white background, circular profile picture style";

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: prompt }]
        },
        config: {
          imageConfig: {
            aspectRatio: "1:1"
          }
        }
      });

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      return null;
    } catch (err) {
      console.error("Image generation failed:", err);
      return null;
    }
  };

  const handleRoleSelect = async (role: 'bride' | 'groom') => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      const profileImage = await generateProfileImage(role);
      
      await updateDoc(doc(db, 'users', user.uid), {
        role,
        profileImage,
        updatedAt: serverTimestamp()
      });

      navigate('/', { replace: true });
    } catch (err) {
      console.error("Failed to update role:", err);
      setError("역할 설정 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="space-y-2">
          <div className="w-20 h-20 bg-rose-100 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-rose-100/50">
            <Heart className="h-10 w-10 text-rose-500 fill-rose-500" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">환영합니다!</h1>
          <p className="text-slate-500">당신의 역할을 선택해주세요.</p>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl text-sm font-medium">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleRoleSelect('bride')}
            disabled={loading}
            className="clay-card p-8 flex flex-col items-center gap-4 hover:scale-[1.02] active:scale-[0.98] transition-all group disabled:opacity-50"
          >
            <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center group-hover:bg-rose-100 transition-colors">
              <span className="text-4xl">👰‍♀️</span>
            </div>
            <span className="text-xl font-bold text-slate-700">예신</span>
          </button>

          <button
            onClick={() => handleRoleSelect('groom')}
            disabled={loading}
            className="clay-card p-8 flex flex-col items-center gap-4 hover:scale-[1.02] active:scale-[0.98] transition-all group disabled:opacity-50"
          >
            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-colors">
              <span className="text-4xl">🤵‍♂️</span>
            </div>
            <span className="text-xl font-bold text-slate-700">예랑</span>
          </button>
        </div>

        {loading && (
          <div className="flex flex-col items-center gap-3 text-slate-500">
            <Loader2 className="h-6 w-6 animate-spin text-rose-500" />
            <p className="text-sm font-medium">나노바나나가 귀여운 프로필을 만들고 있어요...</p>
          </div>
        )}
      </div>
    </div>
  );
}
