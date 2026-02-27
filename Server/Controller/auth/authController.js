import db from '../../db.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import axios from 'axios';
import dotenv from "dotenv";

dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY || "Malpani@2025";

// REGISTER USER
export const registerUser_old = async (req, res) => {
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
          INSERT INTO users (first_name, middle_name,last_name, password, email, phone, role, is_verified) VALUES (?, ?, ?, ?, ?, ?,'User', 'I')`;

        db.query(insertUserSQL, [firstName, middleName, lastName, hashedPassword, email, phone], (insertErr, insertResults) => {
          if (insertErr) {
            console.error("Insert error:", insertErr);
            return res.status(500).json({ message: "Error while registering user" });
          }

          return res.status(201).json({ message: "User registered successfully ✅", userId: insertResults.insertId, });
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

export const registerUser = async (req, res) => {
  const { firstName, middleName, lastName, password, email, phone } = req.body;

  if (!firstName || !lastName || !password || !email || !phone) {
    return res.status(400).json({ message: "Please fill in all required fields.", });
  }

  const checkUserSQL = `SELECT id FROM users WHERE email = ? OR phone = ?`;

  db.query(checkUserSQL, [email, phone], async (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (results.length > 0) {
      return res.status(409).json({ message: "User already exists with this email or phone.", });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      // 1️⃣ Get connection from pool
      db.getConnection((connErr, connection) => {
        if (connErr) {
          console.error(connErr);
          return res.status(500).json({ message: "Database connection failed" });
        }

        // 2️⃣ Start transaction
        connection.beginTransaction((txErr) => {
          if (txErr) {
            connection.release();
            return res.status(500).json({ message: "Transaction start failed" });
          }

          // 3️⃣ Insert user
          const insertUserSQL = `
            INSERT INTO users
            (first_name, middle_name, last_name, password, email, phone, role, is_verified, isorganizer)
            VALUES (?, ?, ?, ?, ?, ?, 'User', 'I', 'N')
          `;

          connection.query(insertUserSQL, [firstName, middleName, lastName, hashedPassword, email, phone], (userErr, userResult) => {
            if (userErr) {
              return connection.rollback(() => {
                connection.release();
                console.error(userErr);
                res.status(500).json({ message: "User creation failed" });
              });
            }

            const userId = userResult.insertId;

            // 4️⃣ Insert member
            const insertMemberSQL = `
                    INSERT INTO mst_members
                      (mem_id, first_name, middle_name, last_name, mobile, email, designation, isorganizer, user_id, status)
                      SELECT IFNULL(MAX(mem_id), 0) + 1,?, ?, ?, ?, ?, 'Users', 'N', ?, 'A'
                      FROM mst_members
                  `;

            connection.query(insertMemberSQL, [firstName, middleName, lastName, phone, email, userId], (memberErr) => {
              if (memberErr) {
                return connection.rollback(() => {
                  connection.release();
                  console.error(memberErr);
                  res.status(500).json({ message: "Member creation failed" });
                });
              }

              // 5️⃣ Commit
              connection.commit((commitErr) => {
                if (commitErr) {
                  return connection.rollback(() => {
                    connection.release();
                    res.status(500).json({ message: "Commit failed" });
                  });
                }

                // 6️⃣ Release connection
                connection.release();

                return res.status(201).json({ message: "User registered successfully ✅", userId, });
              });
            });
          });
        });
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Registration failed" });
    }
  });
};

// LOGIN USER
export const loginUser = (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please fill all required fields!", });
    }

    const sql = `SELECT * FROM users WHERE (email = ? OR phone = ?) LIMIT 1`;

    db.query(sql, [email, email], async (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ message: "Login failed. Please contact the system administrator!", });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "User not found!", });
      }

      const user = results[0];

      if (user.is_verified === 'I') {
        return res.status(403).json({ message: "Your account is temporarily inactive. Please contact the system administrator!", });
      }

      // 🔐 Password check
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid password!", });
      }

      // ✅ Login success
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || SECRET_KEY,
        { expiresIn: "1d" }
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
          isorganizer: user.isorganizer,
        },
      });
    });
  } catch (error) {
    console.error("Unexpected server error:", error);
    return res.status(500).json({ message: "Unexpected server error!", });
  }
};

//GET TEAM MEMBERS updated on 12/01/2026
export const getTeamMembers_old = (req, res) => {
  const { userId } = req.body;

  // STEP 1: Get member IDs for this user
  const sql1 = `SELECT mem_id FROM mst_members WHERE user_id = ?`;

  db.query(sql1, [userId], (err, memberResults) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (memberResults.length === 0) {
      return res.status(404).json({ message: "No member found for this user" });
    }

    const memberIds = memberResults.map(m => m.mem_id);

    // STEP 2: Find teams this user belongs to
    const sql2 = `
                    SELECT DISTINCT t.id AS team_id, t.name AS team_name, t.description, t.manager_id
                    FROM mst_team t
                    JOIN team_members tm ON tm.team_id = t.id
                    WHERE tm.member_id IN (?)
                  `;

    db.query(sql2, [memberIds], (err, teamResults) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ message: "Internal server error" });
      }

      if (teamResults.length === 0) {
        return res.status(200).json({ message: "User is not assigned to any team", teams: [] });
      }

      const teamIds = teamResults.map(t => t.team_id);

      // STEP 3: Get ALL members of those teams EXCEPT the logged-in user
      const sql3 = `
                      SELECT 
                        tm.team_id,
                        m.mem_id,
                        CONCAT(m.first_name, ' ', m.middle_name, ' ', m.last_name) AS full_name,
                        m.user_id
                      FROM team_members tm
                      JOIN mst_members m ON m.mem_id = tm.member_id
                      WHERE tm.team_id IN (?)
                        AND m.user_id <> ?         -- 🚫 exclude logged-in user
                    `;

      db.query(sql3, [teamIds, userId], (err, membersResults) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ message: "Internal server error" });
        }

        // Structure response: team info + members
        const response = teamResults.map(team => ({
          team_id: team.team_id,
          team_name: team.team_name,
          description: team.description,
          manager_id: team.manager_id,
          members: membersResults.filter(m => m.team_id === team.team_id)
        }));

        return res.status(200).json({ teams: response });
      });
    });
  });
};

export const getTeamMembers = (req, res) => {
  const { userId } = req.body;

  // STEP 1: Get member IDs for this user
  const sql1 = `
    SELECT mem_id 
    FROM mst_members 
    WHERE user_id = ?
  `;

  db.query(sql1, [userId], (err, memberResults) => {
    if (err) return res.status(500).json({ message: "Internal server error" });

    if (memberResults.length === 0) {
      return res.status(404).json({ message: "No member found for this user" });
    }

    const memberIds = memberResults.map(m => m.mem_id);

    // STEP 2: Get teams user belongs to
    const sql2 = `
      SELECT DISTINCT t.id AS team_id, t.name AS team_name, t.manager_id
      FROM mst_team t
      JOIN team_members tm ON tm.team_id = t.id
      WHERE tm.member_id IN (?)
    `;

    db.query(sql2, [memberIds], (err, teamResults) => {
      if (err) return res.status(500).json({ message: "Internal server error" });

      if (teamResults.length === 0) {
        return res.status(200).json({ teams: [] });
      }

      const teamIds = teamResults.map(t => t.team_id);

      // STEP 3: Get members of those teams (excluding logged-in user)
      const sql3 = `
        SELECT
          m.mem_id,
          CONCAT(m.first_name, ' ', m.middle_name, ' ', m.last_name) AS mem_name,
          m.user_id,
          tm.team_id
        FROM team_members tm
        JOIN mst_members m ON m.mem_id = tm.member_id
        WHERE tm.team_id IN (?)
          AND m.user_id <> ?
      `;

      db.query(sql3, [teamIds, userId], (err, memberResults) => {
        if (err) return res.status(500).json({ message: "Internal server error" });

        // 🔁 STEP 4: Transform data to MEMBER → TEAMS format
        const memberMap = {};

        memberResults.forEach(member => {
          if (!memberMap[member.mem_id]) {
            memberMap[member.mem_id] = {
              mem_id: member.mem_id,
              mem_name: member.mem_name,
              user_id: member.user_id,
              teams: []
            };
          }

          const team = teamResults.find(t => t.team_id === member.team_id);
          if (team) {
            memberMap[member.mem_id].teams.push({
              team_id: team.team_id,
              team_name: team.team_name,
              manager_id: team.manager_id
            });
          }
        });

        return res.status(200).json({
          teams: Object.values(memberMap)
        });
      });
    });
  });
};

export const sendOtp = async (req, res) => {
  try {
    const { mobile } = req.body;

    const user_name = 'malpanibiz';
    const password = 'dkhy2271DK';
    const sender = 'MALPNI';
    const entityID = '1201159436561584634';
    const TemplateID = '1707170609322119024';

    if (!mobile) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    // 1️⃣ Check user exists
    const checkUserSql = "SELECT id FROM users WHERE phone = ?";
    db.query(checkUserSql, [mobile], async (err, results) => {
      if (err) {
        console.error("Error checking user:", err);
        return res.status(500).json({ message: "Internal server error" });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      // 2️⃣ Generate OTP
      const otp = Math.floor(100000 + Math.random() * 900000);

      const message = `Dear SalesSwift user, your OTP for password reset is ${otp}, which is valid for 2 minutes. MALPANI`;
      const encodedMessage = encodeURIComponent(message);

      // 3️⃣ SMS API URL
      const smsApiUrl = `https://nimbusit.biz/api/SmsApi/SendSingleApi?UserID=${user_name}&Password=${password}&SenderID=${sender}&Phno=${mobile}&Msg=${encodedMessage}&EntityID=${entityID}&TemplateID=${TemplateID}`;

      // 4️⃣ Send SMS
      try {
        await axios.get(smsApiUrl);
      } catch (smsError) {
        console.error("SMS sending error:", smsError);
        return res.status(500).json({ message: "Failed to send OTP" });
      }

      // 5️⃣ Save OTP with **2-minute expiry**
      const expiryTime = new Date(Date.now() + 2 * 60 * 1000);

      const updateSql =
        "UPDATE users SET otp_code = ?, otp_expiry = ? WHERE phone = ?";

      db.query(updateSql, [otp, expiryTime, mobile], (err2) => {
        if (err2) {
          console.error("Error saving OTP:", err2);
          return res.status(500).json({
            message: "Internal server error while saving OTP",
          });
        }

        return res.status(200).json({
          success: true,
          message: "OTP sent successfully",
        });
      });
    });
  } catch (error) {
    console.error("sendOtp error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const validateOtp = async (req, res) => {
  try {
    const { mobile, otp } = req.body;

    if (!mobile) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    if (!otp) {
      return res.status(400).json({ message: "OTP is required" });
    }

    const sql = "SELECT otp_code, otp_expiry FROM users WHERE phone = ?";

    db.query(sql, [mobile], (err, results) => {
      if (err) {
        console.error("Error fetching OTP:", err);
        return res.status(500).json({ message: "Internal server error.", error: err, });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      const { otp_code, otp_expiry } = results[0];

      // Convert MySQL timestamp to JS timestamp
      const expiryTime = new Date(otp_expiry).getTime();
      const currentTime = Date.now();

      // Check OTP match
      if (otp != otp_code) {
        return res.status(400).json({ message: "Invalid OTP" });
      }

      // Check OTP expiration
      if (currentTime > expiryTime) {
        return res.status(400).json({ message: "OTP expired" });
      }

      // OTP is valid
      return res.status(200).json({ success: true, message: "OTP verified successfully", });
    });
  } catch (error) {
    console.error("OTP validation error:", error);
    return res.status(500).json({ success: false, message: "Something went wrong while validating OTP", });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const { mobile, password } = req.body;

    if (!mobile) {
      return res.status(400).json({ message: "Mobile number is required" });
    }

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `UPDATE users SET password = ? WHERE phone = ?`;

    db.query(sql, [hashedPassword, mobile], (err, results) => {
      if (err) {
        console.error("Error updating password:", err);
        return res.status(500).json({ message: "Internal server error.", error: err, });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({ message: "User not found", });
      }

      return res.status(200).json({ success: true, message: "Password reset successfully.", });
    });

  } catch (error) {
    console.error("Password reset error:", error);
    return res.status(500).json({ success: false, message: "Something went wrong while resetting password", });
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