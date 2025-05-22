require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const { poolPromise } = require('./config/db');

const app = express();

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Статичні файли
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'dist')));

// Перенаправлення всіх інших маршрутів на index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

poolPromise
  .then(() => {
    console.log('Database connection successful');

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
  })
  .catch(err => {
    console.error('❌ Failed to connect to the database. Server not initialized.', err.message);
    process.exit(1);
  });

// Angular SPA
app.get('*', (_, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'browser', 'index.html'));
});

module.exports = app;
