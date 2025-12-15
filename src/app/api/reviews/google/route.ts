import { NextResponse } from "next/server";
import { fetchGoogleReviews, normalizeGoogleReview } from "../../../../features/reviews/infra/google.client";

export const runtime = "nodejs";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const placeId = searchParams.get("placeId");
    const propertyName = searchParams.get("propertyName") || "Property";

    if (!placeId) {
        return NextResponse.json(
            { error: "placeId query parameter is required" },
            { status: 400 }
        );
    }

    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
        return NextResponse.json(
            {
                error: "Google Places API key not configured",
                message: "Set GOOGLE_PLACES_API_KEY in environment variables"
            },
            { status: 500 }
        );
    }

    try {
        const googleReviews = await fetchGoogleReviews(placeId, apiKey);
        const normalized = googleReviews.map((r) =>
            normalizeGoogleReview(r, placeId, propertyName)
        );

        return NextResponse.json({
            source: "google" as const,
            count: normalized.length,
            reviews: normalized,
        });
    } catch (error) {
        console.error("Google Reviews API error:", error);

        let errorMessage = "Unknown error";
        let statusCode = 500;

        if (error instanceof Error) {
            errorMessage = error.message;

            if (errorMessage.includes("403")) {
                statusCode = 403;
                errorMessage += " - API key may be restricted or Places API not enabled";
            } else if (errorMessage.includes("400")) {
                statusCode = 400;
                errorMessage += " - Invalid Place ID or request format";
            } else if (errorMessage.includes("404")) {
                statusCode = 404;
                errorMessage += " - Place ID not found";
            }
        }

        return NextResponse.json(
            {
                error: "Failed to fetch Google reviews",
                message: errorMessage,
                details: error instanceof Error ? error.stack : undefined
            },
            { status: statusCode }
        );
    }
}

