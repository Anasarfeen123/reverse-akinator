# ⚽ Reverse Akinator

A modern, highly-interactive web application built with React, Vite, and Express. Instead of guessing a football player you are thinking of, the AI attempts to guess the player by asking you up to 20 strategic questions!

---

## 🚀 Features

- **Double-Agent Setup**: A fast Vite-based React frontend paired with an Express.js backend server.
- **Support for 6+ LLM Providers**: Integrate with **Ollama** (local), **Google Gemini**, **OpenAI**, **Anthropic Claude**, **Groq**, or **Puter.js** (Free Cloud AI).
- **Strict State Machine**: Clean state transitions between `INTRO`, `PLAYING`, `VAR_CHECK` (evaluation), `WIN`, `GIVE_UP` (reveal), and `ERROR`.
- **Cyberpunk UI & Glassmorphism**: Stunning EA Sports-inspired dark mode UI with interactive neon animations, confidence meters, and reactive components.
- **RAG Integration**: Leverages an offline RAG knowledge base containing profiles of 35+ legendary football players to ensure factual responses.

---

## 📋 Prerequisites

Before setting up the project locally, ensure you have the following installed:
* **Node.js** (v18.x or higher)
* **npm** (v9.x or higher)
* **Ollama** (Optional, only if you wish to run AI models locally)

---

## 💻 Getting Started (Local Development)

### 1. Clone the Repository
```bash
git clone https://github.com/Anasarfeen123/reverse-akinator.git
cd reverse-akinator
```

### 2. Install Dependencies
Installs both frontend and backend dev dependencies:
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env` file in the root directory of the project:
```bash
touch .env
```
Add the API keys or auth tokens for the LLM providers you want to support (only fill the ones you plan to use):
```env
# Server Configuration
PORT=3001

# LLM API Keys
GEMINI_API_KEY=your_gemini_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
GROQ_API_KEY=your_groq_api_key_here
PUTER_AUTH_TOKEN=your_puter_auth_token_here

# Frontend Configuration
VITE_API_BASE=http://localhost:3001/api
```

### 4. Start the Application
To run both the **Vite Dev Server** and the **Express Backend** concurrently with automatic hot-reloading:
```bash
npm run dev:all
```

Alternatively, you can run them in separate terminal windows:
* **Start Frontend Client:** `npm run dev` (runs on `http://localhost:5173/`)
* **Start Backend Server:** `npm run server` (runs on `http://localhost:3001/`)

---

## ⚙️ AI Models Setup & Configuration

You can configure and switch models dynamically in-game using the **Settings Gear Icon (⚙️)** in the header.

### Local Ollama Setup
To use a local model (no internet or API keys required):
1. Download and run [Ollama](https://ollama.com/).
2. Pull a coding or chat model (e.g. Qwen or Llama):
   ```bash
   ollama pull qwen2.5-coder:7b
   ```
3. Keep Ollama running on your local port `11434`.

### Puter.js (Free Cloud AI) Setup
Puter allows you to query cloud models like `gpt-4o-mini` without registering credit cards:
1. Log in to [Puter Dashboard Account](https://puter.com/dashboard#account).
2. Create an **API token** under your account.
3. Paste the token into the game's setting modal or define it in your `.env` as `PUTER_AUTH_TOKEN`.

---

## 🚀 Cloud Deployment (Vercel)

This project is configured to deploy seamlessly to Vercel as a monorepo containing both the server routes and static client files.

### 1. Install Vercel CLI
```bash
npm install -g vercel
```

### 2. Connect and Link Project
Run this command from the root directory to link your local workspace to Vercel:
```bash
npx vercel link
```

### 3. Configure Environment Variables
Add your production API keys (e.g. `PUTER_AUTH_TOKEN`, `GEMINI_API_KEY`, etc.) in the Vercel project settings dashboard under **Settings** -> **Environment Variables**.

### 4. Production Deployment
To build and deploy your application directly:
```bash
npx vercel --prod
```

---

## 📁 Project Structure

```text
reverse-akinator/
├── api/                  # Serverless function handlers for Vercel deployment
├── server/               # Express.js backend server code
│   ├── index.js          # Express app entry point & routes
│   ├── llmService.js     # LLM API integration layer (OpenAI, Gemini, Puter, etc.)
│   ├── ollamaService.js  # Local Ollama connection client
│   └── playerPool.js     # Wikipedia RAG dataset & biographies for 35+ players
├── src/                  # React Frontend client application
│   ├── components/       # Modular UI components (MatchArena, ModelSettingsModal, etc.)
│   ├── services/         # Client API service and configuration handlers
│   ├── types/            # TypeScript type definitions
│   └── main.tsx          # Client entrypoint
├── package.json          # Dependency and script configuration
├── vercel.json           # Vercel routing, build configuration, and rewrite rules
└── README.md             # Project documentation
```

---

## 🎮 How to Play

1. Think of a famous football player (active or legendary).
2. Click **Start Interrogation**.
3. The AI Referee will start asking you Yes/No questions to narrow down the pool.
4. Answer honestly (Yes, No, Probably, Probably Not, Don't Know).
5. If the AI guesses your player correctly within **3 attempts** and **20 questions**, it wins! If it fails to guess, you win!
