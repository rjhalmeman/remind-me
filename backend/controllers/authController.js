const db = require('../database');

exports.login = async function(req, res) {
    // Recebe do formulário (frontend envia json: { email: "...", senha: "..." })
    const { email, senha } = req.body;

    console.log('Tentando logar com:', email, senha);

    if (!email || !senha) {
        return res.status(400).json({ erro: 'Email e senha são obrigatórios.' });
    }

    try {
        // --- CORREÇÃO AQUI: Usando os nomes corretos da tabela ---
        const query = 'SELECT * FROM pessoa WHERE email_pessoa = $1 AND senha_pessoa = $2';
        const result = await db.query(query, [email, senha]);

        if (result.rows.length > 0) {
            const user = result.rows[0];

            console.log('Login Sucesso:', user.nome_pessoa);

            // Cria os cookies necessários para o Menu funcionar
            // Importante: id_usuario é usado para filtrar os eventos
            res.cookie('usuario_logado', 'true', { httpOnly: false });
            res.cookie('nome_usuario', user.nome_pessoa, { httpOnly: false });
            res.cookie('id_usuario', user.id_pessoa, { httpOnly: false });

            res.json({ 
                sucesso: true, 
                mensagem: 'Login realizado!',
                usuario: { id: user.id_pessoa, nome: user.nome_pessoa }
            });
        } else {
            console.log('Falha: Usuário ou senha incorretos');
            res.status(401).json({ erro: 'Email ou senha incorretos.' });
        }
    } catch (err) {
        console.error('Erro no servidor:', err);
        res.status(500).json({ erro: 'Erro interno: ' + err.message });
    }
};

exports.logout = function(req, res) {
    res.clearCookie('usuario_logado');
    res.clearCookie('nome_usuario');
    res.clearCookie('id_usuario');
    res.json({ sucesso: true });
};