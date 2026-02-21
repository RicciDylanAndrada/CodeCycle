# CodeCycle

**Anki for LeetCode** — spaced repetition for coding problems.

CodeCycle syncs your solved LeetCode problems and builds a daily review queue using a spaced repetition algorithm. You see problems again at optimal intervals (like Anki flashcards) so patterns stick instead of fading after a few weeks.

---

## Summary

| | Anki | CodeCycle |
|---|------|-----------|
| **Content** | Flashcards | LeetCode problems you’ve solved |
| **Schedule** | Spaced repetition (again, good, easy) | Spaced repetition (failed, struggled, solved, instant) |
| **Source** | You create cards | Synced from your LeetCode account |
| **Goal** | Long-term retention of facts | Long-term retention of patterns & interview readiness |

- **Login:** You paste LeetCode session cookies (no official OAuth). The app stores them encrypted and never sends them to the client.
- **Sync:** Fetches your solved problems via LeetCode’s GraphQL API and stores them in PostgreSQL.
- **Today’s list:** Built from (1) problems due for review (`nextReviewAt ≤ today`) and (2) “fresh” problems (never reviewed, up to your daily goal).
- **Review:** You open the problem on LeetCode, solve or recall, then rate: **Failed** → **Struggled** → **Solved** → **Instant**. The app computes the next review date and saves progress.
- **Settings:** Daily goal, max new per day, and default interval (e.g. 7 days before a synced problem can enter the queue).

---

## How It Works (System Overview)

### High-level architecture

```mermaid
flowchart LR
    subgraph User
        Browser[Browser]
    end
    subgraph CodeCycle
        UI[Next.js Frontend]
        API[API Routes]
        SR[Spaced Repetition]
        DB[(PostgreSQL)]
    end
    subgraph External
        LC[LeetCode GraphQL]
    end
    Browser <--> UI
    UI <--> API
    API --> SR
    API --> DB
    API --> LC
```

- **Frontend:** Next.js (App Router), React, TypeScript, Tailwind. Pages: `/`, `/login`, `/dashboard`, `/review`, `/browse`.
- **Backend:** Next.js API routes. Auth (login/logout), LeetCode proxy (profile, solved), review (today, submit, settings).
- **Data:** PostgreSQL + Prisma. Models: `User`, `Problem`, `UserProblemProgress` (one row per user–problem with `nextReviewAt`, `intervalDays`, etc.).

### Authentication flow (cookie-based)

LeetCode has no public OAuth, so the app uses session cookies.

```mermaid
sequenceDiagram
    participant U as User
    participant LeetCode as LeetCode.com
    participant App as CodeCycle API
    participant DB as Database

    U->>LeetCode: Log in in browser
    U->>U: Copy LEETCODE_SESSION + csrftoken from DevTools
    U->>App: POST /api/auth/login (username, cookies)
    App->>App: Encrypt cookies
    App->>DB: Store User (leetUsername, encrypted cookies)
    App->>U: success
    Note over App: Later: API uses cookies server-side only to call LeetCode GraphQL
```

### Sync and daily list flow

```mermaid
flowchart TD
    A[User clicks Sync] --> B[GET /api/leetcode/solved]
    B --> C[LeetCode GraphQL: recent AC submissions]
    C --> D[Upsert Problem table]
    D --> E[Return count to UI]
    E --> F[GET /api/review/today]
    F --> G{UserProblemProgress with nextReviewAt ≤ today}
    G -->|Due items| H[Add to today list]
    G -->|Slots left| I[Fresh: Problem not in progress, solved 7+ days ago or first sync]
    I --> J[Add up to maxNewPerDay]
    H --> K[Return list capped by dailyGoal]
    J --> K
    K --> L[Dashboard shows Today's Review]
```

### Spaced repetition (review outcome → next interval)

After you rate a problem, the next review date is computed and stored.

```mermaid
flowchart LR
    subgraph Rate
        R1[FAILED]
        R2[STRUGGLED]
        R3[SOLVED]
        R4[INSTANT]
    end
    subgraph Next interval
        N1[1 day]
        N2[interval × 1.2]
        N3[interval × 1.5]
        N4[interval × 2]
    end
    R1 --> N1
    R2 --> N2
    R3 --> N3
    R4 --> N4
```

Formula: `nextReviewAt = today + newIntervalDays`. First review uses a default interval (e.g. 7 days) when the problem enters the queue.

### Data model (conceptual)

```mermaid
erDiagram
    User ||--o{ UserProblemProgress : has
    Problem ||--o{ UserProblemProgress : has
    User {
        uuid id
        string leetUsername
        string sessionCookie
        string csrfToken
        int dailyGoal
        int maxNewPerDay
        int defaultInterval
    }
    Problem {
        uuid id
        string slug
        string title
        string difficulty
        string[] tags
        datetime solvedAt
    }
    UserProblemProgress {
        uuid id
        uuid userId
        uuid problemId
        datetime lastReviewed
        int intervalDays
        datetime nextReviewAt
    }
```

---

## Draw.io diagrams

Editable diagrams (open in [draw.io](https://app.diagrams.net/) or VS Code with Draw.io extension):

| Diagram | File | Description |
|--------|------|-------------|
| System architecture | [docs/diagrams/architecture.drawio](docs/diagrams/architecture.drawio) | Components and data flow |
| Auth & sync flow | [docs/diagrams/auth-and-sync.drawio](docs/diagrams/auth-and-sync.drawio) | Login and LeetCode sync |
| Review & scheduling | [docs/diagrams/review-scheduling.drawio](docs/diagrams/review-scheduling.drawio) | Daily list and spaced repetition |

---

## Tech stack

- **App:** Next.js 16 (App Router), React, TypeScript, Tailwind CSS
- **API:** Next.js API routes, server-side LeetCode GraphQL proxy
- **Data:** Prisma, PostgreSQL (e.g. Neon / Supabase)
- **Deploy:** Vercel + hosted Postgres

---

## Getting started

1. **Clone and install**

   ```bash
   git clone <repo-url>
   cd CodeCycle
   npm install
   ```

2. **Database**

   ```bash
   cp .env.example .env
   # Set DATABASE_URL and DIRECT_URL (PostgreSQL)
   npx prisma migrate dev
   ```

3. **Run**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000). Log in with your LeetCode username and session cookies (from browser DevTools after logging into LeetCode), then sync and use Today’s Review.

---

## Scripts

| Command | Purpose |
|--------|---------|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Run production server |
| `npx prisma migrate dev` | Apply migrations |
| `npx prisma studio` | Open Prisma Studio |

---

## Security notes

- Session and CSRF cookies are stored encrypted and used only on the server.
- All LeetCode requests go through your backend; cookies are never exposed to the client.
- Use HTTPS in production and rotate cookies if you suspect compromise.

---

For full product and technical details, see [PRD.md](PRD.md).
