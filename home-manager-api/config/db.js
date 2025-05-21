// require('dotenv').config();
const sql = require('mssql');

const requiredEnv = ['DB_USER', 'DB_PASSWORD', 'DB_SERVER', 'DB_DATABASE'];
requiredEnv.forEach(name => {
  if (!process.env[name]) {
    throw new Error(`❌ Environment variable ${name} is not set`);
  }
});

const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    options: {
        encrypt: true,
        enableArithAbort: true
    }
};

const poolPromise = new sql.ConnectionPool(dbConfig)
    .connect()
    .then(pool => {
        console.log('Connected to SQL Server');
        return pool;
    })
    .catch(err => {
      console.error('❌ Database connection failed:', err);
      throw err;
  });

module.exports = {
    sql, poolPromise
};
