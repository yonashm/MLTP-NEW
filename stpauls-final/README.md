# St. Paul's Hospital — Card Department
## Inquiry Management System

Full-stack web application for the Card Department to receive, track, and
respond to medical record inquiries from courts, police, and government offices.

---

## Project structure

```
stpauls-card-dept/
├── frontend/               React 18 SPA
│   ├── src/App.jsx         Complete UI (login + all 8 pages)
│   ├── public/index.html
│   ├── Dockerfile          Multi-stage build → served by Nginx
│   └── package.json
│
├── backend/                Node.js / Express REST API
│   ├── src/
│   │   ├── server.js       Entry point
│   │   ├── db/pool.js      PostgreSQL connection pool
│   │   ├── middleware/
│   │   │   └── auth.js     JWT authentication guard
│   │   └── routes/
│   │       ├── auth.js     POST /api/auth/login, GET /api/auth/me
│   │       ├── inquiries.js GET/POST/PATCH /api/inquiries
│   │       ├── users.js    GET /api/users
│   │       └── reports.js  GET /api/reports/*
│   ├── Dockerfile
│   └── package.json
│
├── database/
│   ├── 01_schema.sql       Tables, enums, triggers, views, functions
│   └── 02_seed.sql         Demo users + 12 sample inquiries
│
├── nginx/
│   └── nginx.conf          Reverse proxy — routes /api → backend, / → frontend
│
├── docker-compose.yml      Full stack orchestration (5 services)
├── .env.example            All environment variables
└── README.md               This file
```

---

## Quick Start (Docker — recommended)

**Requirements:** Docker Desktop installed and running on your machine.

```bash
# 1. Clone / download the project folder
cd stpauls-card-dept

# 2. Create your environment file
cp .env.example .env

# 3. (Optional) Edit .env to change passwords before first run

# 4. Start everything
docker compose up --build -d

# 5. Open the app
#    → http://localhost
```

All five services start automatically:
- **PostgreSQL** — database on port 5432 (internal only)
- **Backend API** — Node.js on port 4000 (internal only)
- **Frontend** — React app (internal only)
- **Nginx** — public entry point on **port 80**
- **pgAdmin** — disabled by default (see below)

**First startup** takes ~2 minutes to build the React app. Subsequent starts are instant.

---

## Accessing the app

| What | URL |
|---|---|
| Main application | http://localhost |
| API health check | http://localhost/api/health |
| pgAdmin (DB browser) | http://localhost:5050 *(tools profile only)* |

### Demo accounts

| Email | Password | Role |
|---|---|---|
| admin@stpauls.et | admin123 | Admin |
| tigist@stpauls.et | staff123 | Staff |
| hana@stpauls.et | staff123 | Staff |
| yonas@stpauls.et | staff123 | Staff |
| supervisor@stpauls.et | super123 | Supervisor |

> Click any demo account on the login screen to autofill credentials.

---

## Common commands

```bash
# Start all services
docker compose up -d

# Start with pgAdmin (DB browser at http://localhost:5050)
docker compose --profile tools up -d

# View logs
docker compose logs -f

# View logs for one service
docker compose logs -f backend

# Stop all services
docker compose down

# Stop and wipe all data (full reset)
docker compose down -v

# Rebuild after code changes
docker compose up --build -d

# Run SQL directly
docker exec -it stpauls_postgres psql -U stpauls_admin -d stpauls_card_dept
```

---

## API Reference

All protected routes require:
```
Authorization: Bearer <token>
```
Obtain a token via `POST /api/auth/login`.

### Auth
| Method | Path | Description |
|---|---|---|
| POST | /api/auth/login | Sign in → returns JWT token |
| GET  | /api/auth/me    | Get current user |

### Inquiries
| Method | Path | Description |
|---|---|---|
| GET    | /api/inquiries              | List all (filter: source, status, search) |
| GET    | /api/inquiries/stats        | Dashboard counts |
| GET    | /api/inquiries/:id          | Full record + audit log |
| POST   | /api/inquiries              | Create new inquiry |
| PATCH  | /api/inquiries/:id          | Update status, response, etc. |
| GET    | /api/inquiries/source/overdue | All overdue inquiries |

### Users & Reports
| Method | Path | Description |
|---|---|---|
| GET    | /api/users              | All active staff |
| PATCH  | /api/users/me           | Update own profile |
| GET    | /api/reports/monthly    | Monthly volume by source |
| GET    | /api/reports/status-breakdown | Count per status per source |
| GET    | /api/reports/staff-workload   | Open/closed per staff member |

---

## Database features

- **Auto-lock on close** — inquiries locked at DB level when status = Closed
- **Edit guard trigger** — locked records throw an error on any UPDATE
- **`next_reference_number()`** — generates INQ-2024-083 style IDs
- **`v_inquiry_summary`** — main view with `deadline_health` computed field
- **`v_overdue_inquiries`** — filtered view for alert page
- **`v_monthly_stats`** — aggregated view for reports page
- **`audit_log`** — append-only trail of every action

---

## Deploying to a server (VPS / cloud)

```bash
# On your server (Ubuntu 22.04 recommended)
sudo apt update && sudo apt install -y docker.io docker-compose-plugin
git clone <your-repo> stpauls-card-dept
cd stpauls-card-dept
cp .env.example .env
nano .env          # Change all passwords and JWT_SECRET
docker compose up --build -d
```

### Point a domain at the server

Edit `nginx/nginx.conf` — change `server_name _;` to `server_name yourdomain.et;`

### Add HTTPS (SSL) with Let's Encrypt

```bash
sudo apt install certbot
sudo certbot certonly --standalone -d yourdomain.et
```
Then update `nginx/nginx.conf` to listen on 443 with the certificate paths.

---

## Production checklist

- [ ] Change `DB_PASSWORD` in `.env`
- [ ] Change `PGADMIN_PASSWORD` in `.env`
- [ ] Set `JWT_SECRET` to a 32+ character random string
- [ ] Set `FRONTEND_URL` to your actual domain
- [ ] Set `APP_PORT=80` (or 443 with SSL)
- [ ] Enable firewall — only expose ports 80 and 443 publicly
- [ ] Set up daily backup cron job (see below)
- [ ] Remove demo seed data (`02_seed.sql`) or change passwords

### Daily backup

```bash
# Add to crontab (crontab -e)
0 2 * * * docker exec stpauls_postgres pg_dump -U stpauls_admin stpauls_card_dept | gzip > /backups/stpauls_$(date +\%Y\%m\%d).sql.gz
```

### Restore from backup

```bash
gunzip -c backup_20241108.sql.gz | docker exec -i stpauls_postgres psql -U stpauls_admin stpauls_card_dept
```

---

## Support

**Hospital:** St. Paul's Hospital Millennium Medical College
**Department:** Card Department
**Email:** cardrecords@stpauls.et
**Phone:** +251 11 275 3050
