# 2026-03-29 Android Header And Map Follow-up

## todo
- [x] S3-10 작성
- [x] S3-11 작성
- [x] 테스트 기준 갱신
- [x] fixed header 전환
- [x] status bar 대비 수정
- [x] 지도 stretch / bottom dock 수정
- [x] 검증
- [ ] 버전업 / APK 릴리스 / 배포

## doing
- 버전업 및 릴리스 산출물 생성 중

## done
- 기존 S3-7, S3-8 구현이 실제 Android 렌더링과 완전히 일치하지 않는 문제를 확인
- 투어/지도/비교/설정 상단 헤더를 fixed 구조로 전환
- Android status bar를 밝은 배경 + dark icon 조합으로 변경
- 지도 iframe을 absolute fill 구조로 변경하고 상세 카드를 하단 dock로 이동
- 하단 탭 컨테이너를 화면 하단에 붙이고 배경이 safe-area까지 덮도록 조정

## verification
- `npm test -- tests/unit/android-system-ui.test.ts tests/unit/sticky-screen-headers.test.ts tests/unit/map-view-scale.test.ts tests/unit/dashboard-layout-polish.test.ts tests/unit/mobile-layout-safe-area.test.ts`
- `npm run lint`
- `npm run build`

## risks
- fixed header 도입 시 본문 top padding이 화면별로 달라질 수 있다.
