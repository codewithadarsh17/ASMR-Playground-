# ASMR Playground (with AI Sound Lab)

**Easiest way:** Windows: double-click `start.bat`. Mac/Linux: run `./start.sh`.

AI: ElevenLabs sound generation. Backend: Node + Express (keeps the key private).

1. Install Node.js (v18+).
2. `npm install`
3. Copy `.env.example` to `.env` and paste your ElevenLabs key.
4. `npm start`, then open http://localhost:3000
5. Open the AI Lab tab, describe a sound, press Generate.

Never put the key in the HTML and never commit .env.
(Fallback: opening public/index.html directly lets you paste the key into the page.)
