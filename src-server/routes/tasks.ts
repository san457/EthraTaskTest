import express from 'express';
import asyncErrorHandler from '../utils/AsyncErrorHandler';
import { isAuthenticated } from '../middleware/auth';
import { createTask, getTasks, updateTask, deleteTask, getMyTasks } from '../controller/taskController';
import { isProjectAdmin, isProjectMember } from '../middleware/rbac';
 
const router = express.Router();
 
router.post('/create', isAuthenticated, isProjectMember, asyncErrorHandler(createTask));
router.get('/me', isAuthenticated, asyncErrorHandler(getMyTasks));
router.get('/project/:projectId', isAuthenticated, isProjectMember, asyncErrorHandler(getTasks));
router.put('/update', isAuthenticated, isProjectMember, asyncErrorHandler(updateTask));


router.delete('/delete', isAuthenticated, isProjectMember, asyncErrorHandler(deleteTask));


export default router;

