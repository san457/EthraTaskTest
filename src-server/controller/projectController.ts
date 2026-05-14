import { Request, Response } from 'express';
import client from '../db/db';
import { projectSchema } from '../validations/schemas';

export const createProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const validated = projectSchema.parse(req.body);
    const userId = req.user?.userId;

    const result = await client.query(
      'INSERT INTO projects (name, description, owner_id) VALUES ($1, $2, $3) RETURNING *',
      [validated.name, validated.description || '', userId]
    );

    const project = result.rows[0];

    // Automatically add creator as admin
    await client.query(
      'INSERT INTO project_members (project_id, user_id, role) VALUES ($1, $2, $3)',
      [project.id, userId, 'admin']
    );

    res.status(201).json({ project });
  } catch (err: any) {
    if (err.name === 'ZodError') {
      res.status(400).json({ errors: err.errors });
      return;
    }
    console.error('Error creating project:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


export const getUserProjects = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.userId;

  try {
    const result = await client.query(
      `
      SELECT 
        p.*,
        (SELECT COUNT(*) FROM project_members pm WHERE pm.project_id = p.id) AS membercount,
        (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id) AS taskcount
      FROM projects p
      LEFT JOIN project_members pm ON p.id = pm.project_id
      WHERE p.owner_id = $1 OR pm.user_id = $1
      GROUP BY p.id
      ORDER BY p.created_at DESC;
      `,
      [userId]
    );

    res.status(200).json({ projects: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch projects" });
  }
};

export const getProjectMembers = async (req: Request, res: Response): Promise<void> => {
  const { projectId } = req.params;

  try {
    const result = await client.query(
      `
      SELECT u.id, u.name, u.email, pm.role
      FROM users u
      INNER JOIN project_members pm ON pm.user_id = u.id
      WHERE pm.project_id = $1
      `,
      [projectId]
    );

    res.status(200).json({ members: result.rows });
  } catch (err) {
    console.error('Error getting project members:', err);
    res.status(500).json({ message: 'Failed to fetch project members' });
  }
};

export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.userId;

  try {
    // Count projects
    const projectsResult = await client.query(
      'SELECT COUNT(*) as count FROM project_members WHERE user_id = $1',
      [userId]
    );

    // Count pending tasks in those projects
    const tasksResult = await client.query(
      `
      SELECT COUNT(*) as count 
      FROM tasks t
      INNER JOIN project_members pm ON t.project_id = pm.project_id
      WHERE pm.user_id = $1 AND t.status != 'completed'
      `,
      [userId]
    );

    res.status(200).json({
      projectCount: parseInt(projectsResult.rows[0].count),
      pendingTasksCount: parseInt(tasksResult.rows[0].count),
    });
  } catch (err) {
    console.error('Error fetching dashboard stats:', err);
    res.status(500).json({ message: 'Failed to fetch dashboard stats' });
  }
};

export const inviteToProject = async (req: Request, res: Response): Promise<void> => {
  const { projectId, email, role } = req.body;

  try {
    // Check if user exists
    const userRes = await client.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userRes.rows.length === 0) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    const targetUserId = userRes.rows[0].id;

    // Check if already a member
    const memberCheck = await client.query(
      'SELECT role FROM project_members WHERE project_id = $1 AND user_id = $2',
      [projectId, targetUserId]
    );

    if (memberCheck.rows.length > 0) {
      res.status(400).json({ message: 'User is already a member' });
      return;
    }

    // Add member
    await client.query(
      'INSERT INTO project_members (project_id, user_id, role) VALUES ($1, $2, $3)',
      [projectId, targetUserId, role || 'member']
    );

    res.status(200).json({ message: 'User invited successfully' });
  } catch (err) {
    console.error('Error inviting to project:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getProjectAnalytics = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  const isAdmin = req.user?.role === 'ADMIN';

  try {
    let projectIds: string[] = [];

    if (!isAdmin) {
      const projectsRes = await client.query(
        'SELECT project_id FROM project_members WHERE user_id = $1 AND role = $2',
        [userId, 'admin']
      );
      projectIds = projectsRes.rows.map(row => row.project_id);

      if (projectIds.length === 0) {
        res.status(403).json({ message: 'No projects managed by the user' });
        return;
      }
    }

    const statusQuery = isAdmin

      ? `SELECT status as name, COUNT(*) as value FROM tasks GROUP BY status`
      : `SELECT status as name, COUNT(*) as value FROM tasks WHERE project_id = ANY($1) GROUP BY status`;
    const statusParams = isAdmin ? [] : [projectIds];
    const statusRes = await client.query(statusQuery, statusParams);

    const projectQuery = isAdmin

      ? `SELECT p.name, 
                COUNT(CASE WHEN t.status = 'completed' THEN 1 END)::int as completed,
                COUNT(CASE WHEN t.status != 'completed' THEN 1 END)::int as pending
         FROM projects p
         LEFT JOIN tasks t ON p.id = t.project_id
         GROUP BY p.id, p.name
         LIMIT 10`
      : `SELECT p.name, 
                COUNT(CASE WHEN t.status = 'completed' THEN 1 END)::int as completed,
                COUNT(CASE WHEN t.status != 'completed' THEN 1 END)::int as pending
         FROM projects p
         LEFT JOIN tasks t ON p.id = t.project_id
         WHERE p.id = ANY($1)
         GROUP BY p.id, p.name
         LIMIT 10`;
    const projectParams = isAdmin ? [] : [projectIds];
    const projectRes = await client.query(projectQuery, projectParams);

    const totalTasksQuery = isAdmin ? 'SELECT COUNT(*) as count FROM tasks' : 'SELECT COUNT(*) as count FROM tasks WHERE project_id = ANY($1)';

    const totalProjectsQuery = isAdmin ? 'SELECT COUNT(*) as count FROM projects' : 'SELECT COUNT(*) as count FROM projects WHERE id = ANY($1)';
    const activeUsersQuery = isAdmin 
      ? 'SELECT COUNT(*) as count FROM users' 
      : 'SELECT COUNT(DISTINCT user_id) as count FROM project_members WHERE project_id = ANY($1)';

    const totalTasksRes = await client.query(totalTasksQuery, isAdmin ? [] : [projectIds]);
    const totalProjectsRes = await client.query(totalProjectsQuery, isAdmin ? [] : [projectIds]);
    const activeUsersRes = await client.query(activeUsersQuery, isAdmin ? [] : [projectIds]);

    res.status(200).json({
      statusDistribution: statusRes.rows.map(row => ({
        name: row.name.charAt(0).toUpperCase() + row.name.slice(1).replace('_', ' '),
        value: parseInt(row.value)
      })),
      projectPerformance: projectRes.rows,
      metrics: {
        totalTasks: parseInt(totalTasksRes.rows[0].count),
        totalProjects: parseInt(totalProjectsRes.rows[0].count),
        activeUsers: parseInt(activeUsersRes.rows[0].count)
      }
    });
  } catch (err) {
    console.error('Error fetching analytics:', err);
    res.status(500).json({ message: 'Failed to fetch analytics data' });
  }
};


