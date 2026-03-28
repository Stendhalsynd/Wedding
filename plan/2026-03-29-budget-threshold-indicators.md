# 2026-03-29 Budget Threshold Indicators

## todo
- [x] S3-12 작성
- [x] 테스트 추가
- [x] HallDetail 범위 확장
- [x] 예산 초과 badge / 색상 전환 구현
- [x] 검증
- [ ] 릴리스 산출물 재생성

## doing
- 릴리스 산출물 재생성 중

## done
- 현재 대관료 `800`, 식대 `7.5` max 제약 때문에 실제 투어 결과를 기록하지 못하는 문제 확인

## verification
- `npm test -- tests/unit/hall-detail-budget-thresholds.test.ts`
- `npm run lint`
- `npm run build`

## risks
- `input[type="range"]`의 accent 색상은 플랫폼별 표현 차이가 있다.
