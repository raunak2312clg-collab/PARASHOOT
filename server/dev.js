import express from 'express';

const app = express();
const port = process.env.API_PORT || 3001;

app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, app: 'parashootstudio-react', mode: 'development' });
});

app.listen(port, () => {
  console.log(`Parashoot Studio API running on http://localhost:${port}`);
});
