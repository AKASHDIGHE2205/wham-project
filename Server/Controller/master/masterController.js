import db from '../../db.js';

export const getAllTeams = (req, res) => {
  const sql = `SELECT a.id,a.name,a.manager_id,a.description,a.status,
               CONCAT(b.first_name, ' ', b.middle_name, ' ', b.last_name) AS manager_name
               FROM mst_team AS a
               LEFT JOIN mst_members AS b on a.manager_id = b.mem_id
               `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching teams:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    return res.status(200).json({
      message: "Teams fetched successfully",
      teams: results
    });
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

export const getAllmembers = (req, res) => {
  const sql = `
      SELECT 
        a.mem_id,
        CONCAT(a.first_name, ' ', a.middle_name, ' ', a.last_name) AS mem_name,
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
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    // Group by member
    const membersMap = {};

    results.forEach(row => {
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

    const finalData = Object.values(membersMap);

    res.status(200).json({ message: "Members fetched successfully", members: finalData });
  });
};

export const addMember = (req, res) => {
  const { first_name, middle_name, last_name, mobile, email, address, designation, birth_date, isOrganizer, teams, } = req.body;

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
          (mem_id, first_name, middle_name, last_name, mobile, email, birth_date, address, designation, isorganizer, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      db.query(sqlInsertMember, [nextMemId, first_name, middle_name, last_name, mobile, email, birth_date, address, designation, isOrganizer, "A",], (err, insertResult) => {
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
                         a.designation,a.isorganizer,a.status,a.user_id, b.role,c.team_id,d.name,
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
                SELECT  id,CONCAT(first_name,' ',middle_name ,' ',last_name) AS full_name
                FROM users
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
    const {
      mem_id, first_name, middle_name, last_name, mobile, email,
      address, designation, birth_date, isOrganizer, role, user_id, teams
    } = req.body;

    /** ------------------------------------------
     * 1. Update mst_members table
     * ------------------------------------------ */
    const sql1 = `
      UPDATE mst_members 
      SET first_name=?, middle_name=?, last_name=?, mobile=?, email=?, address=?, 
          designation=?, birth_date=?, isOrganizer=?, user_id=?
      WHERE mem_id = ?
    `;

    db.query(sql1, [
      first_name, middle_name, last_name, mobile, email,
      address, designation, birth_date, isOrganizer, user_id, mem_id
    ], (err) => {
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

export const getAllSidebarMembers = (req, res) => {
  const sql = `
      SELECT 
        a.mem_id,
        CONCAT(a.first_name, ' ', a.middle_name, ' ', a.last_name) AS mem_name,
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
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    // Group by member
    const membersMap = {};

    results.forEach(row => {
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

    const finalData = Object.values(membersMap);

    res.status(200).json({ message: "Members fetched successfully", members: finalData });
  });
};

export const getAllTasks = (req, res) => {
  const sql = `
                SELECT a.id,a.task_name,a.task_desc,a.step_id,b.step_name,a.status
                FROM mst_tasks AS a 
                LEFT JOIN mst_steps AS b ON a.step_id = b.id
              `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching tasks:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
    return res.status(200).json({
      message: "Tasks fetched successfully",
      tasks: results
    });
  }
  );
}

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
  const sql = `
                SELECT id,step_name,step_desc,status
                FROM mst_steps
              `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching steps:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
    return res.status(201).json({
      message: "Steps fetched successfully",
      steps: results
    });
  }
  );
}