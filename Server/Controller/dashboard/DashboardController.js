import db from '../../db.js'
import fs from 'fs-extra';
import sharp from 'sharp';
import path from 'path';

export const getUpcomingEvents = (req, res) => {
  const { userId, role } = req.body;//isOrganizer
  if (!userId) {
    return res.status(400).json({ message: "Missing userId" });
  }

  // STEP 1: Get member_id from mst_members
  const getMemberQuery = `SELECT mem_id FROM mst_members WHERE user_id = ? LIMIT 1`;

  db.query(getMemberQuery, [userId], (err, memberData) => {
    if (err) return res.status(500).json({ message: "Internal server error", err });

    if (memberData.length === 0) {
      return res.status(404).json({ message: "No member found for user. Contact Admin." });
    }

    const memberId = memberData[0].mem_id;

    // STEP 2: If User → fetch only their team IDs; If Manager/Admin/Master → skip
    const isPrivileged = ["Master", "Admin", "Manager"].includes(role);

    const fetchTeams = () => {
      return new Promise((resolve, reject) => {
        if (isPrivileged) return resolve([]);

        const getTeamsQuery = `SELECT team_id FROM team_members WHERE member_id = ?`;

        db.query(getTeamsQuery, [memberId], (err, teamsData) => {
          if (err) reject(err);
          else resolve(teamsData.map(t => t.team_id));
        });
      });
    };

    fetchTeams().then(userTeamIds => {

      // STEP 3: Build Event Query
      let getEventsQuery = `
        SELECT DISTINCT
          eh.id AS event_id,
          eh.event_date,
          eh.title,
          eh.description,
          eh.from_date,
          eh.to_date,
          eh.isapproved,
          eh.type,
          eh.isdeleted,
          eh.approved_by,
          eh.created_by,
          eh.created_at,
          eh.updated_by,
          eh.updated_at,
          concat(u.first_name ," ", u.middle_name ," ", u.last_name) as organizer_name
        FROM event_hd eh
        LEFT JOIN event_member em ON eh.id = em.event_id
        LEFT JOIN event_team et ON eh.id = et.event_id
        LEFT JOIN users u ON eh.created_by = u.id
        WHERE eh.isdeleted = 'N'
          AND DATE(eh.from_date) > CURDATE()
      `;

      let params = [];

      // APPLY FILTER BASED ON ROLE
      if (isPrivileged) {
        // Managers/Admin/Master: No restrictions
        getEventsQuery += " ORDER BY eh.from_date ASC, eh.created_at DESC";
      } else {
        // User: Restrict to their member and team events
        getEventsQuery += `
          AND (
              em.member_id = ?
              OR et.team_id IN (?)
          )
          ORDER BY eh.from_date ASC, eh.created_at DESC
        `;
        params = userTeamIds.length > 0 ? [memberId, userTeamIds] : [memberId, [null]];
      }

      db.query(getEventsQuery, params, (err, eventsData) => {
        if (err) return res.status(500).json({ message: "Internal server error", err });

        if (eventsData.length === 0) {
          return res.status(200).json({
            message: "No upcoming events found",
            events: []
          });
        }

        const eventIds = eventsData.map(e => e.event_id);

        // STEP 4, 5, 6 – Fetch Members, Teams, Locations
        const getMembersQuery = `
          SELECT
            em.event_id,
            mm.mem_id AS id,
            mm.first_name,
            mm.middle_name,
            mm.last_name,
            mm.designation,
            CONCAT(mm.first_name, ' ', mm.last_name) AS full_name
          FROM event_member em
          JOIN mst_members mm ON em.member_id = mm.mem_id
          WHERE em.event_id IN (?)
        `;

        const getTeamsQuery2 = `
          SELECT et.event_id, t.id AS id, t.name AS name
          FROM event_team et
          JOIN mst_team t ON et.team_id = t.id
          WHERE et.event_id IN (?)
        `;

        const getLocationsQuery = `
          SELECT event_id, id, address, lng, lat, city, postal_code
          FROM event_loc
          WHERE event_id IN (?)
        `;

        Promise.all([
          new Promise((resolve, reject) => {
            db.query(getMembersQuery, [eventIds], (err, result) => {
              if (err) reject(err);
              else resolve(result);
            });
          }),
          new Promise((resolve, reject) => {
            db.query(getTeamsQuery2, [eventIds], (err, result) => {
              if (err) reject(err);
              else resolve(result);
            });
          }),
          new Promise((resolve, reject) => {
            db.query(getLocationsQuery, [eventIds], (err, result) => {
              if (err) reject(err);
              else resolve(result);
            });
          })
        ])
          .then(([membersData, teamsData, locationsData]) => {
            const eventsMap = {};

            // Initialize event containers
            eventsData.forEach(event => {
              eventsMap[event.event_id] = {
                ...event,
                members: [],
                teams: [],
                locations: []
              };
            });

            // Add members
            membersData.forEach(member => {
              if (eventsMap[member.event_id]) {
                eventsMap[member.event_id].members.push(member);
              }
            });

            // Add teams
            teamsData.forEach(team => {
              if (eventsMap[team.event_id]) {
                eventsMap[team.event_id].teams.push(team);
              }
            });

            // Add locations
            locationsData.forEach(location => {
              if (eventsMap[location.event_id]) {
                eventsMap[location.event_id].locations.push(location);
              }
            });

            return res.status(200).json({
              message: "Upcoming events fetched successfully",
              events: Object.values(eventsMap)
            });
          })
          .catch(error => {
            return res.status(500).json({ message: "Internal server error", error });
          });
      });
    }).catch(err => {
      return res.status(500).json({ message: "Internal server error", err });
    });
  });
};

