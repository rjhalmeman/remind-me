const db = require('../database');

exports.listar = async function(req, res) {
    const result = await db.query('SELECT * FROM status_evento');
    res.json(result.rows);
};