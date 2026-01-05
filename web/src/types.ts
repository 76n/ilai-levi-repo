export interface Task {
  id: string;
  title: string;
  done: boolean;
  dueDate?: string;
  tags: string[];
  createdAt: string;
}

