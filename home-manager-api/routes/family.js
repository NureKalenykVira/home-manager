var express = require('express');
var router = express.Router();
const { poolPromise, sql } = require('../config/db');

// POST /create
router.post('/create', async (req, res) => {
  const { familyName, userId } = req.body;
  if (!familyName || !userId) return res.status(400).send("Missing data");

  try {
    const pool = await poolPromise;

    const joinCode = `${familyName.toLowerCase().replace(/\s+/g, '-')}-${Math.random().toString(36).substring(2, 7)}`;

    const insertResult = await pool.request()
      .input('familyName', sql.NVarChar, familyName)
      .input('joinCode', sql.NVarChar, joinCode)
      .query(`
        INSERT INTO Family (FamilyName, JoinCode)
        OUTPUT INSERTED.FamilyID AS familyId, INSERTED.JoinCode AS joinCode
        VALUES (@familyName, @joinCode)
      `);

    const newFamilyId = insertResult.recordset[0].familyId;

    await pool.request()
      .input('userId', sql.Int, userId)
      .input('familyId', sql.Int, newFamilyId)
      .query('UPDATE [User] SET FamilyID = @familyId WHERE UserID = @userId');

    res.status(201).json({ familyId: newFamilyId, joinCode });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// POST /join
router.post('/join', async (req, res) => {
  const { familyCode, userId } = req.body;
  if (!familyCode || !userId) return res.status(400).send("Missing data");

  try {
    const pool = await poolPromise;

    const family = await pool.request()
      .input('joinCode', sql.NVarChar, familyCode)
      .query('SELECT FamilyID FROM Family WHERE JoinCode = @joinCode');

    if (family.recordset.length === 0) {
      return res.status(404).send("Сім’ю не знайдено");
    }

    const familyId = family.recordset[0].FamilyID;

    await pool.request()
      .input('userId', sql.Int, userId)
      .input('familyId', sql.Int, familyId)
      .query('UPDATE [User] SET FamilyID = @familyId WHERE UserID = @userId');

    res.status(200).json({ message: "Приєднано до сім’ї" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// GET /api/family/users?familyId=...
router.get('/users', async (req, res) => {
  const familyId = req.query.familyId;

  if (!familyId) {
    return res.status(400).json({ message: 'familyId is required' });
  }

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('familyId', sql.Int, familyId)
      .query('SELECT UserID, UserName FROM [User] WHERE FamilyID = @familyId');

    res.status(200).json(result.recordset);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Помилка при отриманні користувачів родини', error });
  }
});

module.exports = router;