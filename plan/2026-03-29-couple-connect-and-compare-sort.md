# 2026-03-29 Couple Connect And Compare Sort

## todo
- [x] S3-13 작성
- [x] S3-14 작성
- [x] 테스트 추가
- [x] Firestore rules 연결 허용 수정
- [x] Compare 정렬 기준 수정
- [x] 검증
- [ ] rules 재배포 및 앱 릴리스 반영

## doing
- rules 배포와 새 릴리스 반영 중

## done
- 연결 실패 원인이 `weddingHalls`의 솔로 -> 커플 `coupleId` 마이그레이션 rules 거부에 있음을 확인
- 비교 화면에서 대관료/식대가 selected hall이 아닌 top-level 값을 보고 정렬하는 문제 확인

## verification
- `npm test -- tests/unit/firestore-rules-couple-connection.test.ts tests/unit/compare-sorting-behavior.test.ts`
- `npm run lint`
- `npm run build`

## risks
- Firestore rules 변경은 named database에 다시 deploy 해야 실제 연결 문제가 해소된다.
