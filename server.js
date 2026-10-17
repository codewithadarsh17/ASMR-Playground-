import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const app = express();
const PORT = process.env.PORT || 3000;
const KEY = process.env.ELEVENLABS_API_KEY;
const here = path.dirname(fileURLToPath(import.meta.url));

app.use(express.json({ limit: '10kb' }));
app.use(express.static(path.join(here, 'public')));

// tiny in-memory rate limit: 10 requests per minute per IP (protects your credits)
const hits = new Map();
function limited(ip) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < 60_000);
  list.push(now); hits.set(ip, list);
  return list.length > 10;
}

const cache = new Map(); // repeated prompts cost nothing

app.post('/api/sound', async (req, res) => {
  if (!KEY) return res.status(500).json({ error: 'Server has no API key. Add ELEVENLABS_API_KEY to .env' });
  if (limited(req.ip)) return res.status(429).json({ error: 'Slow down a little, try again in a minute.' });

  const prompt = String(req.body?.prompt || '').trim().slice(0, 200);
  if (!prompt) return res.status(400).json({ error: 'Prompt is empty.' });

  const hit = cache.get(prompt.toLowerCase());
  if (hit) return res.type('audio/mpeg').send(hit);

  try {
    const r = await fetch('https://api.elevenlabs.io/v1/sound-generation', {
      method: 'POST',
      headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: prompt, duration_seconds: 3, prompt_influence: 0.5 })
    });
    if (!r.ok) {
      const body = await r.text();
      console.error('ElevenLabs error', r.status, body);
      let why = ''; try { const j = JSON.parse(body); why = (j.detail && (j.detail.message || j.detail.status)) || (typeof j.detail === 'string' ? j.detail : ''); } catch {}
      return res.status(502).json({ error: 'ElevenLabs said no (' + r.status + ')' + (why ? ': ' + String(why).slice(0, 140) : '. Check the key and credits.') });
    }
    const buf = Buffer.from(await r.arrayBuffer());
    cache.set(prompt.toLowerCase(), buf);
    res.type('audio/mpeg').send(buf);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server failed to reach ElevenLabs.' });
  }
});

app.listen(PORT, () => console.log('ASMR Playground on http://localhost:' + PORT));
