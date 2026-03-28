# 2026-03-29 S2 Subagent Execution Model

## todo
- [x] S2-0 실행 모델 스펙 작성
- [x] `Wedding` 전용 `AGENTS.md` 추가
- [x] 프로젝트 메모 directive 반영
- [x] 현재 저장소 규칙과 충돌 없는지 검토

## doing
- 완료

## done
- `S2-0` 스펙으로 Android 패키징 프로그램의 실행 모델을 고정
- 저장소 루트 `AGENTS.md`에 SDD + subagent 병렬 실행 규칙 추가
- Android/Firebase/Capacitor 작업에서 `dependency-expert` 선행 규칙 명시
- review gate, 병렬화 제한, 산출물 기대치 규칙 문서화

## verification
- `/Users/jihun/AGENTS.md` 상위 규칙과 충돌 없는지 수동 검토
- 새 `AGENTS.md`가 저장소 범위에서만 적용되도록 위치 확인
- `spec/S2-0.md`가 S2-1~S2-4 실행 방식과 일관되는지 확인

## risks
- 현재 세션 도구에는 일반화된 `spawn_agent` 실행 경로가 직접 노출되지 않을 수 있다.
- 따라서 실제 실행 시에는 사용 가능한 병렬/subagent 도구에 맞춰 역할 분리를 적용하되, 동일 파일 동시 수정 금지 원칙은 유지해야 한다.
