-- Tabela status_evento
CREATE TABLE status_evento (
    id_status SERIAL PRIMARY KEY,
    descricao_status VARCHAR(50) NOT NULL
);

-- Tabela pessoa
CREATE TABLE pessoa (
    id_pessoa SERIAL PRIMARY KEY,
    email_pessoa VARCHAR(100) UNIQUE NOT NULL,
    nome_pessoa VARCHAR(50) NOT NULL,
    senha_pessoa VARCHAR(30) NOT NULL,
    foto_pessoa BYTEA,
    data_nascimento_pessoa DATE
);

-- Tabela eventos
CREATE TABLE eventos (
    id_evento SERIAL PRIMARY KEY,
    nome_evento VARCHAR(50) NOT NULL,
    data_evento DATE NOT NULL,
    hora_evento TIME WITHOUT TIME ZONE NOT NULL,
    som_evento BYTEA,
    status INT NOT NULL,
    log_status TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_pessoa INT NOT NULL,
    CONSTRAINT fk_status FOREIGN KEY (status) 
        REFERENCES status_evento(id_status) 
        ON UPDATE CASCADE,
    CONSTRAINT fk_pessoa FOREIGN KEY (id_pessoa) 
        REFERENCES pessoa(id_pessoa) 
        ON UPDATE CASCADE
);

-- Tabela descricao_evento (relacionamento 1:1)
CREATE TABLE descricao_evento (
    id_evento INT PRIMARY KEY,
    descricao_evento VARCHAR(1000),
    CONSTRAINT fk_evento FOREIGN KEY (id_evento) 
        REFERENCES eventos(id_evento) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
);

-- Índices para melhor performance
CREATE INDEX idx_eventos_status ON eventos(status);
CREATE INDEX idx_eventos_pessoa ON eventos(id_pessoa);
CREATE INDEX idx_eventos_data ON eventos(data_evento);


-- inserts

-- Inserir status possíveis
INSERT INTO status_evento (descricao_status) VALUES 
('Agendado'),
('Em andamento'),
('Cancelado'),
('Concluído');

-- Inserir uma pessoa
INSERT INTO pessoa (email_pessoa, nome_pessoa, senha_pessoa, data_nascimento_pessoa) 
VALUES ('exemplo@email.com', 'João Silva', 'senha123', '1990-05-15');
