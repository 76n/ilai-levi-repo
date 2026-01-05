import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from './index.js';
import { taskStore } from './store.js';

describe('Task API', () => {
  beforeEach(async () => {
    await taskStore.clear();
  });

  describe('POST /api/tasks', () => {
    it('should create a task with valid title', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({ title: 'Buy groceries' })
        .expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(String),
        title: 'Buy groceries',
        done: false,
        tags: [],
        createdAt: expect.any(String),
      });
    });

    it('should reject empty title after trimming', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({ title: '   ' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('empty');
    });

    it('should normalize tags by trimming and lowercasing', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({
          title: 'Test task',
          tags: ['  Work  ', 'URGENT', 'home'],
        })
        .expect(201);

      expect(response.body.tags).toEqual(['work', 'urgent', 'home']);
    });

    it('should accept and normalize dueDate', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({
          title: 'Meeting',
          dueDate: '2024-12-31T10:00:00.000Z',
        })
        .expect(201);

      expect(response.body.dueDate).toBe('2024-12-31T10:00:00.000Z');
    });
  });

  describe('GET /api/tasks', () => {
    it('should return all tasks', async () => {
      await request(app).post('/api/tasks').send({ title: 'Task 1' });
      await request(app).post('/api/tasks').send({ title: 'Task 2' });

      const response = await request(app).get('/api/tasks').expect(200);

      expect(response.body).toHaveLength(2);
    });

    it('should filter tasks by tag case-insensitively', async () => {
      await request(app)
        .post('/api/tasks')
        .send({ title: 'Work task', tags: ['work'] });
      await request(app)
        .post('/api/tasks')
        .send({ title: 'Home task', tags: ['home'] });

      const response = await request(app)
        .get('/api/tasks?tag=WORK')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].title).toBe('Work task');
    });

    it('should search tasks by title substring case-insensitively', async () => {
      await request(app)
        .post('/api/tasks')
        .send({ title: 'Buy groceries' });
      await request(app).post('/api/tasks').send({ title: 'Buy tickets' });
      await request(app).post('/api/tasks').send({ title: 'Sell items' });

      const response = await request(app).get('/api/tasks?q=buy').expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body.every((t: any) => t.title.includes('Buy'))).toBe(
        true
      );
    });
  });

  describe('PATCH /api/tasks/:id', () => {
    it('should update task title partially', async () => {
      const created = await request(app)
        .post('/api/tasks')
        .send({ title: 'Old title', tags: ['work'] });

      const response = await request(app)
        .patch(`/api/tasks/${created.body.id}`)
        .send({ title: 'New title' })
        .expect(200);

      expect(response.body.title).toBe('New title');
      expect(response.body.tags).toEqual(['work']);
    });

    it('should toggle done status with toggleDone', async () => {
      const created = await request(app)
        .post('/api/tasks')
        .send({ title: 'Task' });

      expect(created.body.done).toBe(false);

      const response = await request(app)
        .patch(`/api/tasks/${created.body.id}`)
        .send({ toggleDone: true })
        .expect(200);

      expect(response.body.done).toBe(true);
    });

    it('should return 404 for non-existent task', async () => {
      const response = await request(app)
        .patch('/api/tasks/999')
        .send({ title: 'Updated' })
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('should delete an existing task', async () => {
      const created = await request(app)
        .post('/api/tasks')
        .send({ title: 'To delete' });

      await request(app)
        .delete(`/api/tasks/${created.body.id}`)
        .expect(204);

      const tasks = await request(app).get('/api/tasks').expect(200);
      expect(tasks.body.find((t: any) => t.id === created.body.id)).toBeUndefined();
    });
  });
});

