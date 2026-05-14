import express from 'express';
import { login, register, logout, getauth, refresh } from '../controller/authController';
import asyncErrorHandler from '../utils/AsyncErrorHandler';

const router = express.Router();

router.post('/register', asyncErrorHandler(register));
router.post('/login', asyncErrorHandler(login));
router.post('/logout', asyncErrorHandler(logout));
router.post('/refresh', asyncErrorHandler(refresh));
router.get('/get-auth', asyncErrorHandler(getauth));


export default router;
