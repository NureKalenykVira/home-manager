require('dotenv').config();
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const cors = require('cors');
const authRouter = require('./routes/auth');
const tasksRouter = require('./routes/tasks');
const familyRouter = require('./routes/family');
const shoppingRoutes = require('./routes/shopping');
const calendarRoutes = require('./routes/calendar');
const commentRoutes = require('./routes/comments');

var app = express();

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'dist')));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/auth', authRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/family', familyRouter);
app.use('/api/shopping', shoppingRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/attachments', require('./routes/attachments'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'browser', 'index.html'));
});

module.exports = app;
