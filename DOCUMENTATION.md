# Flex Living Reviews Dashboard - Documentation

## Tech Stack

- Next.js 16 (App Router)
- TypeScript 5
- Tailwind CSS v4 + Material-UI v7
- SWR for data fetching
- Day.js for date handling

## Architecture

Feature-based structure with domain/infra/ui separation:
- `domain/` - Business logic & models
- `infra/` - External integrations (API clients, storage)
- `ui/` - React components

## API Routes

### `/api/reviews/hostaway` (GET)
- Fetches reviews from Hostaway API or mock data
- Query params: `listingSlug`, `channel`
- Returns normalized reviews with metadata

### `/api/reviews/selections` (GET/POST)
- GET: Returns approved review IDs
- POST: Toggles approval status
- Body: `{ reviewId: number, listingSlug: string, isSelected: boolean }`

## Setup

1. Install dependencies: `npm install`
2. Create `.env.local`:
   ```
   HOSTAWAY_ACCESS_TOKEN=******
   HOSTAWAY_ACCOUNT_ID=*****
   ```
3. Run: `npm run dev`
4. Access: `http://localhost:3000/dashboard`

## Features

- Dashboard with reviews grouped by property
- Filter by property, channel, category, rating, date
- Approve/unapprove reviews for public display
- Per-property performance analytics
- Public property pages showing only approved reviews

## Google Reviews Integration

**Status**: ✅ Implemented

**Findings**:
- ✅ Feasible via Google Places API (New)
- Cost: $17 per 1000 requests (first 1000/month free)
- Requires Place ID mapping for each property

**Implementation**:
- Client: `src/features/reviews/infra/google.client.ts`
- API Route: `/api/reviews/google`
- Merged with Hostaway reviews in `/api/reviews`
- Test page: `/test-google`

**Setup**: See `GOOGLE_SETUP.md` for detailed instructions
