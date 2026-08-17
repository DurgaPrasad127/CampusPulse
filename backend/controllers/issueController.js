import { query } from '../config/db.js';

export async function listIssues(req, res) {
  const { status } = req.query;
  const params = [];
  let where = '';
  if (status && ['OPEN','IN_PROGRESS','RESOLVED'].includes(status)) {
    params.push(status);
    where = 'WHERE i.status = $1';
  }

  const result = await query(
    `SELECT i.*, u.name AS reporter_name, a.name AS assignee_name,
      (SELECT COUNT(*) FROM votes v WHERE v.issue_id=i.id)::int AS vote_count
     FROM issues i
     JOIN users u ON u.id=i.reported_by
     LEFT JOIN users a ON a.id=i.assigned_to
     ${where}
     ORDER BY i.created_at DESC`,
    params
  );
  return res.json(result.rows);
}

export async function getStats(_req, res) {
  const result = await query(
    `SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE status='OPEN')::int AS open,
      COUNT(*) FILTER (WHERE status='IN_PROGRESS')::int AS in_progress,
      COUNT(*) FILTER (WHERE status='RESOLVED')::int AS resolved
     FROM issues`
  );
  return res.json(result.rows[0]);
}

export async function getIssue(req, res) {
  const result = await query(
    `SELECT i.*, u.name AS reporter_name, a.name AS assignee_name,
      (SELECT COUNT(*) FROM votes v WHERE v.issue_id=i.id)::int AS vote_count
     FROM issues i JOIN users u ON u.id=i.reported_by
     LEFT JOIN users a ON a.id=i.assigned_to
     WHERE i.id=$1`,
    [req.params.id]
  );
  if (!result.rowCount) return res.status(404).json({ message: 'Issue not found' });
  return res.json(result.rows[0]);
}

export async function createIssue(req, res) {
  const { title, description, category, location, priority = 'MEDIUM' } = req.body;
  if (!title || !description || !category || !location) {
    return res.status(400).json({ message: 'Title, description, category and location are required' });
  }
  if (!['LOW','MEDIUM','HIGH','CRITICAL'].includes(priority)) {
    return res.status(400).json({ message: 'Invalid priority' });
  }
  const result = await query(
    `INSERT INTO issues(title,description,category,location,priority,reported_by)
     VALUES($1,$2,$3,$4,$5,$6) RETURNING *`,
    [title.trim(), description.trim(), category.trim(), location.trim(), priority, req.user.id]
  );
  return res.status(201).json(result.rows[0]);
}

export async function updateIssue(req, res) {
  const { status, priority, assigned_to } = req.body;
  if (status && !['OPEN','IN_PROGRESS','RESOLVED'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }
  if (priority && !['LOW','MEDIUM','HIGH','CRITICAL'].includes(priority)) {
    return res.status(400).json({ message: 'Invalid priority' });
  }

  const result = await query(
    `UPDATE issues
     SET status=COALESCE($1,status), priority=COALESCE($2,priority),
         assigned_to=$3, updated_at=NOW()
     WHERE id=$4
     RETURNING *`,
    [status || null, priority || null, assigned_to || null, req.params.id]
  );
  if (!result.rowCount) return res.status(404).json({ message: 'Issue not found' });
  return res.json(result.rows[0]);
}

export async function deleteIssue(req, res) {
  const result = await query('DELETE FROM issues WHERE id=$1 RETURNING id', [req.params.id]);
  if (!result.rowCount) return res.status(404).json({ message: 'Issue not found' });
  return res.json({ message: 'Issue deleted' });
}

export async function voteIssue(req, res) {
  try {
    await query('INSERT INTO votes(issue_id,user_id) VALUES($1,$2)', [req.params.id, req.user.id]);
    return res.status(201).json({ message: 'Vote recorded' });
  } catch (error) {
    if (error.code === '23505') return res.status(409).json({ message: 'You already voted for this issue' });
    if (error.code === '23503') return res.status(404).json({ message: 'Issue not found' });
    throw error;
  }
}
