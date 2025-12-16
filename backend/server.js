const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3003;

// --- Middlewares ---
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());
app.use(cors());

// Servir arquivos estáticos (Front e CSS Global)
app.use('/frontend', express.static(path.join(__dirname, '../frontend')));
app.use(express.static(path.join(__dirname, '../')));

// --- Importar Rotas ---
const authRoutes = require('./routes/authRoutes');
const eventoRoutes = require('./routes/eventoRoutes');
const pessoaRoutes = require('./routes/pessoaRoutes');
const statusRoutes = require('./routes/statusRoutes');

// --- Usar Rotas (Ajustado) ---

// Mude de '/api' para '/api/auth' para organizar melhor
app.use('/api/auth', authRoutes); // <--- AQUI A MUDANÇA
// Resultado: http://localhost:3003/api/auth/login

app.use('/api/eventos', eventoRoutes);
app.use('/api/pessoas', pessoaRoutes);
app.use('/api/status', statusRoutes);

app.listen(PORT, function() {
    console.log('Servidor rodando na porta ' + PORT);
    console.log('Acesse: http://localhost:3003/frontend/login/login.html');
});