import { Task } from './types';

const API_BASE = '/api';

export async function createTask(
  title: string,
  tags?: string[]
): Promise<Task> {
  const response = await fetch(`${API_BASE}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, tags }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create task');
  }

  return response.json();
}

export async function getTasks(filter?: {
  tag?: string;
  q?: string;
}): Promise<Task[]> {
  const params = new URLSearchParams();
  if (filter?.tag) params.set('tag', filter.tag);
  if (filter?.q) params.set('q', filter.q);

  const url = `${API_BASE}/tasks${params.toString() ? '?' + params.toString() : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Failed to fetch tasks');
  }

  return response.json();
}

export async function toggleTask(id: string): Promise<Task> {
  const response = await fetch(`${API_BASE}/tasks/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ toggleDone: true }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to toggle task');
  }

  return response.json();
}

