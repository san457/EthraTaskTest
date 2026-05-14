import { Request, Response } from "express";
import client from "../db/db";
import { taskSchema } from "../validations/schemas";

export const createTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const validated = taskSchema.parse(req.body);
    const creatorId = req.user?.userId;

    const result = await client.query(
      `INSERT INTO tasks (title, description, project_id, status, priority, assignee_id, creator_id, due_date) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        validated.title,
        validated.description || "",
        validated.projectId,
        'todo',
        validated.priority,
        validated.assigneeId || creatorId, // Use creatorId as default assignee
        creatorId,
        validated.dueDate || null

      ]
    );

    res.status(201).json({ task: result.rows[0] });
  } catch (err: any) {
    if (err.name === 'ZodError') {
      res.status(400).json({ errors: err.errors });
      return;
    }
    console.error("Create Task Error:", err);
    res.status(500).json({ message: "Failed to create task" });
  }
};


export const getTasks = async (req: Request, res: Response): Promise<void> => {
  const { projectId } = req.params;

  if (!projectId) {
    res.status(400).json({ message: "projectId is required" });
    return;
  }


  try {
    const result = await client.query(
      `SELECT * FROM tasks WHERE project_id = $1 ORDER BY created_at DESC`,
      [projectId]
    );

    res.status(200).json({ tasks: result.rows });
    return;
  } catch (error) {
    console.error("Get Tasks Error:", error);
    res.status(500).json({ message: "Failed to fetch tasks" });
    return;
  }
};

export const updateTask = async (req: Request, res: Response): Promise<void> => {
    // Basic implementation, can be expanded to use Zod for partial updates
  const { taskId, title, description, status, priority, assigneeId, dueDate } = req.body;

  try {
    const result = await client.query(
      `UPDATE tasks 
       SET title = COALESCE($1, title), 
           description = COALESCE($2, description),
           status = COALESCE($3, status),
           priority = COALESCE($4, priority),
           assignee_id = COALESCE($5, assignee_id),
           due_date = COALESCE($6, due_date)
       WHERE id = $7 RETURNING *`,
      [title, description, status, priority, assigneeId, dueDate, taskId]
    );

    res.status(200).json({ task: result.rows[0] });
  } catch (error) {
    console.error("Update Task Error:", error);
    res.status(500).json({ message: "Failed to update task" });
  }
};

export const deleteTask = async (req: Request, res: Response): Promise<void> => {
  const { taskId } = req.body;

  try {
    await client.query(`DELETE FROM tasks WHERE id = $1`, [taskId]);
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Delete Task Error:", error);
    res.status(500).json({ message: "Failed to delete task" });
  }
};

export const getMyTasks = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.userId;

  try {
    const result = await client.query(
      `SELECT t.*, p.name as project_name 
       FROM tasks t
       JOIN projects p ON t.project_id = p.id
       WHERE t.assignee_id = $1 OR t.creator_id = $1
       ORDER BY t.created_at DESC`,
      [userId]
    );

    res.status(200).json({ tasks: result.rows });
  } catch (error) {
    console.error("Get My Tasks Error:", error);
    res.status(500).json({ message: "Failed to fetch your tasks" });
  }
};

