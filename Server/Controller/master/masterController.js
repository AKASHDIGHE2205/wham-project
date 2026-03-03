import db from '../../db.js';
import fs from "fs";
import path from "path";

//TEAM CONTROLLER
export const getAllTeams = (req, res) => {
  const { search = "", page = 1, limit = 5 } = req.query;

  const pageNum = Number(page);
  const limitNum = Number(limit);
  const offset = (pageNum - 1) * limitNum;

  let whereClause = "WHERE 1=1";
  const params = [];

  // 🔍 Search on team fields
  if (search) {
    whereClause += `
      AND (
        a.id LIKE ?
        OR a.name LIKE ?
        OR a.description LIKE ?
      )
    `;
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  // 1️⃣ COUNT QUERY (NO LIMIT / OFFSET)
  const countSql = `
    SELECT COUNT(*) AS total
    FROM mst_team AS a
    ${whereClause}
  `;

  // 2️⃣ DATA QUERY
  const dataSql = `
    SELECT 
      a.id,
      a.name,
      a.manager_id,
      a.description,
      a.status,
      CONCAT(
        b.first_name, ' ',
        IFNULL(b.middle_name,''), ' ',
        IFNULL(b.last_name,'')
      ) AS manager_name
    FROM mst_team AS a
    LEFT JOIN mst_members AS b ON a.manager_id = b.mem_id
    ${whereClause}
    ORDER BY a.id ASC
    LIMIT ? OFFSET ?
  `;

  db.query(countSql, params, (countErr, countResult) => {
    if (countErr) {
      console.error("Count error:", countErr);
      return res.status(500).json({ message: "Internal server error" });
    }

    const total = countResult[0].total;

    db.query(dataSql, [...params, limitNum, offset], (dataErr, results) => {
      if (dataErr) {
        console.error("Data error:", dataErr);
        return res.status(500).json({ message: "Internal server error" });
      }

      res.status(200).json({
        message: "Teams fetched successfully",
        teams: results,
        total
      });
    }
    );
  });
};
export const newTeam = async (req, res) => {
  const { name, managerId, description, status } = req.body;

  const sql = `
    INSERT INTO mst_team (id, name, manager_id, description, status)
    SELECT IFNULL(MAX(id), 0) + 1, ?, ?, ?, ?
    FROM mst_team
  `;

  db.query(sql, [name, managerId, description, status], (err, results) => {
    if (err) {
      console.error("Error creating team:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    return res.status(201).json({
      message: "New team added successfully",
      teamId: results.insertId || null
    });
  });
};
export const updateTeam = async (req, res) => {
  const { id, name, managerId, description, status } = req.body;
  // Validate required fields (optional)
  if (!id) {
    return res.status(400).json({ message: "Team ID is required" });
  }

  const sql = `
    UPDATE mst_team 
    SET name = ?, manager_id = ?, description = ?, status = ?
    WHERE id = ?
  `;

  db.query(sql, [name, managerId, description, status, id], (err, results) => {
    if (err) {
      console.error("Error updating team:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Team not found" });
    }

    return res.status(200).json({
      message: "Team updated successfully",
      updatedTeamId: id
    });
  });
};

