import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PrismaClient } = require('@prisma/client');

// Importação das rotas
import authRoutes from './routes/authRoutes.js';
import partyRoutes from './routes/partyRoutes.js';
import guestRoutes from './routes/guestRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import supplierRoutes from './routes/supplierRoutes.js';
import leadRoutes from './routes/leadRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import whatsappRoutes from './routes/whatsappRoutes.js';
import path from 'path';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

export const prisma = new PrismaClient();

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/parties', partyRoutes);
app.use('/api/guests', guestRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/whatsapp', whatsappRoutes);

// Servir a pasta de uploads publicamente
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Rota de teste
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Middleware Global de Tratamento de Erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Ocorreu um erro interno no servidor',
    message: err.message,
  });
});

app.listen(port, () => {
  console.log(`🚀 Servidor Celebrate rodando na porta ${port}`);
});
