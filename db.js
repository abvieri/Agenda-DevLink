const mysql = require('mysql2/promise');

// Configuração de conexão
const connection = mysql.createPool({
  host: 'localhost', // Pode ser o host do seu banco, como localhost ou IP remoto
  user: 'root', // Seu nome de usuário no MySQL
  password: '123456', // Sua senha
  database: 'agendacontatos', // Nome do banco de dados
  port: 3307, // Porta correta
  waitForConnections: true, // Permite que as conexões aguardem no pool
  connectionLimit: 10, // Limite de conexões simultâneas
  queueLimit: 0 // Limite de requisições em fila
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
