import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import client from '../db/db';
import { signupSchema, loginSchema } from '../validations/schemas';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const validated = signupSchema.parse(req.body);
    const { name, email, password } = validated;

    const userExists = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }


    const hashed = await bcrypt.hash(password, 12);

    await client.query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3)',
      [name, email, hashed]
    );

    res.status(201).json({ message: 'Registered successfully' });
  } catch (err: any) {
    if (err.name === 'ZodError') {
      res.status(400).json({ errors: err.errors });
      return;
    }
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const validated = loginSchema.parse(req.body);
    const { email, password } = validated;

    const result = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }


    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }


    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);


    // Store refresh token
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await client.query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, refreshToken, expiresAt]
    );

    const isProjectAdminRes = await client.query(
      'SELECT 1 FROM project_members WHERE user_id = $1 AND role = $2 LIMIT 1',
      [user.id, 'admin']
    );
    const isProjectAdmin = isProjectAdminRes.rows.length > 0;

    res.status(200).json({
      message: 'Login successful',
      accessToken,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, isProjectAdmin }
    });
  } catch (err: any) {
    if (err.name === 'ZodError') {
      res.status(400).json({ errors: err.errors });
      return;
    }
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) {
    res.status(401).json({ message: 'Refresh token missing' });
    return;
  }


  try {
    const payload = verifyRefreshToken(refreshToken);
    const result = await client.query(
      'SELECT * FROM refresh_tokens WHERE token = $1 AND user_id = $2',
      [refreshToken, payload.userId]
    );

    if (result.rows.length === 0) {
      res.status(403).json({ message: 'Invalid refresh token' });
      return;
    }


    // Rotation: Delete old, create new
    await client.query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);

    // Fetch user role for the new access token
    const userResult = await client.query('SELECT role FROM users WHERE id = $1', [payload.userId]);
    if (userResult.rows.length === 0) {
      res.status(403).json({ message: 'User not found' });
      return;
    }
    const role = userResult.rows[0].role;

    const newAccessToken = generateAccessToken(payload.userId, role);
    const newRefreshToken = generateRefreshToken(payload.userId);

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await client.query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [payload.userId, newRefreshToken, expiresAt]
    );

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({ accessToken: newAccessToken });
  } catch (err) {
    res.status(403).json({ message: 'Invalid or expired refresh token' });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  const { refreshToken } = req.cookies;
  if (refreshToken) {
    await client.query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);
  }
  res.clearCookie('refreshToken');
  res.status(200).json({ message: 'Logged out' });
};

export const getauth = async (req: Request, res: Response): Promise<void> => {
  // This would typically be handled by an auth middleware mapping JWT to req.user
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ authenticated: false });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const { userId } = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET || 'access_secret') as any;
    const result = await client.query('SELECT id, name, email, role FROM users WHERE id = $1', [userId]);
    
    if (result.rows.length === 0) {
      res.status(404).json({ authenticated: false });
      return;
    }

    const user = result.rows[0];
    const isProjectAdminRes = await client.query(
      'SELECT 1 FROM project_members WHERE user_id = $1 AND role = $2 LIMIT 1',
      [userId, 'admin']
    );
    const isProjectAdmin = isProjectAdminRes.rows.length > 0;

    res.json({ authenticated: true, user: { ...user, isProjectAdmin } });
  } catch (err) {
    res.status(401).json({ authenticated: false });
  }
};


