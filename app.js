const express = require('express');
const session = require('express-session');
const cors = require('cors');
const getConnection = require('./db');
const path = require('path');
const app = express();
const port = 3000;

const contactsPerPage = 10;
let currentPage = 1;
let filteredContacts = [];


// CORS configurado corretamente
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Sessão
app.use(session({
  secret: 'chave_secreta_segura',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;

// CADASTRO
app.post('/register', async (req, res) => {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ message: 'Preencha nome de usuário, email e senha.' });
  }

  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Email inválido.' });
  }

  try {
    const connection = await getConnection();

    const [existingUser] = await connection.execute(
      'SELECT * FROM usuarios WHERE email = ?',
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(409).json({ message: 'Email já cadastrado.' });
    }

    const [result] = await connection.execute(
      'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)',
      [nome, email, senha] // Adicione hash da senha futuramente
    );

    res.redirect('/login.html');
  } catch (err) {
    res.redirect('/cadastro.html');
  }
});

// LOGIN
app.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  try {
    const connection = await getConnection();
    const [users] = await connection.execute(
      'SELECT * FROM usuarios WHERE email = ?',
      [email]
    );

    if (users.length === 0) return res.status(401).send('Usuário não encontrado.');

    const usuario = users[0];

    if (senha !== usuario.senha) {
      return res.status(401).send('Senha incorreta.');
    }

    req.session.userId = usuario.id;
    res.redirect('/');
  } catch (err) {
    res.redirect('/login.html');
  }
});

// LOGOUT
app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).send('Erro ao fazer logout');
    res.clearCookie('connect.sid');
    res.redirect('/login.html');
  });
});

// CRIAR CONTATO
app.post('/contatos', async (req, res) => {
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ message: 'Não autenticado' });

  const { nome, sobrenome, numero, endereco, email, marcador } = req.body;
  
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Email inválido.' });
  }

  try {
    const connection = await getConnection();
    const [result] = await connection.execute(
      'INSERT INTO contatos (nome, sobrenome, numero, endereco, email, marcador, usuario_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [nome, sobrenome, numero, endereco, email, marcador, userId]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao criar contato', error: err.message });
  }
});

// LISTAR CONTATOS DO USUÁRIO
app.get('/contatos', async (req, res) => {
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ message: 'Não autenticado' });

  const { nome, numero, email, marcador } = req.query;

  try {
    const connection = await getConnection();
    let query = 'SELECT * FROM contatos WHERE usuario_id = ?';
    const params = [userId];

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

    if (marcador) {
      query += ' AND marcador LIKE ?';
      params.push(`%${marcador}%`);
    }

    const [contatos] = await connection.execute(query, params);
    res.json(contatos);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao carregar contatos', error: err.message });
  }
});

// VISUALIZAR UM CONTATO
app.get('/contatos/:id', async (req, res) => {
  const userId = req.session.userId;
  const { id } = req.params;

  if (!userId) return res.status(401).json({ message: 'Não autenticado' });

  try {
    const connection = await getConnection();
    const [rows] = await connection.execute(
      'SELECT * FROM contatos WHERE id = ? AND usuario_id = ?',
      [id, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Contato não encontrado' });
    }

    res.status(200).json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar contato', error: err.message });
  }
});

// EDITAR CONTATO
app.put('/contatos/:id', async (req, res) => {
  const userId = req.session.userId;
  const { id } = req.params;
  const { nome, sobrenome, numero, endereco, email, marcador } = req.body;

  if (!userId) return res.status(401).json({ message: 'Não autenticado' });

  try {
    const connection = await getConnection();

    const [result] = await connection.execute(
      'UPDATE contatos SET nome = ?, sobrenome = ?, numero = ?, endereco = ?, email = ?, marcador = ? WHERE id = ? AND usuario_id = ?',
      [nome, sobrenome, numero, endereco, email, marcador, id, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Contato não encontrado' });
    }

    res.status(200).json({ message: 'Contato atualizado com sucesso' });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao editar contato', error: err.message });
  }
});

// DELETAR CONTATO
app.delete('/contatos/:id', async (req, res) => {
  const userId = req.session.userId;
  const { id } = req.params;

  if (!userId) return res.status(401).json({ message: 'Não autenticado' });

  try {
    const connection = await getConnection();
    const [result] = await connection.execute(
      'DELETE FROM contatos WHERE id = ? AND usuario_id = ?',
      [id, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Contato não encontrado' });
    }

    res.status(200).json({ message: 'Contato excluído com sucesso' });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao excluir contato', error: err.message });
  }
});

// RETORNAR USUÁRIO LOGADO
app.get('/me', async (req, res) => {
  const userId = req.session.userId;

  if (!userId) return res.status(401).json({ message: 'Não autenticado' });

  try {
    const connection = await getConnection();
    const [rows] = await connection.execute('SELECT id, nome, email FROM usuarios WHERE id = ?', [userId]);

    if (rows.length === 0) return res.status(404).json({ message: 'Usuário não encontrado' });

    res.json({ usuario: rows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar usuário', error: err.message });
  }
});

// FRONTEND
app.use(express.static(path.join(__dirname, 'agenda-frontend')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'agenda-frontend', 'index.html'));
});

app.listen(port, () => {
  console.log(`🚀 Servidor rodando na porta ${port}`);
});
