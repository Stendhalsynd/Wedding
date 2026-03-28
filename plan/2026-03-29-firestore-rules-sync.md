# 2026-03-29 Firestore Rules Sync

## todo
- [x] S3-4 작성
- [x] 테스트 작성
- [x] users rules 필드 동기화
- [x] 검증

## doing
- Firebase CLI 인증 대기

## done
- 앱이 `roleSetupDismissedAt`를 사용자 문서에 쓰고 있다는 점 확인
- 현재 `isValidUser`가 해당 필드를 허용하지 않는 점 확인
- `firestore.rules`의 `isValidUser`에 `roleSetupDismissedAt` 허용 추가
- 관련 회귀 테스트 추가

## verification
- `npm test -- tests/unit/firestore-rules-user-fields.test.ts tests/unit/android-release-build.test.ts` 통과
- `git diff --check` 통과

## risks
- rules 파일만 수정하면 실제 Firebase 프로젝트 반영은 별도 배포가 필요하다.
- 현재 머신은 `firebase login` 인증이 없어 rules 프로덕션 배포는 미완료다.
