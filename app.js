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

  try {
    const [result] = await pool.execute(
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
  }
});

// Rota para listar contatos com filtro opcional
app.get('/contatos', async (req, res) => {
  const { nome, numero, email } = req.query;

  try {
    const connection = await pool.getConnection();

    let query = 'SELECT * FROM contatos WHERE 1=1';
    const params = [];

    if (nome) {
      query += ' AND nome LIKE ?';
      params.push(`%${nome}%`);
    }
    if (numero) {
      query += ' AND numero = ?'; // Use igualdade exata para número
      params.push(numero);
    }
    if (email) {
      query += ' AND email = ?'; // Use igualdade exata para email
      params.push(email);
    }

    console.log('Consulta SQL:', query);
    console.log('Parâmetros:', params);

    const [rows] = await connection.execute(query, params);
    connection.release(); // Libere a conexão

    res.status(200).json(rows);
  } catch (err) {
    console.error('Erro ao buscar contatos:', err);
    res.status(500).json({ message: 'Erro ao buscar contatos', error: err });
  }
});


// Servir arquivos estáticos da pasta agenda-frontend
app.use(express.static(path.join(__dirname, 'agenda-frontend')));

// Rota para todas as rotas desconhecidas
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'agenda-frontend', 'index.html'));
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`🚀 Servidor rodando na porta ${port}`);
});
