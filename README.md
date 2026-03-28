# Wedding

커플이 함께 웨딩홀 투어 정보를 기록하고 비교할 수 있는 웹 앱입니다. Google 로그인으로 시작하고, 연인 연결 후 같은 웨딩홀 목록을 공유하면서 상태, 방문 일정, 비용, 메모를 함께 관리할 수 있습니다.

## 주요 기능

- Google 로그인 및 Firebase 기반 사용자 관리
- 예신 / 예랑 역할 선택 및 역할별 기본 프로필 이미지 표시
- 초대 코드 기반 커플 연결
- 웨딩홀 추가, 상태 관리, 방문 일정 기록
- 웨딩홀 비교, 지도 확인, 상세 메모 관리
- Vercel 배포 + Firebase Authentication 연동

## 기술 스택

- React 19
- TypeScript
- Vite
- Firebase Authentication / Firestore
- Tailwind CSS

## 로컬 실행

### 1. 의존성 설치

```bash
npm install
```

이 프로젝트는 `pannellum-react`의 peer dependency 제약 때문에 루트 [`.npmrc`](/Users/jihun/StudioProjects/Wedding/.npmrc)에서 `legacy-peer-deps=true`를 사용합니다.

### 2. 환경 변수 설정

`.env` 또는 `.env.local`에 Firebase 웹 앱 설정 값을 넣어야 합니다.

예시:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_FIRESTORE_DATABASE_ID=...
```

실제 Firebase 설정 JSON이나 API 키가 들어간 파일은 저장소에 커밋하지 않습니다.

### 3. 개발 서버 실행

```bash
npm run dev
```

기본 개발 주소는 `http://localhost:3000` 입니다.

### 4. 푸시 전 비밀값 검사 훅 연결

```bash
npm run setup:hooks
```

이후 `git push` 전에 `npm run secrets:check`가 자동 실행됩니다. 현재 규칙은 다음을 차단합니다.

- `firebase-applet-config.json` 같은 tracked Firebase 설정 JSON
- Google API key 패턴 `AIza...`
- tracked 된 `.env` 파일

## Firebase Authentication 설정

Google 로그인을 사용하므로 Firebase Console의 `Authentication > Settings > Authorized domains`에 접속 도메인을 등록해야 합니다.

개발 시 예시:

- `localhost`
- `127.0.0.1`

배포 시 예시:

- `wedding-jwjh.vercel.app`

도메인은 프로토콜 없이 입력합니다.

## 배포

이 프로젝트는 Vercel에 배포할 수 있습니다.

```bash
npx vercel pull --yes --environment preview
npx vercel build --yes
npx vercel deploy --prod --yes
```

현재 운영 배포 URL:

- [https://wedding-jwjh.vercel.app](https://wedding-jwjh.vercel.app)

## 릴리스 및 APK 관련 메모

저장소에는 Android 패키징 구조와 GitHub Release 업로드 스크립트가 포함되어 있습니다.

- [generate-release-notes.mjs](/Users/jihun/StudioProjects/Wedding/scripts/generate-release-notes.mjs)
- [release-apk.sh](/Users/jihun/StudioProjects/Wedding/scripts/release-apk.sh)
- [release-discord.sh](/Users/jihun/StudioProjects/Wedding/scripts/release-discord.sh)

다만 실제 signed release APK 생성은 keystore 설정 검증이 아직 남아 있습니다. 따라서 현재는 Android 구조와 빌드 스크립트는 준비되어 있지만, 실제 배포용 APK 산출은 서명 검증이 끝난 뒤 진행해야 합니다.

## 검증 명령

```bash
npm run secrets:check
npm test
npm run lint
npm run build
```
