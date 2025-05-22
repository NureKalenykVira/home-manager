const express = require('express');
const router = express.Router();
const { poolPromise, sql } = require('../config/db');
const { BlobServiceClient } = require('@azure/storage-blob');
const path = require('path');

const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = 'task-attachments';
const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
const containerClient = blobServiceClient.getContainerClient(containerName);

// GET /api/tasks?familyId=...
router.get('/', async (req, res) => {
  const familyId = req.query.familyId;
  if (!familyId) {
    return res.status(400).json({ message: 'familyId is required' });
  }

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

// POST /api/tasks
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
    
    const newTaskId = result.recordset[0].TaskID;

    res.status(201).json({ taskId: newTaskId, message: 'Завдання додано' });
  } catch (error) {
    res.status(500).json({ message: 'Помилка додавання завдання', error });
  }
});

// PATCH /api/tasks/:id
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

// DELETE
router.delete('/:id', async (req, res) => {
  const taskId = parseInt(req.params.id);

  try {
    const pool = await poolPromise;

    const attachments = await pool.request()
      .input('TaskID', sql.Int, taskId)
      .query('SELECT FilePath FROM TaskAttachment WHERE TaskID = @TaskID');

    for (const file of attachments.recordset) {
      const filePath = file.FilePath;

      try {
        // Якщо починається з http — це Azure Blob URL
        if (filePath.startsWith('http')) {
          const blobName = path.basename(new URL(filePath).pathname);
          const blobClient = containerClient.getBlockBlobClient(blobName);
          await blobClient.deleteIfExists();
        }
        else {
          console.log(`Пропущено: '${filePath}' не є URL`);
        }
      } catch (err) {
        console.warn(`Помилка при обробці файла '${filePath}':`, err.message);
      }
    }

    await pool.request()
      .input('TaskID', sql.Int, taskId)
      .query('DELETE FROM TaskAttachment WHERE TaskID = @TaskID');

    await pool.request()
      .input('TaskID', sql.Int, taskId)
      .query('DELETE FROM TaskComment WHERE TaskID = @TaskID');

    await pool.request()
      .input('TaskID', sql.Int, taskId)
      .query('DELETE FROM Task WHERE TaskID = @TaskID');

    res.status(200).json({ message: 'Завдання та пов’язані дані успішно видалені' });
  } catch (error) {
    console.error("Помилка видалення завдання:", error);
    res.status(500).json({ message: 'Помилка при видаленні завдання', error });
  }
});

module.exports = router;
