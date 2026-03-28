# 2026-03-29 Android Packaging

## todo
- [x] S2-1 작성
- [x] S2-1 테스트 작성
- [x] Capacitor 의존성 추가
- [x] Capacitor Android 프로젝트 생성
- [x] package.json Android 스크립트 추가
- [x] S2-1 검증
- [x] S2-1 리뷰 게이트

- [x] S2-2 작성
- [x] S2-2 테스트 작성
- [x] Android Google 로그인 브리지 구현
- [x] S2-2 검증
- [x] S2-2 리뷰 게이트

- [x] S2-3 작성
- [x] S2-3 테스트 작성
- [x] Android signing / release build 구현
- [ ] S2-3 검증
- [ ] S2-3 리뷰 게이트

- [x] S2-4 작성
- [x] S2-4 테스트 작성
- [x] Web / Android 아이콘 생성 및 적용
- [x] S2-4 검증
- [x] S2-4 리뷰 게이트

## doing
- 실제 사용자 keystore 생성 및 `.env` 연결 완료, signed APK 검증 대기

## done
- S2-0 실행 모델에 따라 S2-1 범위 확정
- `tests/unit/capacitor-config.test.ts`로 S2-1 red -> green 검증 추가
- Capacitor는 Node 20.9 호환을 위해 7.6.1로 고정
- `capacitor.config.ts` 추가
- `package.json`에 Android 스크립트 추가
- `android/` 프로젝트 생성 완료
- S2-2 범위와 auth bridge 구조 결정
- `@capacitor-firebase/authentication@7.5.0` 추가
- `src/services/auth.ts`로 Android/web auth facade 추가
- `src/services/auth-core.ts`로 auth 분기 로직을 runtime wrapper에서 분리
- Login, Settings, ConnectCouple를 새 auth facade로 연결
- Capacitor FirebaseAuthentication plugin config 추가
- S2-3 범위와 signing / version metadata 규칙 결정
- `scripts/android-version.mjs` 추가
- `scripts/release-android-build.sh` 추가
- `android/app/build.gradle`에서 package version/signing config 반영
- `.env.example`에 Android signing 변수 추가
- `package.json`에 Android release build 스크립트 추가
- S2-4 아이콘 범위 확정
- 대표 아이콘 소스는 `public/예비신랑.png`, `public/예비신부.png`로 고정
- `tests/unit/app-icons.test.ts`로 웹 favicon / Android launcher icon 검증 추가
- `scripts/generate-app-icons.py`로 웹/Android 아이콘 생성 자동화 추가
- `index.html`에 favicon / apple-touch-icon 링크와 `Wedding Tour` 타이틀 반영
- Android launcher icon 및 adaptive foreground/background 자산 교체 완료
- `/Users/jihun/.keystores/wedding-release.jks` 생성 및 `.env` Android signing 변수 연결 완료

## verification
- `npm test -- tests/unit/capacitor-config.test.ts` 통과
- `npm run lint` 통과
- `npm run android:prepare` 통과
- `npx tsc --noEmit --project tsconfig.json` 진단 오류 0 확인
- S2-1 review gate에서 추가 수정 필요 사항 없음 확인
- `npm test -- tests/unit/auth-service.test.ts` 통과
- `npm run lint` 통과
- `npm run android:prepare`에서 `@capacitor-firebase/authentication@7.5.0` plugin sync 확인
- S2-2 review gate에서 blocker 없음 확인
- `npm test -- tests/unit/android-release-build.test.ts` 통과
- `npm run lint` 통과
- `npm run build` 통과
- `scripts/release-android-build.sh` dry-run 통과
- Vite build에서 auth dynamic-import chunk warning 제거 확인
- `npm test -- tests/unit/app-icons.test.ts` 통과
- `git diff --check` 통과
- `npm run build` 통과
- `npm run android:prepare` 통과
- Playwright에서 `http://localhost:3000/login` 진입, `Wedding Tour` 타이틀 및 Google 로그인 버튼 렌더링 확인
- Playwright에서 `localhost` 기준 Google popup auth handler 오픈 확인

## risks
- `npx cap add android`와 `npx cap sync android`는 로컬 Java/Android toolchain 상태에 영향을 받는다.
- 현재 세션에는 범용 subagent 실행 도구가 직접 노출되지 않을 수 있어, 역할 분리는 병렬 탐색/검증 중심으로 적용한다.
- Android 실제 로그인 검증은 `google-services.json` 및 Firebase Android 앱 등록이 준비된 뒤 가능하다.
- 임시 keystore(JKS/PKCS12)로 `:app:packageRelease` 서명 단계가 계속 실패해 실제 signed release APK 검증은 미완료다.
- 실제 사용자 keystore를 사용해 `scripts/release-android-build.sh`를 다시 검증해야 한다.
- Playwright를 `127.0.0.1`로 열면 Firebase `authorized domain`에 걸릴 수 있으므로 로컬 검증은 `localhost` 기준으로 진행해야 한다.
