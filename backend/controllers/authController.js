const db = require('../database');

exports.login = async function(req, res) {
    const { email, senha } = req.body;
    try {
        const result = await db.query(
            'SELECT * FROM pessoa WHERE email_pessoa = $1 AND senha_pessoa = $2', 
            [email, senha]
        );

        if (result.rows.length > 0) {
            const user = result.rows[0];
            // Salva cookie (duração de 1 hora)
            res.cookie('usuario_logado', user.id_pessoa, { maxAge: 3600000 });
            res.cookie('nome_usuario', user.nome_pessoa, { maxAge: 3600000 });
            res.json({ sucesso: true });
        } else {
            res.status(401).json({ sucesso: false, mensagem: 'Dados incorretos' });
        }
    } catch (error) {
        res.status(500).json({ erro: error.message });
    }
};

exports.logout = function(req, res) {
    res.clearCookie('usuario_logado');
    res.clearCookie('nome_usuario');
    res.json({ sucesso: true });
};