const express = require('express');
const connection = require('./db');
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

  // Validação de email
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Email inválido.' });
  }

  try {
    const [result] = await connection.execute(
      'INSERT INTO contatos (nome, sobrenome, numero, email, foto) VALUES (?, ?, ?, ?, ?)',
      [nome, sobrenome, numero, email, foto]
    );
    res.status(201).json({ id: result.insertId, nome, sobrenome, numero, email, foto });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao criar contato', error: err });
  }
});

// Rota para listar todos os contatos
app.get('/contatos', async (req, res) => {
  try {
    const [rows] = await connection.execute('SELECT * FROM contatos');
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao listar contatos', error: err });
  }
});

// Rota para buscar um contato pelo ID
app.get('/contatos/:id', async (req, res) => {
  const { id } = req.params;
  console.log(`ID recebido: ${id} (tipo: ${typeof id})`);

  try {
    const [rows] = await connection.execute('SELECT * FROM contatos WHERE id = ?', [Number(id)]);
    
    console.log('Resultado da consulta:', rows);

    if (rows.length > 0) {
      res.status(200).json(rows[0]); 
    } else {
      res.status(404).json({ message: 'Contato não encontrado' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar contato', error: err });
  }
});


// Rota para atualizar um contato
app.put('/contatos/:id', async (req, res) => {
  const { id } = req.params;
  let { nome, sobrenome, numero, email, foto } = req.body;
  
  // Validação de campos obrigatórios
  if (nome === undefined || sobrenome === undefined || numero === undefined || email === undefined) {
    return res.status(400).json({ message: 'Campos nome, sobrenome, numero e email são obrigatórios.' });
  }

  // Validação de email
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Email inválido.' });
  }

  // Se foto for opcional, definimos como null caso não seja enviado
  foto = foto !== undefined ? foto : null;
  
  try {
    const [result] = await connection.execute(
      'UPDATE contatos SET nome = ?, sobrenome = ?, numero = ?, email = ?, foto = ? WHERE id = ?',
      [nome, sobrenome, numero, email, foto, id]
    );
    
    if (result.affectedRows > 0) {
      res.status(200).json({ message: 'Contato atualizado com sucesso' });
    } else {
      res.status(404).json({ message: 'Contato não encontrado' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Erro ao atualizar contato', error: err });
  }
});

// Rota para deletar um contato
app.delete('/contatos/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const [result] = await connection.execute('DELETE FROM contatos WHERE id = ?', [id]);
    
    if (result.affectedRows > 0) {
      res.status(200).json({ message: 'Contato deletado com sucesso' });
    } else {
      res.status(404).json({ message: 'Contato não encontrado' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Erro ao deletar contato', error: err });
  }
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
