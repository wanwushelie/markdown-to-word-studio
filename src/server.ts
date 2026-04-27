import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import apiRouter from './routes/api.js';
import wopiRouter from './wopi/index.js';
import { initDiscovery } from './wopi/discovery.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, '../public')));

app.use('/api', apiRouter);
app.use('/wopi', wopiRouter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/CONFIG_SPEC.md', (_req, res) => {
  res.sendFile(path.join(__dirname, '../CONFIG_SPEC.md'));
});

initDiscovery()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to initialize CODE discovery:', err.message);
    console.warn('Starting server anyway; CODE features will not work until discovery succeeds.');
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT} (CODE unavailable)`);
    });
  });
