# Supabase: connect and run migrations

## One-time setup: connect the CLI to your project

1. **Log in to Supabase (once)**  
   In your terminal (needs a TTY/browser for interactive login):

   ```bash
   supabase login
   ```

   Or use an access token (e.g. for CI or non-interactive use):
   - Create a token at [Supabase Account → Access Tokens](https://supabase.com/dashboard/account/tokens)
   - Then: `export SUPABASE_ACCESS_TOKEN=your_token`

2. **Link this repo to your remote project**  
   Ensure `.env` has `SUPABASE_PROJECT_ID` (your project ref from the dashboard URL).

   ```bash
   # Load project ref from .env, then link (you’ll be prompted for DB password)
  source .env 2>/dev/null || true
   supabase link --project-ref $SUPABASE_PROJECT_ID
   ```

   When prompted, use the **database password** from:  
   Supabase Dashboard → **Project Settings** → **Database** → “Database password”.

## Run migrations

After linking, push all pending migrations:

```bash
npm run db:push
# or
supabase db push
```

## Run migration manually (without CLI)

If you prefer not to use the CLI:

1. Open **Supabase Dashboard** → **SQL Editor**.
2. Paste the contents of `supabase/migrations/20250207000000_pending_profiles.sql`.
3. Run the script.

Note: run migrations in order (earlier migrations must already be applied).
