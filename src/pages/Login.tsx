import { useState, useEffect } from 'react';
import { isNativeAndroid, signInWithGoogle } from '../services/auth';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { AlertCircle, ExternalLink } from 'lucide-react';

export default function Login() {
  const nativeAndroid = isNativeAndroid();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isInApp, setIsInApp] = useState(false);

  useEffect(() => {
    if (nativeAndroid) {
      setIsInApp(false);
      return;
    }

    const ua = navigator.userAgent.toLowerCase();
    const isInAppBrowser = ua.indexOf('kakaotalk') > -1 || 
                          ua.indexOf('instagram') > -1 || 
                          ua.indexOf('fban') > -1 || 
                          ua.indexOf('fbav') > -1 || 
                          ua.indexOf('line') > -1;
    setIsInApp(isInAppBrowser);
  }, [nativeAndroid]);

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error(err);
      if (nativeAndroid && err.message?.includes('idToken')) {
        setError('안드로이드 구글 로그인 응답에 필수 토큰이 없어 로그인을 완료하지 못했습니다.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setError('현재 도메인이 Firebase 인증에 등록되지 않았습니다. Firebase 콘솔의 Authentication > Settings > Authorized domains에 현재 URL을 추가해주세요.');
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError('로그인 팝업이 닫혔습니다. 다시 시도해주세요.');
      } else if (err.message?.includes('disallowed_useragent')) {
        setError('구글 보안 정책으로 인해 현재 브라우저에서는 로그인이 차단되었습니다. 크롬(Chrome)이나 사파리(Safari) 등 외부 브라우저에서 접속해주세요.');
      } else if (nativeAndroid) {
        setError('안드로이드 구글 로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
      } else {
        setError(err.message || '로그인 중 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  const openExternalBrowser = () => {
    const url = window.location.href;
    if (navigator.userAgent.match(/KAKAOTALK/i)) {
      window.location.href = `kakaotalk://web/openExternal?url=${encodeURIComponent(url)}`;
    } else {
      setError('우측 상단 메뉴(...)를 눌러 "다른 브라우저로 열기" 또는 "Safari로 열기"를 선택해주세요.');
    }
  };

  return (
    <div className="flex h-screen items-center justify-center p-4 bg-slate-50">
      <Card className="w-full max-w-md clay-card border-none shadow-xl">
        <CardHeader className="text-center pb-2">
          <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
            <span className="text-3xl">💍</span>
          </div>
          <CardTitle className="text-3xl font-bold text-slate-800">Wedding Tour</CardTitle>
          <CardDescription className="text-slate-500 font-medium">
            연인과 함께 실시간으로<br />웨딩홀 투어 정보를 기록하세요.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 pt-6">
          {!nativeAndroid && isInApp && (
            <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex flex-col gap-3 shadow-sm">
              <div className="flex items-start gap-3 text-amber-700">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <p className="text-sm font-bold leading-tight">
                  인앱 브라우저(카카오톡 등)에서는 구글 로그인이 제한될 수 있습니다.
                </p>
              </div>
              <button 
                onClick={openExternalBrowser}
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-amber-100 text-amber-800 rounded-xl text-xs font-bold hover:bg-amber-200 transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                외부 브라우저로 열기
              </button>
            </div>
          )}

          {error && (
            <div className="p-4 text-sm font-bold text-rose-600 bg-rose-50 border border-rose-100 rounded-2xl break-words shadow-sm">
              {error}
            </div>
          )}
          
          <Button 
            onClick={handleLogin} 
            disabled={loading} 
            size="lg" 
            className="w-full h-14 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold shadow-lg transition-all active:scale-95"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                로그인 중...
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
                구글 계정으로 로그인
              </div>
            )}
          </Button>
          
          <p className="text-[10px] text-slate-400 text-center mt-2">
            로그인 시 서비스 이용약관 및 개인정보 처리방침에 동의하게 됩니다.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
