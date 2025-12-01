// Arquivo: backend/config/db.js (Substituir Código Completo)

import pkg from 'pg'; // Se for MySQL, use o módulo mysql2 ou similar
const { Pool } = pkg;

// As credenciais devem ser carregadas de um arquivo .env para segurança!
const pool = new Pool({
    user: process.env.DB_USER, // Carregado via dotenv no server.js
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

pool.connect()
    .then(() => console.log('Conexão bem-sucedida ao Banco de Dados!'))
    .catch(err => console.error('Erro na conexão com o DB:', err));

// Exportamos a função de query para ser usada nos controladores
export default {
    query: (text, params) => pool.query(text, params),
};