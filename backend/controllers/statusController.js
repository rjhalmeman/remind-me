const db = require('../database');

// Listar todos
exports.listar = async function(req, res) {
    try {
        const result = await db.query('SELECT * FROM status_evento ORDER BY id_status ASC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
};

// Buscar por ID
exports.buscarPorId = async function(req, res) {
    const { id } = req.params;
    try {
        const result = await db.query('SELECT * FROM status_evento WHERE id_status = $1', [id]);
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ erro: 'Status não encontrado' });
        }
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
};

// Criar
exports.criar = async function(req, res) {
    const { descricao } = req.body;
    try {
        await db.query(
            'INSERT INTO status_evento (descricao_status) VALUES ($1)',
            [descricao]
        );
        res.json({ sucesso: true, mensagem: 'Status criado com sucesso!' });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
};

// Atualizar
exports.atualizar = async function(req, res) {
    const { id } = req.params;
    const { descricao } = req.body;
    try {
        await db.query(
            'UPDATE status_evento SET descricao_status = $1 WHERE id_status = $2',
            [descricao, id]
        );
        res.json({ sucesso: true, mensagem: 'Status atualizado com sucesso!' });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
};

// Deletar
exports.deletar = async function(req, res) {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM status_evento WHERE id_status = $1', [id]);
        res.json({ sucesso: true, mensagem: 'Status excluído com sucesso!' });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
};