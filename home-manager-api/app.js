require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Статичні файли
app.use(express.static(path.join(__dirname, 'dist', 'browser')));
app.use(express.static(path.join(__dirname, 'public')));

// Роутери з обробкою помилок підключення
try {
  app.use('/', require('./routes/index'));
} catch (e) {
  console.error('Error loading /routes/index:', e.message);
}
try {
  app.use('/users', require('./routes/users'));
} catch (e) {
  console.error('Error loading /routes/users:', e.message);
}
try {
  app.use('/auth', require('./routes/auth'));
} catch (e) {
  console.error('Error loading /routes/auth:', e.message);
}
try {
  app.use('/api/tasks', require('./routes/tasks'));
} catch (e) {
  console.error('Error loading /routes/tasks:', e.message);
}
try {
  app.use('/api/family', require('./routes/family'));
} catch (e) {
  console.error('Error loading /routes/family:', e.message);
}
try {
  app.use('/api/shopping', require('./routes/shopping'));
} catch (e) {
  console.error('Error loading /routes/shopping:', e.message);
}
try {
  app.use('/api/calendar', require('./routes/calendar'));
} catch (e) {
  console.error('Error loading /routes/calendar:', e.message);
}
try {
  app.use('/api/comments', require('./routes/comments'));
} catch (e) {
  console.error('Error loading /routes/comments:', e.message);
}
try {
  app.use('/api/attachments', require('./routes/attachments'));
} catch (e) {
  console.error('Error loading /routes/attachments:', e.message);
}
try {
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
} catch (e) {
  console.error('Error loading /uploads:', e.message);
}

// Angular SPA
app.get('*', (_, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'browser', 'index.html'));
});

module.exports = app;
