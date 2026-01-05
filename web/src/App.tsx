import { useState, useEffect } from 'react';
import { Task } from './types';
import { createTask, getTasks, toggleTask } from './api';

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [error, setError] = useState('');

  const loadTasks = async () => {
    try {
      const filter = filterTag ? { tag: filterTag } : undefined;
      const data = await getTasks(filter);
      setTasks(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
    }
  };

  useEffect(() => {
    loadTasks();
  }, [filterTag]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      await createTask(title, tags.length > 0 ? tags : undefined);
      setTitle('');
      setTagsInput('');
      setError('');
      await loadTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await toggleTask(id);
      setError('');
      await loadTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle task');
    }
  };

  return (
    <div>
      <h1>Task Tracker</h1>

      {error && <div className="error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task title"
        />
        <input
          type="text"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="Tags (comma-separated)"
        />
        <button type="submit">Add Task</button>
      </form>

      <div className="filter-section">
        <input
          type="text"
          value={filterTag}
          onChange={(e) => setFilterTag(e.target.value)}
          placeholder="Filter by tag"
        />
        {filterTag && (
          <button onClick={() => setFilterTag('')}>Clear filter</button>
        )}
      </div>

      <ul className="task-list">
        {tasks.map((task) => (
          <li key={task.id} className={`task-item ${task.done ? 'done' : ''}`}>
            <div className="task-info">
              <div className={`task-title ${task.done ? 'done' : ''}`}>
                {task.title}
              </div>
              <div className="task-meta">
                {task.tags.length > 0 && (
                  <span className="task-tags">
                    {task.tags.map((tag) => (
                      <span key={tag} className="tag">
                        {tag}
                      </span>
                    ))}
                  </span>
                )}
              </div>
            </div>
            <button onClick={() => handleToggle(task.id)}>
              {task.done ? 'Undo' : 'Done'}
            </button>
          </li>
        ))}
      </ul>

      {tasks.length === 0 && <p>No tasks yet. Add one above!</p>}
    </div>
  );
}

export default App;

