# Self-driving loop instructions

This file tells a Claude Code agent how to autonomously make progress on `todo.md`
across many short sessions, using `ScheduleWakeup` to chain iterations. Read this
file at the start of every iteration.

---

## Goal

Work through `todo.md` one task at a time. Each iteration:
**bootstrap → pick → plan → implement → verify → commit & push → mark done →
schedule next**.

Cadence: **1800s (30 min)** between wakeups. Tweak only if a task is genuinely
larger and benefits from a longer gap before the next pickup.

---

## Each iteration

### 1. Bootstrap (≤30 s of context)

```bash
git status
git log --oneline -5
git rev-parse --abbrev-ref HEAD   # confirm we're on architecture-roadmap
```

If not on `architecture-roadmap`, `git checkout architecture-roadmap`.

Read `todo.md` end-to-end. Identify the next `[ ]` item under the
lowest-numbered priority that is **not** marked `[SKIP-IN-LOOP]`.

If `todo.md` has no actionable items left → **stop the loop** (skip
ScheduleWakeup) and post a final summary.

### 2. Plan (≤2 sentences before any tool call)

State out loud: which task, which files, the test plan. Don't enter plan mode —
just say it and start. If the task is bigger than ~60 min, split it: implement
sub-task A this iteration, append sub-task B to `todo.md`.

### 3. Implement

- Edit code with `Edit` / `Write`.
- Backend changes: try them via `curl` against the local `wrangler dev` (port
  8787). If wrangler isn't running, start it: `cd backend && npx wrangler dev
  src/index.ts --port 8787` in the background.
- Frontend changes: HMR via the running Vite dev server (port 5173). If not
  running: `cd frontend && npm run dev` in the background.
- Keep diffs focused. One task per commit.

### 4. Verify

- **Frontend type check**: `cd frontend && npx tsc --noEmit`. The pre-existing
  `ProfilePage.tsx:41 'userBlogs' declared but never read` is allowed; anything
  else is a fail.
- **Backend smoke**: hit the affected endpoint(s) with a real JWT (sign up a
  throwaway user if needed) and assert HTTP 2xx + expected payload shape.
- **No broken commits**: if verify fails, fix before committing. Don't
  commit-and-fix-later.

### 5. Commit and push

```bash
git add <specific files>
git commit -m "$(cat <<'EOF'
<imperative summary, ≤72 char first line>

<2–4 lines: what + why>

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
git push origin architecture-roadmap
```

Do **not** open or merge a PR. The user will batch-merge when they're satisfied.

### 6. Mark the todo done

Edit `todo.md`: change `[ ]` to `[x]` on the completed item. Commit + push that
edit (one-liner commit message: `chore: mark <task> done`).

### 7. Schedule next wakeup

```
ScheduleWakeup(delaySeconds=1800, prompt="<<autonomous-loop-dynamic>>",
               reason="continuing architecture-roadmap; next: <task>")
```

The sentinel `<<autonomous-loop-dynamic>>` is resolved by the runtime to the
autonomous-loop instructions. The next iteration will read this file and
continue.

---

## Hard rules

These are non-negotiable. If a task seems to require violating one, **skip it**
and add a note to `todo.md` explaining why.

1. **Never push to `main`.** Always push to `architecture-roadmap`.
2. **Never merge PRs.** The user merges manually.
3. **Never deploy backend** (no `wrangler deploy`). Local-only changes.
4. **Never apply migrations to remote DB** without explicit user permission.
   `prisma migrate dev` runs against the configured `DATABASE_URL`, which is
   Neon. If a task needs a schema change: edit `schema.prisma`, generate the
   migration with `prisma migrate dev --create-only` (writes SQL but does NOT
   apply), commit it, and add a note to the PR description that migration
   needs human approval to apply.
5. **Never disable hooks** (`--no-verify`), GPG signing, or branch protection.
6. **Never commit secrets.** Even temporary ones. If a task seems to require
   one, mark it `[SKIP-IN-LOOP]` in `todo.md` and pick the next task.
7. **Don't loop on failures.** If three iterations in a row fail to verify,
   stop the loop and notify the user via the final message instead of
   scheduling another wakeup.
8. **Don't widen scope mid-iteration.** If you spot something to fix that isn't
   the current task, add it to `todo.md` and keep going.
9. **No `console.log` of secrets, JWTs, or passwords.** Even temporarily.

## Stop conditions

The loop should self-terminate (skip the final ScheduleWakeup) when:

- All P0–P3 items in `todo.md` are checked or `[SKIP-IN-LOOP]`.
- Three consecutive iterations have failed to verify.
- A task fails in a way that needs human input (missing API key, ambiguous
  product decision, etc.) — mark `[SKIP-IN-LOOP]` and check whether anything
  else is actionable; if nothing is, stop.
- The user explicitly tells the loop to stop.

When stopping: post a summary listing what was completed, what's blocked, and
the suggested next step for the user.

## Handling user interrupts mid-loop

If the user sends a message between wakeups, treat their message as the new
priority. Pause the loop (don't schedule a wakeup at the end of the current
turn unless they explicitly say "keep looping"). The user is always in charge.

## Edge cases

- **Wrangler dev not running**: start it in the background, wait for "Ready
  on http://localhost:8787" via `until grep -q "Ready on" <log>`.
- **Migration creates conflict**: if `prisma migrate dev` fails because a
  prior unapplied migration was committed but not run remotely, prefer
  `--create-only` and document in the commit body.
- **Existing demo accounts in DB**: there are ~25 users in the Neon DB,
  most with no posts. The user with all 6 posts is `akshat@email.com` /
  `akshatgoel`. Use that for any local "needs an existing user with content"
  testing — but **never log the password**.
- **Auto-mode is on**: the runtime is permissive; respect the rules in this
  file even if individual tool calls would succeed.
