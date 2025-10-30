import express from 'express';
import 'express-async-errors';
import compression from 'compression';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import url from 'url';

import analyticsRouter from './routes/analytics.js';

const app = express();
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDir = path.join(__dirname, '../frontend');

app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(express.static(frontendDir));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/analytics', analyticsRouter);

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return next();
  }
  res.sendFile(path.join(frontendDir, 'index.html'));
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

export default app;
