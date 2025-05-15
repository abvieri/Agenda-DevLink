require('dotenv').config();
const mysql = require('mysql2/promise');

async function getConnection() {
  try {
    const connection = await mysql.createPool({
      host: 'localhost',
      user: 'root',
      password: 'vierisouza',
      database: 'agendacontatos',
      port: 3306,
      waitForConnections: true,
      connectionLimit: 5,
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
