import { Request, Response, NextFunction } from 'express';
import client from '../db/db';

export const isGlobalAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'ADMIN') {
    res.status(403).json({ message: 'Access denied. Administrator role required.' });
    return;
  }
  next();
};

export const canViewAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role === 'ADMIN') {
    next();
    return;
  }

  try {
    const result = await client.query(
      'SELECT 1 FROM project_members WHERE user_id = $1 AND role = $2 LIMIT 1',
      [req.user?.userId, 'admin']
    );

    if (result.rows.length > 0) {
      next();
      return;
    }

    res.status(403).json({ message: 'Access denied. You must be an admin of at least one project to view analytics.' });
  } catch (err) {
    console.error('Error checking analytics access:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

