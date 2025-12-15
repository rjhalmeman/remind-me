const { Pool } = require('pg');

const pool = new Pool({
    user: 'radames',
    host: 'localhost',
    database: 'remember_yourself',
    password: 'Lageado001.',
    port: 5432,
});

console.log('--- Banco de Dados Conectado ---');

module.exports = pool;