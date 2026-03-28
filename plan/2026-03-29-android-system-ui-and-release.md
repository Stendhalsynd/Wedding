# 2026-03-29 Android System UI And Versioned Release

## todo
- [x] S3-7 작성
- [x] S3-8 작성
- [x] S4-1 작성
- [x] 테스트 추가
- [x] Android status bar / safe-top 구현
- [x] 공통 sticky header 정리
- [x] 지도 viewport fit 조정
- [x] package.json 버전업
- [x] APK 재빌드
- [ ] Git tag / Release / Discord 배포
- [x] 검증
- [x] 리뷰 게이트

## doing
- versioned release publish 진행 중

## done
- 문제를 status bar 가독성, safe-top 충돌, sticky header, map viewport fitting, versioned release 다섯 영역으로 분해
- Capacitor Status Bar + Android theme + CSS safe-top 조합으로 해결 방향 확정

## verification
- `npm test -- tests/unit/android-system-ui.test.ts tests/unit/sticky-screen-headers.test.ts tests/unit/map-view-scale.test.ts tests/unit/dashboard-layout-polish.test.ts` 통과
- `npm run lint` 통과
- `npm run build` 통과
- `npm run release:android:build` 통과
- `npx vercel deploy --prod --yes` 통과
- `wedding-jwjh.vercel.app` alias 반영 확인
- APK SHA-256: `4b9954ba3c22debc355d1c0e6dfdd87cc2695bd64a89316c731cf77e358b8c94`

## risks
- Android 15 edge-to-edge 정책은 native theme 속성과 plugin 설정이 함께 맞아야 안정적으로 동작한다.
- 지도 embed는 주소 기반이므로 확대 비율이 항상 완전히 동일하지 않을 수 있다.
