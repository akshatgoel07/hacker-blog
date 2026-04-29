# Hacker Blog — Architecture Roadmap

A prioritized list of architectural improvements. Each item is sized to fit in one
loop iteration (≈30–60 min of focused work) unless marked **[L]** for large.

The loop driver is `loop.md`. Mark items `[x]` when complete. Add new items at the
bottom of the appropriate priority bucket.

---

## Snapshot (2026-04-29)

Just merged on `main` (PR #1):

- Real `createdAt` / `updatedAt` on posts, dates rendered everywhere
- Related-posts endpoint + "From The Archives" UI
- JWT verify bug fix (`HS256` was missing)
- Old-newspaper UI restyle (parchment palette, blackletter masthead, drop caps)

Open security debt: plaintext passwords in DB, secrets committed to git, JWT has no
expiry, CORS is permissive, no rate limiting.

---

## Priority 0 — Security blockers

- [x] **Hash passwords (lazy migration)** — Web Crypto PBKDF2-SHA256, 100k iterations,
      per-user salt. Store as `pbkdf2$<iter>$<saltB64>$<hashB64>`. On signin: detect
      legacy plaintext, compare, rehash, persist. On signup: hash before insert.
      File: `backend/src/lib/password.ts`, edits to `user.ts`.
- [x] **JWT expiry + iat** — Add `exp` (24h) + `iat` to `sign()`. Frontend should
      handle 401 on expired and redirect to /signin.
- [ ] **Rotate leaked secrets** — Generate new Neon password, JWT secret, Accelerate
      key, Clerk key. Update Cloudflare via `wrangler secret put`. (Skipped from
      autonomous loop — needs human-in-the-loop.) **[SKIP-IN-LOOP]**
- [x] **Move secrets out of git** — Add `.env`, `wrangler.toml` to `.gitignore`,
      `git rm --cached` them, write `.env.example` and `wrangler.example.toml` with
      placeholder values, document in README.
- [x] **CORS lockdown** — Restrict `cors()` to known origins
      (`http://localhost:5173`, deployed Vercel domain). Read from env.
      *`ALLOWED_ORIGINS` (comma-separated) in wrangler.toml; defaults to
      `http://localhost:5173` if unset. Production must add the deployed
      frontend domain.*
- [x] **Strip credential logging** — Remove `console.log(jwt)` in `blog.ts:18`.
      Add lint rule banning `console.log` in `backend/src`.
      *`console.log(jwt)` was already removed in iter 2 when the auth
      middleware got a try/catch; this iter also removed the leftover
      `console.log("control reached after body")` debug line. The
      ESLint rule for backend is deferred until a backend lint config
      exists (currently only frontend has one).*
- [ ] **Rate limiting** — Cloudflare-native: use `@upstash/ratelimit` with KV, or a
      simple per-IP token bucket via Workers KV. Apply to `/signup` and `/signin`
      (5 req/min). **[L]**
- [x] **Standard auth header** — Accept `Authorization: Bearer <jwt>` (currently
      raw token). Update frontend to send `Bearer ` prefix.
      *Backend now accepts both forms (back-compat). Frontend prefix migration
      deferred until centralized API client lands (P3).*
- [x] **Validate on every route** — Use `@hono/zod-validator` with the schemas in
      `common/src/index.ts`. Replace ad-hoc `if (!body.email)` checks.
      *Schemas live in `backend/src/lib/schemas.ts` (the published
      `@100xdevs/medium-common` package's schemas didn't match the actual
      API — `name` vs `username`, no length constraints — so we don't
      depend on it for validation). `validateJson()` helper wraps
      `zValidator` and returns a 400 with the first issue's message.*

## Priority 1 — Performance & scale

- [x] **Paginate `/api/v1/blog/bulk`** — Cursor-based: `?cursor=<id>&limit=20`,
      response `{ posts, nextCursor }`. Update `useBlogs` hook to support
      "load more" / infinite scroll.
      *Response keeps the legacy `post` key alongside `posts` for one-version
      back-compat. UI uses a "Read earlier issues" button (newspaper-themed)
      and an "End of edition" footer when `nextCursor` is null.*
- [ ] **TanStack Query (React Query)** — Replace ad-hoc `useEffect` data fetching
      in `useBlog`, `useBlogs`, `useRelatedBlogs`. Stale-while-revalidate, dedupe
      requests, cache across navigations.
- [ ] **Edge cache GET endpoints** — Wrap public GETs in `Cache.match` /
      `Cache.put` with a 60s TTL. Bust on POST/PUT.
- [x] **DB indexes** — Add `@@index([createdAt(sort: Desc)])` and
      `@@index([authorId, createdAt])` on `Post`. Migration only; safe additive.
      *Migration `20260429100158_add_post_indexes` created with
      `--create-only` (per loop.md rule 4 — no remote schema changes
      from the loop). Indexes: `(createdAt DESC, id DESC)` for the
      cursor pagination and `(authorId, createdAt DESC)` for
      `/get-blogs-for-user`. **User must run `npx prisma migrate
      deploy` (or `prisma migrate dev`) in `backend/` to apply.***
- [x] **Code-split editor route** — `Publish.tsx` pulls in
      `react-markdown-editor-lite` + `markdown-it`; lazy-load via
      `React.lazy` + `Suspense`. Saves ~150KB from the initial bundle.
      *Split: Publish (59KB gzip), Blog (55KB), ProfilePage (27KB)
      now lazy. Main chunk: 163KB gzip.*
- [x] **Memoize markdown render in BlogCard** — `useMemo` on the parsed excerpt;
      currently re-renders on every list re-render.
      *`BlogCard` is now `React.memo`; `excerpt` and `minutes` use
      `useMemo` keyed on `content`.*
- [ ] **Bundle audit** — Three markdown libs in deps (`react-markdown`,
      `markdown-it`, `editorjs`). Drop `editorjs` (unused) and `markdown-it`
      (only used in Publish render preview — `react-markdown` can do it).

## Priority 2 — Core features

- [ ] **Drafts** — Use existing `Post.published` field. Publish.tsx gets a "Save
      draft" button. New `/api/v1/blog/drafts` endpoint (auth-required, current
      user only). Drafts hidden from `/bulk`.
