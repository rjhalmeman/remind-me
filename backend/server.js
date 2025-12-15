const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();
const PORT = 3003;


// Aumentamos o limite para 50mb para aceitar fotos grandes
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
// -------------------

app.use(cookieParser());

// Servir arquivos do frontend (estáticos)
app.use('/frontend', express.static(path.join(__dirname, '../frontend')));
app.use(express.static(path.join(__dirname, '../'))); // Para o index.html da raiz

// Importar Rotas
const authRoutes = require('./routes/authRoutes');
const eventoRoutes = require('./routes/eventoRoutes');
const pessoaRoutes = require('./routes/pessoaRoutes');
const statusRoutes = require('./routes/statusRoutes');

// Usar Rotas
app.use('/api', authRoutes);
app.use('/api/eventos', eventoRoutes);
app.use('/api/pessoas', pessoaRoutes);
app.use('/api/status', statusRoutes);

app.listen(PORT, function() {
    console.log('Servidor rodando na porta ' + PORT);
    console.log('Acesse: http://localhost:3003');
});