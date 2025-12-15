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

function hashStringToNumber(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
}

export function normalizeGoogleReview(
    review: GoogleReview,
    placeId: string,
    propertyName: string
) {
    const rating10 = review.rating * 2;
    const submittedAt = review.publishTime || new Date().toISOString();
    const idString = `google-${placeId}-${review.publishTime}`;

    return {
        id: hashStringToNumber(idString),
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