- [ ] **Edit-your-own-post UI** — Reuse Publish.tsx for edit mode at
      `/edit/:id`. Backend PUT already exists; just wire UI + auth check.
- [ ] **Delete post** — Backend `DELETE /:id` (auth + ownership check). UI:
      delete button on user's own posts in `/profile`.
- [ ] **Author profile pages** — `/u/:userId` shows that user's published posts.
      Reuse the BlogCard list component. Public, no auth required.
- [ ] **Tags** — `Tag` model with `@@unique([slug])`, many-to-many to `Post` via
      `_PostTags`. Add tag chips to BlogCard. Filter `/bulk?tag=<slug>`. **[L]**
- [ ] **Comments** — `Comment` model (id, postId, authorId, content, createdAt).
      Threaded later; flat first. Endpoints: `POST /:postId/comments`,
      `GET /:postId/comments`. **[L]**
- [ ] **Search** — Postgres full-text index on `title || content`.
      `GET /search?q=...` returns ranked posts.
- [ ] **Bookmarks** — `Bookmark` join table (userId, postId, createdAt).
      `/bookmarks` page renders saved posts.

## Priority 3 — DX / CI

- [x] **`.env.example` files** — Backend + frontend, with placeholder values and
      one-line comments. README points to them.
      *Done as part of P0.4 (move secrets out of git).*
- [ ] **GitHub Actions** — `.github/workflows/ci.yml`: typecheck, lint, build for
      both `frontend` and `backend` on PR + push to main.
- [ ] **Husky + lint-staged** — Pre-commit: `tsc --noEmit` on staged files.
- [ ] **Vitest + tests** — Backend: route-level tests with a mocked Prisma client.
      Frontend: smoke tests for hooks. Aim for 5–10 starter tests, not coverage.
