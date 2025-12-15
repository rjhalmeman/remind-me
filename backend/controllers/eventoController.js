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

exports.listar = async function(req, res) {
    try {
        const result = await db.query('SELECT * FROM eventos ORDER BY id_evento DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
};

exports.criar = async function(req, res) {
    const { nome, data, hora, status, id_pessoa, descricao } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO eventos (nome_evento, data_evento, hora_evento, status, id_pessoa) VALUES ($1, $2, $3, $4, $5) RETURNING id_evento',
            [nome, data, hora, status, id_pessoa]
        );
        
        // Se tiver descrição, insere na outra tabela
        if (descricao) {
            const idNovo = result.rows[0].id_evento;
            await db.query('INSERT INTO descricao_evento (id_evento, descricao_evento) VALUES ($1, $2)', [idNovo, descricao]);
        }
        res.json({ sucesso: true });
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

exports.deletar = async function(req, res) {
    try {
        await db.query('DELETE FROM eventos WHERE id_evento = $1', [req.params.id]);
        res.json({ sucesso: true });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
};