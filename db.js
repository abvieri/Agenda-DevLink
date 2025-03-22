require('dotenv').config();
const mysql = require('mysql2/promise');

// Cria o pool de conexões uma vez
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'bbnddvnxc2azi22dbplj-mysql.services.clever-cloud.com',
  user: process.env.DB_USER || 'ugq9nwc4xowcemy7',
  password: process.env.DB_PASSWORD || 'bO64FEsqBx1PjZjDpLbX',
  database: process.env.DB_NAME || 'bbnddvnxc2azi22dbplj',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 5, // Ajuste o limite conforme permitido (limite atual: 5)
  queueLimit: 0
});

pool.getConnection()
  .then(() => console.log('✅ Conectado ao banco de dados MySQL!'))
  .catch(err => {
    console.error('❌ Erro ao conectar ao banco de dados:', err);
  });

module.exports = pool;
