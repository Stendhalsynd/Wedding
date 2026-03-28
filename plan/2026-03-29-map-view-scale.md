# 2026-03-29 Map View Scale

## todo
- [x] S3-6 작성
- [x] S3-6 테스트 작성
- [x] Map 뷰 대형 지도 높이 적용
- [x] 정보 카드 오버레이 제거
- [x] S3-6 검증
- [x] S3-6 리뷰 게이트

## doing
- 완료

## done
- 지도 뷰의 실제 문제를 지도 높이 부족과 카드 오버레이 두 축으로 분해
- 모바일에서 한 웨딩홀 집중형 뷰로 재배치하는 방향을 확정
- `Map.tsx`를 지도 우선 레이아웃으로 재구성
- 지도 높이를 `h-[min(58vh,34rem)] min-h-[24rem]`로 확장
- 선택 웨딩홀 정보 카드를 지도 아래 별도 카드로 분리

## verification
- `npm test -- tests/unit/dashboard-layout-polish.test.ts tests/unit/map-view-scale.test.ts` 통과
- `npm run lint` 통과
- `npm run build` 통과
- `git diff --check` 통과
- Playwright로 로컬 앱 접속 및 로그인 화면 렌더링 확인
- 인증 게이트 때문에 실제 지도 화면 Playwright 확인은 미실행

## risks
- iframe 기반 Google Maps embed는 주소 문자열만으로는 항상 최적 줌을 보장하지 않는다.
- 지도 높이를 키우면 작은 화면에서 정보 카드가 fold 아래로 내려갈 수 있다.
