# KazakhBuddy

Working demo project with:
- React + Vite frontend
- Node.js + Express backend
- PostgreSQL database
- pgAdmin in browser
- real auth, real buddy requests, matching, and messages

## Main working features

- sign up with confirm password
- sign in after registration
- different dashboards for international student and buddy
- real profile data from database
- Find Buddies page with real buddy accounts from DB
- matching score based on:
  - study program
  - shared languages
  - shared interests
  - gender preference
- student sends buddy request
- buddy accepts or declines request
- max **3 students per buddy**
- after accept, match is created automatically
- after match, chat becomes available in Messages

---

## 1. Programs you need

Install these first:
- Node.js 18+
- Docker Desktop

---

## 2. Open the project

```bash
cd buddy_project-main
```

---

## 3. Create backend `.env`

Create file:

```text
backend/.env
```

Paste this:

```env
PORT=5000
FRONTEND_URL=http://localhost:5173
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/buddy_project
JWT_SECRET=super_secret_change_me
JWT_EXPIRES_IN=7d
```

Important:
- because Docker uses port **5433** on your computer, keep `5433` here
- database name is `buddy_project`

---

## 4. Create frontend `.env`

Create file:

```text
frontend/.env
```

Paste this:

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 5. Start database and pgAdmin

In project root:

```bash
docker compose up -d
```

Check containers:

```bash
docker ps
```

You should see:
- `buddy_postgres`
- `buddy_pgadmin`

---

## 6. Open pgAdmin

Open in browser:

```text
http://localhost:5051
```

Login:
- email: `admin@example.com`
- password: `admin`

Then connect server:

### General
- Name: `Buddy DB`

### Connection
- Host: `postgres`
- Port: `5432`
- Maintenance database: `buddy_project`
- Username: `postgres`
- Password: `postgres`

After that you can see tables in:

```text
Servers
 -> Buddy DB
   -> Databases
     -> buddy_project
       -> Schemas
         -> public
           -> Tables
```

---

## 7. Install packages

### backend

```bash
cd backend
npm install
```

### frontend

Open second terminal:

```bash
cd frontend
npm install
```

---

## 8. Initialize database tables

In backend terminal:

```bash
npm run db:init
```

This creates and updates tables.

---

## 9. Start backend

```bash
npm run dev
```

Expected:

```text
PostgreSQL connected successfully.
Server running on http://localhost:5000
```

Check:

```text
http://localhost:5000/health
```

---

## 10. Start frontend

In frontend terminal:

```bash
npm run dev
```

Open:

```text
http://localhost:5173
```

---

## 11. Demo flow you can show

### Option A: create international student
1. Sign up as **International Student**
2. After success, app sends you to **Login**
3. Sign in
4. Open **Find Buddies**
5. Send a request to a buddy
6. You will see pending status

### Option B: create buddy
1. Sign up as **Buddy**
2. Go to Login
3. Sign in as buddy
4. Open **Buddy Requests**
5. Accept student request
6. Match is created automatically
7. Open **Messages**

### Back to student
1. Sign in as student again
2. Open **Overview** or **Messages**
3. You will see matched buddy and chat

---

## 12. Important database tables

- `users`
- `buddy_requests`
- `buddy_matches`
- `conversations`
- `messages`
- `events`
- `useful_information`

---

## 13. Important notes

- registration does **not** log in automatically
- login and signup are separate now
- dashboards no longer use fake current user like Yuki Tanaka
- buddies in Find Buddies come from real database users with role `local`
- one international student can have only **one active buddy**
- one buddy can have at most **three active students**
- chat is available only after accepted match

---

## 14. If something does not work

Most common fixes:

### database error
Check:
- Docker Desktop is running
- `docker ps` shows `buddy_postgres`
- `.env` uses port `5433`

### frontend error
Run again:

```bash
cd frontend
npm install
npm run dev
```

### backend error
Run again:

```bash
cd backend
npm install
npm run db:init
npm run dev
```


## Updated features in this version

- Editable student and buddy profiles with save/cancel flow
- Real notifications for requests, accepts, declines, and messages
- Working adaptation checklist with progress updates
- Better message input state and clearer time format
- Improved signup form help text and select styling
- Cleaner empty state and success alert on Find Buddies
- Improved student overview "Next Steps" card

## Safe way to run this updated version

If you want the new notifications and checklist tables to exist in your database, do this once:

```bash
cd backend
npm run db:init
```

Important: `npm run db:init` recreates the database structure from `backend/database/init.sql`. If you want to keep your old test data, export it first or use your current database carefully.

Then run the app normally:

```bash
docker compose up -d
```

In one terminal:

```bash
cd backend
npm install
npm run dev
```

In another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend: `http://localhost:5173`
Backend: `http://localhost:5000`
pgAdmin: `http://localhost:5051`
