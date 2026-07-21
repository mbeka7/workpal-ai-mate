# AI Workplace Mate

A modern, responsive SaaS-style AI assistant that helps professionals automate common workplace tasks. Built with [TanStack Start](https://tanstack.com/start), React 19, TypeScript, Tailwind CSS, and the [Lovable AI Gateway](https://docs.lovable.dev/ai-gateway).

## Features

- **AI Chatbot** – Streaming, threaded conversation with suggested prompts and local persistence.
- **Research Assistant** – Generate structured research briefs with configurable depth and output format.
- **Meeting Summarizer** – Turn meeting transcripts or notes into concise, actionable summaries.
- **Smart Email Generator** – Draft professional emails with tone, length, and recipient context.
- **AI Task Planner** – Prioritize tasks using the Eisenhower matrix and generate a time-blocked schedule.
- **Prompt Library** – Browse, search, and customize reusable prompts for every tool.
- **History** – Save, revisit, edit, and download AI outputs from any tool.
- **Settings** – Toggle light/dark mode, set default tone, length, and language preferences.

## Tech Stack

- **Framework:** TanStack Start v1 + React 19
- **Styling:** Tailwind CSS v4 + shadcn/ui components
- **AI:** AI SDK (OpenAI-compatible) + Lovable AI Gateway
- **Language:** TypeScript with strict mode
- **State & Storage:** React state + `localStorage` for history, prompts, and settings
- **Notifications:** Sonner toasts

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) or Node.js 20+
- A Lovable API key (set as `LOVABLE_API_KEY` in your environment)

### Install dependencies

```bash
bun install
```

### Run the development server

```bash
bun dev
```

The app will be available at `http://localhost:8080`.

### Build for production

```bash
bun build
```

### Preview the production build

```bash
bun preview
```

## Project Structure

```text
src/
├── components/          # Reusable UI components (AppShell, AiOutputCard, Markdown, etc.)
├── hooks/               # Custom React hooks
├── lib/                 # Utilities, storage, AI server functions, and gateway config
├── routes/              # TanStack file-based routes
│   ├── api/             # Server API routes (streaming chat endpoint)
│   ├── index.tsx        # Dashboard
│   ├── chat.tsx         # AI Chatbot
│   ├── research.tsx     # Research Assistant
│   ├── summarizer.tsx   # Meeting Summarizer
│   ├── email.tsx        # Email Generator
│   ├── planner.tsx      # Task Planner
│   ├── prompts.tsx      # Prompt Library
│   ├── history.tsx      # Saved history
│   └── settings.tsx     # App settings
├── router.tsx           # TanStack Router setup
├── start.ts             # Start app configuration
└── styles.css           # Tailwind CSS entry + custom theme tokens
```

## AI Configuration

AI calls are routed through the Lovable AI Gateway using the default model `google/gemini-3-flash-preview`. The gateway is configured in `src/lib/ai-gateway.server.ts` and consumed by:

- `src/lib/ai.functions.ts` – non-streaming generation for research, email, planner, summarizer
- `src/routes/api/chat.ts` – streaming endpoint for the chatbot

Make sure `LOVABLE_API_KEY` is available in the environment before running the app.

## Deployment

This project is optimized for deployment on the Lovable platform. When connected to GitHub, changes in Lovable sync to your repository and vice versa. You can also self-host the generated code from the repository on any platform that supports Vite/React edge deployments.

## Responsible AI

AI-generated content may contain inaccuracies or omissions. Always review and verify outputs before using them for professional, legal, financial, or business decisions.

## License

Private – built and managed within the Lovable platform.
