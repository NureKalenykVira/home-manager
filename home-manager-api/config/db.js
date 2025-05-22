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
  port: parseInt(process.env.DB_PORT || '1433', 10),
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    enableArithAbort: true
  }
};

const poolPromise = new sql.ConnectionPool(dbConfig)
  .connect()
  .then(pool => {
    console.log('✅ Connected to Azure SQL');
    return pool;
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err);
    throw err;
  });

module.exports = {
  sql, poolPromise
};
