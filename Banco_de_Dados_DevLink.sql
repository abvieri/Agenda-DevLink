CREATE DATABASE AgendaContatos;
USE AgendaContatos;

-- Criação da tabela de contatos
CREATE TABLE contatos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,
    sobrenome VARCHAR(50),
    numero VARCHAR(20) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    foto LONGBLOB, -- Armazenamento de foto, caso necessário
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



-- Criação de índices para otimizar a busca por e-mail e número
CREATE INDEX idx_email ON contatos(email);
CREATE INDEX idx_numero ON contatos(numero);

-- Inserção de dados de exemplo
INSERT INTO contatos (nome, sobrenome, numero, email, foto)
VALUES ('Carlos', 'Silva', '11987654321', 'carlos@gmail.com', NULL);

-- Consulta para ver todos os contatos
SELECT * FROM contatos;

-- Atualização de número de telefone
UPDATE contatos SET numero = '11999998888' WHERE id = 1;

-- Consultar após atualização
SELECT * FROM contatos;

-- Atualização de email
UPDATE contatos SET email = 'vando@gmail.com' WHERE id = 1;

-- Consultar após atualização
SELECT * FROM contatos;

-- Atualização de número de telefone novamente
UPDATE contatos SET numero = '1197044805' WHERE id = 1;

-- Consultar após atualização
SELECT * FROM contatos;

-- Excluir um contato específico
DELETE FROM contatos WHERE id = 4;

-- Mostrar todos os bancos de dados
SHOW DATABASES;
