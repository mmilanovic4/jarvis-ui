# Jarvis UI

A local AI assistant interface powered by [Ollama](https://ollama.com).
Runs entirely on your machine — no cloud, no API keys, no data leaving your device.

## Requirements

- [Node.js](https://nodejs.org)
- [Ollama](https://ollama.com) running locally with at least one model

```bash
ollama pull llama3
```

## Getting Started

```bash
git clone https://github.com/mmilanovic4/jarvis-ui
cd jarvis-ui
npm install
npm run dev
```

Open [http://localhost:6789](http://localhost:6789).

## Features

- Chat with local Ollama models
- Persistent conversation history (SQLite)
- Model switching per conversation
- Fully offline after setup

## Stack

- Next.js
- Tailwind CSS
- SQLite
- Ollama
