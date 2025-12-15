# Google Places API Setup Guide

## Step-by-Step Setup

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name (e.g., "Flex Living Reviews")
4. Click "Create"

### 2. Enable Places API (New)

1. In Google Cloud Console, go to **APIs & Services** → **Library**
2. Search for "Places API (New)"
3. Click on it and press **Enable**
4. Wait for it to enable (may take a minute)

### 3. Create API Key

1. Go to **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **API key**
3. Copy the API key (you'll see it in a popup)
4. **Important**: Click "Restrict key" to secure it

### 4. Configure API Key Restrictions (Recommended)

1. Click on your API key to edit it
2. Under **Application restrictions**:
   - For testing: Select "None"
   - For production: Select "HTTP referrers" and add your domain
3. Under **API restrictions**:
   - Select "Restrict key"
   - Check only "Places API (New)"
   - Click "Save"

### 5. Enable Billing (Required)

⚠️ **Important**: Google Places API requires billing to be enabled

1. Go to **Billing** in Google Cloud Console
2. Link a billing account (you get $200 free credit)
3. Note: First 1000 requests/month are free, then $17 per 1000 requests

### 6. Add API Key to Project

1. Create or edit `.env.local` in your project root:
   ```bash
   cd /Users/maryanazavarunska/Desktop/assigments/flex_living
   ```

2. Add the API key:
   ```env
   GOOGLE_PLACES_API_KEY=your_api_key_here
   ```

3. **Restart your dev server** (important!):
   ```bash
   # Stop the server (Ctrl+C)
   # Then restart:
   npm run dev
   ```

### 7. Test the Setup

1. Go to: `http://localhost:3000/test-google`
2. Enter Place ID: `ChIJN1t_tDeuEmsRUsoyG83frY4` (Sydney Opera House)
3. Click "Test API"
4. You should see reviews!

## Quick Test Commands

### Check if API key is set:
```bash
cd /Users/maryanazavarunska/Desktop/assigments/flex_living
cat .env.local | grep GOOGLE_PLACES_API_KEY
```

### Test API directly (replace YOUR_KEY):
```bash
curl "https://places.googleapis.com/v1/places/ChIJN1t_tDeuEmsRUsoyG83frY4" \
  -H "X-Goog-Api-Key: YOUR_KEY" \
  -H "X-Goog-FieldMask: reviews,id,displayName"
```

## Common Errors & Solutions

### Error: "Google Places API key not configured"
- **Solution**: Add `GOOGLE_PLACES_API_KEY` to `.env.local` and restart server

### Error: "403 Forbidden"
- **Solution**: 
  - Check if Places API (New) is enabled
  - Check if billing is enabled
  - Check API key restrictions

### Error: "400 Bad Request"
- **Solution**: Verify Place ID format (should start with ChIJ...)

### Error: "API key restrictions blocking request"
- **Solution**: 
  - Go to API key settings
  - Under "Application restrictions", set to "None" for testing
  - Under "API restrictions", ensure "Places API (New)" is allowed

## Example .env.local File

```env
# Hostaway (optional)
HOSTAWAY_ACCESS_TOKEN=your_token_here
HOSTAWAY_ACCOUNT_ID=your_account_id

# Google Places API (required for Google Reviews)
GOOGLE_PLACES_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Google Place Mappings (optional - for dashboard integration)
GOOGLE_PLACE_MAPPINGS={"property-slug":{"placeId":"ChIJ...","propertyName":"Property Name"}}
```

## Getting a Place ID

### Method 1: Google Maps
1. Search for a business on Google Maps
2. Click on the marker
3. Look at URL: `https://www.google.com/maps/place/.../@lat,lng,zoom/data=!3m1!4b1!4m6!3m5!1s**PLACE_ID**!8m2!3d...`
4. Copy the Place ID (between `1s` and `!8m2`)

### Method 2: Places API Search
```bash
curl -X POST \
  'https://places.googleapis.com/v1/places:searchText' \
  -H 'Content-Type: application/json' \
  -H 'X-Goog-Api-Key: YOUR_KEY' \
  -d '{"textQuery": "Sydney Opera House"}'
```

Look for `id` field in response.

## Test Place IDs (have reviews)

- **Sydney Opera House**: `ChIJN1t_tDeuEmsRUsoyG83frY4`
- **Eiffel Tower**: `ChIJD7fiBh9u5kcRYJSMaMOCCwQ`
- **Statue of Liberty**: `ChIJu46S-ZZhLw4RjO7n2-3ZYYk`

## Next Steps

Once API key is working:
1. Test with the test page: `http://localhost:3000/test-google`
2. Configure `GOOGLE_PLACE_MAPPINGS` to show Google reviews in dashboard
3. See `TESTING_GOOGLE.md` for more details

