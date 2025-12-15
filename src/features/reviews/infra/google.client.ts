export interface GoogleReview {
    authorName: string;
    rating: number;
    text: string;
    publishTime: string;
    relativePublishTimeDescription: string;
}

interface GooglePlaceResponse {
    reviews?: GoogleReview[];
    id?: string;
    displayName?: {
        text: string;
    };
}

export async function fetchGoogleReviews(
    placeId: string,
    apiKey: string
): Promise<GoogleReview[]> {
    if (!placeId || !apiKey) {
        console.error("Missing placeId or API key for Google Reviews");
        return [];
    }

    try {
        const url = `https://places.googleapis.com/v1/places/${placeId}`;
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "X-Goog-Api-Key": apiKey,
                "X-Goog-FieldMask": "reviews,id,displayName",
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
                `Google Places API error: ${response.status} ${response.statusText}. ${errorText}`
            );
        }

        const data = (await response.json()) as GooglePlaceResponse;
        return data.reviews || [];
    } catch (error) {
        console.error("Failed to fetch Google reviews:", error);
        throw error;
    }
}

export function normalizeGoogleReview(
    review: GoogleReview,
    placeId: string,
    propertyName: string
) {
    const rating10 = review.rating * 2;
    const submittedAt = review.publishTime || new Date().toISOString();

    return {
        id: `google-${placeId}-${review.publishTime}`,
        source: "google" as const,
        listing: {
            name: propertyName,
            slug: placeId,
        },
        type: "guest-to-host",
        status: "published",
        channel: "google",
        submittedAt,
        guestName: review.authorName || null,
        overallRating: rating10,
        publicReview: review.text || "",
        categories: {},
        categoryAverage: rating10,
        tags: [],
    };
}
