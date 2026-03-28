import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';

export default function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/login');
    }, 2000); // 2 seconds splash screen

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto items-center justify-center bg-rose-50 p-4">
      <div className="animate-bounce mb-8">
        <div className="clay-card p-6 rounded-full bg-white flex items-center justify-center">
          <Heart className="h-16 w-16 text-rose-500 fill-rose-500" />
        </div>
      </div>
      <h1 className="text-4xl font-bold text-slate-800 tracking-tight mb-2">Start!</h1>
      <p className="text-slate-500 font-medium text-center">
        우리의 결혼 준비, <br /> 완벽한 시작을 위해
      </p>
    </div>
  );
}
