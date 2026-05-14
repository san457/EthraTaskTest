import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const signupSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
});

export const projectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

export const memberSchema = z.object({
  userId: z.number(),
  role: z.enum(['admin', 'member']),
});

export const taskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  projectId: z.number(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  assigneeId: z.number().nullable().optional(),
  dueDate: z.string().datetime().nullable().optional(),
});
