const express = require('express'); 
const getConnection = require('./db'); // Importando a função correta
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
    const connection = await getConnection();
    const [result] = await connection.execute(
      'INSERT INTO contatos (nome, sobrenome, numero, email, foto) VALUES (?, ?, ?, ?, ?)',
      [nome, sobrenome, numero, email, foto]
    );
    res.status(201).json({ id: result.insertId, nome, sobrenome, numero, email, foto });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao criar contato', error: err });
  }
});

// Rota para listar contatos com filtro opcional
app.get('/contatos', async (req, res) => {
  const { nome, numero, email } = req.query;

  try {
    const connection = await getConnection();
    let query = 'SELECT * FROM contatos WHERE 1=1';
    let params = [];

    if (nome) {
      query += ' AND nome LIKE ?';
      params.push(`%${nome}%`);
    }
    if (numero) {
      query += ' AND numero LIKE ?';
      params.push(`%${numero}%`);
    }
    if (email) {
      query += ' AND email LIKE ?';
      params.push(`%${email}%`);
    }

    const [rows] = await connection.execute(query, params);
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar contatos', error: err });
  }
});

// Servir arquivos estáticos da pasta agenda-frontend
app.use(express.static(path.join(__dirname, 'agenda-frontend')));

// Para garantir que todas as rotas desconhecidas carreguem o index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'agenda-frontend', 'index.html'));
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`🚀 Servidor rodando na porta ${port}`);
});
