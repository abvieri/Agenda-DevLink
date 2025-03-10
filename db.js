require('dotenv').config();
const mysql = require('mysql2/promise');

async function getConnection() {
  try {
    const connection = await mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    console.log('✅ Conectado ao banco de dados MySQL!');
    return connection;
  } catch (err) {
    console.error('❌ Erro ao conectar ao banco de dados:', err);
    throw err;
  }
}

// Exporta a função para obter a conexão
module.exports = getConnection;
