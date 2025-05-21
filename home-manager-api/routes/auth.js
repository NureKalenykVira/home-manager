const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { poolPromise, sql } = require('../config/db');

const SECRET_KEY = 'your_secret_key';

// POST /api/auth/register
router.post('/register', async (req, res) => {
    console.log('Отримано логін-запит із тілом:', req.body);
    const { email, password, userName } = req.body;

  try {
    const pool = await poolPromise;

    const result = await pool.request()
      .input('Email', sql.NVarChar, email)
      .query('SELECT * FROM [User] WHERE Email = @Email');

    if (result.recordset.length > 0) {
      return res.status(400).json({ message: 'Користувач з таким email вже існує.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.request()
      .input('UserName', sql.NVarChar, userName)
      .input('Email', sql.NVarChar, email)
      .input('PasswordHash', sql.NVarChar, hashedPassword)
      .query('INSERT INTO [User] (UserName, Email, PasswordHash) VALUES (@UserName, @Email, @PasswordHash)');

    res.status(201).json({ message: 'Реєстрація пройшла успішно!' });
  } catch (error) {
    res.status(500).json({ message: 'Помилка сервера', error });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    console.log('Отримано логін-запит із тілом:', req.body);
    const { email, password } = req.body;

  try {
    const pool = await poolPromise;

    const result = await pool.request()
      .input('Email', sql.NVarChar, email)
      .query('SELECT * FROM [User] WHERE Email = @Email');

    const user = result.recordset[0];

    if (!user) {
      return res.status(404).json({ message: 'Користувача не знайдено.' });
    }

    const isMatch = await bcrypt.compare(password, user.PasswordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Невірний пароль.' });
    }

    const token = jwt.sign({ userId: user.UserID }, SECRET_KEY, { expiresIn: '1h' });
    res.status(200).json({ message: 'Вхід успішний!', token, userId: user.UserID, familyId: user.FamilyID, userName: user.UserName });
  } catch (error) {
    res.status(500).json({ message: 'Помилка сервера', error });
  }
});

module.exports = router;
