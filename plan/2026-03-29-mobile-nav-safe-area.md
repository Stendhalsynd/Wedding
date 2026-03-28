# 2026-03-29 Mobile Bottom Nav Safe-Area

## todo
- [x] S3-2 작성
- [x] S3-2 테스트 작성
- [x] MobileLayout safe-area / dvh 구조 적용
- [x] S3-2 검증
- [x] S3-2 리뷰 게이트

## doing
- 실제 휴대폰 브라우저 재확인 대기

## done
- 원인이 `h-screen` + `absolute bottom-0` 조합이라는 점 확인
- 수정 방향을 `fixed bottom-0` + safe-area + dynamic viewport height로 확정
- `tests/unit/mobile-layout-safe-area.test.ts`로 safe-area 구조 검증 추가
- `MobileLayout.tsx`를 `fixed bottom-0` + `pb-safe-bottom` 구조로 전환
- `index.css`에 `min-h-app-screen`, `pb-safe-bottom`, `pb-safe-nav` 유틸리티 추가

## verification
- `npm test -- tests/unit/mobile-layout-safe-area.test.ts` 통과
- `npm run lint` 통과
- `npm run build` 통과
- `git diff --check` 통과
- `npx tsc --noEmit` 진단 오류 0 확인

## risks
- 실제 모바일 브라우저별 UI 높이는 다르므로 `100vh` 단일 기준은 계속 위험하다.
- Playwright에서 로그인 상태를 바로 재현하지 못할 수 있어 일부 검증은 구조/뷰포트 기준으로 확인해야 한다.
