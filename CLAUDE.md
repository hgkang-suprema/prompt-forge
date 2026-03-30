# Prompt Forge

Prompt Reliability & Evaluation Engine — 프롬프트의 신뢰성을 데이터로 검증하는 도구.

## 프로젝트 개요

- **목적**: "내 프롬프트는 99%의 확률로 안전한가?"에 대한 답을 주는 도구
- **대상**: 1인 개발자 및 프롬프트 엔지니어 (Public Open Source)
- **규모**: MVP → v1.0 (완성도 높은 사이드 프로젝트)
- **배포**: 로컬 전용 (사용자가 자신의 API Key를 넣어 사용)

## 핵심 기능

1. **Stress Test**: 동일 프롬프트 N회 반복 실행 및 결과 일관성 측정
2. **Unit Testing**: 입력값(Variables) 세트별 기대 결과값 비교
3. **Model Benchmarking**: 동일 프롬프트를 여러 모델(Claude, GPT, Gemini)에 동시 투입
4. **Auto-Optimizer**: 실패 케이스 분석 후 프롬프트 개선안 제안

## 기술 스택

| 구분 | 스택 |
|------|------|
| Framework | Vite + React (TypeScript) |
| State | Zustand + Persist (localStorage) |
| LLM SDK | Vercel AI SDK |
| UI/UX | Tailwind CSS v4 + Shadcn UI |
| Charts | Recharts |
| DB | 없음 (localStorage) |

## 개발 명령어

```bash
npm run dev      # 개발 서버 실행
npm run build    # 프로덕션 빌드 (tsc + vite build)
npm run lint     # ESLint 실행
npm run preview  # 빌드 결과 미리보기
```

## 프로젝트 구조

```
src/
├── components/ui/   # Shadcn UI 컴포넌트
├── lib/utils.ts     # 유틸리티 (cn 함수 등)
├── App.tsx          # 메인 앱
├── main.tsx         # 엔트리포인트
└── index.css        # Tailwind CSS + 테마
```

## 문서

- **기능 명세**: [docs/spec.md](docs/spec.md) — 전체 기능 명세 (P0/P1/P2 우선순위)

## 컨벤션

- 컴포넌트 추가: `npx shadcn@latest add <component>`
- import alias: `@/` → `src/`
- 상태 관리: Zustand store는 `src/stores/`에 배치
