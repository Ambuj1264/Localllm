
# Next.js OpenAI Chat App

Minimal chat application built with Next.js and the official OpenAI JavaScript SDK.

## Features
- Simple chat UI (client)
- `/api/chat` server route that calls OpenAI's SDK
- Streaming is **not** implemented (keeps the example simple)

## Setup

1. Copy `.env.local.example` to `.env.local` and add your `OPENAI_API_KEY`.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the dev server:
   ```bash
   npm run dev
   ```
4. Open http://localhost:3000

## Notes
- This project uses the official `openai` npm package. Check OpenAI docs for SDK usage and latest models: https://platform.openai.com/docs/api-reference. 
- Replace `model` in `pages/api/chat.js` with a model you have access to.

# Localllm
