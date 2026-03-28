# 2026-03-29 Tour Layout Polish

## todo
- [x] S3-5 작성
- [x] S3-5 테스트 작성
- [x] Dashboard sticky title 적용
- [x] FAB 하단 오프셋 조정
- [x] MobileLayout 탭바 높이 축소
- [x] S3-5 검증
- [x] S3-5 리뷰 게이트

## doing
- 완료

## done
- 투어 화면 문제를 sticky header / FAB offset / nav height 세 영역으로 분해
- 기존 safe-area 구조와 충돌하지 않는 수정 방향을 확정
- `Dashboard.tsx`에 sticky 제목 영역과 `bottom-safe-fab` 구조 적용
- `MobileLayout.tsx` 탭바 세로 패딩과 아이콘 패딩 축소
- `index.css`의 `pb-safe-nav`를 새 탭바 높이에 맞게 조정

## verification
- `npm test -- tests/unit/dashboard-layout-polish.test.ts tests/unit/map-view-scale.test.ts` 통과
- `npm run lint` 통과
- `npm run build` 통과
- `git diff --check` 통과
- Playwright로 로컬 앱 접속 및 로그인 화면 렌더링 확인
- 인증 게이트 때문에 실제 투어 화면 Playwright 확인은 미실행

## risks
- sticky 헤더 배경이 약하면 카드와 겹쳐 보일 수 있다.
- 탭바 높이를 너무 줄이면 터치 타깃이 작아질 수 있다.