export const getActiveEvents = (req, res) => {
  const { userId, role } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "Missing userId" });
  }

  // STEP 1: Get member_id
  const getMemberQuery = `SELECT mem_id, isorganizer FROM mst_members WHERE user_id = ? LIMIT 1`;

  db.query(getMemberQuery, [userId], (err, memberData) => {
    if (err) return res.status(500).json({ message: "Internal server error", err });

    if (memberData.length === 0) {
      return res.status(404).json({ message: "No member found for user. Contact Admin." });
    }

    const memberId = memberData[0].mem_id;
    const isPrivileged = ["Master", "Admin", "Manager"].includes(role);

    // STEP 2 (only needed for USER)
    const fetchTeams = () => {
      return new Promise((resolve, reject) => {
        if (isPrivileged) return resolve([]); // skip for Admin/Master/Manager

        const getTeamsQuery = `SELECT team_id FROM team_members WHERE member_id = ?`;

        db.query(getTeamsQuery, [memberId], (err, teamsData) => {
          if (err) reject(err);
          else resolve(teamsData.map(t => t.team_id));
        });
      });
    };

    fetchTeams().then(userTeamIds => {

      // STEP 3: ACTIVE events
      let getEventsQuery = `
        SELECT DISTINCT
          eh.id AS event_id,
          eh.event_date,
          eh.title,
          eh.description,
          eh.from_date,
          eh.to_date,
          eh.isapproved,
          eh.type,
          eh.isdeleted,
          eh.approved_by,
          eh.created_by,
          concat(u.first_name ," ", u.middle_name ," ", u.last_name) as organizer_name,
          eh.created_at,
          eh.updated_by,
          eh.updated_at
        FROM event_hd eh
        LEFT JOIN event_member em ON eh.id = em.event_id
        LEFT JOIN event_team et ON eh.id = et.event_id
        LEFT JOIN users u ON eh.created_by = u.id
        WHERE eh.isdeleted = 'N'
        AND CURDATE() BETWEEN DATE(eh.from_date) AND DATE(eh.to_date)
      `;

      let params = [];

      if (isPrivileged) {
        // Master/Admin/Manager → no restrictions
        getEventsQuery += ` ORDER BY eh.from_date ASC, eh.created_at DESC`;
      } else {
        // User → apply member/team filter
        getEventsQuery += `
          AND (
            em.member_id = ?
            OR et.team_id IN (?)
          )
          ORDER BY eh.from_date ASC, eh.created_at DESC
        `;

        params = userTeamIds.length > 0 ? [memberId, userTeamIds] : [memberId, [null]];
      }

      db.query(getEventsQuery, params, (err, eventsData) => {
        if (err) return res.status(500).json({ message: "Internal server error", err });

        if (eventsData.length === 0) {
          return res.status(200).json({
            message: "No active events found",
            events: []
          });
        }

        const eventIds = eventsData.map(e => e.event_id);

        // STEP 4: Members
        const getMembersQuery = `
          SELECT
            em.event_id,
            mm.mem_id AS id,
            mm.first_name,
            mm.middle_name,
            mm.last_name,
            mm.designation,
            CONCAT(mm.first_name, ' ', mm.last_name) AS full_name
          FROM event_member em
          JOIN mst_members mm ON em.member_id = mm.mem_id
          WHERE em.event_id IN (?)
        `;

        // STEP 5: Teams
        const getTeamsQuery2 = `
          SELECT et.event_id, t.id AS id, t.name AS name
          FROM event_team et
          JOIN mst_team t ON et.team_id = t.id
          WHERE et.event_id IN (?)
        `;

        // STEP 6: Locations
        const getLocationsQuery = `
          SELECT event_id, id, address, lng, lat, city, postal_code
          FROM event_loc
          WHERE event_id IN (?)
        `;

        Promise.all([
          new Promise((resolve, reject) => {
            db.query(getMembersQuery, [eventIds], (err, result) => {
              if (err) reject(err);
              else resolve(result);
            });
          }),
          new Promise((resolve, reject) => {
            db.query(getTeamsQuery2, [eventIds], (err, result) => {
              if (err) reject(err);
              else resolve(result);
            });
          }),
          new Promise((resolve, reject) => {
            db.query(getLocationsQuery, [eventIds], (err, result) => {
              if (err) reject(err);
              else resolve(result);
            });
          })
        ])
          .then(([membersData, teamsData, locationsData]) => {
            const eventsMap = {};

            // initialize
            eventsData.forEach(event => {
              eventsMap[event.event_id] = {
                ...event,
                members: [],
                teams: [],
                locations: []
              };
            });

            // add members
            membersData.forEach(member => {
              if (eventsMap[member.event_id]) {
                eventsMap[member.event_id].members.push(member);
              }
            });

            // add teams
            teamsData.forEach(team => {
              if (eventsMap[team.event_id]) {
                eventsMap[team.event_id].teams.push(team);
              }
            });

            // add locations
            locationsData.forEach(location => {
              if (eventsMap[location.event_id]) {
                eventsMap[location.event_id].locations.push(location);
              }
            });

            return res.status(200).json({
              message: "Active events fetched successfully",
              events: Object.values(eventsMap)
            });
          })
          .catch(error => {
            return res.status(500).json({ message: "Internal server error", error });
          });

      });
    }).catch(err => {
      return res.status(500).json({ message: "Internal server error", err });
    });
  });
};

