# University Church Management System

CASA UENR public website and administrative platform for regions, chapters, members, attendance, events, finances, and content publishing.

## Stack and requirements

- Node.js 20.9 or newer
- Next.js 16.2 / React 19 / TypeScript
- PostgreSQL with Prisma 7 (SQLite is not supported)
- Auth.js v5 credentials authentication
- Tailwind CSS 4, Phosphor icons, Recharts

## Local setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env`. Set PostgreSQL `DATABASE_URL` and a strong random `AUTH_SECRET`.
3. For a new empty database, run `npm run db:migrate`.
4. Set `BOOTSTRAP_ADMIN_EMAIL` and a unique `BOOTSTRAP_ADMIN_PASSWORD` of at least 16 characters, then run `npm run seed:auth`. This creates one national administrator only if that email does not exist. Remove the bootstrap variables afterward. There are no default credentials.
5. Run `npm run dev`.

Demo scripts (`seed:full`, `seed:dummy`, and `seed-uenr.js`) are development fixtures. Never run them against production data.

## Existing databases: migration baseline

This repository previously used `prisma db push` without migration history. Back up the database and verify that its existing schema matches the baseline migration before adopting migrations. Do not execute the baseline SQL against an existing populated database.

For a matching existing schema, mark only the baseline as already applied:

```powershell
npx prisma migrate resolve --applied 20261031000000_baseline
```

Review the currency preflight below, then run `npm run db:migrate` to apply subsequent migrations. If the database differs from the baseline, reconcile the differences in a reviewed migration first. For a new empty database, `npm run db:migrate` applies both migrations normally.

### Currency migration

Transaction amounts now use PostgreSQL `DECIMAL(14,2)`. The migration rounds historical floating-point values to cents. Before deployment, review out-of-range, non-positive, non-finite, and fractional-cent data with your database administrator:

```sql
SELECT id, amount FROM "Transaction"
WHERE amount <= 0 OR amount >= 1000000000000
   OR amount::text IN ('NaN', 'Infinity', '-Infinity')
   OR amount::numeric <> round(amount::numeric, 2);
```

Resolve invalid values and review rounding before applying the migration. New finance API requests must have a positive amount with at most two decimal places and a valid transaction type/date. Bulk imports validate all rows before inserting.

## Deployment

Set `DATABASE_URL`, a strong `AUTH_SECRET`, `AUTH_TRUST_HOST=true`, and the canonical site URL when needed. Configure optional S3-compatible storage from `.env.example`.

Run database migrations as a separate reviewed deployment step:

```powershell
npm run db:migrate
npm run build
npm start
```

The build generates the Prisma client and compiles the application; it does not modify the database. `seed:prod` runs only the explicit create-only administrator bootstrap and never inserts demo records or resets existing passwords.

After changing client components, remove the entire workspace `.next` directory before building, per `AGENTS.md`.

## Checks

```powershell
npm run lint
npm test
npx tsc --noEmit --incremental false
npm run build
```


### Secretary inbox and Arkesel SMS

Public contact submissions are stored for `SITE_CHAPTER_ID`. Only a `SECRETARY` in that
chapter can read/archive them at `/messages`. Other roles cannot access the inbox.

Secretaries use `/announcements` to prepare SMS for active chapter members, student
leaders, or selected active members. Invalid/duplicate phone numbers are excluded.
A preview saves the recipient snapshot; sending requires confirmation and happens once.

Set these server-only environment variables and restart:

```dotenv
SITE_CHAPTER_ID="the-chapter-that-owns-this-website"
ARKESEL_API_KEY="your-arkesel-api-key"
ARKESEL_SENDER_ID="CASA UENR"
```

Use an Arkesel-approved sender ID (at most 11 letters, numbers, or spaces) and fund the
SMS balance. Do not use a `NEXT_PUBLIC_` prefix for these variables. The integration uses
the [Arkesel SMS V2 API](https://developers.arkesel.com/), supports up to 1,000 recipients
per announcement, and estimates GSM-7/Unicode SMS parts before sending.

Accepted means gateway acceptance, not handset delivery. Check Arkesel for final delivery
reports. Unknown or interrupted submissions must be checked before sending another
announcement; the application does not automatically retry ambiguous sends.

Apply migration `20261101010000_secretary_communications` with `npm run db:migrate`
when deploying elsewhere. Contact rate limiting is in memory; use a shared limiter for
multiple application instances.
