# 2026-03-29 Role / Author Visibility

## todo
- [x] S1-1 작성
- [x] S1-2 작성
- [x] S1-3 작성
- [x] S1-4 작성
- [ ] S1-5 작성
- [x] README 정리
- [x] 실제 PNG 자산 재배포 검증
- [x] GitHub push / release 가능 범위 확인
- [x] Vercel install 충돌 복구
- [x] Vercel 배포 검증
- [x] 역할 선택 skip 허용 흐름 구현
- [x] 프로필 정적 이미지 자산 추가
- [x] 작성자 표시 view model 및 UI 구현
- [x] 릴리스 업로드 / Discord 배포 자동화 추가
- [x] 타입 체크 / 빌드 / Playwright 검증

## doing
- 완료

## done
- 기존 로그인, 프로필, 설정, 웨딩홀 작성자 흐름 분석 완료
- SDD 스펙 슬라이스 작성 완료
- Vercel `npm install` 단계에서 `pannellum-react` peer dependency 충돌 확인
- 루트 `.npmrc`에 `legacy-peer-deps=true` 추가
- `vercel pull --yes --environment preview`로 프로젝트 링크 완료
- `vercel build --yes` 통과
- production 배포 완료: `wedding-kappa-ochre.vercel.app`
- 실제 프로필 PNG 파일 교체 확인
- macOS 유니코드 정규화 차이로 정적 자산 404 원인 확인 및 파일명 수정
- production 재배포 후 `예비신랑.png`, `예비신부.png` 200 응답 확인
- README를 현재 프로젝트 기준으로 전면 갱신
- `localhost`에서 Firebase authorized domain 미설정으로 Playwright 로그인 이후 검증은 제한됨
- 역할 선택 skip 허용과 canonical 프로필 이미지 규칙 구현 완료
- 웨딩홀 작성자 `이미지 + 예신/예랑` 표시 구현 완료
- release APK 업로드 / Discord 공지 스크립트 추가 완료

## verification
- `npm test` 통과
- `npm run lint` 통과
- `npm run build` 통과
- `node scripts/generate-release-notes.mjs HEAD ...` 통과
- Playwright에서 `/login` 진입 및 로그인 버튼 오류 메시지 확인
- Playwright에서 `https://wedding-kappa-ochre.vercel.app/login` 진입 및 Google 로그인 클릭 후 `auth/unauthorized-domain` 재현 확인
- `npx vercel build --yes` 통과
- `npx vercel deploy --prod --yes` 통과
- `curl -I https://wedding-kappa-ochre.vercel.app/예비신랑.png` 200 확인
- `curl -I https://wedding-kappa-ochre.vercel.app/예비신부.png` 200 확인
- Playwright에서 production PNG 자산 직접 로드 확인
- `npm test` 통과
- `npx tsc --noEmit --project tsconfig.json` 진단 오류 0 확인
- Firebase `auth/unauthorized-domain`으로 인해 로컬 로그인 이후 메인 화면 검증은 미완료

## risks
- 로컬 Playwright 검증을 완전히 하려면 Firebase Authentication authorized domains에 `localhost` 또는 `127.0.0.1` 추가 필요
- 운영 로그인 동작을 위해 Firebase Authentication authorized domains에 `wedding-kappa-ochre.vercel.app` 추가 필요
- 이 리포지토리에는 Android 빌드 구조가 없어, GitHub Release 업로드는 외부에서 생성된 `release` APK 경로를 입력받는 방식으로 제공함
