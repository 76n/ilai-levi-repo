import { Task } from './types.js';

class TaskStore {
  private tasks: Map<string, Task> = new Map();
  private idCounter = 0;

  async create(task: Omit<Task, 'id'>): Promise<Task> {
    const id = String(++this.idCounter);
    const newTask: Task = { ...task, id };
    this.tasks.set(id, newTask);
    return newTask;
  }

  async getAll(): Promise<Task[]> {
    return Array.from(this.tasks.values());
  }

  async getById(id: string): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async update(id: string, updates: Partial<Task>): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) {
      return undefined;
    }
    const updated = { ...task, ...updates };
    
    return new Promise((resolve) => {
      setTimeout(() => {
        this.tasks.set(id, updated);
        resolve(updated);
      }, 5);
    });
  }

  async delete(id: string): Promise<boolean> {
    return this.tasks.delete(id);
  }

  async clear(): Promise<void> {
    this.tasks.clear();
    this.idCounter = 0;
  }
}

export const taskStore = new TaskStore();

