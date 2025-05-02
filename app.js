const express = require('express');
const getConnection = require('./db'); // Importando a função correta
const app = express();
const port = 3000;

// Middleware para ler dados do body
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const cors = require('cors');
app.use(cors());

const path = require('path');
const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;

// Rota para registrar novo usuário (Cadastro)
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

    // Senha salva sem hash
    const [result] = await connection.execute(
      'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)',
      [nome, email, senha]
    );

    res.status(201).json({ message: 'Usuário cadastrado com sucesso', id: result.insertId });
    // Redireciona para o index.html
    res.redirect('/');
  } catch (err) {
    res.status(500).json({ message: 'Erro ao registrar usuário', error: err.message });
    // Redireciona para o index.html
    res.redirect('/cadastrar.html');
  }
});

// Rota para login de usuário
app.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  try {
    const connection = await getConnection();

    const [users] = await connection.execute(
      'SELECT * FROM usuarios WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).send('Usuário não encontrado.');
    }

    const usuario = users[0];

    // Verificação direta de senha (sem hash)
    if (senha !== usuario.senha) {
      return res.status(401).send('Senha incorreta.');
    }

    // Redireciona para o index.html
    res.redirect('/');
  } catch (err) {
    res.status(500).send('Erro no login: ' + err.message);
    res.redirect('/cadastrar.html');
  }
});

app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).send('Erro ao fazer logout');
    res.clearCookie('connect.sid'); // limpa cookie da sessão
    res.status(200).send('Logout feito com sucesso');
  });
});


// Rota para criar um novo contato
app.post('/contatos', async (req, res) => {
  const { nome, sobrenome, numero, endereco, email, marcador } = req.body;

  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Email inválido.' });
  }

  try {
    const connection = await getConnection();
    const [result] = await connection.execute(
      'INSERT INTO contatos (nome, sobrenome, numero, endereco, email, marcador) VALUES (?, ?, ?, ?, ?, ?)',
      [nome, sobrenome, numero, endereco, email, marcador]
    );
    res.status(201).json({ id: result.insertId, nome, sobrenome, numero, endereco, email, marcador });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao criar contato', error: err.message });
  }
});

// Rota para listar todos os contatos ou buscar por nome, telefone, email ou marcador
app.get('/contatos', async (req, res) => {
  const { nome, numero, email, marcador } = req.query;

  try {
    const connection = await getConnection();

    let query = 'SELECT * FROM contatos';
    const params = [];

    if (nome || numero || email || marcador) {
      query += ' WHERE 1=1';

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
        query += ' AND marcador = ?';
        params.push(marcador);
      }
    }

    const [rows] = await connection.execute(query, params);
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao listar contatos', error: err.message });
  }
});

// Rota para pegar um contato específico com base no ID
app.get('/contatos/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const connection = await getConnection();
    const query = 'SELECT * FROM contatos WHERE id = ?';
    const [rows] = await connection.execute(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Contato não encontrado' });
    }

    res.status(200).json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar o contato', error: err.message });
  }
});

// Rota para excluir um contato
app.delete('/contatos/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const connection = await getConnection();
    const query = 'DELETE FROM contatos WHERE id = ?';
    const [result] = await connection.execute(query, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Contato não encontrado' });
    }

    res.status(200).json({ message: 'Contato excluído com sucesso' });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao excluir o contato', error: err.message });
  }
});

// Rota para editar um contato
app.put('/contatos/:id', async (req, res) => {
  const id = req.params.id;
  const { nome, sobrenome, numero, endereco, email, marcador } = req.body;

  try {
    const connection = await getConnection();

    const query = 'UPDATE contatos SET nome = ?, sobrenome = ?, numero = ?, endereco = ?, email = ?, marcador = ? WHERE id = ?';
    const params = [nome, sobrenome, numero, endereco, email, marcador, id];

    const [result] = await connection.execute(query, params);

    if (result.affectedRows > 0) {
      res.status(200).json({ message: 'Contato atualizado com sucesso' });
    } else {
      res.status(404).json({ message: 'Contato não encontrado' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Erro ao editar contato', error: err.message });
  }
});

//Rota para retornar o usuário logado, aplicar no app.js
app.get('/me', async (req, res) => {
  if (!req.session) {
    return res.status(401).json({ message: 'Não autenticado' });
  }
  const usuario = await buscarUsuarioPorId(req.session.userId); // banco de dados
  res.json({ usuario }); // Retorna nome, email etc.
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
