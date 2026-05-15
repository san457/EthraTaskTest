import { Request, Response, NextFunction } from 'express';
import client from '../db/db';

export const isProjectAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized: No user ID' });
      return;
    }

    let projectIdRaw = req.params?.projectId || req.body?.projectId || req.query?.projectId;
    const taskIdRaw = req.params?.taskId || req.body?.taskId || req.query?.taskId;

    let projectId: number | undefined;

    if (projectIdRaw) {
      projectId = parseInt(projectIdRaw as string);
    } else if (taskIdRaw) {
      const taskId = parseInt(taskIdRaw as string);
      if (!isNaN(taskId)) {
        const taskRes = await client.query('SELECT project_id FROM tasks WHERE id = $1', [taskId]);
        if (taskRes.rows.length > 0) {
          projectId = taskRes.rows[0].project_id;
        }
      }
    }

    if (!projectId || isNaN(projectId)) {
      res.status(400).json({ message: 'Valid Project ID is required' });
      return;
    }

    // Global Admin bypass
    const userRes = await client.query('SELECT role FROM users WHERE id = $1', [userId]);
    if (userRes.rows[0]?.role === 'ADMIN') return next();

    const result = await client.query(
      'SELECT role FROM project_members WHERE project_id = $1 AND user_id = $2',
      [projectId, userId]
    );

    if (result.rows.length === 0 || result.rows[0].role !== 'admin') {
      res.status(403).json({ message: 'Forbidden: Project Admin access required' });
      return;
    }
    next();
  } catch (err: any) {
    console.error('RBAC Admin Error:', err.message);
    res.status(500).json({ message: 'Server error checking project admin: ' + err.message });
  }
};

export const isProjectMember = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized: No user ID' });
      return;
    }

    let projectIdRaw = req.params?.projectId || req.body?.projectId || req.query?.projectId;
    const taskIdRaw = req.params?.taskId || req.body?.taskId || req.query?.taskId;

    let projectId: number | undefined;

    if (projectIdRaw) {
      projectId = parseInt(projectIdRaw as string);
    } else if (taskIdRaw) {
      const taskId = parseInt(taskIdRaw as string);
      if (!isNaN(taskId)) {
        const taskRes = await client.query('SELECT project_id FROM tasks WHERE id = $1', [taskId]);
        if (taskRes.rows.length > 0) {
          projectId = taskRes.rows[0].project_id;
        }
      }
    }

    if (!projectId || isNaN(projectId)) {
      res.status(400).json({ message: 'Valid Project ID is required' });
      return;
    }

    // Global Admin bypass
    const userRes = await client.query('SELECT role FROM users WHERE id = $1', [userId]);
    if (userRes.rows[0]?.role === 'ADMIN') return next();

    const result = await client.query(
      'SELECT role FROM project_members WHERE project_id = $1 AND user_id = $2',
      [projectId, userId]
    );

    if (result.rows.length === 0) {
      // Also allow if the user is the assignee or creator of the task (if taskId is present)
      if (taskIdRaw) {
        const taskId = parseInt(taskIdRaw as string);
        if (!isNaN(taskId)) {
          const checkTask = await client.query(
            'SELECT 1 FROM tasks WHERE id = $1 AND (assignee_id = $2 OR creator_id = $2)',
            [taskId, userId]
          );
          if (checkTask.rows.length > 0) return next();
        }
      }

      res.status(403).json({ message: 'Forbidden: Project Member access required' });
      return;
    }
    next();
  } catch (err: any) {
    console.error('RBAC Member Error:', err.message);
    res.status(500).json({ message: 'Server error checking project membership: ' + err.message });
  }
};

export const protectLastAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const projectIdRaw = req.body?.projectId;
    const userIdToRemoveRaw = req.body?.userIdToRemove;

    if (!projectIdRaw || !userIdToRemoveRaw) {
      res.status(400).json({ message: 'Project ID and User ID to remove are required' });
      return;
    }

    const projectId = parseInt(projectIdRaw as string);
    const userIdToRemove = parseInt(userIdToRemoveRaw as string);

    if (isNaN(projectId) || isNaN(userIdToRemove)) {
      res.status(400).json({ message: 'Invalid Project or User ID' });
      return;
    }

    const result = await client.query(
      'SELECT role FROM project_members WHERE project_id = $1 AND user_id = $2',
      [projectId, userIdToRemove]
    );

    if (result.rows[0]?.role === 'admin') {
      const adminCount = await client.query(
        "SELECT COUNT(*) FROM project_members WHERE project_id = $1 AND role = 'admin'",
        [projectId]
      );

      if (parseInt(adminCount.rows[0].count) <= 1) {
        res.status(400).json({ message: 'Cannot remove or demote the last admin of a project' });
        return;
      }
    }
    next();
  } catch (err: any) {
    console.error('safety check error', err.message);
    res.status(500).json({ message: 'Server error during safety check: ' + err.message });
  }
};
