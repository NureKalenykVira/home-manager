const express = require('express');
const router = express.Router();
const { poolPromise, sql } = require('../config/db');

// GET /api/comments?taskId=1
router.get('/', async (req, res) => {
  const { taskId } = req.query;
  if (!taskId) return res.status(400).send("taskId is required");

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('taskId', sql.Int, taskId)
      .query(`
        SELECT c.CommentID, c.Text, c.CreatedAt, u.UserName
        FROM TaskComment c
        JOIN [User] u ON c.UserID = u.UserID
        WHERE c.TaskID = @taskId
        ORDER BY c.CreatedAt ASC
      `);

    res.status(200).json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send("Помилка отримання коментарів");
  }
});

// POST /api/comments
router.post('/', async (req, res) => {
  const { taskId, userId, text } = req.body;
  if (!taskId || !userId || !text) return res.status(400).send("Missing fields");

  try {
    const pool = await poolPromise;
    await pool.request()
      .input('taskId', sql.Int, taskId)
      .input('userId', sql.Int, userId)
      .input('text', sql.NVarChar, text)
      .query(`
        INSERT INTO TaskComment (TaskID, UserID, Text)
        VALUES (@taskId, @userId, @text)
      `);

    res.status(201).json({ message: 'Коментар додано' });
  } catch (err) {
    console.error(err);
    res.status(500).send("Помилка додавання коментаря");
  }
});

// DELETE /api/comments/:commentId
router.delete('/:commentId', async (req, res) => {
  const commentId = parseInt(req.params.commentId);
  if (!commentId) return res.status(400).send("commentId is required");

  try {
    const pool = await poolPromise;
    await pool.request()
      .input('commentId', sql.Int, commentId)
      .query('DELETE FROM TaskComment WHERE CommentID = @commentId');

    res.status(200).json({ message: 'Коментар видалено' });
  } catch (err) {
    console.error(err);
    res.status(500).send("Помилка при видаленні коментаря");
  }
});

module.exports = router;
