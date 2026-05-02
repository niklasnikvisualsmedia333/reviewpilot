# ReviewPilot

ReviewPilot is a lightweight review and testimonial workflow tool for freelancers, local service businesses, small agencies, photographers, videographers, handcraft businesses, practices and consultants.

It helps a small business ask every real customer for honest Google feedback, track manual follow-ups, capture private feedback, manage testimonial permission, and reuse approved customer quotes.

## Key Features

- Dark-mode-first SaaS dashboard with workflow status cards and funnel reporting
- Business setup with Google review link, local QR code generation and QR PNG download
- Customer/project tracking with statuses, filters and follow-up dates
- Deterministic ethical review request generator for WhatsApp, email, SMS and LinkedIn
- German and English templates with editable variables
- Follow-up queue for overdue, due today, upcoming and completed follow-ups
- Feedback capture and reusable testimonial library with permission tracking
- CSV exports for customers and testimonials
- JSON backup export/import with validation
- Local demo data reset
- Browser-local workspace login for separating business profiles on one device
- Guided onboarding for business setup, default language, primary channel and service focus
- Customer analytics fields for customer type, acquisition source and project value

## Tech Stack

- Vite
- React
- TypeScript
- Tailwind CSS
- lucide-react
- recharts
- qrcode
- localStorage persistence
- Local workspace profiles only; no cloud authentication in v0.1
- Vitest

## Run Locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Test

```bash
npm test
```

## Deploy On GitHub Pages

The app is configured for the repository name `reviewpilot` with:

- Vite `base: "/reviewpilot/"`
- GitHub Actions workflow at `.github/workflows/deploy.yml`
- Static build output from `dist`

After pushing to GitHub, enable Pages if needed:

GitHub repository → Settings → Pages → Build and deployment → Source → GitHub Actions.

Expected Pages URL:

```text
https://<your-github-username>.github.io/reviewpilot/
```

## Why v0.1 Is Local-First

ReviewPilot v0.1 is meant to prove the workflow before adding infrastructure. It does not pretend to send messages or scrape reviews. It gives small businesses a practical operating system for manual review collection: clear next actions, copy-ready messages, follow-up tracking, testimonial permission and exports.

The login screen is intentionally browser-local. It separates workspaces on one device but is not a secure cloud account system. Export JSON backups before clearing browser data or switching machines.

## What Is Not Included In v0.1

- No Google API
- No Google review scraping
- No automated SMS or email sending
- No OpenAI API
- No backend
- No cloud authentication or shared team accounts
- No database
- No Stripe
- No paid APIs
- No review gating
- No incentives or manipulative review language

## Ethical Review Collection Principles

- Ask real customers only
- Ask for honest feedback, not only positive reviews
- Do not incentivize reviews
- Do not filter unhappy customers away from public review options
- Use private feedback to improve the business
- Keep review requests respectful and low pressure

## Roadmap

### v0.2

- Supabase Auth and database
- Real customer feedback form with persistent submissions
- Shareable feedback links
- Better QR code exports
- CSV customer import
- Website testimonial widget

### v0.3

- Email sending through the user’s own SMTP or provider
- Scheduled reminders
- Client-facing testimonial wall
- Agency dashboard for multiple businesses
- PDF monthly review report

### v0.4

- Google Business Profile integration if feasible
- Review monitoring
- Reply templates
- Multi-location support
- Reputation insights
