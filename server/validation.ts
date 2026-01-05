export function validateTitle(title: unknown): string {
  if (typeof title !== 'string') {
    throw new Error('Title must be a string');
  }
  const trimmed = title.trim();
  if (trimmed.length === 0) {
    throw new Error('Title cannot be empty');
  }
  return trimmed;
}

export function validateDueDate(dueDate: unknown): string | undefined {
  if (dueDate === undefined || dueDate === null) {
    return undefined;
  }
  if (typeof dueDate !== 'string') {
    throw new Error('Due date must be a string');
  }
  const date = new Date(dueDate);
  if (isNaN(date.getTime())) {
    throw new Error('Due date must be a valid ISO date string');
  }
  return date.toISOString();
}

export function normalizeTags(tags: unknown): string[] {
  if (!Array.isArray(tags)) {
    return [];
  }
  return tags
    .filter((tag) => typeof tag === 'string')
    .map((tag) => tag.toLowerCase())
    .filter((tag) => tag.length > 0);
}

