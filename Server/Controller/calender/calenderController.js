import db from '../../db.js';

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
    const isapproved = "P";
    const isdeleted = "N";
    const approvedBy = null;

    if (!title || !fromDate || !toDate || !userId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Insert into event_hd
    const hdSQL = `
      INSERT INTO event_hd
      (title, description, from_date, to_date, team_id, isapproved, type, isdeleted, created_by, approved_by, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const primaryTeam = teamsId.length > 0 ? teamsId[0] : null;

    db.query(
      hdSQL,
      [title, description, fromDate, toDate, primaryTeam, isapproved, type, isdeleted, userId, approvedBy, createdAt],
      (err, result) => {
        if (err) {
          console.error("❌ event_hd insert error:", err);
          return res.status(500).json({ message: "Internal Server Error" });
        }

        const eventId = result.insertId;

        // 1️⃣ Insert event_team
        if (teamsId.length > 0) {
          const teamValues = teamsId.map(id => [eventId, id]);
          const teamSQL = `INSERT INTO event_team (event_id, team_id) VALUES ?`;

          db.query(teamSQL, [teamValues], err => {
            if (err) {
              console.error("❌ event_team insert error:", err);
              return res.status(500).json({ message: "Failed inserting teams" });
            }
            insertMembers();
          });
        } else {
          insertMembers();
        }

        // 2️⃣ Insert event_member
        const insertMembers = () => {
          const memberIds = members.map(m => m.id);

          if (memberIds.length === 0) {
            return insertLocations();
          }

          const memberValues = memberIds.map(id => [eventId, id]);
          const memberSQL = `INSERT INTO event_member (event_id, member_id) VALUES ?`;

          db.query(memberSQL, [memberValues], err => {
            if (err) {
              console.error("❌ event_member insert error:", err);
              return res.status(500).json({ message: "Failed inserting members" });
            }
            insertLocations();
          });
        };

        // 3️⃣ Insert event_loc
        const insertLocations = () => {
          if (locations.length === 0) {
            return res.status(201).json({ message: "Event created successfully!", eventId });
          }

          // Helper to extract city + postal code
          const parseAddress = (fullAddress) => {
            let parts = fullAddress.split(",");
            let postal = null;
            let city = null;

            // Try to extract pin code (Indian-style)
            const pinMatch = fullAddress.match(/\b\d{6}\b/);
            if (pinMatch) postal = pinMatch[0];

            // City is usually the item before "India"
            if (parts.length >= 3) {
              city = parts[parts.length - 2]?.trim();
            }

            return { city, postal };
          };

          const locationValues = locations.map(loc => {
            const { city, postal } = parseAddress(loc.address);
            return [
              eventId,
              loc.address,
              loc.lng,
              loc.lat,
              city,
              postal
            ];
          });

          const locSQL = `
            INSERT INTO event_loc
            (event_id, address, lng, lat, city, postal_code)
            VALUES ?
          `;

          db.query(locSQL, [locationValues], err => {
            if (err) {
              console.error("❌ event_loc insert error:", err);
              return res.status(500).json({ message: "Failed inserting locations" });
            }

            res.status(201).json({ message: "Event created successfully!", eventId });
          });
        };
      }
    );
  } catch (err) {
    console.error("🔥 Exception:", err);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const getEvents = (req, res) => {
  const { userId } = req.body;

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

    // STEP 2: Get all team_ids the user belongs to
    const getTeamsQuery = `
      SELECT team_id 
      FROM team_members 
      WHERE member_id = ?
    `;

    db.query(getTeamsQuery, [memberId], (err, teamsData) => {
      if (err) return res.status(500).json({ message: "Internal server error", err });

      const userTeamIds = teamsData.map(t => t.team_id);

      // STEP 3: Build Dynamic Conditions
      let conditions = `
        eh.id IN (SELECT event_id FROM event_member WHERE member_id = ?)
      `;
      let params = [memberId];

      if (userTeamIds.length > 0) {
        conditions += `
          OR eh.id IN (
            SELECT event_id FROM event_team WHERE team_id IN (?)
          )
        `;
        params.push(userTeamIds);
      }

      // FINAL SQL (Including event_loc)
      const sql = `
                SELECT 
                  eh.id AS event_id,
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

                  -- members
                  mm.mem_id AS member_id,
                  mm.first_name,
                  mm.middle_name,
                  mm.last_name,
                  mm.designation,

                  -- teams
                  t.id AS team_id,
                  t.name AS team_name,

                  -- locations
                  el.id AS loc_id,
                  el.address,
                  el.lng,
                  el.lat,
                  el.city,
                  el.postal_code

                FROM event_hd eh

                LEFT JOIN (SELECT DISTINCT event_id, member_id FROM event_member) em ON eh.id = em.event_id

                LEFT JOIN (
                  SELECT DISTINCT mem_id, first_name, middle_name, last_name, designation 
                  FROM mst_members) mm ON em.member_id = mm.mem_id

                LEFT JOIN (SELECT DISTINCT event_id, team_id FROM event_team) et ON eh.id = et.event_id

                LEFT JOIN mst_team t ON et.team_id = t.id

                LEFT JOIN event_loc el ON eh.id = el.event_id

                WHERE eh.isdeleted = 'N'
                  AND (
                      eh.id IN (SELECT event_id FROM event_member WHERE member_id = ?)
                      OR eh.id IN (SELECT event_id FROM event_team WHERE team_id IN (?))
                  )

                ORDER BY eh.from_date DESC, eh.created_at DESC

      `;

      // STEP 4: Run Query
      db.query(sql, params, (err, rows) => {
        if (err) return res.status(500).json({ message: "Internal server error", err });

        // STEP 5: Format results
        const eventsMap = {};
        rows.forEach(row => {
          const event = eventsMap[row.event_id] ??= {
            event_id: row.event_id,
            title: row.title,
            description: row.description,
            from_date: row.from_date,
            to_date: row.to_date,
            isapproved: row.isapproved,
            type: row.type,
            isdeleted: row.isdeleted,
            approved_by: row.approved_by,
            created_by: row.created_by,
            created_at: row.created_at,
            updated_by: row.updated_by,
            updated_at: row.updated_at,
            members: [],
            teams: [],
            locations: []
          };

          // MEMBER FIX
          if (row.member_id && !event.members.some(m => m.id === row.member_id)) {
            event.members.push({
              id: row.member_id,
              first_name: row.first_name,
              middle_name: row.middle_name,
              last_name: row.last_name,
              designation: row.designation,
              full_name: `${row.first_name} ${row.last_name}`.trim()
            });
          }

          // TEAM FIX
          if (row.team_id && !event.teams.some(t => t.id === row.team_id)) {
            event.teams.push({
              id: row.team_id,
              name: row.team_name
            });
          }

          // LOCATION FIX (Already correct)
          if (row.loc_id && !event.locations.some(l => l.loc_id === row.loc_id)) {
            event.locations.push({
              id: row.loc_id,
              address: row.address,
              lng: row.lng,
              lat: row.lat,
              city: row.city,
              postal_code: row.postal_code
            });
          }
        });


        const formattedEvents = Object.values(eventsMap);

        return res.status(200).json({
          message: "Events fetched successfully",
          events: formattedEvents
        });
      });
    });
  });
};

export const updateEvent = (req, res) => {
  const { id, title, description, fromDate, toDate, type, isapproved, isdeleted, userId, teams = [], members = [], locations = [] } = req.body;

  try {
    if (!id || !title || !fromDate || !toDate || !userId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Extract only IDs
    const teamIds = teams.map(t => t.id);
    const memberIds = members.map(m => m.id);

    // 1️⃣ Update event_hd
    const sqlUpdateHd = `
      UPDATE event_hd 
      SET title=?, description=?, from_date=?, to_date=?, type=?, isapproved=?, isdeleted=?, updated_by=? 
      WHERE id=?
    `;

    db.query(sqlUpdateHd, [title, description, fromDate, toDate, type, isapproved, isdeleted, userId, id],
      (err) => {
        if (err) {
          console.error("❌ event_hd update error:", err);
          return res.status(500).json({ message: "Failed updating event header" });
        }

        // Step 2 → Update Teams
        updateTeams();
      }
    );

    // 2️⃣ Delete + Insert event_team
    const updateTeams = () => {
      const delTeamSQL = `DELETE FROM event_team WHERE event_id = ?`;

      db.query(delTeamSQL, [id], (err) => {
        if (err) {
          console.error("❌ delete event_team error:", err);
          return res.status(500).json({ message: "Failed deleting teams" });
        }

        if (teamIds.length === 0) return updateMembers();

        const teamValues = teamIds.map(tid => [id, tid]);
        const insertTeamSQL = `INSERT INTO event_team (event_id, team_id) VALUES ?`;

        db.query(insertTeamSQL, [teamValues], (err) => {
          if (err) {
            console.error("❌ insert event_team error:", err);
            return res.status(500).json({ message: "Failed inserting teams" });
          }
          updateMembers();
        });
      });
    };

    // 3️⃣ Delete + Insert event_member
    const updateMembers = () => {
      const delMemSQL = `DELETE FROM event_member WHERE event_id = ?`;

      db.query(delMemSQL, [id], (err) => {
        if (err) {
          console.error("❌ delete event_member error:", err);
          return res.status(500).json({ message: "Failed deleting members" });
        }

        if (memberIds.length === 0) return updateLocations();

        const memberValues = memberIds.map(mid => [id, mid]);
        const insertMemSQL = `INSERT INTO event_member (event_id, member_id) VALUES ?`;

        db.query(insertMemSQL, [memberValues], (err) => {
          if (err) {
            console.error("❌ insert event_member error:", err);
            return res.status(500).json({ message: "Failed inserting members" });
          }
          updateLocations();
        });
      });
    };

    // 4️⃣ Delete + Insert event_loc
    const updateLocations = () => {
      const delLocSQL = `DELETE FROM event_loc WHERE event_id = ?`;

      db.query(delLocSQL, [id], (err) => {
        if (err) {
          console.error("❌ delete event_loc error:", err);
          return res.status(500).json({ message: "Failed deleting locations" });
        }

        if (locations.length === 0) {
          return res.status(200).json({ message: "Event updated successfully!", eventId: id });
        }

        // Same parser as addEvent
        const parseAddress = (fullAddress) => {
          let parts = fullAddress.split(",");
          let postal = fullAddress.match(/\b\d{6}\b/);
          postal = postal ? postal[0] : null;

          let city = parts.length >= 2 ? parts[parts.length - 2].trim() : null;

          return { city, postal };
        };

        const locationValues = locations.map(loc => {
          const { city, postal } = parseAddress(loc.address);
          return [
            id,
            loc.address,
            loc.lng,
            loc.lat,
            city,
            postal
          ];
        });

        const insertLocSQL = `
          INSERT INTO event_loc 
          (event_id, address, lng, lat, city, postal_code)
          VALUES ?
        `;

        db.query(insertLocSQL, [locationValues], (err) => {
          if (err) {
            console.error("❌ insert event_loc error:", err);
            return res.status(500).json({ message: "Failed inserting locations" });
          }

          res.status(200).json({ message: "Event updated successfully!", eventId: id });
        });
      });
    };

  } catch (err) {
    console.error("🔥 updateEvent Exception:", err);
    return res.status(500).json({ message: "Server Error" });
  }
};