import { Router, Request, Response } from 'express';
import { taskStore } from './store.js';
import { validateTitle, validateDueDate, normalizeTags } from './validation.js';
import { CreateTaskRequest, UpdateTaskRequest } from './types.js';

const router = Router();

router.post('/tasks', async (req: Request, res: Response) => {
  try {
    const { title, dueDate, tags }: CreateTaskRequest = req.body;

    const validatedTitle = validateTitle(title);
    const validatedDueDate = validateDueDate(dueDate);
    const normalizedTags = normalizeTags(tags);

    const task = await taskStore.create({
      title: validatedTitle,
      done: false,
      dueDate: validatedDueDate,
      tags: normalizedTags,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json(task);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(400).json({ error: message });
  }
});

router.get('/tasks', async (req: Request, res: Response) => {
  try {
    let tasks = await taskStore.getAll();

    const { tag, q } = req.query;

    if (typeof tag === 'string' && tag) {
      tasks = tasks.filter((task) => task.tags.includes(tag));
    }

    if (typeof q === 'string' && q) {
      const searchLower = q.toLowerCase();
      tasks = tasks.filter((task) =>
        task.title.toLowerCase().includes(searchLower)
      );
    }

    res.json(tasks);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

router.patch('/tasks/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates: UpdateTaskRequest = req.body;

    const existing = await taskStore.getById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const taskUpdates: Partial<typeof existing> = {};

    if (updates.title !== undefined) {
      taskUpdates.title = validateTitle(updates.title);
    }

    if (updates.dueDate !== undefined) {
      taskUpdates.dueDate = validateDueDate(updates.dueDate);
    }

    if (updates.tags !== undefined) {
      taskUpdates.tags = normalizeTags(updates.tags);
    }

    if (updates.done !== undefined) {
      taskUpdates.done = Boolean(updates.done);
    }

    if (updates.toggleDone) {
      taskUpdates.done = !existing.done;
    }

    const updated = await taskStore.update(id, taskUpdates);

    res.json(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(400).json({ error: message });
  }
});

router.delete('/tasks/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await taskStore.delete(id);
    res.status(204).send();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

export default router;

