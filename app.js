const express = require('express');
const getConnection = require('./db'); // Importando a função correta
const app = express();
const port = 3000;

// Middleware para parsear o corpo das requisições (JSON)
app.use(express.json());

const cors = require('cors');
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

// Rota para listar todos os contatos ou buscar por nome, telefone, email ou categoria
app.get('/contatos', async (req, res) => {
  const { nome, numero, email, categoria } = req.query;

  try {
    const connection = await getConnection();

    let query = 'SELECT * FROM contatos';
    const params = [];

    if (nome || numero || email || categoria) {
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
      if (categoria) {
        query += ' AND categoria = ?';
        params.push(categoria);
      }
    }

    const [rows] = await connection.execute(query, params);
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao listar contatos', error: err });
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

    res.status(200).json(rows[0]); // Retorna apenas o contato com o ID correspondente
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar o contato', error: err });
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
    res.status(500).json({ message: 'Erro ao excluir o contato', error: err });
  }
});

// Rota para editar um contato
app.put('/contatos/:id', async (req, res) => {
  const id = req.params.id;
  const { nome, sobrenome, numero, email } = req.body;

  try {
      const connection = await getConnection();

      const query = 'UPDATE contatos SET nome = ?, sobrenome = ?, numero = ?, email = ? WHERE id = ?';
      const params = [nome, sobrenome, numero, email, id];

      const [result] = await connection.execute(query, params);

      if (result.affectedRows > 0) {
          res.status(200).json({ message: 'Contato atualizado com sucesso' });
      } else {
          res.status(404).json({ message: 'Contato não encontrado' });
      }
  } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Erro ao editar contato', error: err });
  }
});


const path = require('path');

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
