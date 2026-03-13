const mysql = require('mysql2');
const path = require('path');
require('dotenv').config({
    path: path.join(__dirname, '..', '.env'),
    quiet: true
});

const dbHost = process.env.DB_HOST || process.env.MYSQLHOST || 'localhost';
const dbPort = Number(process.env.DB_PORT || process.env.MYSQLPORT || 3306);
const dbUser = process.env.DB_USER || process.env.MYSQLUSER || 'root';
const dbPassword = process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || '';
const dbName = process.env.DB_NAME || process.env.MYSQLDATABASE || 'library_attendance';

const connectionConfig = {
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPassword,
    database: dbName,
    waitForConnections: true,
    connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
    queueLimit: 0
};

const shouldUseSsl = ['1', 'true', 'yes'].includes(
    `${process.env.DB_SSL || ''}`.trim().toLowerCase()
);

if (shouldUseSsl) {
    connectionConfig.ssl = {
        rejectUnauthorized: `${process.env.DB_SSL_REJECT_UNAUTHORIZED || 'true'}`
            .trim()
            .toLowerCase() !== 'false'
    };
}

const pool = mysql.createPool(connectionConfig);

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
