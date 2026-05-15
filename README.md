# EthraTask

A full-stack project and task management platform. Teams use it to organize work into projects, assign tasks, track progress, and get a quick read on how things are going — all in one place.

![EthraTask Dashboard](public/logo.png)

---

## What it does

EthraTask is built around three ideas: projects hold the work, tasks move the work forward, and the dashboard tells you where everything stands at a glance.

Each project has its own team. Members can be given admin or member-level access, and those roles actually mean something — admins manage the project and its people, members work the tasks. The dashboard rolls everything up into one view: active projects, task distribution by status, and anything that's fallen overdue.

There's nothing groundbreaking here in terms of concept. The point was to build something that works reliably, looks good, and doesn't get in the way.

---

## Stack

**Frontend** — React 18 (Vite), Tailwind CSS, shadcn/ui, Recharts, Axios

**Backend** — Node.js, Express, PostgreSQL, Zod, bcrypt, JWT

**Deployed on** Railway

---

## Running it locally

You'll need Node 18+ and a running PostgreSQL instance.

```bash
git clone https://github.com/san457/EthraTaskTest.git
cd EthraTaskTest
npm install
```

Create a `.env` in the project root:

```env
DATABASE_URL=postgresql://user:password@host:port/dbname
ACCESS_TOKEN_SECRET=your_access_secret
REFRESH_TOKEN_SECRET=your_refresh_secret
PORT=3000
```

Then:

```bash
npm run dev
```

That spins up the API and the Vite dev server concurrently. The frontend proxies API requests to Express, so no CORS config needed locally.

---

## Building for production

```bash
npm run build   # builds the React client into server/public
npm start       # starts the Express server, which serves the built client
```

Railway runs `npm run build` on deploy and `npm start` to boot the server. The database URL and token secrets are set as environment variables in the Railway dashboard — no `.env` file in production.

---


## Auth

Login returns a short-lived access token (kept in memory) and a refresh token set as an HttpOnly cookie. The refresh endpoint issues new access tokens silently — users stay logged in across page refreshes without the access token ever touching localStorage.

---

## Role-based access

Roles are scoped to individual projects, not the user account globally. The same user can be an admin on one project and a plain member on another.

| Action | Admin | Member |
|---|---|---|
| View project | ✓ | ✓ |
| Edit project details | ✓ | — |
| Invite / remove members | ✓ | — |
| Create tasks | ✓ | ✓ |
| Assign tasks to others | ✓ | — |
| Update status on assigned task | ✓ | ✓ |
| Delete any task | ✓ | — |
| Delete own task | ✓ | ✓ |

One rule worth noting: the last admin on a project can't remove themselves. Someone else has to be promoted first. This is enforced server-side, not just in the UI.

---

## License

MIT
