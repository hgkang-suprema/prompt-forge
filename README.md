# Prompt Forge

**Prompt Reliability & Evaluation Engine**

"내 프롬프트는 99%의 확률로 안전한가?"에 대한 답을 주는 도구입니다.

## Features

- **Stress Test** — 동일 프롬프트를 N회 반복 실행하고 코사인 유사도 기반 일관성 점수 측정
- **Unit Testing** — 변수 세트별 기대값과 실제 응답 비교 (Semantic / Contains / Regex / Exact)
- **Model Benchmarking** — 동일 프롬프트를 여러 모델에 동시 투입하고 응답 시간/토큰 비교
- **Analytics** — 테스트 결과 히스토리, 통계 대시보드, JSON Export

## Tech Stack

| Category | Library | Version |
|----------|---------|---------|
| **Framework** | [React](https://react.dev) | 19.x |
| **Build Tool** | [Vite](https://vite.dev) | 8.x |
| **Language** | [TypeScript](https://www.typescriptlang.org) | 5.9 |
| **Styling** | [Tailwind CSS](https://tailwindcss.com) | 4.x |
| **UI Components** | [shadcn/ui](https://ui.shadcn.com) (Base UI) | - |
| **Icons** | [Lucide React](https://lucide.dev) | 1.x |
| **State Management** | [Zustand](https://zustand.docs.pmnd.rs) | 5.x |
| **Charts** | [Recharts](https://recharts.org) | 3.x |
| **LLM Integration** | [Vercel AI SDK](https://sdk.vercel.ai) | 6.x |
| **LLM Provider — Anthropic** | [@ai-sdk/anthropic](https://sdk.vercel.ai/providers/ai-sdk-providers/anthropic) | 3.x |
| **LLM Provider — OpenAI** | [@ai-sdk/openai](https://sdk.vercel.ai/providers/ai-sdk-providers/openai) | 3.x |
| **LLM Provider — Google** | [@ai-sdk/google](https://sdk.vercel.ai/providers/ai-sdk-providers/google) | 3.x |
| **Font** | [Geist](https://vercel.com/font) (via @fontsource-variable/geist) | - |

## Getting Started

### Prerequisites

- Node.js 22+
- API Key for at least one provider (Anthropic, OpenAI, or Google)

### Install & Run

```bash
git clone https://github.com/hgkang-suprema/prompt-forge.git
cd prompt-forge
npm install
npm run dev
```

Open `http://localhost:5173/prompt-forge/` in your browser.

### Setup API Keys

1. Click **Settings** in the sidebar
2. Enter your API key(s) for the providers you want to use
3. Keys are stored in browser localStorage only — never sent to any server

## Supported Models

| Provider | Models |
|----------|--------|
| Anthropic | Claude Opus 4.6, Claude Sonnet 4.6, Claude Haiku 4.5 |
| OpenAI | GPT-5.4, GPT-5.4 Mini, GPT-5.4 Nano, GPT-5, GPT-5 Mini, o3, o4 Mini, GPT-4o, GPT-4o Mini |
| Google | Gemini 3.1 Pro, Gemini 2.5 Pro, Gemini 2.5 Flash |

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Production build (TypeScript check + Vite build)
npm run lint     # ESLint
npm run preview  # Preview production build
```

## Architecture

```
src/
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── layout/          # Sidebar layout
│   ├── prompt-editor    # Template editor with {{variable}} support
│   ├── stress-test      # N-run consistency testing
│   ├── unit-test        # Expected value comparison
│   ├── benchmark        # Multi-model comparison
│   ├── analytics        # Stats dashboard + JSON export
│   └── settings-dialog  # API key management
├── stores/              # Zustand stores (settings, prompt, results)
├── lib/                 # LLM client, embeddings, similarity, evaluator
└── App.tsx
```

## License

MIT
