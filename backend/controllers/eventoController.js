const db = require('../database');

// Lista para o Menu (Ordenado, não concluídos)
exports.listarMenu = async function(req, res) {
    try {
        // Status 4 = Concluído. Trazemos tudo que é diferente de 4.
        const sql = `
            SELECT e.*, s.descricao_status, d.descricao_evento
            FROM eventos e
            JOIN status_evento s ON e.status = s.id_status
            LEFT JOIN descricao_evento d ON e.id_evento = d.id_evento
            WHERE e.status != 4
            ORDER BY e.data_evento ASC, e.hora_evento ASC
        `;
        const result = await db.query(sql);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
};
exports.atualizarStatus = async function(req, res) {
    const { novoStatus } = req.body;
    const { id } = req.params;
    try {
        await db.query('UPDATE eventos SET status = $1 WHERE id_evento = $2', [novoStatus, id]);
        res.json({ sucesso: true });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
};



// Auxiliares para Áudio (Base64)
const bufferParaBase64 = (buffer) => {
    if (!buffer) return null;
    // Prefixo para tocar no navegador (assumindo mp3/wav)
    return `data:audio/mpeg;base64,${buffer.toString('base64')}`;
};

const base64ParaBuffer = (base64String) => {
    if (!base64String) return null;
    // Remove prefixo (ex: "data:audio/mpeg;base64,")
    const base64Data = base64String.split(';base64,').pop();
    return Buffer.from(base64Data, 'base64');
};

// Listar (Join para trazer nomes em vez de IDs na tabela)
exports.listar = async function(req, res) {
    try {
        const sql = `
            SELECT e.*, p.nome_pessoa, s.descricao_status 
            FROM eventos e
            LEFT JOIN pessoa p ON e.id_pessoa = p.id_pessoa
            LEFT JOIN status_evento s ON e.status = s.id_status
            ORDER BY e.data_evento DESC, e.hora_evento ASC
        `;
        const result = await db.query(sql);
        
        // Formata o áudio para o front
        const eventos = result.rows.map(e => ({
            ...e,
            som_evento: bufferParaBase64(e.som_evento)
        }));
        res.json(eventos);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
};

// Buscar por ID
exports.buscarPorId = async function(req, res) {
    const { id } = req.params;
    try {
        const result = await db.query('SELECT * FROM eventos WHERE id_evento = $1', [id]);
        if (result.rows.length > 0) {
            const e = result.rows[0];
            e.som_evento = bufferParaBase64(e.som_evento);
            res.json(e);
        } else {
            res.status(404).json({ erro: 'Evento não encontrado' });
        }
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
};

// Criar
exports.criar = async function(req, res) {
    const { nome, data, hora, status, id_pessoa, som } = req.body;
    try {
        const somBuffer = base64ParaBuffer(som);
        await db.query(
            'INSERT INTO eventos (nome_evento, data_evento, hora_evento, status, id_pessoa, som_evento) VALUES ($1, $2, $3, $4, $5, $6)',
            [nome, data, hora, status, id_pessoa, somBuffer]
        );
        res.json({ sucesso: true, mensagem: 'Evento criado!' });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
};

// Atualizar
exports.atualizar = async function(req, res) {
    const { id } = req.params;
    const { nome, data, hora, status, id_pessoa, som } = req.body;
    try {
        const somBuffer = base64ParaBuffer(som);
        await db.query(
            'UPDATE eventos SET nome_evento=$1, data_evento=$2, hora_evento=$3, status=$4, id_pessoa=$5, som_evento=$6 WHERE id_evento=$7',
            [nome, data, hora, status, id_pessoa, somBuffer, id]
        );
        res.json({ sucesso: true, mensagem: 'Evento atualizado!' });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
};

// Deletar
exports.deletar = async function(req, res) {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM eventos WHERE id_evento = $1', [id]);
        res.json({ sucesso: true, mensagem: 'Evento excluído!' });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
};