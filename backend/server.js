import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import db from './config/db.js';
import authRoutes from './routes/auth.js';
import dashboardRoutes from './routes/dashboard.js';
import resourceRoutes from './routes/resources.js';
import webhookRoutes from './routes/webhook.js';
import vendasRoutes from './routes/vendas.js';
import clientesRoutes from './routes/clientes.js';
import { authenticate } from './middleware/auth.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', async (_req, res) => {
  try {
    await db.query('SELECT 1');
    res.status(200).json({ status: 'ok', db: true });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'DB connection failed', details: error.message });
  }
});

app.get('/', (_req, res) => {
  res.status(200).json({ message: 'Meu Painel Back-end está rodando!' });
});

app.use('/auth', authRoutes);
app.use('/webhook', webhookRoutes);

app.use(authenticate);
app.use('/dashboard', dashboardRoutes);
app.use('/', resourceRoutes);
app.use('/vendas', vendasRoutes);
app.use('/clientes', clientesRoutes);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
