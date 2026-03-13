// controllers/trainingController.js
import fs from "fs";
import path from "path";
import db from "../../db.js";

export const addTraining = async (req, res) => {
  try {
    const { training_title, training_description, status, c_by, file_type } = req.body;
    const file = req.file;
    if (!training_title || !status) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // File save
    let savedFilePath = null;
    let savedFileType = file_type || 'other';

    if (file) {
      const basePath = "D:/Projects/Wham/Server/uploads";
      const trainingFolder = path.join(basePath, "trainings");

      if (!fs.existsSync(trainingFolder)) {
        fs.mkdirSync(trainingFolder, { recursive: true });
      }

      const ext = path.extname(file.originalname);
      const fileName = `${training_title.replace(/\s+/g, '_')}_${Date.now()}${ext}`;
      const fullPath = path.join(trainingFolder, fileName);

      fs.writeFileSync(fullPath, file.buffer);
      savedFilePath = `/uploads/trainings/${fileName}`;
    }

    const sql = `
      INSERT INTO mst_training 
      (training_id, training_title, training_description, file_path, file_type, status, c_by, c_at)
      SELECT IFNULL(MAX(training_id), 0) + 1, ?, ?, ?, ?, ?, ?, NOW()
      FROM mst_training
    `;

    const values = [training_title, training_description, savedFilePath, savedFileType, status, c_by];

    await db.query(sql, values);

    return res.status(201).json({message: "Training added successfully"});

  } catch (error) {
    console.error("Add Training Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
export const getAllTrainings = (req, res) => {
  const { search = "", page = 1, limit = 5 } = req.query;

  const pageNum = Number(page);
  const limitNum = Number(limit);
  const offset = (pageNum - 1) * limitNum;

  let whereClause = "WHERE 1=1";
  const params = [];

  if (search) {
    whereClause += `
      AND (
        training_id LIKE ?
        OR training_title LIKE ?
        OR training_description LIKE ?
      )
    `;
    params.push(
      `%${search}%`,
      `%${search}%`,
      `%${search}%`
    );
  }

  // Data Query
  const dataSql = `
    SELECT training_id, training_title, training_description, file_path, file_type, status, c_by, c_at, u_by, u_at
    FROM mst_training
    ${whereClause}
    LIMIT ? OFFSET ?
  `;

  const countSql = `
    SELECT COUNT(*) AS total
    FROM mst_training
    ${whereClause}
  `;

  // Get total count first
  db.query(countSql, params, (countErr, countResult) => {
    if (countErr) {
      console.error("Training Count Error:", countErr);
      return res.status(500).json({ message: "Count failed" });
    }

    const total = countResult[0].total;

    // Get paginated data
    db.query(dataSql, [...params, limitNum, offset], (dataErr, results) => {
      if (dataErr) {
        console.error("Training Fetch Error:", dataErr);
        return res.status(500).json({ message: "Data fetch failed" });
      }

      res.status(200).json({
        message: "Trainings fetched successfully",
        trainings: results,
        total: total
      });
    });
  });
};
export const getTrainingDetails = (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT training_id, training_title, training_description, file_path, file_type, status
    FROM mst_training
    WHERE training_id = ?
  `;

  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error("Training Fetch Error:", err);
      return res.status(500).json({ message: "Data fetch failed" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Training not found" });
    }

    res.status(200).json(results[0]);
  });
};
export const updateTraining = (req, res) => {
  const { id, training_title, training_description, status } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Training id is required" });
  }

  const sql = `
    UPDATE mst_training
    SET training_title = ?, training_description = ?, status = ?, u_at = NOW()
    WHERE training_id = ?
  `;

  db.query(sql, [training_title, training_description, status, id], (err, results) => {
    if (err) {
      console.error("Training Update Error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Training not found" });
    }

    return res.status(200).json({ message: "Training updated successfully" });
  });
};
export const getActiveTrainings = (req, res) => {
  const sql = `
    SELECT training_id, training_title, training_description, file_path, file_type
    FROM mst_training
    WHERE status = 'A'
    ORDER BY training_title ASC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Training fetch Error:", err);
      return res.status(500).json({ message: "Fetch failed" });
    }
    return res.status(200).json(results);
  });
};
export const deactivateTraining = (req, res) => {
  const { id, status } = req.body;

  const sql = `
    UPDATE mst_training
    SET status = ?, u_at = NOW()
    WHERE training_id = ?
  `;

  db.query(sql, [status, id], (err, results) => {
    if (err) {
      console.error("Training Status Update Error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Training not found" });
    }

    return res.status(200).json({
      message: `Training ${status === 'I' ? 'deactivated' : 'activated'} successfully`
    });
  });
};