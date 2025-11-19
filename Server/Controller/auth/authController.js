import db from '../../db.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const SECRET_KEY = "Malpani@2025";

// REGISTER USER
export const registerUser = async (req, res) => {
  try {
    const { lastName, middleName, firstName, password, email, phone } = req.body;

    if (!firstName || !lastName || !password || !email || !phone) {
      return res.status(400).json({ message: "Please fill in all required fields." });
    }

    const checkUserSQL = `SELECT id FROM users WHERE email = ? OR phone = ?`;
    db.query(checkUserSQL, [email, phone], async (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ message: "Internal server error" });
      }

      if (results.length > 0) {
        return res.status(409).json({ message: "User already exists with this email or phone" });
      }

      try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const insertUserSQL = `
          INSERT INTO users 
           (first_name, middle_name,last_name, password, email, phone, role) 
          VALUES (?, ?, ?, ?, ?, ?,'User')
        `;

        db.query(insertUserSQL,
          [firstName, middleName, lastName, hashedPassword, email, phone],
          (insertErr, insertResults) => {
            if (insertErr) {
              console.error("Insert error:", insertErr);
              return res.status(500).json({ message: "Error while registering user" });
            }

            return res.status(201).json({
              message: "User registered successfully ✅",
              userId: insertResults.insertId,
            });
          }
        );

      } catch (hashErr) {
        console.error("Hashing error:", hashErr);
        return res.status(500).json({ message: "Error hashing password" });
      }
    });

  } catch (error) {
    console.error("Unexpected server error:", error);
    return res.status(500).json({ message: "Unexpected server error" });
  }
};

// LOGIN USER
export const loginUser = (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const sql = `SELECT * FROM users WHERE email = ?`;
    db.query(sql, [email], async (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ message: "Internal server error" });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "User not found." });
      }

      const user = results[0];

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid password." });
      }

      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || SECRET_KEY,
        { expiresIn: "1h" }
      );

      return res.status(200).json({
        message: `Login successful! Welcome back, ${user.first_name}!`,
        token,
        user: {
          id: user.id,
          firstName: user.first_name,
          lastName: user.last_name,
          middleName: user.middle_name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
      });
    });
  } catch (error) {
    console.error("Unexpected server error:", error);
    return res.status(500).json({ message: "Unexpected server error" });
  }
};

// Add this to authController.js
export const validateToken = async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ valid: false, message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || SECRET_KEY);

    // Check if user still exists in database
    const checkUserSQL = `SELECT id, email, first_name, last_name, role FROM users WHERE id = ?`;
    db.query(checkUserSQL, [decoded.userId], (err, results) => {
      if (err || results.length === 0) {
        return res.status(401).json({ valid: false, message: 'User not found' });
      }

      return res.status(200).json({
        valid: true,
        user: {
          id: results[0].id,
          firstName: results[0].first_name,
          lastName: results[0].last_name,
          email: results[0].email,
          role: results[0].role
        }
      });
    });
  } catch (error) {
    return res.status(401).json({ valid: false, message: 'Invalid token' });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token required' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || SECRET_KEY + 'REFRESH');

    // Verify refresh token exists in database
    const checkTokenSQL = `SELECT * FROM refresh_tokens WHERE token = ? AND user_id = ? AND expires_at > NOW()`;
    db.query(checkTokenSQL, [refreshToken, decoded.userId], (err, results) => {
      if (err || results.length === 0) {
        return res.status(401).json({ message: 'Invalid refresh token' });
      }

      // Generate new tokens
      const newToken = jwt.sign(
        { userId: decoded.userId, email: decoded.email, role: decoded.role },
        process.env.JWT_SECRET || SECRET_KEY,
        { expiresIn: '15m' }
      );

      const newRefreshToken = jwt.sign(
        { userId: decoded.userId },
        process.env.JWT_REFRESH_SECRET || SECRET_KEY + 'REFRESH',
        { expiresIn: '7d' }
      );

      // Update refresh token in database
      const updateTokenSQL = `UPDATE refresh_tokens SET token = ?, expires_at = DATE_ADD(NOW(), INTERVAL 7 DAY) WHERE user_id = ?`;
      db.query(updateTokenSQL, [newRefreshToken, decoded.userId], (updateErr) => {
        if (updateErr) {
          return res.status(500).json({ message: 'Error updating refresh token' });
        }

        return res.json({
          token: newToken,
          refreshToken: newRefreshToken
        });
      });
    });
  } catch (error) {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
};