export const getActiveSteps = (req, res) => {
  const sql = `SELECT * FROM mst_steps WHERE status = 'A'`;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching steps:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    return res.status(200).json({
      message: "Steps fetched successfully",
      steps: results
    });
  });
}

export const getActiveTasks_old = (req, res) => {
  const { Id } = req.params;
  const sql = `SELECT * FROM mst_tasks WHERE status = 'A' AND step_id=?`;

  db.query(sql, [Id], (err, results) => {
    if (err) {
      console.error("Error fetching tasks:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    return res.status(200).json({
      message: "Tasks fetched successfully",
      tasks: results
    });
  });
}

export const getActiveTasks = (req, res) => {
  const sql = `SELECT * FROM mst_tasks WHERE status = 'A'`;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching tasks:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    return res.status(200).json({
      message: "Tasks fetched successfully",
      tasks: results
    });
  });
}

export const addAttendence_old13012026 = async (req, res) => {
  try {
    const { eventId, Time, punchDate, eventDate, stepId, taskId, memId, location, attenddesc } = req.body;
    const file = req.file;
    let locationObj = typeof location === "string" ? JSON.parse(location) : location;

    const getMemDetails = `
                          SELECT CONCAT(first_name,' ',middle_name,' ', last_name)
                          FROM mst_members
                  WHERE mem_id = ?
                          `;

    const dbQuery = (sql, params = []) => {
      return new Promise((resolve, reject) => {
        db.query(sql, params, (error, results) => {
          if (error) reject(error);
          else resolve(results);
        });
      });
    };

    // Step 1: CHECK IF ALREADY ATTENDED OR IF PUNCH_DATE ALREADY EXISTS
    const checkQuery = `
      SELECT 1
      FROM event_media
      WHERE event_id = ? 
        AND mem_id = ? 
        AND event_date = ? 
        AND step_id = ? 
        AND task_id = ?
        AND punch_date = ?
      LIMIT 1
    `;

    const alreadyAttended = await dbQuery(checkQuery, [eventId, memId, eventDate, stepId, taskId, punchDate]);

    if (alreadyAttended.length > 0) {
      return res.status(400).json({ success: false, message: `You have already attended this task.` });
    }

    // Step 2: (Your existing logic)
    let savePath = null;
    let mediaSrNo = null;

    if (file) {
      const folderName = `${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}`;
      const uploadPath = path.join("uploads", folderName, memId.toString());

      await fs.ensureDir(uploadPath);

      const fileName = Date.now() + "_" + file.originalname;
      savePath = path.posix.join(uploadPath.replace(/\\/g, "/"), fileName);

      await sharp(file.buffer).jpeg({ quality: 40 }).toFile(savePath);

      const mediaMaxResult = await dbQuery(
        "SELECT COALESCE(MAX(sr_no), 0) + 1 as next_id FROM event_media"
      );
      mediaSrNo = mediaMaxResult[0].next_id;

      const mediaQuery = `
        INSERT INTO event_media(sr_no, event_id, in_time, punch_date, event_date, media_path, address, lat, lng, media_desc, mem_id, step_id, task_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      await dbQuery(mediaQuery, [mediaSrNo, eventId, Time, punchDate, eventDate, savePath, locationObj?.address ?? null, locationObj?.latitude ?? null, locationObj?.longitude ?? null, attenddesc, memId, stepId, taskId]);
    }

    res.json({ success: true, message: "Attendance added successfully!" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

export const addAttendence = async (req, res) => {
  try {
    const { eventId, Time, punchDate, eventDate, stepId, taskId, c_by, location, attenddesc } = req.body;
    const file = req.file;
    const locationObj = typeof location === "string" ? JSON.parse(location) : location;

    const dbQuery = (sql, params = []) => {
      return new Promise((resolve, reject) => {
        db.query(sql, params, (error, results) => {
          if (error) reject(error);
          else resolve(results);
        });
      });
    };

    /* -----------------------------------
       STEP 1: CHECK DUPLICATE ATTENDANCE
    ------------------------------------ */
    const checkQuery = `
      SELECT 1
      FROM event_media
      WHERE event_id = ?
        AND c_by = ?
        AND event_date = ?
        AND step_id = ?
        AND task_id = ?
        AND punch_date = ?
      LIMIT 1
    `;

    const alreadyAttended = await dbQuery(checkQuery, [eventId, c_by, eventDate, stepId, taskId, punchDate]);

    if (alreadyAttended.length > 0) {
      return res.status(400).json({ success: false, message: "You have already attended this task." });
    }

    /* -----------------------------------
       STEP 2: GET MEMBER NAME
    ------------------------------------ */
    const getMemDetails = `
      SELECT CONCAT(first_name,' ',middle_name,' ',last_name) AS full_name
      FROM mst_members
      WHERE mem_id = ?
    `;
    const memResult = await dbQuery(getMemDetails, [memId]);
    const memNameRaw = memResult[0]?.full_name || "unknown";
    const memName = memNameRaw.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_]/g, "");

    /* -----------------------------------
       STEP 3: FILE UPLOAD & SAVE
    ------------------------------------ */
    let savePath = null;
    let mediaSrNo = null;

    if (file) {
      const yearMonth = `${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}`;

      const memberFolder = `${memId}_${memName}`;
      const uploadPath = path.join("uploads/attendance", yearMonth, memberFolder);

      await fs.ensureDir(uploadPath);
      const fileName = `${new Date().toISOString().split('T')[0].replace(/-/g, '')}_${file.originalname}`;
      savePath = path.posix.join(uploadPath.replace(/\\/g, "/"), fileName);
      await sharp(file.buffer).jpeg({ quality: 40 }).toFile(savePath);

      /* -----------------------------------
         STEP 4: INSERT DB RECORD
      ------------------------------------ */
      const mediaMaxResult = await dbQuery("SELECT COALESCE(MAX(sr_no), 0) + 1 AS next_id FROM event_media");

      mediaSrNo = mediaMaxResult[0].next_id;

      const mediaQuery = `
        INSERT INTO event_media (sr_no,event_id,in_time,punch_date,event_date,media_path,address,city,state,pin,lat,lng,media_desc,step_id,task_id,c_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

      await dbQuery(mediaQuery, [mediaSrNo, eventId, Time, punchDate, eventDate, savePath, locationObj?.address ?? null, locationObj?.city ?? null, locationObj?.state ?? null, locationObj?.pin ?? null, locationObj?.latitude ?? null, locationObj?.longitude ?? null, attenddesc, stepId, taskId, c_by]);
    }

    return res.json({ success: true, message: "Attendance added successfully!" });

  } catch (error) {
    console.error("Attendance Error:", error);
    return res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

export const addAttendence_old041225 = async (req, res) => {
  try {
    const { eventId, Time, eventDate, stepId, taskId, userId, location, attenddesc } = req.body;
    const file = req.file;

    // Parse location if it's a string
    let locationObj = typeof location === "string" ? JSON.parse(location) : location;

    // Helper: convert db.query to Promise
    const dbQuery = (sql, params = []) => {
      return new Promise((resolve, reject) => {
        db.query(sql, params, (error, results) => {
          if (error) reject(error);
          else resolve(results);
        });
      });
    };

    let savePath = null;
    let mediaSrNo = null;

    // 1️⃣ IF FILE EXISTS → PROCESS MEDIA
    if (file) {
      const currentDate = new Date();
      const folderName = `${currentDate.getFullYear()}${String(currentDate.getMonth() + 1).padStart(2, "0")}`;

      const uploadPath = path.join("uploads", folderName, userId.toString());
      await fs.ensureDir(uploadPath);

      // Filename
      const fileName = Date.now() + "_" + file.originalname;
      // savePath = path.join(uploadPath, fileName);
      savePath = path.posix.join(uploadPath.replace(/\\/g, "/"), fileName);


      // Compress image
      await sharp(file.buffer).jpeg({ quality: 40 }).toFile(savePath);

      // Get next sr_no for event_media
      const mediaMaxResult = await dbQuery(
        "SELECT COALESCE(MAX(sr_no), 0) + 1 as next_id FROM event_media"
      );
      mediaSrNo = mediaMaxResult[0].next_id;

      // Insert into event_media
      const mediaQuery = `
        INSERT INTO event_media(sr_no, event_id, in_time, event_date, media_path, address, lat, lng, media_desc, mem_id, step_id, task_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      await dbQuery(mediaQuery, [
        mediaSrNo,
        eventId,
        Time,
        eventDate,
        savePath,
        locationObj?.address ?? null,
        locationObj?.latitude ?? null,
        locationObj?.longitude ?? null,
        attenddesc,
        userId,
        stepId,
        taskId
      ]);
    }

    // RESPONSE
    res.json({ success: true, message: "Attendance added successfully!" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

export const addSteps = (req, res) => {
  const { eventId, eventDate, memId, userId, description, taskId, stepId, status } = req.body;

  const checkSql = `
                      SELECT * 
                      FROM event_dt 
                      WHERE event_id = ? AND event_date = ? AND task_id = ?
                    `;

  db.query(checkSql, [eventId, eventDate, taskId], (err, results) => {
    if (err) {
      console.error("Error checking existing step:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (results.length > 0) {
      return res.status(400).json({ message: "Already exists!" });
    }

    // STEP 2: Get next step ID (sr_no + step_no)
    const sql1 = `SELECT COALESCE(MAX(sr_no), 0) + 1 AS next_sr_no FROM event_dt`;

    db.query(sql1, [eventId, eventDate], (err, result) => {
      if (err) {
        console.error("Error fetching next step ID:", err);
        return res.status(500).json({ message: "Internal server error" });
      }

      const nextStepId = result[0].next_sr_no;

      // STEP 3: Insert new step
      const insertSql = `
                        INSERT INTO event_dt 
                          (sr_no, event_id, event_date, mem_id, task_desc, step_no, task_id, status, c_at, c_by)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)
                      `;

      db.query(insertSql, [nextStepId, eventId, eventDate, memId, description, stepId, taskId, status, userId], (err, insertResult) => {
        if (err) {
          console.error("Error adding step:", err);
          return res.status(500).json({ message: "Internal server error" });
        }

        return res.status(200).json({
          message: "Step added successfully",
          stepId: nextStepId
        });
      }
      );
    });
  });
};

export const getEventForAttend = async (req, res) => {
  try {
    const { userId, role } = req.body;
    if (!userId) {
      return res.status(400).json({ message: "UserId is required" });
    }

    // helper for mysql
    const queryAsync = (sql, params) => {
      return new Promise((resolve, reject) => {
        db.query(sql, params, (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      });
    };

    // If User → get mem_id & team_id
    let memId = null;
    let teamArray = [0];

    if (role === "User") {
      const sql1 = `SELECT mem_id FROM mst_members WHERE user_id = ? LIMIT 1`;
      const memberData = await queryAsync(sql1, [userId]);

      if (memberData.length === 0) {
        return res.status(404).json({ message: "No member found for user. Contact Admin." });
      }

      memId = memberData[0].mem_id;

      const sql2 = `SELECT team_id FROM team_members WHERE member_id = ?`;
      const teamsData = await queryAsync(sql2, [memId]);

      const teamIds = teamsData.map(t => t.team_id);
      teamArray = teamIds.length ? teamIds : [0];
    }

    // --------------------------------------------
    // Build WHERE clause based on ROLE
    // --------------------------------------------

    let roleCondition = "";

    if (role === "User") {
      roleCondition = `
        AND (
          em.member_id = ${db.escape(memId)} 
          OR et.team_id IN (${teamArray.map(id => db.escape(id)).join(",")})
        )
      `;
    } else {
      // Master, Manager, Admin → No member/team restriction
      roleCondition = "";
    }

    // --------------------------------------------
    // FINAL SQL
    // --------------------------------------------
    const sql3 = `
      SELECT DISTINCT
        eh.id AS event_id,
        eh.event_Date,
        eh.title,
        eh.description,
        eh.from_date,
        eh.to_date,
        eh.isapproved,
        eh.type,
        eh.isdeleted,
        eh.approved_by,
        eh.created_by,
        eh.created_at,
        eh.updated_by,
        eh.updated_at,
        a.sr_no, 
        a.event_id AS dt_event_id,
        a.event_date,
        a.step_no,
        a.task_id,
        a.task_desc,
        a.status as dt_status,
        b.step_name,
        c.task_name
      FROM event_hd eh
      LEFT JOIN event_member em ON eh.id = em.event_id
      LEFT JOIN event_team et ON eh.id = et.event_id
      LEFT JOIN event_dt AS a ON a.event_id = eh.id 
                AND a.event_date = eh.event_date
      LEFT JOIN mst_steps AS b ON a.step_no = b.id
      LEFT JOIN mst_tasks AS c ON a.task_id = c.id
      WHERE eh.isdeleted = 'N'
            AND a.status NOT IN ('D', 'C')
            AND CURDATE() BETWEEN DATE(eh.from_date) AND DATE(eh.to_date)
            ${roleCondition}
      ORDER BY eh.from_date ASC, eh.created_at DESC
    `;

    const eventsData = await queryAsync(sql3);

    return res.status(200).json({ events: eventsData });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error", err });
  }
};

export const updateSteps = (req, res) => {
  const { srNo, eventId, eventDate, stepId, taskId, status, userId } = req.body;

  const sql = `
                UPDATE event_dt 
                SET status = ?, step_no = ?, task_id = ?, u_at = NOW(), u_by = ?
                WHERE sr_no = ? AND event_id = ? AND event_date = ?
              `;

  db.query(sql, [status, stepId, taskId, userId, srNo, eventId, eventDate], (err, result) => {
    if (err) {
      console.error("Error updating step:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
    return res.status(200).json({ message: "Step updated successfully" });
  });
};

export const getMemberDetailsForDashboard = (req, res) => {
  const { id } = req.params;

  try {
    const sql = `
                  SELECT a.mem_id,a.first_name,a.middle_name,a.last_name,a.mobile,a.email,a.birth_date,a.address,
                         a.designation,a.isorganizer,a.status,a.user_id, b.role,c.team_id,d.name,a.gender,
                         CONCAT(b.first_name,' ',b.middle_name,' ',b.last_name) as user_name
                  FROM mst_members AS a
                  LEFT JOIN users AS b ON a.user_id = b.id
                  LEFT JOIN team_members AS c ON c.member_id = a.mem_id
                  LEFT JOIN mst_team AS d on c.team_id = d.id
                  WHERE a.user_id = ?
                `;

    db.query(sql, [id], (err, results) => {
      if (err) {
        console.error("Error:", err);
        return res.status(500).json({ message: "Internal server error" });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "Member not found" });
      }

      const base = results[0];

      const member = {
        mem_id: base.mem_id,
        first_name: base.first_name,
        middle_name: base.middle_name,
        last_name: base.last_name,
        mobile: base.mobile,
        email: base.email,
        birth_date: base.birth_date,
        address: base.address,
        designation: base.designation,
        isorganizer: base.isorganizer,
        status: base.status,
        user_id: base.user_id,
        user_name: base.user_name,
        role: base.role,
        gender: base.gender,
        teams: results.map(row => ({
          team_id: row.team_id,
          name: row.name
        })).filter(team => team.team_id !== null)
      };

      return res.status(200).json({
        message: "Member fetched successfully",
        member
      });
    });

  } catch (error) {
    console.error("Exception:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
