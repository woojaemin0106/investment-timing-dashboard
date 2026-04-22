# investment-timing-dashboard

해커톤용 타이밍 분석 대시보드 초기 세팅 저장소입니다.

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Sass
- Axios, Zod, React Query, Recharts, Dayjs
- Playwright (smoke e2e)
- GitHub Actions (PR check + labeler)

## Quick Start

```bash
npm ci
npm run dev
```

브라우저에서 `http://localhost:3000`을 열면 초기 대시보드 화면을 확인할 수 있습니다.

## Scripts

- `npm run dev`: 개발 서버 실행
- `npm run lint`: ESLint 검사
- `npm run build`: 프로덕션 빌드
- `npm run test`: Playwright e2e 실행
- `npm run test:headed`: 브라우저 표시 모드 e2e 실행

## Collaboration Flow

- 브랜치 전략: `feature/* -> develop -> main`
- PR 기본 대상: `develop`
- 커밋 규칙: Conventional Commits (`feat:`, `fix:`, `chore:` 등)

세부 규칙은 [`CONTRIBUTING.md`](./CONTRIBUTING.md)를 참고하세요.
