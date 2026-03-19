import fs from 'fs';
import path from 'path';
import db from '../../db.js';

const query = (sql, values = []) => {
  return new Promise((resolve, reject) => {
    db.query(sql, values, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

export const getActiveTeams = (req, res) => {
  const sql = `SELECT * FROM mst_team WHERE status = ? `;
  db.query(sql, ['A'], (err, results) => {
    if (err) {
      console.error('Error fetching events:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
    return res.status(200).json({ Teams: results });
  });
};

export const getActiveMembers = (req, res) => {
  const sql = `SELECT a.mem_id,a.first_name,a.middle_name,a.last_name,a.mobile,a.email,a.address,a.designation,a.user_id,a.isorganizer
               FROM mst_members AS a
               WHERE a.status = ?`;
  db.query(sql, ['A'], (err, results) => {
    if (err) {
      console.error('Error fetching events:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
    return res.status(200).json({ Members: results });
  });
};

export const addEvent = (req, res) => {
  try {
    const { title, description, fromDate, toDate, type, userId, teamsId = [], members = [], locations = [] } = req.body;
    const createdAt = new Date();
    const eventDate = new Date();
    const isapproved = "P";
    const isdeleted = "N";
    const approvedBy = null;

    if (!title || !fromDate || !toDate || !userId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // First, get the MAX(id) from event_hd
    const getMaxIdSQL = `SELECT COALESCE(MAX(id), 0) + 1 as next_id FROM event_hd`;

    db.query(getMaxIdSQL, (err, result) => {
      if (err) {
        console.error("❌ Error getting next event ID:", err);
        return res.status(500).json({ message: "Internal Server Error" });
      }

      const eventId = result[0].next_id;

      // Insert into event_hd with explicit ID
      const hdSQL = `
        INSERT INTO event_hd
        (id, title, description, from_date, to_date, isapproved, type, isdeleted, created_by, approved_by, created_at, event_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      db.query(
        hdSQL,
        [
          eventId,
          title,
          description,
          fromDate,
          toDate,
          isapproved,
          type,
          isdeleted,
          userId,
          approvedBy,
          createdAt,
          eventDate
        ],
        (err, result) => {
          if (err) {
            console.error("❌ event_hd insert error:", err);
            return res.status(500).json({ message: "Internal Server Error" });
          }

          // Define functions in correct order to avoid hoisting issues
          const insertTeams = (callback) => {
            if (teamsId.length === 0) {
              return callback();
            }

            const getTeamMaxIdSQL = `SELECT COALESCE(MAX(id), 0) + 1 as next_id FROM event_team`;

            db.query(getTeamMaxIdSQL, (err, teamResult) => {
              if (err) {
                console.error("❌ Error getting next event_team ID:", err);
                return res.status(500).json({ message: "Internal Server Error" });
              }

              let teamNextId = teamResult[0].next_id;
              const teamValues = teamsId.map((id, index) => [teamNextId + index, eventId, id, eventDate]);
              const teamSQL = `INSERT INTO event_team (id, event_id, team_id, event_date) VALUES ?`;

              db.query(teamSQL, [teamValues], err => {
                if (err) {
                  console.error("❌ event_team insert error:", err);
                  return res.status(500).json({ message: "Failed inserting teams" });
                }
                callback();
              });
            });
          };

          const insertMembers = (callback) => {
            const memberIds = members.map(m => m.id);

            if (memberIds.length === 0) {
              return callback();
            }

            const getMemberMaxIdSQL = `SELECT COALESCE(MAX(id), 0) + 1 as next_id FROM event_member`;

            db.query(getMemberMaxIdSQL, (err, memberResult) => {
              if (err) {
                console.error("❌ Error getting next event_member ID:", err);
                return res.status(500).json({ message: "Internal Server Error" });
              }

              let memberNextId = memberResult[0].next_id;
              const memberValues = memberIds.map((id, index) => [memberNextId + index, eventId, id, eventDate]);
              const memberSQL = `INSERT INTO event_member (id, event_id, member_id, event_date) VALUES ?`;

              db.query(memberSQL, [memberValues], err => {
                if (err) {
                  console.error("❌ event_member insert error:", err);
                  return res.status(500).json({ message: "Failed inserting members" });
                }
                callback();
              });
            });
          };
          const insertLocations = (callback) => {
            if (locations.length === 0) {
              return callback();
            }

            const getLocMaxIdSQL = `SELECT COALESCE(MAX(id), 0) + 1 as next_id FROM event_loc`;

            db.query(getLocMaxIdSQL, (err, locResult) => {
              if (err) {
                console.error("❌ Error getting next event_loc ID:", err);
                return res.status(500).json({ message: "Internal Server Error" });
              }

              let locNextId = locResult[0].next_id;

              const locationValues = locations.map((loc, index) => [
                locNextId + index,
                eventId,
                loc.address,
                loc.lng,
                loc.lat,
                loc.city,
                loc.state,
                loc.pin,
                eventDate
              ]);

              const locSQL = `
                                INSERT INTO event_loc
                                (id, event_id, address, lng, lat, city, state, postal_code, event_date)
                                VALUES ?
                              `;

              db.query(locSQL, [locationValues], err => {
                if (err) {
                  console.error("❌ event_loc insert error:", err);
                  return res.status(500).json({ message: "Failed inserting locations" });
                }
                callback();
              });
            });
          };

          // Execute in sequence: teams → members → locations → final response
          insertTeams(() => {
            insertMembers(() => {
              insertLocations(() => {
                res.status(201).json({ message: "Event created successfully!", eventId });
              });
            });
          });
        }
      );
    });
  } catch (err) {
    console.error("🔥 Exception:", err);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const getEvents = (req, res) => {
  const { userId, role } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "Missing userId" });
  }

  const adminRoles = ['Master', 'Manager', 'Admin'];
  const isAdmin = adminRoles.includes(role);

  const getMemberQuery = `SELECT mem_id FROM mst_members WHERE user_id = ? LIMIT 1`;

  db.query(getMemberQuery, [userId], (err, memberData) => {
    if (err) return res.status(500).json({ message: "Internal server error", err });

    if (memberData.length === 0) {
      return res.status(404).json({ message: "No member found for user. Contact Admin." });
    }

    const memberId = memberData[0].mem_id;

    if (isAdmin) {
      // ADMIN FLOW: Get all events + organizer name
      const getAllEventsQuery = `
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
          CONCAT(mm.first_name, ' ', mm.middle_name, ' ', mm.last_name) AS organizer_name,
          eh.created_at,
          eh.updated_by,
          eh.updated_at
        FROM event_hd eh
        LEFT JOIN mst_members mm ON eh.created_by = mm.mem_id
        WHERE eh.isdeleted = 'N'
        ORDER BY eh.from_date DESC, eh.created_at DESC
      `;

      db.query(getAllEventsQuery, (err, eventsData) => {
        if (err) return res.status(500).json({ message: "Internal server error", err });

        if (eventsData.length === 0) {
          return res.status(200).json({
            message: "No events found",
            events: []
          });
        }

        fetchEventDetails(eventsData, res);
      });

    } else {
      const getTeamsQuery = `SELECT team_id FROM team_members WHERE member_id = ?`;

      db.query(getTeamsQuery, [memberId], (err, teamsData) => {
        if (err) return res.status(500).json({ message: "Internal server error", err });

        const userTeamIds = teamsData.map(t => t.team_id);

        // USER FLOW with organizer name
        const getUserEventsQuery = `
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
            CONCAT(mm.first_name, ' ', mm.middle_name, ' ', mm.last_name) AS organizer_name,
            eh.created_at,
            eh.updated_by,
            eh.updated_at
          FROM event_hd eh
          LEFT JOIN mst_members mm ON eh.created_by = mm.mem_id
          LEFT JOIN event_member em 
            ON eh.id = em.event_id AND eh.event_date = em.event_date
          LEFT JOIN event_team et 
            ON eh.id = et.event_id AND eh.event_date = et.event_date
          WHERE eh.isdeleted = 'N'
            AND (
              em.member_id = ?
              OR et.team_id IN (?)
            )
          ORDER BY eh.from_date DESC, eh.created_at DESC
        `;

        const eventParams = userTeamIds.length > 0 ? [memberId, userTeamIds] : [memberId, [null]];

        db.query(getUserEventsQuery, eventParams, (err, eventsData) => {
          if (err) return res.status(500).json({ message: "Internal server error", err });

          if (eventsData.length === 0) {
            return res.status(200).json({
              message: "No events found",
              events: []
            });
          }

          fetchEventDetails(eventsData, res);
        });
      });
    }
  });
};

function fetchEventDetails(eventsData, res) {
  // Create arrays for event_id and event_date pairs for the IN clause
  const eventIdDatePairs = eventsData.map(e => [e.event_id, e.event_date]);

  // For MySQL IN clause with multiple columns, we need to use OR conditions
  const eventConditions = eventIdDatePairs.map(pair => `(event_id = ? AND event_date = ?)`).join(' OR ');
  const eventParamsFlat = eventIdDatePairs.flat();

  // Get members for these events
  const getMembersQuery = `
    SELECT 
      em.event_id,
      em.event_date,
      mm.mem_id AS id,
      mm.first_name,
      mm.middle_name,
      mm.last_name,
      mm.designation,
      CONCAT(mm.first_name, ' ', mm.last_name) AS full_name
    FROM event_member em
    JOIN mst_members mm ON em.member_id = mm.mem_id
    WHERE ${eventConditions}
  `;

  // Get teams for these events
  const getTeamsQuery = `
    SELECT 
      et.event_id,
      et.event_date,
      t.id AS id,
      t.name AS name
    FROM event_team et
    JOIN mst_team t ON et.team_id = t.id
    WHERE ${eventConditions}
  `;

  // Get locations for these events
  const getLocationsQuery = `
    SELECT 
      event_id,
      event_date,
      id,
      address,
      lng,
      lat,
      city,
      postal_code
    FROM event_loc
    WHERE ${eventConditions}
  `;

  // Execute all queries in parallel
  Promise.all([
    new Promise((resolve, reject) => {
      db.query(getMembersQuery, [...eventParamsFlat], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    }),
    new Promise((resolve, reject) => {
      db.query(getTeamsQuery, [...eventParamsFlat], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    }),
    new Promise((resolve, reject) => {
      db.query(getLocationsQuery, [...eventParamsFlat], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    })
  ]).then(([membersData, teamsData, locationsData]) => {

    // Combine all data
    const eventsMap = {};

    // Initialize events - use composite key of event_id + event_date
    eventsData.forEach(event => {
      const eventKey = `${event.event_id}_${event.event_date}`;
      eventsMap[eventKey] = {
        ...event,
        members: [],
        teams: [],
        locations: []
      };
    });

    // Add members
    membersData.forEach(member => {
      const eventKey = `${member.event_id}_${member.event_date}`;
      if (eventsMap[eventKey]) {
        eventsMap[eventKey].members.push(member);
      }
    });

    // Add teams
    teamsData.forEach(team => {
      const eventKey = `${team.event_id}_${team.event_date}`;
      if (eventsMap[eventKey]) {
        eventsMap[eventKey].teams.push(team);
      }
    });

    // Add locations
    locationsData.forEach(location => {
      const eventKey = `${location.event_id}_${location.event_date}`;
      if (eventsMap[eventKey]) {
        eventsMap[eventKey].locations.push(location);
      }
    });

    const formattedEvents = Object.values(eventsMap);

    return res.status(200).json({
      message: "Events fetched successfully",
      events: formattedEvents
    });

  }).catch(error => {
    return res.status(500).json({ message: "Internal server error", error });
  });
}

export const updateEvent = (req, res) => {
  const { id, event_date, title, description, fromDate, toDate, type, isapproved, isdeleted, userId, teams = [], members = [], locations = [] } = req.body;

  try {
    if (!id || !event_date || !title || !fromDate || !toDate || !userId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const approvedBy = isapproved === 'A' ? userId : null;
    const teamIds = teams.map(t => t.id);
    const memberIds = members.map(m => m.id);

    // 1️⃣ Update event_hd
    const sqlUpdateHd = `
                          UPDATE event_hd 
                          SET title=?, description=?, from_date=?, to_date=?, type=?, isapproved=?, isdeleted=?, updated_by=?, approved_by=? 
                          WHERE id=? AND event_date=?
                        `;

    db.query(sqlUpdateHd, [title, description, fromDate, toDate, type, isapproved, isdeleted, userId, approvedBy, id, event_date], (err) => {
      if (err) {
        console.error("event_hd update error:", err);
        return res.status(500).json({ message: "Failed updating event header" });
      }
      updateTeams();
    }
    );

    // 2️⃣ Delete + Insert event_team WITH MAX(id)+1
    const updateTeams = () => {
      const delTeamSQL = `DELETE FROM event_team WHERE event_id = ? AND event_date = ?`;

      db.query(delTeamSQL, [id, event_date], (err) => {
        if (err) return res.status(500).json({ message: "Failed deleting teams" });

        if (teamIds.length === 0) return updateMembers();

        const nextIdSQL = `SELECT COALESCE(MAX(id), 0) + 1 AS next_id FROM event_team`;

        db.query(nextIdSQL, (err, result) => {
          if (err) return res.status(500).json({ message: "Failed fetching next team id" });

          let nextId = result[0].next_id;

          const teamValues = teamIds.map(tid => {
            const row = [nextId, id, tid, event_date]; nextId++;
            return row;
          });

          const insertTeamSQL = `
                                  INSERT INTO event_team (id, event_id, team_id, event_date)
                                  VALUES ?
                                `;

          db.query(insertTeamSQL, [teamValues], (err) => {
            if (err) return res.status(500).json({ message: "Failed inserting teams" });
            updateMembers();
          });
        });
      });
    };

    // 3️⃣ Delete + Insert event_member WITH MAX(id)+1
    const updateMembers = () => {
      const delMemSQL = `DELETE FROM event_member WHERE event_id = ? AND event_date = ?`;

      db.query(delMemSQL, [id, event_date], (err) => {
        if (err) return res.status(500).json({ message: "Failed deleting members" });

        if (memberIds.length === 0) return updateLocations();

        const nextIdSQL = `SELECT COALESCE(MAX(id), 0) + 1 AS next_id FROM event_member`;

        db.query(nextIdSQL, (err, result) => {
          if (err) return res.status(500).json({ message: "Failed fetching next member id" });

          let nextId = result[0].next_id;

          const memberValues = memberIds.map(mid => {
            const row = [nextId, id, mid, event_date];
            nextId++;
            return row;
          });

          const insertMemSQL = `
                                  INSERT INTO event_member (id, event_id, member_id, event_date)
                                  VALUES ?
                                `;

          db.query(insertMemSQL, [memberValues], (err) => {
            if (err) return res.status(500).json({ message: "Failed inserting members" });
            updateLocations();
          });
        });
      });
    };

    // 4️⃣ Delete + Insert event_loc WITH MAX(id)+1
    const updateLocations = () => {
      const delLocSQL = `DELETE FROM event_loc WHERE event_id = ? AND event_date = ?`;

      db.query(delLocSQL, [id, event_date], (err) => {
        if (err) return res.status(500).json({ message: "Failed deleting locations" });

        if (locations.length === 0) {
          return res.status(200).json({ message: "Event updated successfully!", eventId: id });
        }

        const nextIdSQL = `SELECT COALESCE(MAX(id), 0) + 1 AS next_id FROM event_loc`;

        db.query(nextIdSQL, (err, result) => {
          if (err) return res.status(500).json({ message: "Failed fetching next location id" });

          let nextId = result[0].next_id;

          const parseAddress = (fullAddress) => {
            let parts = fullAddress.split(",");
            let postal = fullAddress.match(/\b\d{6}\b/);
            postal = postal ? postal[0] : null;
            let city = parts.length >= 2 ? parts[parts.length - 2].trim() : null;
            return { city, postal };
          };

          const locationValues = locations.map(loc => {
            const { city, postal } = parseAddress(loc.address);
            const row = [nextId, id, loc.address, loc.lng, loc.lat, city, postal, event_date];
            nextId++;
            return row;
          });

          const insertLocSQL = `
                                  INSERT INTO event_loc 
                                  (id, event_id, address, lng, lat, city, postal_code, event_date)
                                  VALUES ?
                                `;

          db.query(insertLocSQL, [locationValues], (err) => {
            if (err) return res.status(500).json({ message: "Failed inserting locations" });

            res.status(200).json({ message: "Event updated successfully!", eventId: id });
          });
        });
      });
    };

  } catch (err) {
    console.error("updateEvent Exception:", err);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const deleteEvent = (req, res) => {
  const { id, event_date, isdeleted } = req.body;

  try {
    if (!id || !event_date) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const sql = `
                          UPDATE event_hd 
                          SET isdeleted=?
                          WHERE id=? AND event_date=?
                        `;

    db.query(sql, [isdeleted, id, event_date], (err) => {
      if (err) {
        console.error("event_hd update error:", err);
        return res.status(500).json({ message: "Failed delete event" });
      }
      return res.status(200).json({ message: "Event deleted successfully." })
    }
    );

  } catch (err) {
    console.error("updateEvent Exception:", err);
    return res.status(500).json({ message: "Server Error" });
  }
};

// ---------------------------------------------------------------------
export const getActiveOccasions = (req, res) => {
  const sql = `SELECT * FROM occasions WHERE status = 'A'`;
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching occasions:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
    return res.status(200).json({ Occasions: results });
  });
}

export const getActiveCompaign = (req, res) => {
  const sql = `SELECT * FROM compaign WHERE status = 'A'`;
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching compaign:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
    return res.status(200).json({ Compaigns: results });
  });
}

export const addActivity = async (req, res) => {
  try {
    const { title, occasion, campaign, colleges, departments, locations, members, teams, subActivities, vehicleType, notes, startDate, endDate, userId } = req.body;
    const activityDate = new Date().toISOString().split("T")[0];

    // STEP 1 — Parse JSON fields
    const parsedColleges = colleges ? JSON.parse(colleges) : [];
    const parsedDepartments = departments ? JSON.parse(departments) : [];
    const parsedLocations = locations ? JSON.parse(locations) : [];
    const parsedMembers = members ? JSON.parse(members) : [];
    const parsedTeams = teams ? JSON.parse(teams) : [];
    const parsedSubActivities = subActivities ? JSON.parse(subActivities) : [];

    // STEP 2 — Generate Activity ID
    const idResult = await query("SELECT IFNULL(MAX(id),0)+1 AS nextId FROM activities");

    const activityId = idResult[0].nextId;

    // Insert Activity
    await db.query(
      `INSERT INTO activities 
        (id,date,title,occasion_id,campaign_id,start_date,end_date,vehicle_type,notes,status,c_at,c_by,u_at,u_by)
       VALUES (?,?,?,?,?,?,?,?,?,?,NOW(),?,NOW(),?)`,
      [activityId, activityDate, title, occasion, campaign, startDate, endDate, vehicleType, notes, 'P', userId, userId]
    );

    // STEP 3 — Create Activity Folder
    const activityFolder = path.join("uploads", "activities", `${activityId}-${activityDate}`);

    if (!fs.existsSync(activityFolder)) {
      fs.mkdirSync(activityFolder, { recursive: true });
    }

    // Convert req.files array into object map
    const fileMap = {};
    if (req.files) {
      req.files.forEach((file) => {
        fileMap[file.fieldname] = file;
      });
    }

    // STEP 4 — Save Main Files
    const mainFileFields = ["image", "file"];

    for (const field of mainFileFields) {
      if (fileMap[field]) {
        const file = fileMap[field];
        const filePath = path.join(activityFolder, file.originalname);
        fs.writeFileSync(filePath, file.buffer);

        await query(`INSERT INTO activity_files (activity_id,activity_date,file_name,file_path,file_type,uploaded_at)
                     VALUES (?,?,?,?,?,NOW())`,[activityId,activityDate,file.originalname,filePath,file.mimetype]);
      }
    }

    // STEP 5 — Insert Colleges
    for (const clg of parsedColleges) {
      await query(`INSERT INTO activity_colleges (activity_id,date,clg_id) VALUES (?,?,?)`,
        [activityId, activityDate, clg.clg_id]
      );
    }

    // STEP 6 — Insert Departments
    for (const dept of parsedDepartments) {
      await query(`INSERT INTO activity_departments (activity_id,activity_date,dept_id) VALUES (?,?,?)`,
      [activityId, activityDate, dept.dept_id]);
    }

    // STEP 7 — Insert Locations
    for (const loc of parsedLocations) {
      await query(`INSERT INTO activity_locations(activity_id,activity_date,lat,lng,address,city,state,pin) VALUES (?,?,?,?,?,?,?,?)`,
      [activityId, activityDate, loc.lat, loc.lng, loc.address, loc.city, loc.state, loc.pin]);
    }

    // STEP 8 — Insert Members
    for (const member of parsedMembers) {
      await query(`INSERT INTO activity_members (activity_id,activity_date,member_id) VALUES (?,?,?)`,
        [activityId, activityDate, member.id]);
    }

    // STEP 9 — Insert Teams
    for (const team of parsedTeams) {
      await query(`INSERT INTO activity_teams (activity_id,activity_date,team_id) VALUES (?,?,?)`, [activityId, activityDate, team.id]);
    }

    // STEP 10 & 11 — Insert SubActivities + Attachments
    for (let i = 0; i < parsedSubActivities.length; i++) {
      const sub = parsedSubActivities[i];

      const srNo = i + 1;

      const subResult = await query(
        `INSERT INTO sub_activities (activity_id,activity_date,sr_no,task_id,title,start_time,end_time,notes,attachment)
         VALUES (?,?,?,?,?,?,?,?,?)`,
        [activityId, activityDate, srNo, sub.taskId, sub.title, sub.startTime, sub.endTime, sub.notes, null]
      );
      const subActivityId = subResult.insertId;

      const attachmentField = `subActivity_${i}_attachment`;

      if (fileMap[attachmentField]) {
        const file = fileMap[attachmentField];
        const safeTitle = sub.title.replace(/\s+/g, "-").toLowerCase();
        const subFolder = path.join(activityFolder, `subactivity-${subActivityId}-${safeTitle}`);

        if (!fs.existsSync(subFolder)) {
          fs.mkdirSync(subFolder, { recursive: true });
        }

        const filePath = path.join(subFolder, file.originalname);
        fs.writeFileSync(filePath, file.buffer);

        await query(`UPDATE sub_activities SET attachment=? WHERE id=?`, [filePath, subActivityId]);
      }
    }

    // STEP 12 — Response
    res.status(201).json({ message: "Activity created successfully", activityId });
  } catch (error) {
    console.error("Add Activity Error:", error);
    res.status(500).json({ message: "Failed to create activity", error: error.message });
  }
};

export const getActivities = async (req, res) => {
  try {
    const { userId, role, startDate, endDate } = req.body;

    let dateFilter = '';
    if (startDate && endDate) {
      dateFilter = `AND (
        DATE(A.start_date) BETWEEN '${startDate}' AND '${endDate}'
        OR DATE(A.end_date) BETWEEN '${startDate}' AND '${endDate}'
        OR ('${startDate}' BETWEEN DATE(A.start_date) AND DATE(A.end_date))
      )`;
    }

    // STEP 1 — If Admin roles → Fetch activities with date filter
    if (["Manager", "Admin", "Master"].includes(role)) {
      const activities = await query(`
        SELECT 
          id,
          date,
          title,
          start_date,
          end_date,
          vehicle_type,
          status
        FROM activities A
        WHERE 1=1 ${dateFilter}
        ORDER BY date DESC
      `);

      return res.status(200).json({
        message: "Activities fetched successfully",
        activities
      });
    }

    // STEP 2 — Get Member Details
    const userResult = await query(`SELECT mem_id FROM mst_members WHERE user_id = ? `, [userId]);

    if (!userResult.length) {
      return res.status(404).json({
        message: "Member not found"
      });
    }

    const memId = userResult[0].mem_id;

    // STEP 3 — Get Team IDs of Member
    const teamResult = await query(`SELECT team_id FROM team_members WHERE member_id = ?`, [memId]);
    const teamIds = teamResult.map((t) => t.team_id);

    // STEP 4 — Fetch Activities with date filter
    let activities;

    if (teamIds.length > 0) {
      activities = await query(
        `
        SELECT DISTINCT A.id,
               A.date,
               A.title,
               A.start_date,
               A.end_date,
               A.vehicle_type,
               A.status
        FROM activities A
        LEFT JOIN activity_members AM 
          ON A.id = AM.activity_id AND A.date = AM.activity_date
        LEFT JOIN activity_teams AT 
          ON A.id = AT.activity_id AND A.date = AT.activity_date
        WHERE 
            (AM.member_id = ? OR AT.team_id IN (?))
            ${dateFilter}
        ORDER BY A.date DESC
        `,
        [memId, teamIds]
      );
    } else {
      activities = await query(
        `
        SELECT DISTINCT A.id,
               A.date,
               A.title,
               A.start_date,
               A.end_date,
               A.vehicle_type,
               A.status
        FROM activities A
        LEFT JOIN activity_members AM 
          ON A.id = AM.activity_id AND A.date = AM.activity_date
        WHERE AM.member_id = ?
        ${dateFilter}
        ORDER BY A.date DESC
        `,
        [memId]
      );
    }

    // STEP 5 — Send Response
    res.status(200).json({
      message: "Activities fetched successfully",
      activities
    });
  } catch (error) {
    console.error("Get Activity Error:", error);
    res.status(500).json({
      message: "Failed to fetch activities",
      error: error.message
    });
  }
};

export const getActivityDetails = async (req, res) => {
  try {
    const { id, date } = req.body;

    if (!id || !date) {
      return res.status(400).json({
        message: "Activity id and date are required"
      });
    }

    // 1️⃣ Activity Main Details
    const activity = await query(
      `SELECT * 
       FROM activities 
       WHERE id = ? AND date = ?`,
      [id, date]
    );

    if (!activity.length) {
      return res.status(404).json({ message: "Activity not found" });
    }

    // 2️⃣ Files
    const files = await query(
      `SELECT file_path,file_type
       FROM activity_files
       WHERE activity_id = ? AND activity_date = ?`,
      [id, date]
    );

    // 3️⃣ Colleges
    const colleges = await query(
      `SELECT a.clg_id,b.clg_name
       FROM activity_colleges AS a 
       LEFT JOIN colleges AS b ON a.clg_id = b.clg_id
       WHERE activity_id = ? AND date = ?`,
      [id, date]
    );

    // 4️⃣ Departments
    const departments = await query(
      `SELECT a.dept_id,b.dept_name
       FROM activity_departments AS a 
       LEFT JOIN departments AS b ON a.dept_id = b.dept_id
       WHERE activity_id = ? AND activity_date = ?`,
      [id, date]
    );

    // 5️⃣ Locations
    const locations = await query(
      `SELECT lat,lng,address,city,state,pin
       FROM activity_locations
       WHERE activity_id = ? AND activity_date = ?`,
      [id, date]
    );

    // 6️⃣ Members
    const members = await query(
      `SELECT a.member_id, b.first_name, b.middle_name, b.last_name, CONCAT(b.first_name,' ',b.middle_name,' ', b.last_name) AS full_name
       FROM activity_members AS a
       LEFT JOIN mst_members AS b ON a.member_id = b.mem_id
       WHERE activity_id = ? AND activity_date = ?`,
      [id, date]
    );

    // 7️⃣ Teams
    const teams = await query(
      `SELECT a.team_id,b.name
       FROM activity_teams AS a 
       LEFT JOIN mst_team AS b ON a.team_id = b.id
       WHERE activity_id = ? AND activity_date = ?`,
      [id, date]
    );

    // 8️⃣ Sub Activities
    const subActivities = await query(
      `SELECT id,sr_no,task_id,title,start_time,end_time,notes,attachment
       FROM sub_activities
       WHERE activity_id = ? AND activity_date = ?
       ORDER BY sr_no`,
      [id, date]
    );

    res.status(200).json({
      activity: activity[0],
      files: files[0],
      colleges,
      departments,
      locations,
      members,
      teams,
      subActivities
    });

  } catch (error) {
    console.error("Get Activity Details Error:", error);

    res.status(500).json({
      message: "Failed to fetch activity details",
      error: error.message
    });
  }
};

export const updateActivity = async (req, res) => {
  try {

    const {
      activityId,
      activityDate,
      title,
      occasion,
      campaign,
      status,
      colleges = [],
      departments = [],
      locations = [],
      members = [],
      teams = [],
      subActivities = [],
      vehicleType,
      notes,
      startDate,
      endDate,
      userId
    } = req.body;

    if (!activityId || !activityDate) {
      return res.status(400).json({ message: "Please fill all required fields!" });
    }

    /* ==============================
       STEP 1 — Update Activity
    ============================== */

    await query(
      `UPDATE activities
       SET title=?,
           occasion_id=?,
           campaign_id=?,
           status = ?,
           start_date=?,
           end_date=?,
           vehicle_type=?,
           notes=?,
           u_at=NOW(),
           u_by=?
       WHERE id=? AND date=?`,
      [title, occasion, campaign, status, startDate, endDate, vehicleType, notes, userId, activityId, activityDate]
    );

    /* ==============================
       STEP 2 — Delete Old Child Data
    ============================== */

    await query(`DELETE FROM activity_colleges WHERE activity_id=? AND date=?`, [activityId, activityDate]);
    await query(`DELETE FROM activity_departments WHERE activity_id=? AND activity_date=?`, [activityId, activityDate]);
    await query(`DELETE FROM activity_locations WHERE activity_id=? AND activity_date=?`, [activityId, activityDate]);
    await query(`DELETE FROM activity_members WHERE activity_id=? AND activity_date=?`, [activityId, activityDate]);
    await query(`DELETE FROM activity_teams WHERE activity_id=? AND activity_date=?`, [activityId, activityDate]);
    await query(`DELETE FROM sub_activities WHERE activity_id=? AND activity_date=?`, [activityId, activityDate]);

    /* ==============================
       STEP 3 — Insert Colleges
    ============================== */

    for (const clg of colleges) {
      await query(
        `INSERT INTO activity_colleges (activity_id,date,clg_id)
         VALUES (?,?,?)`,
        [activityId, activityDate, clg.clg_id]
      );
    }

    /* ==============================
       STEP 4 — Insert Departments
    ============================== */

    for (const dept of departments) {
      await query(
        `INSERT INTO activity_departments
         (activity_id,activity_date,dept_id)
         VALUES (?,?,?)`,
        [activityId, activityDate, dept.dept_id]
      );
    }

    /* ==============================
       STEP 5 — Insert Locations
    ============================== */

    for (const loc of locations) {
      await query(
        `INSERT INTO activity_locations
         (activity_id,activity_date,lat,lng,address,city,state,pin)
         VALUES (?,?,?,?,?,?,?,?)`,
        [
          activityId,
          activityDate,
          loc.lat,
          loc.lng,
          loc.address,
          loc.city,
          loc.state,
          loc.pin
        ]
      );
    }

    /* ==============================
       STEP 6 — Insert Members
    ============================== */

    for (const member of members) {
      await query(
        `INSERT INTO activity_members
         (activity_id,activity_date,member_id)
         VALUES (?,?,?)`,
        [activityId, activityDate, member.id]
      );
    }

    /* ==============================
       STEP 7 — Insert Teams
    ============================== */

    for (const team of teams) {
      await query(
        `INSERT INTO activity_teams
         (activity_id,activity_date,team_id)
         VALUES (?,?,?)`,
        [activityId, activityDate, team.id]
      );
    }

    /* ==============================
       STEP 8 — Insert SubActivities
       FIXED: Using correct field names from frontend
    ============================== */

    for (let i = 0; i < subActivities.length; i++) {

      const sub = subActivities[i];
      const srNo = i + 1;
      await query(
        `INSERT INTO sub_activities
         (activity_id, activity_date, sr_no, task_id, title, start_time, end_time, notes)
         VALUES (?,?,?,?,?,?,?,?)`,
        [
          activityId,
          activityDate,
          srNo,
          sub.task_id,      // Changed from sub.taskId to sub.task_id
          sub.title,
          sub.start_time,   // Changed from sub.startTime to sub.start_time
          sub.end_time,     // Changed from sub.endTime to sub.end_time
          sub.notes
        ]
      );
    }

    /* ==============================
       STEP 9 — Response
    ============================== */

    res.json({
      message: "Activity updated successfully",
      activityId
    });

  } catch (error) {

    console.error("Update Activity Error:", error);

    res.status(500).json({
      message: "Failed to update activity",
      error: error.message
    });

  }
};