import { slugify } from "@/shared/utils/slugify";
import { hostawayToIso } from "@/shared/utils/date";
import type { HostawayReview, NormalizedReview, ReviewSource } from "./models";

function avg(values: number[]): number | null {
    if (!values.length) return null;
    return values.reduce((a, b) => a + b, 0) / values.length;
}

export function normalizeReview(
    review: HostawayReview,
    source: ReviewSource
): NormalizedReview {
    const categories: Record<string, number> = {};
    for (const c of review.reviewCategory ?? []) {
        categories[c.category] = c.rating;
    }

    const categoryAverage = avg(Object.values(categories));

    const tags: string[] = [];
    const text = (review.publicReview ?? "").toLowerCase();

    if (categories.cleanliness !== undefined && categories.cleanliness <= 7) tags.push("cleanliness-issue");
    if (categories.communication !== undefined && categories.communication <= 7) tags.push("communication-issue");
    if (categories.respect_house_rules !== undefined && categories.respect_house_rules <= 7) tags.push("house-rules-issue");

    if (text.includes("dirty") || text.includes("unclean")) {
        if (!tags.includes("cleanliness-issue")) tags.push("cleanliness-issue");
    }

    return {
        id: review.id,
        source,
        listing: {
            name: review.listingName,
            slug: slugify(review.listingName),
        },
        type: review.type,
        status: review.status,
        channel: review.channel ?? null,
        submittedAt: hostawayToIso(review.submittedAt),
        guestName: review.guestName ?? null,
        overallRating: review.rating ?? null,
        publicReview: review.publicReview ?? "",
        categories,
        categoryAverage,
        tags,
    };
}
