import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { DatabaseService } from './services/database.js';
import { initializeWebSocket } from './services/websocket.js';
import questionnaireRoutes from './routes/questionnaires.js';
import answerRoutes from './routes/answers.js';

const app = express();
const server = createServer(app);

// Initialize WebSocket
const io = initializeWebSocket(server);

// Middleware
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use('/api/questionnaires', questionnaireRoutes);
app.use('/api/answers', answerRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Initialize database and start server
async function startServer() {
  try {
    await DatabaseService.initialize();
    
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

