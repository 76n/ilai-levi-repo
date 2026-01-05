export interface Task {
  id: string;
  title: string;
  done: boolean;
  dueDate?: string;
  tags: string[];
  createdAt: string;
}

export interface CreateTaskRequest {
  title: string;
  dueDate?: string;
  tags?: string[];
}

export interface UpdateTaskRequest {
  title?: string;
  dueDate?: string;
  tags?: string[];
  done?: boolean;
  toggleDone?: boolean;
}

