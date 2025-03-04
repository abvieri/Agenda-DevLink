const mysql = require('mysql2/promise');

// Configuração de conexão
const connection = mysql.createPool({
  host: 'ldpg-cur29h5ds78s7384etr0-a',
  user: 'crudpython_ejl8_user',
  password: 'YwD8vhsb6UdkNUHncZPG9HjgRxZjoHjm',
  database: 'crudpython_ejl8', 
  port: 5432,
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
