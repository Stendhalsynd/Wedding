# 2026-03-29 Vercel SPA Routing

## todo
- [x] S3-9 작성
- [x] rewrite 테스트 추가
- [x] vercel.json SPA fallback 추가
- [ ] 재배포
- [ ] production 직접 진입 경로 확인

## doing
- `/login` 404를 없애기 위한 Vercel rewrite 반영 중

## done
- production에서 React Router 직접 진입이 404 나는 원인을 SPA rewrite 누락으로 확인

## verification
- 대기 중

## risks
- rewrite 범위가 너무 넓으면 정적 파일 응답 정책에 영향을 줄 수 있다.
