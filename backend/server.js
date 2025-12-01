// Arquivo: backend/server.js (APENAS TRECHOS ALTERADOS)

import 'dotenv/config'; // Forma correta de carregar o .env em módulos ES
import express from 'express';
import cors from 'cors';
import db from './config/db.js'; // Note o '.js' na importação local
// ... (imports de rotas virão aqui)

const app = express();
const PORT = process.env.PORT || 3001; 

// Middlewares
app.use(cors());
// ...

// Rota de Teste de Saúde
app.get('/', (req, res) => {
    res.status(200).send({ message: 'Meu Painel Back-end está rodando!' });
});

// Inicia o Servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});