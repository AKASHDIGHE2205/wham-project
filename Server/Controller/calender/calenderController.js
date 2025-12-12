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
      const primaryTeam = teamsId.length > 0 ? teamsId[0] : null;

      // Insert into event_hd with explicit ID
      const hdSQL = `
        INSERT INTO event_hd
        (id, title, description, from_date, to_date, team_id, isapproved, type, isdeleted, created_by, approved_by, created_at, event_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      db.query(
        hdSQL,
        [
          eventId,
          title,
          description,
          fromDate,
          toDate,
          primaryTeam,
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

              let locNextId = locResult[0].next_id;
              const locationValues = locations.map((loc, index) => {
                const { city, postal } = parseAddress(loc.address);
                return [
                  locNextId + index,
                  eventId,
                  loc.address,
                  loc.lng,
                  loc.lat,
                  city,
                  postal,
                  eventDate
                ];
              });

              const locSQL = `
                INSERT INTO event_loc
                (id, event_id, address, lng, lat, city, postal_code, event_date)
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