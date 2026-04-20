require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: '31.97.102.106',
    database: 'hospital5b',
    password: 'Penjamo-123', 
    port: 5432,              
});

// Prueba de conexión inmediata
pool.connect((err, client, release) => {
    if (err) {
        return console.error('❌ ERROR CRÍTICO DE CONEXIÓN:', err.message);
    }
    console.log('✅ CONECTADO A POSTGRESQL EXITOSAMENTE');
    release();
});

module.exports = pool;