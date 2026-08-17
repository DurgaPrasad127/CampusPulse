import { query } from '../config/db.js';

export async function listEvents(_req, res) {
  const result = await query(
    `SELECT e.*, u.name AS creator_name
     FROM events e JOIN users u ON u.id=e.created_by
     WHERE e.event_date >= NOW()
     ORDER BY e.event_date ASC`
  );
  return res.json(result.rows);
}

export async function createEvent(req, res) {
  const { title, description, location, event_date } = req.body;
  if (!title || !description || !location || !event_date) {
    return res.status(400).json({ message: 'All event fields are required' });
  }
  const result = await query(
    `INSERT INTO events(title,description,location,event_date,created_by)
     VALUES($1,$2,$3,$4,$5) RETURNING *`,
    [title.trim(), description.trim(), location.trim(), event_date, req.user.id]
  );
  return res.status(201).json(result.rows[0]);
}

export async function updateEvent(req, res) {
  const { title, description, location, event_date } = req.body;
  const result = await query(
    `UPDATE events SET title=$1,description=$2,location=$3,event_date=$4
     WHERE id=$5 RETURNING *`,
    [title?.trim(), description?.trim(), location?.trim(), event_date, req.params.id]
  );
  if (!result.rowCount) return res.status(404).json({ message: 'Event not found' });
  return res.json(result.rows[0]);
}

export async function deleteEvent(req, res) {
  const result = await query('DELETE FROM events WHERE id=$1 RETURNING id', [req.params.id]);
  if (!result.rowCount) return res.status(404).json({ message: 'Event not found' });
  return res.json({ message: 'Event deleted' });
}
