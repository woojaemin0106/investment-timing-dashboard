# Husky 훅 가이드

## 적용된 훅

- `pre-commit`: `lint-staged` 실행
  - 스테이징된 `js/jsx/ts/tsx/mjs/cjs` 파일에 대해 `eslint --max-warnings=0` 검사
- `commit-msg`: `commitlint` 실행
  - 커밋 메시지가 Conventional Commits 형식인지 검사

## 로컬 동작 방식

- `npm install` 또는 `npm ci` 시 `prepare` 스크립트로 Husky가 자동 활성화됩니다.
- 훅 파일 위치:
  - `.husky/pre-commit`
  - `.husky/commit-msg`

## 커밋 메시지 예시

- `feat(chart): 타이밍 신호 위젯 추가`
- `fix(api): 빈 응답 처리 로직 수정`
- `docs(husky): 훅 설정 가이드 추가`
