import express, { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import http from 'http';
import cors from 'cors';
import path from 'path';

import { connectToDB } from './db/db';

import auth from './routes/auth';
import projects from './routes/projects';
import tasks from './routes/tasks';

const app = express();

const PORT = Number(process.env.PORT) || 3000;

const server = http.createServer(app);

app.use(cors({
  origin: true,
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
  });
});

app.use('/auth', auth);
app.use('/projects', projects);
app.use('/tasks', tasks);

// Serve frontend static files in production
const frontendPath = path.join(__dirname, '../dist');
app.use(express.static(frontendPath));

app.use((req: Request, res: Response) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Global error handler - logs actual error to Railway and returns JSON
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled server error:', err?.message || err, err?.stack);
  res.status(500).json({ message: err?.message || 'Internal server error' });
});

async function startServer() {
  await connectToDB();

  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

startServer();