# Contributing Guide

## 브랜치 정책

- 기본 브랜치: `main`
- 통합 브랜치: `develop`
- 기능 작업 브랜치: `feature/<scope>-<task>`
- 버그 수정 브랜치: `fix/<scope>-<task>`

모든 작업은 기능 브랜치에서 시작하고 `develop`으로 PR을 보냅니다.

## 커밋 메시지 규칙 (Conventional Commits)

형식:

`type(scope): summary`

예시:

- `feat(chart): add timing confidence widget`
- `fix(api): handle empty market response`
- `chore(ci): add playwright install step`
- `docs(plan): update merged requirements summary`

권장 type:

- `feat`, `fix`, `refactor`, `chore`, `docs`, `test`, `style`, `ci`

## Pull Request 규칙

- PR 대상 브랜치: `develop`
- PR 제목은 한글 기준으로 명확히 작성
  - 예시: `[feat] 타이밍 지표 카드 컴포넌트 추가`
  - 예시: `[fix] 신호 계산 API 에러 처리 수정`
- PR 템플릿의 체크리스트를 모두 채운 뒤 요청
- CI(`pr-checks`) 실패 시 머지 금지

## 로컬 검증

PR 전 최소 확인:

```bash
npm run lint
npm run build
npm run test
```
