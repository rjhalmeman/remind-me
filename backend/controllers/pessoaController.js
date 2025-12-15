const db = require('../database');

// Função auxiliar: Converte Buffer do banco para String Base64 para o Frontend
const bufferParaBase64 = (buffer) => {
    if (!buffer) return null;
    // Retorna a string pronta para usar no src da tag <img>
    return `data:image/jpeg;base64,${buffer.toString('base64')}`;
};

// Função auxiliar: Converte String Base64 do Frontend para Buffer do Banco
const base64ParaBuffer = (base64String) => {
    if (!base64String) return null;
    // Remove o cabeçalho "data:image/png;base64," se existir para salvar só os dados
    const base64Data = base64String.replace(/^data:image\/\w+;base64,/, "");
    return Buffer.from(base64Data, 'base64');
};

exports.listar = async function(req, res) {
    try {
        const result = await db.query('SELECT * FROM pessoa ORDER BY id_pessoa ASC');
        // Converte a foto de cada pessoa antes de enviar
        const pessoas = result.rows.map(p => ({
            ...p,
            foto_pessoa: bufferParaBase64(p.foto_pessoa)
        }));
        res.json(pessoas);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
};

exports.buscarPorId = async function(req, res) {
    const { id } = req.params;
    try {
        const result = await db.query('SELECT * FROM pessoa WHERE id_pessoa = $1', [id]);
        if (result.rows.length > 0) {
            const p = result.rows[0];
            p.foto_pessoa = bufferParaBase64(p.foto_pessoa);
            res.json(p);
        } else {
            res.status(404).json({ erro: 'Pessoa não encontrada' });
        }
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
};

exports.criar = async function(req, res) {
    // Agora recebemos 'foto' no corpo
    const { email, nome, senha, nascimento, foto } = req.body;
    try {
        const fotoBuffer = base64ParaBuffer(foto);
        await db.query(
            'INSERT INTO pessoa (email_pessoa, nome_pessoa, senha_pessoa, data_nascimento_pessoa, foto_pessoa) VALUES ($1, $2, $3, $4, $5)',
            [email, nome, senha, nascimento, fotoBuffer]
        );
        res.json({ sucesso: true, mensagem: 'Pessoa criada com sucesso!' });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
};

exports.atualizar = async function(req, res) {
    const { id } = req.params;
    const { email, nome, senha, nascimento, foto } = req.body;
    try {
        const fotoBuffer = base64ParaBuffer(foto);
        await db.query(
            'UPDATE pessoa SET email_pessoa = $1, nome_pessoa = $2, senha_pessoa = $3, data_nascimento_pessoa = $4, foto_pessoa = $5 WHERE id_pessoa = $6',
            [email, nome, senha, nascimento, fotoBuffer, id]
        );
        res.json({ sucesso: true, mensagem: 'Pessoa atualizada com sucesso!' });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
};

exports.deletar = async function(req, res) {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM pessoa WHERE id_pessoa = $1', [id]);
        res.json({ sucesso: true, mensagem: 'Pessoa excluída com sucesso!' });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
};