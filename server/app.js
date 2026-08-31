import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import authRoutes from './src/routes/auth.routes.js';
import judgeRoutes from './src/routes/judge.routes.js';

const app = express();

app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((url) => url.trim()).filter(Boolean)
  : ['http://localhost:3000'];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS Policy: Origin ${origin} is not allowed.`));
      }
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'Judging-as-a-Service API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/judge', judgeRoutes);

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

export default app;
