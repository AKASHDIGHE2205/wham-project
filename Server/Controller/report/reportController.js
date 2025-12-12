import db from "../../db.js";

export const report1_old = (req, res) => {
  const { fromDate, toDate } = req.body;

  // ---- QUERY 1: Event Header ----
  const sqlEventHd = `
      SELECT 
        id, event_date, title, description, from_date, to_date,
        isapproved, type, approved_by
      FROM event_hd
      WHERE isdeleted != 'Y'
      AND DATE(from_date) >= ?
      AND DATE(to_date) >= ?
  `;

  db.query(sqlEventHd, [fromDate, toDate], (err, event_hd) => {
    if (err) return res.status(500).json({ error: err });

    if (event_hd.length === 0) {
      return res.status(200).json({
        event_hd: [],
        event_team: [],
        event_loc: [],
        event_dt: [],
        event_member: []
      });
    }

    const ids = event_hd.map(e => e.id).join(",");

    // ---- QUERY 2: Teams ----
    const sqlTeams = `
      SELECT b.event_id, b.event_date,b.team_id, h.name AS team_name
      FROM event_team b
      LEFT JOIN mst_team h ON b.team_id = h.id
      WHERE b.event_id IN (${ids})
    `;

    db.query(sqlTeams, (err, event_team) => {
      if (err) return res.status(500).json({ error: err });

      // ---- QUERY 3: Location ----
      const sqlLoc = `
        SELECT event_id, event_date,address, lat, lng
        FROM event_loc
        WHERE event_id IN (${ids})
      `;

      db.query(sqlLoc, (err, event_loc) => {
        if (err) return res.status(500).json({ error: err });

        // ---- QUERY 4: Details ----
        const sqlDt = `
          SELECT 
            d.event_id, d.event_date, d.step_no, j.step_name,
            d.task_id, i.task_name, d.task_desc,
            d.status, d.mem_id
          FROM event_dt d
          LEFT JOIN mst_tasks i ON d.task_id = i.id
          LEFT JOIN mst_steps j ON d.step_no = j.id
          WHERE d.event_id IN (${ids})
        `;

        db.query(sqlDt, (err, event_dt) => {
          if (err) return res.status(500).json({ error: err });

          // ---- QUERY 6: Members ----
          const sqlMembers = `
              SELECT 
                f.event_id, f.event_date, f.member_id,
                CONCAT(g.first_name,' ',g.middle_name,' ',g.last_name) AS member_name
              FROM event_member f
              LEFT JOIN mst_members g ON f.member_id = g.mem_id
              WHERE f.event_id IN (${ids})
          `;

          db.query(sqlMembers, (err, event_member) => {
            if (err) return res.status(500).json({ error: err });

            // ---- FINAL RESPONSE ----
            return res.status(200).json({
              event_hd,
              event_team,
              event_loc,
              event_dt,
              event_member
            });
          });
        });
      });
    });
  });
};

