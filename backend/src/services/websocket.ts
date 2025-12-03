import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { DatabaseService } from './database.js';
import { groupSimilarAnswers } from './similarity.js';
import { MultipleChoiceStats } from '../types.js';

let io: SocketIOServer | null = null;

export function initializeWebSocket(server: HTTPServer) {
  io = new SocketIOServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });

    // Join room for a specific questionnaire dashboard
    socket.on('join-dashboard', async (questionnaireId: string) => {
      socket.join(`dashboard-${questionnaireId}`);
      console.log(`Client ${socket.id} joined dashboard for questionnaire ${questionnaireId}`);
      
      // Send current results when joining
      await broadcastQuestionnaireResults(questionnaireId);
    });

    // Leave dashboard room
    socket.on('leave-dashboard', (questionnaireId: string) => {
      socket.leave(`dashboard-${questionnaireId}`);
    });
  });

  return io;
}

export async function broadcastAnswerUpdate(questionnaireId: string) {
  if (!io) return;
  
  await broadcastQuestionnaireResults(questionnaireId);
}

async function broadcastQuestionnaireResults(questionnaireId: string) {
  if (!io) return;

  try {
    const questions = await DatabaseService.getQuestionsByQuestionnaire(questionnaireId);
    
    const results = await Promise.all(
      questions.map(async (question) => {
        const answers = await DatabaseService.getAnswersByQuestion(question.id);
        
        if (question.type === 'multiple_choice') {
          const statsMap = new Map<string, number>();
          const totalAnswers = answers.length;

          answers.forEach(answer => {
            const count = statsMap.get(answer.answerText) || 0;
            statsMap.set(answer.answerText, count + 1);
          });

          const stats: MultipleChoiceStats[] = Array.from(statsMap.entries())
            .map(([option, count]) => ({
              option,
              count,
              percentage: totalAnswers > 0 ? Math.round((count / totalAnswers) * 100) : 0
            }))
            .sort((a, b) => b.count - a.count);

          return { question, answers, stats };
        } else {
          const wordCloudData = groupSimilarAnswers(answers);
          return { question, answers, wordCloudData };
        }
      })
    );

    io.to(`dashboard-${questionnaireId}`).emit('results-update', results);
  } catch (error) {
    console.error('Error broadcasting results:', error);
  }
}

export function getIO(): SocketIOServer | null {
  return io;
}

