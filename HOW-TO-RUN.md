# How to Run This Project

This file walks you through running the whole app on your own computer, start
to finish. No prior setup needed beyond having Docker installed.

## What you need first
- **Docker Desktop** installed and running. That's it — the database, backend,
  and frontend all run inside Docker, so you don't need to install Node,
  Postgres, or anything else separately just to run the app.
- (Only needed if you also want to run the automated tests yourself, outside
  Docker) **Node.js** installed on your computer.

## Step 1 — Get into the project folder
Open a terminal and go to the project folder:
```bash
cd employee-internal-transfer
```

## Step 2 — Create your settings file
The project comes with an example settings file. Copy it to create your own:
```bash
cp .env.example .env
```
You don't need to change anything in it — the defaults work out of the box.

## Step 3 — Start everything
You've got two options here. Option A is the simplest (one command, everything
in Docker). Option B runs the frontend and backend directly on your computer
instead — better if you're actively changing code and want instant reload
without rebuilding a Docker image every time.

### Option A — everything in Docker (simplest)
```bash
docker compose up -d --build
```
This one command:
- Downloads and starts the database (PostgreSQL)
- Sets up the database tables and adds some test employees automatically
- Builds and starts the backend (the API)
- Builds and starts the frontend (the website)

The first time you run this, it may take a minute or two while it downloads
and builds things. After that, it's much faster.

### Option B — database in Docker, frontend and backend run directly
Keep only the database in Docker, and run the backend and frontend yourself
in two separate terminals. This needs **Node.js** installed on your computer.

**1. Start just the database:**
```bash
docker compose up -d postgres
```

**2. Terminal 1 — start the backend:**
```bash
cd backend
npm install
DATABASE_URL="postgres://eit:eit@localhost:5433/employee_internal_transfer" npm run migrate
DATABASE_URL="postgres://eit:eit@localhost:5433/employee_internal_transfer" npm start
```
You should see `employee-internal-transfer backend listening on :4000`. Leave
this terminal running.

**3. Terminal 2 — start the frontend:**
```bash
cd frontend
npm install
npm run dev
```
You should see Vite print a local address, normally
`http://localhost:5173`. Leave this terminal running too.

The frontend already knows to talk to the backend at `http://localhost:4000`
by default, so no extra setup is needed — as long as the backend is running
on port 4000 like above.

Now any change you make to the backend or frontend code shows up immediately
(the frontend hot-reloads in the browser; for the backend, stop it with
`Ctrl+C` and run `npm start` again to pick up changes) — no rebuilding a
Docker image each time.

## Step 4 — Open the app
Once it's running, open your browser to:
```
http://localhost:5173
```
You should see the "One-Point Employee Portal" page.

### A quick check that the backend is working
```bash
curl http://localhost:4000/health
```
This should reply with `{"ok":true}`. If it doesn't, see Troubleshooting below.

## Step 5 — Try it out
The app doesn't have a real login (see `ADR-0002` in `.ai-context/decisions/`
for why) — instead, there's a **"Logged in as"** dropdown at the top of the
page with 6 test employees already set up:

| Employee | Role |
|---|---|
| EMP1001 — Aditi Sharma | Regular employee (Engineering) |
| EMP1002 — Rohan Verma | Aditi's manager |
| EMP1003 — Neha Gupta | Regular employee (Sales) |
| EMP1004 — Karan Mehta | Neha's manager |
| EMP1005 — Priya Nair | HR |
| EMP1006 — Suresh Iyer | IT |

A simple walkthrough:
1. Pick **EMP1001 — Aditi Sharma** from the dropdown.
2. Go to the **New Transfer Request** tab, fill in the form (pick a date at
   least 14 days from today), and submit.
3. Switch the dropdown to **EMP1002 — Rohan Verma** (Aditi's manager).
4. Go to the **Stakeholder Inbox** tab — you'll see Aditi's request waiting
   for approval. Click **APPROVE**.
5. Go back to the top dropdown and use the **Stakeholder Inbox** tab's
   **"Acting as"** dropdown to act as **HR**, then **Payroll/IT/Facilities**
   (whichever apply) to move the request forward.
6. Switch back to **EMP1001 — Aditi Sharma**, go to **My Transfer Requests**,
   and once everything's done, click **Confirm**.

You can watch the request's status change the whole way through on the
**My Transfer Requests** tab.

## Stopping the app
**If you used Option A:**
```bash
docker compose down
```
This stops everything but keeps your data (the database) saved for next time.

**If you used Option B:** press `Ctrl+C` in both terminals (backend and
frontend), then stop the database with:
```bash
docker compose down
```

If you want to wipe the data too and start completely fresh:
```bash
docker compose down -v
```

## Running the automated tests
The tests check that every rule in the spec actually works, and they run
against a real database (not a fake one). To run them yourself:

```bash
# 1. Make sure the database is running
docker compose up -d postgres

# 2. Go into the backend folder and install its tools
cd backend
npm install

# 3. Set up the database tables
DATABASE_URL="postgres://eit:eit@localhost:5433/employee_internal_transfer" npm run migrate

# 4. Run the tests
DATABASE_URL="postgres://eit:eit@localhost:5433/employee_internal_transfer" npm test
```
You should see `Tests: 20 passed, 20 total`. See
`assessment/10-gate2-evidence.md` for what this output looked like when we ran
it, including a real example of a test failing first and then passing after a
fix.

## Where everything runs
| Part | Address | What it is |
|---|---|---|
| Frontend (the website) | http://localhost:5173 | What you see in the browser |
| Backend (the API) | http://localhost:4000 | Handles all the logic |
| Database | localhost:5433 | PostgreSQL — not something you open in a browser, just used internally |

## Troubleshooting
**"Cannot connect to the Docker daemon" or similar**
Docker Desktop isn't running. Open the Docker Desktop app and wait until it
says it's running, then try again.

**A port is already in use (5173, 4000, or 5433)**
Something else on your computer is already using that port. Open `.env` and
change the matching line (for example `FRONTEND_HOST_PORT=5174`), then run
`docker compose up -d --build` again.

**The frontend loads but shows errors / can't reach the backend**
Give it a few extra seconds after starting — the database needs to finish
setting itself up before the backend can connect to it. If it's still broken
after a minute, run `docker compose logs backend` to see what went wrong.

**Want to see what's happening inside the containers**
```bash
docker compose logs -f
```
Press `Ctrl+C` to stop watching.

**Want a completely clean restart**
```bash
docker compose down -v
docker compose up -d --build
```

**Using Option B and the backend won't start / port 4000 already in use**
Make sure the Docker `backend` container isn't also running at the same time
— it uses the same port. Stop it with `docker compose stop backend` (the
database can keep running), then start your local backend again.

**Using Option B and the backend can't connect to the database**
Double check the database container is actually running:
`docker compose ps`. If it's not there, run `docker compose up -d postgres`
first, then try starting the backend again.
