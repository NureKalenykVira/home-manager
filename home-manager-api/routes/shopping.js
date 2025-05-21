const express = require('express');
const router = express.Router();
const { poolPromise, sql } = require('../config/db');

// GET /api/shopping?familyId=...
router.get('/', async (req, res) => {
  const { familyId } = req.query;
  if (!familyId) return res.status(400).json({ message: 'familyId is required' });

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('familyId', sql.Int, familyId)
      .query(`
        SELECT ItemID, ItemName, IsBought, CreatedBy
        FROM ShoppingItem
        WHERE FamilyID = @familyId
        ORDER BY ItemID DESC
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Помилка отримання списку покупок' });
  }
});

// POST /api/shopping
router.post('/', async (req, res) => {
  const { itemName, createdBy } = req.body;
  if (!itemName || !createdBy) return res.status(400).json({ message: 'Missing data' });

  try {
    const pool = await poolPromise;

    // Отримати FamilyID користувача
    const familyResult = await pool.request()
      .input('userId', sql.Int, createdBy)
      .query('SELECT FamilyID FROM [User] WHERE UserID = @userId');

    const familyId = familyResult.recordset[0]?.FamilyID;
    if (!familyId) return res.status(400).json({ message: 'Family not found' });

    await pool.request()
      .input('ItemName', sql.NVarChar, itemName)
      .input('CreatedBy', sql.Int, createdBy)
      .input('FamilyID', sql.Int, familyId)
      .query(`
        INSERT INTO ShoppingItem (ItemName, CreatedBy, FamilyID)
        VALUES (@ItemName, @CreatedBy, @FamilyID)
      `);

    res.status(201).json({ message: 'Товар додано' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Помилка додавання товару' });
  }
});

// PATCH /api/shopping/:id
router.patch('/:id', async (req, res) => {
  const itemId = parseInt(req.params.id);
  const { isBought } = req.body;

  try {
    const pool = await poolPromise;
    await pool.request()
      .input('ItemID', sql.Int, itemId)
      .input('IsBought', sql.Bit, isBought)
      .query('UPDATE ShoppingItem SET IsBought = @IsBought WHERE ItemID = @ItemID');

    res.json({ message: 'Статус оновлено' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Помилка оновлення статусу' });
  }
});

// DELETE /api/shopping/:id
router.delete('/:id', async (req, res) => {
  const itemId = parseInt(req.params.id);

  try {
    const pool = await poolPromise;
    await pool.request()
      .input('ItemID', sql.Int, itemId)
      .query('DELETE FROM ShoppingItem WHERE ItemID = @ItemID');

    res.json({ message: 'Товар видалено' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Помилка при видаленні товару' });
  }
});

module.exports = router;