export const report1 = (req, res) => {
  const { fromDate, toDate } = req.body;
  // 1️⃣ Fetch events in the date range
  const sqlEventHd = `
    SELECT id, event_date, title, description, from_date, to_date,
           isapproved, type, approved_by
    FROM event_hd
    WHERE isdeleted != 'Y'
      AND from_date <= ?
      AND to_date >= ?
    ORDER BY id ASC
  `;

  db.query(sqlEventHd, [toDate, fromDate], (err, event_hd) => {
    if (err) return res.status(500).json({ error: err });

    if (event_hd.length === 0) {
      return res.status(200).json({
        event_hd: [],
        event_team: [],
        event_loc: [],
        event_dt: [],
        event_member: []
      });
    }

    const ids = event_hd.map(e => e.id); // event IDs
    const dates = event_hd.map(e => e.event_date); // event dates

    // 2️⃣ Event Teams
    const sqlTeams = `
      SELECT b.event_id, b.event_date, b.team_id, h.name AS team_name
      FROM event_team b
      LEFT JOIN mst_team h ON b.team_id = h.id
      WHERE b.event_id IN (?)
        AND b.event_date IN (?)
    `;

    db.query(sqlTeams, [ids, dates], (err, event_team) => {
      if (err) return res.status(500).json({ error: err });

      // 3️⃣ Event Locations
      const sqlLoc = `
        SELECT event_id, event_date, address, lat, lng
        FROM event_loc
        WHERE event_id IN (?)
          AND event_date IN (?)
      `;

      db.query(sqlLoc, [ids, dates], (err, event_loc) => {
        if (err) return res.status(500).json({ error: err });

        // 4️⃣ Event Details
        const sqlDt = `
          SELECT d.event_id, d.event_date, d.step_no, j.step_name,
                 d.task_id, i.task_name, d.task_desc,
                 d.status, d.mem_id
          FROM event_dt d
          LEFT JOIN mst_tasks i ON d.task_id = i.id
          LEFT JOIN mst_steps j ON d.step_no = j.id
          WHERE d.event_id IN (?)
            AND d.event_date IN (?)
        `;

        db.query(sqlDt, [ids, dates], (err, event_dt) => {
          if (err) return res.status(500).json({ error: err });

          // 5️⃣ Event Members
          const sqlMembers = `
            SELECT 
              f.event_id, f.event_date, f.member_id,
              CONCAT(g.first_name,' ',g.middle_name,' ',g.last_name) AS member_name
            FROM event_member f
            LEFT JOIN mst_members g ON f.member_id = g.mem_id
            WHERE f.event_id IN (?)
              AND f.event_date IN (?)
          `;

          db.query(sqlMembers, [ids, dates], (err, event_member) => {
            if (err) return res.status(500).json({ error: err });

            // 6️⃣ Final Response
            return res.status(200).json({
              event_hd,
              event_team,
              event_loc,
              event_dt,
              event_member
            });
          });
        });
      });
    });
  });
};

export const getMedia = (req, res) => {
  const { eventId, eventDate, stepNo, taskNo, memberId } = req.body;

  let sql = `
              SELECT 
                a.sr_no,
                a.event_id,
                a.event_date,
                a.step_id,
                c.step_name,
                a.task_id,
                d.task_name,
                a.in_time,
                a.punch_date,
                a.media_path,
                a.address,
                a.mem_id,
                CONCAT(b.first_name,' ',b.middle_name,' ',b.last_name) AS member_name
              FROM event_media AS a
              LEFT JOIN mst_members AS b ON a.mem_id = b.mem_id
              LEFT JOIN mst_steps AS c ON a.step_id = c.id
              LEFT JOIN mst_tasks AS d ON a.task_id = d.id
              WHERE a.event_id = ?
                AND a.event_date = ?
                AND a.step_id = ?
                AND a.task_id = ?
            `;

  const params = [eventId, eventDate, stepNo, taskNo];

  // // Optional member filter
  // if (memberId) {
  //   sql += ` AND a.mem_id = ?`;
  //   params.push(memberId);
  // }

  sql += ` ORDER BY a.mem_id, a.in_time ASC`;

  db.query(sql, params, (err, rows) => {
    if (err) {
      console.error("GetMedia Error:", err);
      return res.status(500).json({ error: err });
    }

    // ---- GROUP BY MEMBER ----
    const grouped = {};

    rows.forEach(row => {
      if (!grouped[row.mem_id]) {
        grouped[row.mem_id] = {
          member_id: row.mem_id,
          member_name: row.member_name,
          items: []
        };
      }

      grouped[row.mem_id].items.push({
        sr_no: row.sr_no,
        event_id: row.event_id,
        event_date: row.event_date,
        step_id: row.step_id,
        step_name: row.step_name,
        task_id: row.task_id,
        task_name: row.task_name,
        in_time: row.in_time,
        punch_date: row.punch_date,
        media_path: row.media_path,
        address: row.address
      });
    });

    return res.status(200).json({
      media: Object.values(grouped)
    });
  });
};