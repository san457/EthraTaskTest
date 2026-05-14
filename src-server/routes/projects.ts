import express from 'express';
import { createProject, getUserProjects, getProjectMembers, getDashboardStats, inviteToProject, getProjectAnalytics } from '../controller/projectController';



import { isAuthenticated } from '../middleware/auth';
import { isProjectAdmin } from '../middleware/rbac';
import asyncErrorHandler from '../utils/AsyncErrorHandler';

import { isGlobalAdmin, canViewAnalytics } from '../middleware/admin';

const router = express.Router();

router.post('/create', isAuthenticated, asyncErrorHandler(createProject));
router.get('/', isAuthenticated, asyncErrorHandler(getUserProjects));
router.get('/members/:projectId', isAuthenticated, asyncErrorHandler(getProjectMembers));
router.get('/stats', isAuthenticated, asyncErrorHandler(getDashboardStats));
router.get('/analytics', isAuthenticated, canViewAnalytics, asyncErrorHandler(getProjectAnalytics));

router.post('/invite', isAuthenticated, asyncErrorHandler(inviteToProject));






export default router;
