const mysql = require('mysql2');
const path = require('path');
const { attachDatabasePool } = require('@vercel/functions');
require('dotenv').config({
    path: path.join(__dirname, '..', '.env')
});

const connectionConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'library_attendance',
    waitForConnections: true,
    connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
    queueLimit: 0
};

const pool = mysql.createPool(connectionConfig);

if (process.env.VERCEL) {
    attachDatabasePool(pool);
}

if (!process.env.VERCEL) {
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error connecting to database:', err.message);
            return;
        }

        console.log('Connected to database successfully');
        connection.release();
    });
}

module.exports = pool;
