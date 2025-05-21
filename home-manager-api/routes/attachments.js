const express = require('express');
const router = express.Router();
const multer = require('multer');
const { poolPromise, sql } = require('../config/db');
const { BlobServiceClient } = require('@azure/storage-blob');
const path = require('path');

const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = 'task-attachments';

const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
const containerClient = blobServiceClient.getContainerClient(containerName);

const storage = multer.memoryStorage();
const upload = multer({ storage });

// 📥 POST /api/attachments/upload
router.post('/upload', upload.single('file'), async (req, res) => {
  const { taskId } = req.body;
  const file = req.file;

  if (!taskId || !file) {
    return res.status(400).send("Missing taskId or file");
  }

  try {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    const blobName = `${base}-${Date.now()}${ext}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.uploadData(file.buffer);
    const fileUrl = blockBlobClient.url;

    const pool = await poolPromise;
    await pool.request()
      .input('TaskID', sql.Int, taskId)
      .input('FilePath', sql.NVarChar, fileUrl)
      .input('FileType', sql.NVarChar, file.mimetype)
      .query(`
        INSERT INTO TaskAttachment (TaskID, FilePath, FileType)
        VALUES (@TaskID, @FilePath, @FileType)
      `);

    res.status(201).json({ message: 'Файл завантажено', url: fileUrl });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// 📤 GET /api/attachments?taskId=...
router.get('/', async (req, res) => {
  const { taskId } = req.query;
  if (!taskId) return res.status(400).send("taskId is required");

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('taskId', sql.Int, taskId)
      .query('SELECT * FROM TaskAttachment WHERE TaskID = @taskId');

    res.status(200).json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// 🗑 DELETE /api/attachments/:id
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  if (!id) return res.status(400).send("id is required");

  try {
    const pool = await poolPromise;

    const fileResult = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT FilePath FROM TaskAttachment WHERE AttachmentID = @id');

    if (fileResult.recordset.length === 0) return res.status(404).send("Файл не знайдено");

    const fileUrl = fileResult.recordset[0].FilePath;
    const blobName = path.basename(new URL(fileUrl).pathname);
    const blobClient = containerClient.getBlockBlobClient(blobName);
    await blobClient.deleteIfExists();

    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM TaskAttachment WHERE AttachmentID = @id');

    res.status(200).json({ message: 'Файл видалено' });
  } catch (err) {
    console.error(err);
    res.status(500).send("Помилка при видаленні файлу");
  }
});

module.exports = router;
