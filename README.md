# Flex Living - Reviews Dashboard

A modern, feature-rich Reviews Dashboard for Flex Living that helps property managers assess property performance based on guest reviews.

## Features

✅ **Hostaway Integration** - Fetches reviews from Hostaway API with automatic fallback to mock data  
✅ **Manager Dashboard** - Comprehensive dashboard with filtering, sorting, and analytics  
✅ **Review Selection** - Select which reviews to display on public property pages  
✅ **Per-Property Analytics** - KPIs showing review counts, ratings, and recurring issues  
✅ **Advanced Filtering** - Filter by property, channel, category, rating, and date range  
✅ **Public Property Pages** - Display selected reviews on property detail pages  
✅ **Modern UI** - Clean, responsive design built with Material-UI and Tailwind CSS  

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4 + Material-UI v7
- **Data Fetching**: SWR
- **Date Handling**: Day.js

## Getting Started

### Prerequisites

- Node.js >= 20.11
- npm or yarn

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   
   Create a `.env.local` file in the project root:
   ```env
   HOSTAWAY_ACCESS_TOKEN=*******
   HOSTAWAY_ACCOUNT_ID=*****
   ```

   Note: The API is sandboxed and typically returns no reviews, so the app will automatically use mock data.

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   
   - Dashboard: [http://localhost:3000/dashboard](http://localhost:3000/dashboard)
   - Home: [http://localhost:3000](http://localhost:3000)
   - Property pages: [http://localhost:3000/properties/{slug}](http://localhost:3000/properties/2b-n1-a-29-shoreditch-heights)

## Project Structure

```
src/
├── app/                    # Next.js App Router pages & API routes
│   ├── api/
│   │   └── reviews/       # API routes for reviews and selections
│   ├── dashboard/         # Manager dashboard page
│   └── properties/        # Public property pages
├── features/
│   ├── reviews/          # Reviews feature module
│   │   ├── domain/       # Business logic & models
│   │   ├── infra/        # External integrations
│   │   └── ui/           # React components
│   └── properties/       # Properties feature module
├── shared/               # Shared utilities
└── data/                 # Mock data & JSON storage
```

## API Routes

- `GET /api/reviews/hostaway` - Fetches and normalizes reviews
- `GET /api/reviews/selections` - Returns selected review IDs
- `POST /api/reviews/selections` - Toggles review selection

## Documentation

For detailed documentation including:
- Architecture decisions
- API behaviors
- Google Reviews exploration
- Future improvements

See [DOCUMENTATION.md](./DOCUMENTATION.md)

## Build for Production

```bash
npm run build
npm start
```

## License

Proprietary - Flex Living
