const express = require('express');
const router = express.Router();
const { poolPromise, sql } = require('../config/db');

// GET /api/calendar?familyId=4
router.get('/', async (req, res) => {
  const { familyId } = req.query;
  if (!familyId) return res.status(400).send("familyId is required");

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('familyId', sql.Int, familyId)
      .query(`
        SELECT EntryID, Title, Date
        FROM CalendarEntry
        WHERE FamilyID = @familyId
        ORDER BY Date ASC
      `);

    res.status(200).json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// POST /api/calendar
router.post('/', async (req, res) => {
  const { title, date, userId } = req.body;
  if (!title || !date || !userId) return res.status(400).send("Missing data");

  try {
    const pool = await poolPromise;

    // отримати родину за userId
    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .query('SELECT FamilyID FROM [User] WHERE UserID = @userId');

    const familyId = result.recordset[0]?.FamilyID;
    if (!familyId) return res.status(400).send("Family not found");

    await pool.request()
      .input('familyId', sql.Int, familyId)
      .input('title', sql.NVarChar, title)
      .input('date', sql.DateTime, date)
      .query(`
        INSERT INTO CalendarEntry (FamilyID, Title, Date)
        VALUES (@familyId, @title, @date)
      `);

    res.status(201).json({ message: 'Подію створено' });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// DELETE /api/calendar/:id
router.delete('/:id', async (req, res) => {
  const entryId = parseInt(req.params.id);

  try {
    const pool = await poolPromise;
    await pool.request()
      .input('entryId', sql.Int, entryId)
      .query('DELETE FROM CalendarEntry WHERE EntryID = @entryId');

    res.status(200).json({ message: 'Подію видалено' });
  } catch (err) {
    console.error(err);
    res.status(500).send("Помилка видалення події");
  }
});

module.exports = router;
