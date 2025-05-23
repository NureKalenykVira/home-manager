require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const { poolPromise } = require('./config/db');

const app = express();

app.use(cors({
  origin: 'https://home-manager-frontend-f5ekckframawd8fj.northeurope-01.azurewebsites.net',
  credentials: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept, Authorization'
}));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Статичні Angular-файли
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'dist')));

poolPromise
  .then(() => {
    console.log('Database connection successful');

    // API маршрути
    app.use('/', require('./routes/index'));
    app.use('/users', require('./routes/users'));
    app.use('/auth', require('./routes/auth'));
    app.use('/api/tasks', require('./routes/tasks'));
    app.use('/api/family', require('./routes/family'));
    app.use('/api/shopping', require('./routes/shopping'));
    app.use('/api/calendar', require('./routes/calendar'));
    app.use('/api/comments', require('./routes/comments'));
    app.use('/api/attachments', require('./routes/attachments'));
    app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

    // Angular SPA fallback (має бути в кінці)
    app.get('*', (_, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  })
  .catch(err => {
    console.error('Failed to connect to the database. Server not initialized.', err.message);
    process.exit(1);
  });

module.exports = app;
