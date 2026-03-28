# 2026-03-29 Production Domain Alignment

## todo
- [x] S3-3 작성
- [x] README 운영 도메인 수정
- [x] Vercel production 재배포
- [x] S3-3 검증

## doing
- 추가 릴리스 작업 전 대기

## done
- 현재 README에 이전 Vercel production URL이 남아 있다는 점 확인
- README 운영 URL을 `wedding-jwjh.vercel.app`으로 수정
- `npx vercel deploy --prod --yes`로 production 재배포 수행
- Vercel alias가 `wedding-jwjh.vercel.app`으로 연결된 것 확인

## verification
- Playwright에서 `https://wedding-jwjh.vercel.app/login` 진입 및 로그인 버튼 렌더링 확인
- Vercel deployment 결과에서 `Aliased: https://wedding-jwjh.vercel.app` 확인

## risks
- Vercel 프로젝트 alias가 이미 `wedding-jwjh.vercel.app`에 연결되어 있어야 한다.
