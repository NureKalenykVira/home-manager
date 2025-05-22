const express = require('express');
const router = express.Router();
const { poolPromise, sql } = require('../config/db');
const { BlobServiceClient } = require('@azure/storage-blob');
const path = require('path');

function getContainerClient() {
  const conn = process.env.AZURE_STORAGE_CONNECTION_STRING;
  if (!conn) {
    throw new Error('AZURE_STORAGE_CONNECTION_STRING is missing');
  }
  const blobServiceClient = BlobServiceClient.fromConnectionString(conn);
  return blobServiceClient.getContainerClient('task-attachments');
}

router.get('/', async (req, res) => {
  const familyId = req.query.familyId;
  if (!familyId) return res.status(400).json({ message: 'familyId is required' });

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('FamilyId', sql.Int, parseInt(familyId))
      .query('SELECT * FROM Task WHERE FamilyID = @FamilyId ORDER BY CreatedAt DESC');

    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ message: 'Помилка отримання завдань', error });
  }
});

router.post('/', async (req, res) => {
  const { title, description, dueDate, createdBy, assigneeId } = req.body;
  if (!createdBy) return res.status(400).json({ message: 'createdBy is required' });

  try {
    const pool = await poolPromise;
    const familyQuery = await pool.request()
      .input('userId', sql.Int, createdBy)
      .query('SELECT FamilyID FROM [User] WHERE UserID = @userId');

    const familyId = familyQuery.recordset[0]?.FamilyID;
    if (!familyId) return res.status(400).json({ message: 'Family not found' });

    const result = await pool.request()
      .input('Title', sql.NVarChar, title)
      .input('Description', sql.NVarChar, description)
      .input('DueDate', sql.DateTime, dueDate)
      .input('CreatedBy', sql.Int, createdBy)
      .input('AssigneeID', sql.Int, assigneeId)
      .input('FamilyID', sql.Int, familyId)
      .query(`
        INSERT INTO Task (Title, Description, DueDate, CreatedBy, AssigneeID, FamilyID)
        OUTPUT INSERTED.TaskID 
        VALUES (@Title, @Description, @DueDate, @CreatedBy, @AssigneeID, @FamilyID)
      `);

    res.status(201).json({ taskId: result.recordset[0].TaskID, message: 'Завдання додано' });
  } catch (error) {
    res.status(500).json({ message: 'Помилка додавання завдання', error });
  }
});

router.patch('/:id', async (req, res) => {
  const taskId = parseInt(req.params.id);
  const { isCompleted } = req.body;

  try {
    const pool = await poolPromise;
    await pool.request()
      .input('TaskID', sql.Int, taskId)
      .input('IsCompleted', sql.Bit, isCompleted)
      .query('UPDATE Task SET IsCompleted = @IsCompleted WHERE TaskID = @TaskID');

    res.status(200).json({ message: 'Статус оновлено' });
  } catch (error) {
    res.status(500).json({ message: 'Помилка оновлення статусу', error });
  }
});

router.delete('/:id', async (req, res) => {
  const taskId = parseInt(req.params.id);

  try {
    const pool = await poolPromise;

    const attachments = await pool.request()
      .input('TaskID', sql.Int, taskId)
      .query('SELECT FilePath FROM TaskAttachment WHERE TaskID = @TaskID');

    const containerClient = getContainerClient();

    for (const file of attachments.recordset) {
      const filePath = file?.FilePath;

      try {
        if (filePath && typeof filePath === 'string' && filePath.startsWith('http')) {
          const blobName = path.basename(new URL(filePath).pathname);
          const blobClient = containerClient.getBlockBlobClient(blobName);
          await blobClient.deleteIfExists();
        }
      } catch (err) {
        console.warn(`Помилка при обробці файла '${filePath}':`, err.message);
      }
    }

    await pool.request().input('TaskID', sql.Int, taskId)
      .query('DELETE FROM TaskAttachment WHERE TaskID = @TaskID');
    await pool.request().input('TaskID', sql.Int, taskId)
      .query('DELETE FROM TaskComment WHERE TaskID = @TaskID');
    await pool.request().input('TaskID', sql.Int, taskId)
      .query('DELETE FROM Task WHERE TaskID = @TaskID');

    res.status(200).json({ message: 'Завдання та пов’язані дані успішно видалені' });
  } catch (error) {
    console.error("Помилка видалення завдання:", error);
    res.status(500).json({ message: 'Помилка при видаленні завдання', error });
  }
});

module.exports = router;
