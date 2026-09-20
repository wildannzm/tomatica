# Tomatica

Real-time IoT monitoring dashboard for tomato plant cultivation. Built with SvelteKit, Supabase, and Prisma.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [SvelteKit](https://kit.svelte.dev) (Svelte 5) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) |
| Database | [Supabase](https://supabase.com) (PostgreSQL) |
| ORM | [Prisma](https://www.prisma.io) |
| Auth | Custom session-based (bcrypt + cookies) |
| Charts | [Chart.js](https://www.chartjs.org) |
| Icons | [Lucide Svelte](https://lucide.dev) |
| Alerts | [SweetAlert2](https://sweetalert2.github.io) |
| Package Manager | [Bun](https://bun.sh) |

## Features

- **Real-time sensor monitoring** — live data via Supabase Realtime (WebSocket)
- **Responsive dashboard** — sensor cards grouped by category (air, soil, weather)
- **Interactive charts** — line charts for 30-point trend analysis with min/max stats
- **Data table** — paginated history with mobile card layout
- **CSV export** — download sensor data as CSV
- **Authentication** — session-based login with bcrypt password hashing
- **Device status detection** — online/offline indicator based on data freshness

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) 18+ or [Bun](https://bun.sh) 1.0+
- A [Supabase](https://supabase.com) project with PostgreSQL database

### Installation

```bash
# Clone the repository
git clone https://github.com/wildannzm/tomatica.git
cd tomatica

# Install dependencies
bun install
```

### Environment Setup

Create a `.env` file in the project root:

```env
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key
DATABASE_URL=postgresql://postgres.your-project-ref:your-db-password@your-pooler-host:6543/postgres?pgbouncer=true&connection_limit=1
```

> Find your Supabase credentials in **Settings → API** (URL and anon key) and **Settings → Database → Connection string** (DATABASE_URL, use Transaction mode / port 6543).

### Database Setup

```bash
# Push Prisma schema to Supabase
bun run db:push
```

### Development

```bash
bun run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Available Scripts

| Script | Description |
|--------|-------------|
| `bun run dev` | Start development server |
| `bun run build` | Create production build |
| `bun run preview` | Preview production build |
| `bun run lint` | Run Prettier + ESLint checks |
| `bun run format` | Auto-format code with Prettier |
| `bun run db:push` | Push Prisma schema to database |
| `bun run db:seed` | Seed admin user |
| `bun run db:seed-sensor` | Seed 100 dummy sensor records |

## Database Schema

### Users

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `username` | String | Unique username |
| `password` | String | bcrypt hashed password |
| `created_at` | Timestamp | Creation time |

### Sessions

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `token` | String | Unique session token |
| `user_id` | UUID | Foreign key → users |
| `expires_at` | Timestamp | Expiration time (7 days) |
| `created_at` | Timestamp | Creation time |

### Sensor Data

| Column | Type | Description |
|--------|------|-------------|
| `id` | Integer | Primary key (auto-increment) |
| `created_at` | Timestamp | Record time |
| `air_temperature` | Float | Air temperature (°C) |
| `air_humidity` | Float | Air humidity (%) |
| `lux` | Float | Light intensity (Lux) |
| `soil_moisture` | Float | Soil moisture (%) |
| `rainfall` | Float | Rainfall (mm/h) |
| `wind_speed` | Float | Wind speed (m/s) |
| `soil_ph` | Float | Soil pH level |
| `nitrogen` | Float | Nitrogen content (mg/kg) |
| `phosphorus` | Float | Phosphorus content (mg/kg) |
| `potassium` | Float | Potassium content (mg/kg) |
| `co2` | Float | CO₂ concentration (ppm) |
| `aqi` | Float | Air Quality Index |

## Project Structure

```
tomatica/
├── prisma/
│   ├── schema.prisma        # Database schema
│   ├── seed.js              # Admin user seeder
│   └── seed-sensor.js       # Dummy sensor data seeder
├── src/
│   ├── hooks.server.js      # Auth middleware (session validation)
│   ├── lib/
│   │   ├── prismaClient.js  # Prisma singleton
│   │   └── supabaseClient.js # Supabase client
│   └── routes/
│       ├── +layout.server.js  # Passes user data to layout
│       ├── +layout.svelte     # Root layout
│       ├── +page.svelte       # Main dashboard
│       ├── login/
│       │   ├── +page.server.js  # Login form action
│       │   └── +page.svelte     # Login page
│       ├── logout/
│       │   ├── +page.server.js  # Logout handler
│       │   └── +page.svelte     # Logout page
│       └── docs/
│           └── +page.svelte     # Technical documentation
├── .env.example
├── package.json
└── svelte.config.js
```

## Authentication

- Passwords are hashed with **bcrypt** (12 rounds)
- Sessions use **crypto.randomUUID()** tokens stored in HttpOnly cookies
- Session expiry: **7 days**
- All routes except `/login` are protected via `hooks.server.js`

## Sensor Data Format

IoT devices (Raspberry Pi / ESP32) send data via Supabase REST API:

```json
{
  "air_temperature": 27.5,
  "air_humidity": 65.2,
  "lux": 3200.0,
  "soil_moisture": 55.0,
  "rainfall": 0.0,
  "wind_speed": 3.5,
  "soil_ph": 6.5,
  "nitrogen": 120,
  "phosphorus": 45,
  "potassium": 110,
  "co2": 520,
  "aqi": 35
}
```

## License

Private project. All rights reserved.
