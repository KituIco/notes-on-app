
function notesdb (mysql){
    return mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        connectionLimit: process.env.DB_CONNECTION_LIMIT,
        charset : 'utf8mb4',
    });

} 

module.exports = notesdb;