- [ ] **Share types from `common/`** — `common/src/index.ts` already has Zod
      schemas. Export inferred types for `Post`, `BlogListResponse`, etc., and
      consume in frontend hooks instead of redefining `Blog` interface.
- [ ] **Error envelope** — Backend returns `{ error: { code, message, details? } }`
      consistently. Frontend axios interceptor unwraps.
- [ ] **Structured logging** — Replace `console.log` with a tiny logger
      (`logger.info({...})`). Forbid raw `console.log` via ESLint rule.
- [x] **`wrangler.toml` `main` field** — Add `main = "src/index.ts"` so `wrangler
      dev` doesn't need explicit entry.
      *Set in `wrangler.example.toml` (the canonical template). Local
      `wrangler.toml` is no longer tracked but the user should mirror this
      when copying.*
- [x] **Fix README install steps** — Says `npm start`, actual script is `dev`.
      Add Prisma migration step + wrangler dev step.
      *Done as part of P0.4 README rewrite.*

## Priority 4 — Polish & UX

- [ ] **Restyle Landing page** — Newspaper hero, FeatureGrid as "Sections" of a
      paper, Footer as colophon.
- [ ] **Restyle Publish page** — Editor framed as a typewriter draft. Title input
      large serif. Submit button matches Auth pages.
- [ ] **Restyle ProfilePage** — Index card / desk layout. List user's drafts +
      published posts with edit/delete buttons (depends on P2 drafts/edit/delete).
- [ ] **OG image generator** — Cloudflare Worker route that returns an SVG/PNG OG
      image with title + author + parchment background.
- [ ] **Reading-time accuracy** — Replace `length / 100` with a word-count based
      estimate (~225 wpm).
- [ ] **Empty states** — `/blogs` with zero posts: "No issue today. Check back
      tomorrow." `/profile` with zero drafts: "Your column is blank…".
- [ ] **404 page** — `Route path="*"` with newspaper-style "Story Not Found".
- [ ] **Dark mode toggle** — CSS vars are already there (`.dark`). Just need a
      toggle in the masthead and persistence in localStorage.

## Discovered issues (file as you find them, fix when relevant)

- [ ] **Some post contents contain raw control characters** — `jq` chokes
      parsing `/bulk` for at least one existing post. Either Prisma is
      surfacing unescaped `\n`/`\r` in `Post.content`, or the content was
      written that way during POST. Repro: `curl '/bulk?limit=3' | jq .`
      with the current 8 posts. Fix likely in the create/update path:
      strip or escape disallowed control chars before insert.

---

## Priority 5 — Future / large

- [ ] **OAuth/Google** — Add `googleId String? @unique` to User, make `password`
      nullable. Hono route `/api/v1/auth/google/callback` verifies Google ID
      token. **[L, SKIP-IN-LOOP — needs Google client ID]**
- [ ] **Email verification** — Verification token + email send via Resend or
      Postmark. **[L, SKIP-IN-LOOP — needs email provider key]**
- [ ] **RSS feed** — `/feed.xml` served by the Worker.
- [ ] **Newsletter / digest** — Daily/weekly email of new posts. **[L]**
- [ ] **Image uploads** — Cloudflare R2 presigned upload from Publish editor.
      **[L]**
- [ ] **Threaded comments** — `Comment.parentId` self-relation, max 3 levels deep.
- [ ] **Likes / reactions** — Anonymous-allowed reactions; rate-limit per IP.

---

## How to use this list

1. **Pick the lowest-priority-number unchecked item** that is not `[SKIP-IN-LOOP]`.
2. Implement, test locally, commit on `architecture-roadmap` branch, push.
3. Mark `[x]` and commit that change.
4. Schedule the next wakeup per `loop.md`.
5. When all P0–P3 items are done (or only `[SKIP-IN-LOOP]` remain), stop the loop
   and post a summary.
