import pool from './src/config/db.js';

const [rows] = await pool.query('SELECT NOW() AS now');
console.log('Conexión OK, hora actual:', rows[0].now);
