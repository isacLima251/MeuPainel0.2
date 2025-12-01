import pkg from 'pg';

const { Pool } = pkg;

const requiredEnv = ['DB_USER', 'DB_HOST', 'DB_NAME'];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);
if (missingEnv.length) {
  console.warn(`Variáveis de ambiente ausentes para o banco de dados: ${missingEnv.join(', ')}`);
}

const dbPassword = process.env.DB_PASSWORD;
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: dbPassword !== undefined ? String(dbPassword) : '',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
});

pool
  .connect()
  .then(() => console.log('Conexão bem-sucedida ao Banco de Dados!'))
  .catch((err) => console.error('Erro na conexão com o DB:', err));

const db = {
  query: (text, params) => pool.query(text, params),
  getClient: () => pool.connect(),
};

export default db;
