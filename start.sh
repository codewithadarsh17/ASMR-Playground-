#!/bin/bash
cd "$(dirname "$0")"
command -v node >/dev/null || { echo "Install Node.js from https://nodejs.org first"; exit 1; }
[ -f .env ] || { cp .env.example .env; echo "Created .env. Paste your keys into it, save, then run ./start.sh again."; exit 0; }
[ -d node_modules ] || npm install
(sleep 1; open http://localhost:3000 2>/dev/null || xdg-open http://localhost:3000 2>/dev/null) &
node server.js
