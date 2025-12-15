"use client";

import { useState } from "react";
import { Box, Button, TextField, Typography, Card, CardContent, Stack, Alert, CircularProgress } from "@mui/material";

export default function TestGooglePage() {
    const [placeId, setPlaceId] = useState("");
    const [propertyName, setPropertyName] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    async function testGoogleAPI() {
        if (!placeId.trim()) {
            setError("Please enter a Place ID");
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await fetch(
                `/api/reviews/google?placeId=${encodeURIComponent(placeId)}&propertyName=${encodeURIComponent(propertyName || "Test Property")}`
            );

            const data = await response.json();

            if (!response.ok) {
                const errorMsg = data.message || data.error || `HTTP ${response.status}: Unknown error`;
                const fullError = `${data.error || "Error"}: ${errorMsg}`;
                throw new Error(fullError);
            }

            setResult(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error occurred");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "grey.50", p: 4 }}>
            <Box sx={{ maxWidth: "800px", mx: "auto" }}>
                <Typography variant="h4" fontWeight={700} gutterBottom>
                    Google Places API Test
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                    Test if Google Places API is configured correctly and can fetch reviews
                </Typography>

                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Stack spacing={3}>
                            <TextField
                                label="Place ID"
                                value={placeId}
                                onChange={(e) => setPlaceId(e.target.value)}
                                placeholder="e.g., ChIJN1t_tDeuEmsRUsoyG83frY4"
                                fullWidth
                                helperText="Find Place ID using Google Places API Geocoding or Place Search"
                            />
                            <TextField
                                label="Property Name (optional)"
                                value={propertyName}
                                onChange={(e) => setPropertyName(e.target.value)}
                                placeholder="e.g., Flex Living Property"
                                fullWidth
                            />
                            <Button
                                variant="contained"
                                onClick={testGoogleAPI}
                                disabled={loading || !placeId.trim()}
                                sx={{ alignSelf: "flex-start" }}
                            >
                                {loading ? <CircularProgress size={24} /> : "Test API"}
                            </Button>
                        </Stack>
                    </CardContent>
                </Card>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        <Typography variant="body2" fontWeight={600} gutterBottom>
                            Error Details:
                        </Typography>
                        <Typography variant="body2" component="pre" sx={{ 
                            whiteSpace: "pre-wrap", 
                            wordBreak: "break-word",
                            fontFamily: "monospace",
                            fontSize: "0.875rem",
                            bgcolor: "rgba(0,0,0,0.05)",
                            p: 1,
                            borderRadius: 1,
                            mb: 2
                        }}>
                            {error}
                        </Typography>
                        <Typography variant="caption" sx={{ mt: 1, display: "block" }}>
                            <strong>Common issues & solutions:</strong>
                            <br />• <strong>API key not set:</strong> Add GOOGLE_PLACES_API_KEY=your_key to .env.local and restart server
                            <br />• <strong>Invalid Place ID:</strong> Verify Place ID format (starts with ChIJ...)
                            <br />• <strong>Places API not enabled:</strong> Enable "Places API (New)" in Google Cloud Console
                            <br />• <strong>API key restrictions:</strong> Check API key restrictions in Google Cloud Console
                            <br />• <strong>403 Forbidden:</strong> API key may be restricted or billing not enabled
                            <br />• <strong>400 Bad Request:</strong> Invalid Place ID or API key format
                            <br />
                            <br /><strong>Check server console</strong> (terminal where npm run dev is running) for detailed error logs
                        </Typography>
                    </Alert>
                )}

                {result && (
                    <Card>
                        <CardContent>
                            <Typography variant="h6" fontWeight={600} gutterBottom>
                                Success! Found {result.count || 0} reviews
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Source: {result.source}
                            </Typography>
                            {result.reviews && result.reviews.length > 0 ? (
                                <Stack spacing={2}>
                                    {result.reviews.slice(0, 3).map((review: any, idx: number) => (
                                        <Box
                                            key={idx}
                                            sx={{
                                                p: 2,
                                                bgcolor: "grey.100",
                                                borderRadius: 1,
                                            }}
                                        >
                                            <Typography variant="body2" fontWeight={600}>
                                                {review.guestName || "Anonymous"}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Rating: {review.overallRating}/10
                                            </Typography>
                                            <Typography variant="body2" sx={{ mt: 1 }}>
                                                {review.publicReview.substring(0, 200)}
                                                {review.publicReview.length > 200 ? "..." : ""}
                                            </Typography>
                                        </Box>
                                    ))}
                                    {result.reviews.length > 3 && (
                                        <Typography variant="caption" color="text.secondary">
                                            ... and {result.reviews.length - 3} more reviews
                                        </Typography>
                                    )}
                                </Stack>
                            ) : (
                                <Typography variant="body2" color="text.secondary">
                                    No reviews found for this Place ID
                                </Typography>
                            )}
                            <Box sx={{ mt: 3, p: 2, bgcolor: "grey.100", borderRadius: 1 }}>
                                <Typography variant="caption" component="pre" sx={{ fontFamily: "monospace", fontSize: "0.75rem", overflow: "auto" }}>
                                    {JSON.stringify(result, null, 2)}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                )}

                <Card sx={{ mt: 3 }}>
                    <CardContent>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                            How to get a Place ID
                        </Typography>
                        <Stack spacing={2}>
                            <Typography variant="body2">
                                <strong>Method 1: Using Google Places API Geocoding</strong>
                                <br />
                                <code style={{ fontSize: "0.75rem", display: "block", marginTop: "4px" }}>
                                    GET https://places.googleapis.com/v1/places:searchText
                                    <br />
                                    Headers: X-Goog-Api-Key: YOUR_KEY
                                    <br />
                                    Body: {"{"}"textQuery": "Your Property Address"{"}"}
                                </code>
                            </Typography>
                            <Typography variant="body2">
                                <strong>Method 2: Using Google Maps</strong>
                                <br />
                                1. Search for your property on Google Maps
                                <br />
                                2. Click on the property marker
                                <br />
                                3. Look in the URL: place_id=ChIJ... (the part after the =)
                            </Typography>
                            <Typography variant="body2">
                                <strong>Method 3: Test with a known Place ID</strong>
                                <br />
                                Try: <code>ChIJN1t_tDeuEmsRUsoyG83frY4</code> (Sydney Opera House - has reviews)
                            </Typography>
                        </Stack>
                    </CardContent>
                </Card>
            </Box>
        </Box>
    );
}

