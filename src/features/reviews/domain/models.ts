export interface ReviewCategory {
    category: string;
    rating: number; // 0..10
}


export interface HostawayReview {
    id: number;
    type: string;      // e.g. "host-to-guest" / "guest-to-host"
    status: string;    // e.g. "published"
    rating: number | null;
    publicReview: string;
    reviewCategory?: ReviewCategory[];
    submittedAt: string; // "YYYY-MM-DD HH:mm:ss"
    guestName?: string;
    listingName: string;

    channel?: string;      // "airbnb" | "booking" | "google" | ...
    listingId?: number | string;
}

export type ReviewSource = "hostaway" | "mock";

export interface ListingRef {
    name: string;
    slug: string;
}

export interface NormalizedReview {
    id: number;
    source: ReviewSource;

    listing: ListingRef;
    type: string;
    status: string;
    channel: string | null;

    submittedAt: string;       // ISO string
    guestName: string | null;

    overallRating: number | null;
    publicReview: string;

    categories: Record<string, number>; // category -> rating 0..10
    categoryAverage: number | null;

    tags: string[];
}

export interface ReviewsApiResponse {
    source: ReviewSource;
    count: number;
    selectedIds: number[];
    reviews: NormalizedReview[];

    byListing: Record<string, NormalizedReview[]>;
    meta: {
        channels: string[];
        listingSlugs: string[];
        categories: string[];
    };
}

export interface SelectionDb {
    selectedIds: number[];
}

export interface SelectionTogglePayload {
    reviewId: number;
    listingSlug: string;
    isSelected: boolean;
}

export interface SelectionToggleResponse {
    ok: true;
    selectedIds: number[];
}
