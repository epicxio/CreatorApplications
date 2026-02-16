# E2E tests (Playwright)

## Running tests

From the **frontend** directory:

```bash
npm run test:e2e
```

## Prerequisites

- **Backend** and **frontend** must be running (e.g. backend on port 5001, frontend on 3000).
- Optional: set `E2E_USER_EMAIL` and `E2E_USER_PASSWORD` for the certificate flow test; if unset, that test is skipped.

## Config

- Playwright config: `frontend/playwright.config.ts`
- Base URL: `PLAYWRIGHT_TEST_BASE_URL` or `http://localhost:3000`
- In CI, the config can start the frontend via `webServer` when `CI` is set.
