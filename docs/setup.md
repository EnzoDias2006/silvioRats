# Local Setup

```bash
bun install
cp .env.example .env
bun run db:generate
bun run db:migrate
bun run dev
```

Web app runs on `http://localhost:5173`.
API runs on `http://localhost:3000`.

## Notes

- Browser mode shows only the install landing page.
- PWA standalone mode is required for the real app shell.
- DigitalOcean Spaces variables are required before photo presign endpoints work.
