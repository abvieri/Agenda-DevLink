const express = require('express');
const { pool } = require('./db'); // Importa o pool corretamente
const app = express();
const port = 3000;
const cors = require('cors');
const path = require('path');

app.use(express.json());
app.use(cors());

// Expressão regular para validar email
const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;

// Rota para criar um novo contato
app.post('/contatos', async (req, res) => {
  const { nome, sobrenome, numero, email, foto } = req.body;

  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Email inválido.' });
  }

  let connection;
  try {
    connection = await pool.getConnection();

    const [result] = await connection.execute(
      'INSERT INTO contatos (nome, sobrenome, numero, email, foto) VALUES (?, ?, ?, ?, ?)',
      [nome, sobrenome, numero, email, foto]
    );

    res.status(201).json({
      id: result.insertId,
      nome,
      sobrenome,
      numero,
      email,
      foto
    });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao criar contato', error: err });
  } finally {
    if (connection) connection.release(); // Libere a conexão
  }
});

// Rota para listar contatos com filtro opcional
app.get('/contatos', async (req, res) => {
  const { nome, numero, email } = req.query;

  let connection;
  try {
    connection = await pool.getConnection();

    let query = 'SELECT * FROM contatos WHERE 1=1';
    const params = [];

    if (nome) {
      query += ' AND nome LIKE ?';
      params.push(`%${nome}%`);
    }
    if (numero) {
      query += ' AND numero = ?';
      params.push(numero);
    }
    if (email) {
      query += ' AND email = ?';
      params.push(email);
    }

    console.log('Consulta SQL:', query);
    console.log('Parâmetros:', params);

    const [rows] = await connection.execute(query, params);
    res.status(200).json(rows);
  } catch (err) {
    console.error('Erro ao buscar contatos:', err);
    res.status(500).json({ message: 'Erro ao buscar contatos', error: err });
  } finally {
    if (connection) connection.release(); // Libere a conexão
  }
});

// Servir arquivos estáticos da pasta agenda-frontend
app.use(express.static(path.join(__dirname, 'agenda-frontend')));

// Rota para todas as rotas desconhecidas
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'agenda-frontend', 'index.html'));
});

// Fechar o pool de conexões ao encerrar o servidor
process.on('SIGINT', async () => {
  try {
    await pool.end();
    console.log('Pool de conexões encerrado.');
    process.exit(0);
  } catch (err) {
    console.error('Erro ao encerrar pool:', err);
    process.exit(1);
  }
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`🚀 Servidor rodando na porta ${port}`);
});
