const mysql = require('mysql2/promise');

// Configuração de conexão
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true, // Permite que as conexões aguardem no pool
  connectionLimit: 10, // Limite de conexões simultâneas
  queueLimit: 0 // Limite de requisições em fila
});

connection.connect((err) => {
  if (err) throw err;
  console.log('Conectado ao banco de dados MySQL!');
});

// Função para testar a conexão
async function testConnection() {
  try {
    const [rows, fields] = await connection.execute('SELECT 1');
    console.log('Conexão bem-sucedida:', rows);
  } catch (err) {
    console.error('Erro de conexão:', err);
  }
}

// Teste a conexão ao iniciar o script
testConnection();

// Exportar a conexão para ser usada em outros arquivos
module.exports = connection;
