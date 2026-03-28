# 2026-03-29 Android Release Publish

## todo
- [x] S2-5 작성
- [x] root Android Gradle 정리
- [x] signed APK 빌드
- [ ] git push / tag / GitHub Release
- [ ] Discord 공지
- [ ] S2-5 검증

## doing
- GitHub Release 업로드 대기

## done
- `google-services.json`이 로컬에 배치되었고 `.gitignore`에 의해 추적되지 않는 점 확인
- Firebase 콘솔 자동안내로 루트 `android/build.gradle`에 잘못 들어간 내용을 정리 대상으로 식별
- 루트 `android/build.gradle`의 잘못된 Firebase plugin/dependency 블록 제거
- release build 스크립트가 `android/keystore.properties`를 임시 생성 후 원복하도록 수정
- signed APK 생성 완료

## verification
- `npm test -- tests/unit/firestore-rules-user-fields.test.ts tests/unit/android-release-build.test.ts` 통과
- `npm run release:android:build` 통과
- APK 생성: `/Users/jihun/StudioProjects/Wedding/dist/releases/Wedding-v0.0.0-release.apk`
- APK SHA-256: `bfb1bca69c35a2fd66f303a93e7a16637961570bd4fb4b0c8c446c5021bbd286`

## risks
- `package.json.version`이 현재 `0.0.0`이므로 첫 release 태그는 `v0.0.0`이 된다.
- GitHub Release/Discord는 네트워크 및 토큰 상태에 의존한다.