// MEMBER CONTROLLER
export const getAllMembers = (req, res) => {
  const { search = "", page = 1, limit = 5 } = req.query;

  const pageNum = Number(page);
  const limitNum = Number(limit);
  const offset = (pageNum - 1) * limitNum;

  let whereClause = "WHERE 1=1";
  const params = [];

  // 🔍 Search filter
  if (search) {
    whereClause += `
      AND (
        a.first_name LIKE ?
        OR a.middle_name LIKE ?
        OR a.last_name LIKE ?
        OR a.email LIKE ?
        OR a.mobile LIKE ?
        OR a.address LIKE ?
      )
    `;
    params.push(
      `%${search}%`,
      `%${search}%`,
      `%${search}%`,
      `%${search}%`,
      `%${search}%`,
      `%${search}%`
    );
  }

  // 1️⃣ TOTAL COUNT (distinct members)
  const countSql = `
    SELECT COUNT(DISTINCT a.mem_id) AS total
    FROM mst_members AS a
    LEFT JOIN team_members AS b ON b.member_id = a.mem_id
    LEFT JOIN mst_team AS c ON b.team_id = c.id
    ${whereClause}
  `;

  db.query(countSql, params, (countErr, countResult) => {
    if (countErr) {
      console.error("Count error:", countErr);
      return res.status(500).json({ message: "Internal server error" });
    }

    const total = countResult[0].total;

    // 2️⃣ FETCH PAGINATED MEMBER IDS
    const memberIdSql = `
      SELECT DISTINCT a.mem_id
      FROM mst_members AS a
      LEFT JOIN team_members AS b ON b.member_id = a.mem_id
      LEFT JOIN mst_team AS c ON b.team_id = c.id
      ${whereClause}
      LIMIT ? OFFSET ?
    `;

    db.query(
      memberIdSql,
      [...params, limitNum, offset],
      (idErr, idResults) => {
        if (idErr) {
          console.error("ID fetch error:", idErr);
          return res.status(500).json({ message: "Internal server error" });
        }

        const memberIds = idResults.map(row => row.mem_id);

        // No data
        if (memberIds.length === 0) {
          return res.status(200).json({
            message: "Members fetched successfully",
            members: [],
            total
          });
        }

        // 3️⃣ FETCH FULL MEMBER DATA
        const dataSql = `
          SELECT 
            a.mem_id,
            CONCAT(
              a.first_name, ' ',
              IFNULL(a.middle_name,''), ' ',
              IFNULL(a.last_name,'')
            ) AS mem_name,
            a.mobile,
            a.email,
            a.birth_date,
            a.address,
            a.designation,
            a.isorganizer,
            a.status,
            b.team_id,
            c.name AS team_name
          FROM mst_members AS a
          LEFT JOIN team_members AS b ON b.member_id = a.mem_id
          LEFT JOIN mst_team AS c ON b.team_id = c.id
          WHERE a.mem_id IN (?)
          ORDER BY a.mem_id ASC
        `;

        db.query(dataSql, [memberIds], (dataErr, rows) => {
          if (dataErr) {
            console.error("Data fetch error:", dataErr);
            return res.status(500).json({ message: "Internal server error" });
          }

          // 4️⃣ GROUP TEAMS PER MEMBER
          const membersMap = {};

          rows.forEach(row => {
            if (!membersMap[row.mem_id]) {
              membersMap[row.mem_id] = {
                mem_id: row.mem_id,
                mem_name: row.mem_name,
                mobile: row.mobile,
                email: row.email,
                birth_date: row.birth_date,
                address: row.address,
                designation: row.designation,
                isorganizer: row.isorganizer,
                status: row.status,
                teams: []
              };
            }

            if (row.team_id) {
              membersMap[row.mem_id].teams.push({
                id: row.team_id,
                name: row.team_name
              });
            }
          });

          res.status(200).json({
            message: "Members fetched successfully",
            members: Object.values(membersMap),
            total
          });
        });
      }
    );
  });
};
export const addMember = (req, res) => {
  const { first_name, middle_name, last_name, mobile, email, address, designation, birth_date, isOrganizer, teams, gender } = req.body;

  try {
    /** ------------------------------------------
     * 1. Get MAX(mem_id) for new member
     * ------------------------------------------ */
    const sqlGetMaxMemId = `SELECT MAX(mem_id) AS maxMemId FROM mst_members`;
    db.query(sqlGetMaxMemId, (err, memResult) => {
      if (err) {
        console.error("Error getting max mem_id:", err);
        return res.status(500).json({ message: "Internal server error" });
      }

      const nextMemId = (memResult[0].maxMemId || 0) + 1;

      /** ------------------------------------------
       * 2. Insert new member with nextMemId
       * ------------------------------------------ */
      const sqlInsertMember = `
        INSERT INTO mst_members
          (mem_id, first_name, middle_name, last_name, gender, mobile, email, birth_date, address, designation, isorganizer, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      db.query(sqlInsertMember, [nextMemId, first_name, middle_name, last_name, gender, mobile, email, birth_date, address, designation, isOrganizer, "A",], (err, insertResult) => {
        if (err) {
          console.error("Error inserting member:", err);
          return res.status(500).json({ message: "Internal server error" });
        }

        // If no teams → finish here
        if (!teams || teams.length === 0) {
          return res.status(201).json({ message: "Member created successfully", memberId: nextMemId, });
        }

        /** ------------------------------------------
         * 3. Get MAX(id) from team_members
         * ------------------------------------------ */
        const sqlGetMaxTeamId = `SELECT MAX(id) AS maxTeamId FROM team_members`;
        db.query(sqlGetMaxTeamId, (err, teamResult) => {
          if (err) {
            console.error("Error getting max team_members.id:", err);
            return res.status(500).json({ message: "Internal server error" });
          }

          let nextTeamId = (teamResult[0].maxTeamId || 0) + 1;

          /** ------------------------------------------
           * 4. Insert multiple team-member entries
           * ------------------------------------------ */
          const sqlInsertTeamMembers = `INSERT INTO team_members (id, team_id, member_id) VALUES ?`;

          const values = teams.map((item) => [
            nextTeamId++,
            item.id,
            nextMemId,
          ]);

          db.query(sqlInsertTeamMembers, [values], (err2) => {
            if (err2) {
              console.error("Error inserting team-members:", err2);
              return res.status(500).json({ message: "Internal server error" });
            }

            return res.status(201).json({ message: "Member added successfully!", memberId: nextMemId, });
          });
        });
      }
      );
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
export const getMemberDetails = (req, res) => {
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
                  WHERE a.mem_id = ?
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
export const getUsers = (req, res) => {
  const sql = `
                SELECT  id,CONCAT(first_name,' ',middle_name ,' ',last_name) AS full_name, role
                FROM users
                WHERE is_verified = 'A'
              `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching teams:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    return res.status(200).json({
      message: "Users fetched successfully",
      users: results
    });
  })
}
export const updateMember = (req, res) => {
  try {
    const { mem_id, first_name, middle_name, last_name, mobile, email, gender, address, designation, birth_date, isOrganizer, role, user_id, teams } = req.body;

    /** ------------------------------------------
     * 1. Update mst_members table
     * ------------------------------------------ */
    const sql1 = `
      UPDATE mst_members 
      SET first_name=?, middle_name=?, last_name=?, gender = ?, mobile=?, email=?, address=?, 
          designation=?, birth_date=?, isOrganizer=?, user_id=?
      WHERE mem_id = ?
    `;

    db.query(sql1, [first_name, middle_name, last_name, gender, mobile, email, address, designation, birth_date, isOrganizer, user_id, mem_id], (err) => {
      if (err) {
        console.error("Error updating member:", err);
        return res.status(500).json({ message: "Internal server error" });
      }

      /** ------------------------------------------
       * 2. ALWAYS DELETE EXISTING TEAM MEMBERS
       * ------------------------------------------ */
      const sqlDeleteTeams = `DELETE FROM team_members WHERE member_id = ?`;

      db.query(sqlDeleteTeams, [mem_id], (err) => {
        if (err) {
          console.error("Error deleting team members:", err);
          return res.status(500).json({ message: "Internal server error" });
        }

        /** If teams = [] → Do NOT insert new teams, directly update role */
        if (!teams || teams.length === 0) {
          return updateUserRole();
        }

        /** ------------------------------------------
         * 3. Get MAX(id) from team_members
         * ------------------------------------------ */
        const sqlGetMaxTeamId = `SELECT MAX(id) AS maxTeamId FROM team_members`;

        db.query(sqlGetMaxTeamId, (err, result) => {
          if (err) {
            console.error("Error getting max id:", err);
            return res.status(500).json({ message: "Internal server error" });
          }

          let nextTeamId = (result[0].maxTeamId || 0) + 1;

          /** ------------------------------------------
           * 4. Insert new teams
           * ------------------------------------------ */
          const sqlInsertTeamMembers =
            `INSERT INTO team_members (id, team_id, member_id) VALUES ?`;

          const values = teams.map((item) => [
            nextTeamId++,
            item.team_id,
            mem_id
          ]);

          db.query(sqlInsertTeamMembers, [values], (err2) => {
            if (err2) {
              console.error("Error inserting team-members:", err2);
              return res.status(500).json({ message: "Internal server error" });
            }

            return updateUserRole();
          });
        });
      });
    });

    /** ------------------------------------------
     * 5. Update user role
     * ------------------------------------------ */
    function updateUserRole() {
      const findUserSql = `SELECT user_id FROM mst_members WHERE mem_id = ?`;

      db.query(findUserSql, [mem_id], (err, result) => {
        if (err) {
          console.error("Error finding user:", err);
          return res.status(500).json({ message: "Internal server error" });
        }

        const uid = result[0]?.user_id || user_id;

        if (!uid) {
          return res.status(200).json({
            message: "Member updated successfully (no user account linked)",
          });
        }

        const sqlUserUpdate = `UPDATE users SET role = ? WHERE id = ?`;

        db.query(sqlUserUpdate, [role, uid], (err2) => {
          if (err2) {
            console.error("Error updating user role:", err2);
            return res.status(500).json({ message: "Internal server error" });
          }

          return res.status(200).json({
            message: "Member updated successfully!",
            memberId: mem_id,
          });
        });
      });
    }

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

//TASk CONTROLLER
export const getAllTasks = (req, res) => {
  const { search = "", page = 1, limit = 5 } = req.query;

  const pageNum = Number(page);
  const limitNum = Number(limit);
  const offset = (pageNum - 1) * limitNum;

  let whereClause = "WHERE 1=1";
  const params = [];

  if (search) {
    whereClause += `
      AND (
        a.id LIKE ?
        OR a.task_name LIKE ?
        OR a.task_desc LIKE ?
      )
    `;
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  // 🔹 Count Query (NO LIMIT / OFFSET)
  const countSql = `
    SELECT COUNT(*) AS total
    FROM mst_tasks AS a
    LEFT JOIN mst_steps AS b ON a.step_id = b.id
    ${whereClause}
  `;

  // 🔹 Data Query
  const dataSql = `
    SELECT 
      a.id,
      a.task_name,
      a.task_desc,
      a.step_id,
      b.step_name,
      a.status
    FROM mst_tasks AS a
    LEFT JOIN mst_steps AS b ON a.step_id = b.id
    ${whereClause}
    LIMIT ? OFFSET ?
  `;

  // 1️⃣ Get total count
  db.query(countSql, params, (countErr, countResult) => {
    if (countErr) {
      console.error("Error counting tasks:", countErr);
      return res.status(500).json({ message: "Count failed" });
    }

    const total = countResult[0].total;

    // 2️⃣ Get paginated data
    db.query(
      dataSql,
      [...params, limitNum, offset],
      (dataErr, results) => {
        if (dataErr) {
          console.error("Error fetching tasks:", dataErr);
          return res.status(500).json({ message: "Internal server error" });
        }

        res.status(200).json({
          message: "Tasks fetched successfully",
          tasks: results,
          total: total, // ✅ REAL TOTAL
        });
      }
    );
  });
};
export const addTask = (req, res) => {
  const { taskName, description, stepId, status } = req.body;
  const sql = ` 
                INSERT INTO mst_tasks (id, task_name, task_desc, step_id,status )
                SELECT IFNULL(MAX(id), 0) + 1, ?, ?, ?, ?
                FROM mst_tasks
              `;
  db.query(sql, [taskName, description, stepId, status], (err, results) => {
    if (err) {
      console.error("Error adding task:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
    return res.status(201).json({
      message: "Task added successfully",
      taskId: results.insertId || null
    });
  }
  );
}
export const updateTask = (req, res) => {
  const { taskId, taskName, description, stepId, status } = req.body;

  const sql = `
                UPDATE mst_tasks SET task_name=?, task_desc = ?, status = ?, step_id = ?
                WHERE id = ?
              `;
  db.query(sql, [taskName, description, status, stepId, taskId], (err, results) => {
    if (err) {
      console.error("Error updating task:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Task not found" });
    }
    return res.status(200).json({
      message: "Task updated successfully",
    });
  }
  )
}

// STEP CONTROLLER
export const addStep = (req, res) => {
  const { stepName, description, status } = req.body;
  const sql = `
                INSERT INTO mst_steps (id, step_name, step_desc, status)
                SELECT IFNULL(MAX(id), 0) + 1, ?, ?, ?
                FROM mst_steps
              `;
  db.query(sql, [stepName, description, status], (err, results) => {
    if (err) {
      console.error("Error adding step:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
    return res.status(201).json({
      message: "Step added successfully",
      stepId: results.insertId || null
    });
  });
}
export const updateStep = (req, res) => {
  const { id, stepName, description, status } = req.body;
  const sql = `
                UPDATE mst_steps  
                SET step_name = ?, step_desc = ?, status = ?
                WHERE id = ?
              `;
  db.query(sql, [stepName, description, status, id], (err, results) => {
    if (err) {
      console.error("Error updating step:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Step not found" });
    }
    return res.status(200).json({
      message: "Step updated successfully",
      updatedStepId: id
    });
  }
  )
}
export const getAllSteps = (req, res) => {
  const { search = "", page = 1, limit = 5 } = req.query;

  const pageNum = Number(page);
  const limitNum = Number(limit);
  const offset = (pageNum - 1) * limitNum;

  let whereClause = "WHERE 1=1";
  const params = [];

  if (search) {
    whereClause += `
      AND (
        id LIKE ?
        OR step_name LIKE ?
        OR step_desc LIKE ?
      )
    `;
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  // 🔹 Data Query
  const dataSql = `
    SELECT id, step_name, step_desc, status
    FROM mst_steps
    ${whereClause}
    LIMIT ? OFFSET ?
  `;

  // 🔹 Count Query
  const countSql = `
    SELECT COUNT(*) AS total
    FROM mst_steps
    ${whereClause}
  `;

  // First get total count
  db.query(countSql, params, (countErr, countResult) => {
    if (countErr) {
      return res.status(500).json({ message: "Count failed" });
    }

    const total = countResult[0].total;

    // Then get paginated data
    db.query(
      dataSql,
      [...params, limitNum, offset],
      (dataErr, results) => {
        if (dataErr) {
          return res.status(500).json({ message: "Data fetch failed" });
        }

        res.status(200).json({
          message: "Steps fetched successfully",
          steps: results,
          total: total, // ✅ CORRECT TOTAL
        });
      }
    );
  });
};

// SIDEBAR MEMBER CONTROLLER
export const getAllSidebarMembers = (req, res) => {
  const { from_date, to_date, userId, role } = req.body;
  const adminRoles = ["Admin", "Master", "Manager"];

  if (!from_date || !to_date) {
    return res.status(400).json({ message: "from_date and to_date required" });
  }

  const fetchData = (limitToMemId = null) => {

    /** STEP 1: Get all members involved in events **/
    let membersSql = `
      SELECT DISTINCT m.mem_id,
        CONCAT(m.first_name, ' ', m.middle_name, ' ', m.last_name) AS mem_name,
        m.mobile, m.email, m.birth_date, m.address,
        m.designation, m.isorganizer, m.status
      FROM mst_members m
      WHERE m.mem_id IN (
          SELECT DISTINCT em.member_id
          FROM event_member em
          JOIN event_hd eh 
            ON eh.id = em.event_id
           AND eh.event_date = em.event_date
           AND eh.isdeleted = 'N'
           AND eh.from_date <= ? 
           AND eh.to_date >= ?

          UNION

          SELECT DISTINCT tm.member_id
          FROM team_members tm
          JOIN event_team et ON et.team_id = tm.team_id
          JOIN event_hd eh 
            ON eh.id = et.event_id
           AND eh.event_date = et.event_date
           AND eh.isdeleted = 'N'
           AND eh.from_date <= ? 
           AND eh.to_date >= ?
      )
    `;

    const params = [to_date, from_date, to_date, from_date];

    if (limitToMemId) {
      membersSql += " AND m.user_id = ? ";
      params.push(limitToMemId);
    }

    db.query(membersSql, params, (err, members) => {
      if (err) {
        return res.status(500).json({ message: "Member fetch error" });
      }

      if (!members.length) {
        return res.status(200).json({ message: "No members", members: [] });
      }

      /** STEP 2: Fetch event stats **/
      const statsSql = `
        SELECT
          x.mem_id,
          COUNT(DISTINCT CONCAT(x.event_id,'_',x.event_date)) AS total_events,
          COUNT(DISTINCT CONCAT(em2.event_id,'_',em2.event_date)) AS completed_events
        FROM (
            SELECT DISTINCT em.member_id AS mem_id, em.event_id, em.event_date
            FROM event_member em
            JOIN event_hd eh 
              ON eh.id = em.event_id
             AND eh.event_date = em.event_date
             AND eh.isdeleted = 'N'
             AND eh.from_date <= ? 
             AND eh.to_date >= ?

            UNION

            SELECT DISTINCT tm.member_id AS mem_id, et.event_id, et.event_date
            FROM team_members tm
            JOIN event_team et ON et.team_id = tm.team_id
            JOIN event_hd eh 
              ON eh.id = et.event_id
             AND eh.event_date = et.event_date
             AND eh.isdeleted = 'N'
             AND eh.from_date <= ? 
             AND eh.to_date >= ?
        ) x
        LEFT JOIN event_media em2
          ON em2.mem_id = x.mem_id
         AND em2.event_id = x.event_id
         AND em2.event_date = x.event_date
        GROUP BY x.mem_id
      `;

      db.query(statsSql, params, (err, stats) => {
        if (err) {
          return res.status(500).json({ message: "Stats error" });
        }

        const statsMap = {};
        stats.forEach(s => {
          statsMap[s.mem_id] = {
            total_events: s.total_events,
            completed_events: s.completed_events,
            pending_events: s.total_events - s.completed_events
          };
        });

        const final = members.map(m => ({
          ...m,
          ...(statsMap[m.mem_id] || {
            total_events: 0,
            completed_events: 0,
            pending_events: 0
          })
        }));

        res.status(200).json({
          message: "Members fetched successfully",
          members: final
        });
      });
    });
  };

  /** ROLE FLOW **/
  if (adminRoles.includes(role)) {
    fetchData();
  }

  else if (role === "User") {
    fetchData(userId);
  }

  else {
    return res.status(403).json({ message: "Unauthorized role" });
  }
};
export const getAllUsers = (req, res) => {
  const { search = "", page = 1, limit = 5 } = req.query;

  const pageNum = Number(page);
  const limitNum = Number(limit);
  const offset = (pageNum - 1) * limitNum;

  let whereClause = "WHERE 1=1";
  const params = [];

  // 🔍 Search filter
  if (search) {
    whereClause += `
      AND (
        first_name LIKE ?
        OR middle_name LIKE ?
        OR last_name LIKE ?
        OR email LIKE ?
        OR phone LIKE ?
        OR role LIKE ?
      )
    `;
    params.push(
      `%${search}%`,
      `%${search}%`,
      `%${search}%`,
      `%${search}%`,
      `%${search}%`,
      `%${search}%`
    );
  }

  // 1️⃣ TOTAL COUNT (filtered)
  const countSql = `
    SELECT COUNT(*) AS total
    FROM users
    ${whereClause}
  `;

  db.query(countSql, params, (countErr, countResult) => {
    if (countErr) {
      console.error("Count error:", countErr);
      return res.status(500).json({ message: "Internal server error" });
    }

    const total = countResult[0].total;

    // 2️⃣ FETCH USERS (paginated)
    const dataSql = `
      SELECT
        id AS user_id,
        CONCAT(
          first_name, ' ',
          IFNULL(middle_name,''), ' ',
          IFNULL(last_name,'')
        ) AS full_name,
        role,
        email,
        phone,
        is_verified,
        isorganizer
      FROM users
      ${whereClause}
      ORDER BY id DESC
      LIMIT ? OFFSET ?
    `;

    // 3️⃣ ACTIVE / INACTIVE COUNTS
    const statusCountSql = `
      SELECT
        SUM(is_verified = 'A') AS active,
        SUM(is_verified = 'I') AS inactive
      FROM users
    `;

    db.query(dataSql, [...params, limitNum, offset], (dataErr, rows) => {
      if (dataErr) {
        console.error("Data fetch error:", dataErr);
        return res.status(500).json({ message: "Internal server error" });
      }

      db.query(statusCountSql, (statusErr, statusResult) => {
        if (statusErr) {
          console.error("Status count error:", statusErr);
          return res.status(500).json({ message: "Internal server error" });
        }

        res.status(200).json({
          message: "Users fetched successfully",
          users: rows,
          total,
          active: statusResult[0].active,
          inactive: statusResult[0].inactive,
          page: pageNum,
          limit: limitNum
        });
      });
    });
  });
};
export const activateUser = (req, res) => {
  const { user_id, role, is_verified, isorganizer } = req.body;

  const sql = `UPDATE users SET is_verified = ?, role = ?, isorganizer = ? WHERE id = ?`;

  db.query(sql, [is_verified, role, isorganizer, user_id], (err, results) => {
    if (err) {
      console.error("Error activating user:", err);
      return res.status(500).json({ message: "Failed to update the user. Please try again later." });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.status(200).json({ message: `User has been successfully updated!` });
  });
};


export const addUniversity = async (req, res) => {
  try {
    const { name, status, c_by, locations } = req.body;
    const file = req.file;

    if (!name || !status || !locations) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // ✅ Parse locations array
    const locationArr = typeof locations === "string" ? JSON.parse(locations) : locations;

    const { address, lat, lng, city = "", state = "", pin = null } = locationArr[0];

    // ✅ File save
    let savedFilePath = null;

    if (file) {
      const basePath = "D:/Projects/Wham/Server/uploads";
      const uniFolder = path.join(basePath, "universities");

      if (!fs.existsSync(uniFolder)) {
        fs.mkdirSync(uniFolder, { recursive: true });
      }

      const ext = path.extname(file.originalname);
      const fileName = `${name}_${Date.now()}${ext}`;
      const fullPath = path.join(uniFolder, fileName);

      fs.writeFileSync(fullPath, file.buffer);
      savedFilePath = `/uploads/universities/${fileName}`;
    }

    const sql = `
      INSERT INTO universities(id, name, address, city, state, pin, lat, lng, photo, status, c_by, c_at)
      SELECT IFNULL(MAX(id), 0) + 1,?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW()
      FROM universities
    `;

    const values = [name, address, city, state, pin, lat, lng, savedFilePath, status, c_by];

    await db.query(sql, values);

    return res.status(201).json({
      message: "University added successfully"
    });

  } catch (error) {
    console.error("Add University Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
export const getAllUniversities = (req, res) => {
  const { search = "", page = 1, limit = 5 } = req.query;

  const pageNum = Number(page);
  const limitNum = Number(limit);
  const offset = (pageNum - 1) * limitNum;

  let whereClause = "WHERE 1=1";
  const params = [];

  if (search) {
    whereClause += `
      AND (
        id LIKE ?
        OR name LIKE ?
        OR city LIKE ?
        OR address LIKE ?
      )
    `;
    params.push(
      `%${search}%`,
      `%${search}%`,
      `%${search}%`,
      `%${search}%`
    );
  }

  // 🔹 Data Query
  const dataSql = `
    SELECT id, name, address, city, lat, lng, photo, status, c_by, c_at
    FROM universities
    ${whereClause}
    LIMIT ? OFFSET ?
  `;

  const countSql = `
    SELECT COUNT(*) AS total
    FROM universities
    ${whereClause}
  `;

  // 🔹 Get total count first
  db.query(countSql, params, (countErr, countResult) => {
    if (countErr) {
      console.error("University Count Error:", countErr);
      return res.status(500).json({ message: "Count failed" });
    }

    const total = countResult[0].total;

    // 🔹 Get paginated data
    db.query(dataSql, [...params, limitNum, offset], (dataErr, results) => {
      if (dataErr) {
        console.error("University Fetch Error:", dataErr);
        return res.status(500).json({ message: "Data fetch failed" });
      }

      res.status(200).json({
        message: "Universities fetched successfully",
        universities: results,
        total: total
      });
    }
    );
  });
};
export const getUniversityDetails = (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT id, name, address, city, status, photo, lat, lng
    FROM universities
    WHERE id = ?
  `;

  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error("University Fetch Error:", err);
      return res.status(500).json({ message: "Data fetch failed" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "University not found" });
    }

    res.status(200).json(results[0]);
  });
};
export const updateUniversity = (req, res) => {
  const { id, name, status, locations } = req.body;

  if (!id) {
    return res.status(400).json({ message: "University id is required" });
  }

  let locationArr = [];

  try {
    locationArr = typeof locations === "string" ? JSON.parse(locations) : locations;
  } catch (e) {
    return res.status(400).json({ message: "Invalid location format" });
  }

  if (!Array.isArray(locationArr) || locationArr.length === 0) {
    return res.status(400).json({ message: "Location data is missing" });
  }

  const { address = "", lat = null, lng = null } = locationArr[0];
  const city = address.split(",").pop()?.trim() || "";

  const sql = `
    UPDATE universities
    SET name = ?, address = ?, city = ?, lat = ?, lng = ?, status = ?
    WHERE id = ?
  `;

  db.query(sql, [name, address, city, lat, lng, status, id], (err, results) => {
    if (err) {
      console.error("University Update Error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "University not found" });
    }

    return res.status(200).json({ message: "University updated successfully" });
  }
  );
};
export const getActiveUniversities = (req, res) => {
  const dataSql = `
    SELECT id, name, address, city, lat, lng, photo, status, c_by, c_at
    FROM universities
    WHERE status = 'A'
  `;
  db.query(dataSql, (Err, Result) => {
    if (Err) {
      console.error("University fetch Error:", Err);
      return res.status(500).json({ message: "Count failed" });
    }
    return res.status(200).json({ Result })
  });
};


export const addCollege = async (req, res) => {
  try {
    const { name, status, uniId, totalStudents = 0, c_by, locations } = req.body;
    const file = req.file;
    const totalStudentsNum = Number(totalStudents) || 0;
    console.log("Received college data:", { name, status, uniId, totalStudents, locations });
    if (!name || !status || !uniId || !locations) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const locationArr = typeof locations === "string" ? JSON.parse(locations) : locations;

    const { address = "", lat = null, lng = null, city = "", state = "", pin = null } = locationArr[0];
    const pinNum = Number(pin) || null;

    // ✅ File save
    let savedFilePath = null;

    if (file) {
      const basePath = "D:/Projects/Wham/Server/uploads";
      const clgFolder = path.join(basePath, "colleges");

      if (!fs.existsSync(clgFolder)) {
        fs.mkdirSync(clgFolder, { recursive: true });
      }

      const ext = path.extname(file.originalname);
      const fileName = `${Date.now()}_${name}${ext}`;
      const fullPath = path.join(clgFolder, fileName);

      fs.writeFileSync(fullPath, file.buffer);
      savedFilePath = `/uploads/colleges/${fileName}`;
    }

    // ✅ IMPORTANT PART (manual clg_id)
    const sql = `
INSERT INTO colleges
  (clg_id, university_id, clg_name, clg_address, state, city, pin, total_students, clg_photo, lat, lng, status, c_at, c_by)
SELECT IFNULL(MAX(clg_id), 0) + 1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?
FROM colleges
`;

    const values = [uniId, name, address, state, city, pinNum, totalStudentsNum, savedFilePath, lat, lng, status, c_by];

    await db.query(sql, values);

    return res.status(201).json({ message: "College added successfully" });

  } catch (error) {
    console.error("Add College Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
export const getAllColleges = (req, res) => {
  const { search = "", page = 1, limit = 5 } = req.query;

  const pageNum = Number(page);
  const limitNum = Number(limit);
  const offset = (pageNum - 1) * limitNum;

  let whereClause = "WHERE 1=1";
  const params = [];

  if (search) {
    whereClause += `
      AND (
        c.clg_id LIKE ?
        OR c.clg_name LIKE ?
        OR c.clg_address LIKE ?
        OR c.university_id LIKE ?
        OR u.name LIKE ?
      )
    `;
    params.push(
      `%${search}%`,
      `%${search}%`,
      `%${search}%`,
      `%${search}%`,
      `%${search}%`
    );
  }

  // 🔹 Data Query
  const dataSql = `
    SELECT
      c.clg_id,
      c.university_id,
      c.clg_name AS name,
      c.clg_address,
      c.total_students,
      c.clg_photo AS photo,
      c.lat,
      c.lng,
      c.status,
      c.c_by,
      c.c_at,
      u.name AS university_name
    FROM colleges AS c
    LEFT JOIN universities AS u ON c.university_id = u.id
    ${whereClause}
    LIMIT ? OFFSET ?
  `;

  // 🔹 Count Query (same JOIN + filters)
  const countSql = `
    SELECT COUNT(*) AS total
    FROM colleges AS c
    LEFT JOIN universities AS u ON c.university_id = u.id
    ${whereClause}
  `;

  // 🔹 Get total count
  db.query(countSql, params, (countErr, countResult) => {
    if (countErr) {
      console.error("College Count Error:", countErr);
      return res.status(500).json({ message: "Count failed" });
    }

    const total = countResult[0].total;

    // 🔹 Get paginated data
    db.query(
      dataSql,
      [...params, limitNum, offset],
      (dataErr, results) => {
        if (dataErr) {
          console.error("College Fetch Error:", dataErr);
          return res.status(500).json({ message: "Data fetch failed" });
        }

        res.status(200).json({
          message: "Colleges fetched successfully",
          colleges: results,
          total,
          page: pageNum,
          limit: limitNum
        });
      }
    );
  });
};
export const getCollegeDetails = (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT
      c.clg_id,
      c.university_id,
      u.name AS university_name,
      c.clg_name,
      c.clg_address,
      c.total_students,
      c.clg_photo,
      c.lat,
      c.lng,
      c.status,
      c.c_by,
      c.c_at
    FROM colleges AS c
    LEFT JOIN universities AS u
      ON c.university_id = u.id
    WHERE c.clg_id = ?
  `;

  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error("College Fetch Error:", err);
      return res.status(500).json({ message: "Data fetch failed" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "College not found" });
    }

    res.status(200).json({
      message: "College details fetched successfully",
      college: results[0]
    });
  });
};
export const updateCollege = (req, res) => {
  const { id, name, status, locations, totalStudents, uniId } = req.body;

  if (!id) {
    return res.status(400).json({ message: "College id is required" });
  }

  let locationArr = [];

  try {
    locationArr = typeof locations === "string" ? JSON.parse(locations) : locations;
  } catch (e) {
    return res.status(400).json({ message: "Invalid location format" });
  }

  if (!Array.isArray(locationArr) || locationArr.length === 0) {
    return res.status(400).json({ message: "Location data is missing" });
  }

  const { address = "", lat = null, lng = null, city = "", state = "", pin = null } = locationArr[0];

  const sql = `
    UPDATE colleges
    SET
      university_id = ?,
      clg_name = ?,
      clg_address = ?,
      city = ?,
      state = ?,
      pin = ?,
      total_students = ?,
      lat = ?,
      lng = ?,
      status = ?
    WHERE clg_id = ?
  `;

  db.query(sql, [uniId, name, address, city, state, pin, totalStudents, lat, lng, status, id], (err, results) => {
    if (err) {
      console.error("College Update Error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "College not found" });
    }

    return res.status(200).json({ message: "College updated successfully" });
  }
  );
};
export const getActiveColleges = (req, res) => {
  const dataSql = `
    SELECT
      clg_id,
      clg_name,
      clg_address,
      total_students,
      clg_photo,
      lat,
      lng,
      status,
      c_by,
      c_at
    FROM colleges
    WHERE status = 'A'
  `;

  db.query(dataSql, (err, result) => {
    if (err) {
      console.error("Get Active Colleges Error:", err);
      return res.status(500).json({ message: "Failed to fetch colleges" });
    }

    return res.status(200).json({ success: true, data: result, });
  });
};

export const addDepartment = (req, res) => {
  const { clg_id, dept_name, student_strength, status } = req.body;

  const sql = `
    INSERT INTO departments (dept_id, clg_id, dept_name, student_strength, status)
    SELECT IFNULL(MAX(dept_id), 0) + 1, ?, ?, ?, ?
    FROM departments
  `;

  db.query(sql, [clg_id, dept_name, student_strength, status], (err, results) => {
    if (err) {
      console.error("Error adding department:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    return res.status(201).json({
      message: "Department added successfully",
      deptId: results.insertId || null,
    });
  }
  );
};
export const getAllDepartments = (req, res) => {
  const { search = "", page = 1, limit = 5 } = req.query;

  const pageNum = Number(page);
  const limitNum = Number(limit);
  const offset = (pageNum - 1) * limitNum;

  let whereClause = "WHERE 1=1";
  const params = [];

  if (search) {
    whereClause += `
      AND (
        d.dept_id LIKE ?
        OR d.dept_name LIKE ?
      )
    `;
    params.push(`%${search}%`, `%${search}%`);
  }

  // 🔹 Data Query with LEFT JOIN
  const dataSql = `
    SELECT
      d.dept_id,
      d.dept_name,
      d.student_strength,
      d.status,
      d.clg_id,
      c.clg_name
    FROM departments d
    LEFT JOIN colleges c ON d.clg_id = c.clg_id
    ${whereClause}
    LIMIT ? OFFSET ?
  `;

  // 🔹 Count Query
  const countSql = `
    SELECT COUNT(*) AS total
    FROM departments d
    LEFT JOIN colleges c ON d.clg_id = c.clg_id
    ${whereClause}
  `;

  // First get total count
  db.query(countSql, params, (countErr, countResult) => {
    if (countErr) {
      console.error("Count error:", countErr);
      return res.status(500).json({ message: "Count failed" });
    }

    const total = countResult[0].total;

    // Then get paginated data
    db.query(dataSql, [...params, limitNum, offset], (dataErr, results) => {
      if (dataErr) {
        console.error("Data fetch error:", dataErr);
        return res.status(500).json({ message: "Data fetch failed" });
      }

      return res.status(200).json({
        message: "Departments fetched successfully",
        departments: results,
        total,
      });
    }
    );
  });
};
export const updateDepartment = (req, res) => {
  const { dept_id, clg_id, dept_name, student_strength, status } = req.body;

  const sql = `
    UPDATE departments
    SET clg_id = ?, dept_name = ?, student_strength = ?, status = ?
    WHERE dept_id = ?
  `;

  db.query(sql, [clg_id, dept_name, student_strength, status, dept_id], (err, results) => {
    if (err) {
      console.error("Error updating department:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Department not found" });
    }

    return res.status(200).json({
      message: "Department updated successfully",
      updatedDeptId: dept_id,
    });
  }
  );
};