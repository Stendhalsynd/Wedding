# 2026-03-29 Secret Hygiene

## todo
- [x] S3-1 작성
- [x] S3-1 테스트 작성
- [x] Firebase 설정을 환경 변수 기반으로 전환
- [x] 공개 키 검사 스크립트 추가
- [x] pre-push 훅 연결
- [x] README 보안 운영 규칙 업데이트
- [x] S3-1 검증
- [x] S3-1 리뷰 게이트

## doing
- 다음 Firebase 웹 앱 설정값 반영 전 대기

## done
- 공개 노출 원인이 `firebase-applet-config.json` 추적 파일이라는 점 확인
- 현재 앱은 `src/firebase.ts`에서 JSON import를 사용 중이라는 점 확인
- `src/firebase.ts`를 `VITE_FIREBASE_*` 환경 변수 기반으로 전환
- `firebase-applet-config.json`을 저장소 기준 파일에서 제거
- `scripts/check-no-public-secrets.mjs`로 Google API key / tracked .env / blocked file 검사 추가
- `.githooks/pre-push` 추가 및 `git config core.hooksPath .githooks` 적용
- README에 hook 연결 및 secret hygiene 규칙 문서화

## verification
- `npm run secrets:check` 통과
- `npm test -- tests/unit/firebase-config-security.test.ts` 통과
- `npm run lint` 통과
- `npm run build` 통과
- `git diff --check` 통과
- `npx tsc --noEmit` 진단 오류 0 확인

## risks
- Firebase 웹 설정은 공개 식별자 성격이 있지만, 현재 조직 정책상 저장소 평문 커밋 금지로 취급해야 한다.
- 이미 공개된 git history는 현재 작업만으로 사라지지 않는다.
- 새 Firebase 웹 설정값은 `.env`, Vercel 환경 변수, 필요 시 GitHub Actions/릴리스 환경에도 별도로 넣어야 한다.
