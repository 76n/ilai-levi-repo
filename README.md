# Task Tracker - Debug Challenge

A simple Task Tracker API (Express + TypeScript) with a React frontend.

**Your mission:** Fix **exactly 4 bugs** — 2 failing tests + 2 runtime issues.

---

## Quick Start

```bash
# Install dependencies
npm install
cd web && npm install && cd ..

# Run tests (shows 2 failures)
npm run server:test

# Start server (http://localhost:4010)
npm run server:dev

# Start web UI (http://localhost:4011)
npm run web:dev

# Or run both together
npm run dev
```

---

## The Challenge

Fix all bugs until:
- ✅ All 11 tests pass (currently 2 failing)
- ✅ Runtime bug #1 is fixed
- ✅ Runtime bug #2 is fixed

---

## Known Issues

### Failing Tests (2)

**Test 1:** `should normalize tags by trimming and lowercasing`
- Tags are lowercased but whitespace isn't being trimmed
- Input: `['  Work  ', 'URGENT', 'home']`
- Expected: `['work', 'urgent', 'home']`
- Actual: `['  work  ', 'urgent', 'home']`

**Test 2:** `should filter tasks by tag case-insensitively`
- Tag filtering doesn't work case-insensitively
- `GET /api/tasks?tag=WORK` should match tasks with tag `'work'`
- Currently returns empty array

### Runtime Bugs (2)

**Bug #1: DELETE ignores task existence**

Deleting a non-existent task returns `204 No Content` instead of `404 Not Found`.

```bash
# Reproduce:
npm run server:dev

# In another terminal:
curl -i -X DELETE http://localhost:4010/api/tasks/fake-id
# Returns 204 ❌ (should return 404)
```

---

**Bug #2: Toggle race condition**

Rapidly toggling a task's done status causes incorrect final state.

```bash
# Reproduce via UI:
npm run dev
# Open http://localhost:4011
# Create a task
# Rapidly double-click "Done" button
# Observe: task ends up in wrong state
```

```bash
# Reproduce via curl:
TASK_ID=$(curl -s -X POST http://localhost:4010/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Test"}' | grep -o '"id":"[^"]*"' | cut -d'"' -f4)

# Send 2 toggles simultaneously
curl -X PATCH http://localhost:4010/api/tasks/$TASK_ID \
  -H "Content-Type: application/json" -d '{"toggleDone":true}' &
curl -X PATCH http://localhost:4010/api/tasks/$TASK_ID \
  -H "Content-Type: application/json" -d '{"toggleDone":true}' &
wait

# Check state (should be false after 2 toggles, but will be true)
curl -s http://localhost:4010/api/tasks | grep done
```

Expected: `false → true → false`  
Actual: Both toggles read same initial state → both set to `true`

---

## API Reference

**POST** `/api/tasks`
- Body: `{ title: string; dueDate?: string; tags?: string[] }`
- Creates a new task

**GET** `/api/tasks`
- Query: `?tag=foo` (case-insensitive), `?q=text` (search in title)
- Returns all tasks (filtered if params provided)

**PATCH** `/api/tasks/:id`
- Body: `{ title?: string; dueDate?: string; tags?: string[]; done?: boolean; toggleDone?: boolean }`
- Updates a task

**DELETE** `/api/tasks/:id`
- Deletes a task

---

## Hints

The bugs involve:
- String normalization (trimming)
- Case-insensitive comparisons
- Validating return values
- Async/concurrency issues with state updates

All bugs are realistic engineering mistakes, not typos. Look in:
- `server/validation.ts` — input normalization
- `server/routes.ts` — request handling
- `server/store.ts` — data persistence

---

## Project Stats

- **Files:** ~15 (6 server, 5 web, 4 config)
- **Lines:** ~740 total
- **Tests:** 11 (9 pass, 2 fail)
- **Stack:** Express, Vitest, React, TypeScript

---

Good luck! 🐛🔍
