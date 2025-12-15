import { NextResponse } from "next/server";
import { fetchHostawayOrMock } from "@/features/reviews/infra/hostaway.client";
import { normalizeReview } from "@/features/reviews/domain/normalize";
import { fetchGoogleReviews, normalizeGoogleReview } from "@/features/reviews/infra/google.client";
import { readSelectionDb } from "@/features/reviews/infra/selection.store";
import type { ReviewsApiResponse, NormalizedReview } from "@/features/reviews/domain/models";

export const runtime = "nodejs";

interface PropertyPlaceMapping {
    [listingSlug: string]: {
        placeId: string;
        propertyName: string;
    };
}

function getPropertyPlaceMappings(): PropertyPlaceMapping {
    const mappingsEnv = process.env.GOOGLE_PLACE_MAPPINGS;
    if (!mappingsEnv) {
        return {};
    }

    try {
        return JSON.parse(mappingsEnv) as PropertyPlaceMapping;
    } catch {
        console.warn("Invalid GOOGLE_PLACE_MAPPINGS format, skipping Google Reviews");
        return {};
    }
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const listingSlug = searchParams.get("listingSlug")?.trim() || undefined;
    const channel = searchParams.get("channel")?.trim() || undefined;

    const { source: hostawaySource, reviews: hostawayReviews } = await fetchHostawayOrMock();
    const normalizedHostaway = hostawayReviews.map((r) => normalizeReview(r, hostawaySource));

    const googleReviews: NormalizedReview[] = [];
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    const placeMappings = getPropertyPlaceMappings();

    if (apiKey && Object.keys(placeMappings).length > 0) {
        try {
            const relevantMappings = listingSlug 
                ? (placeMappings[listingSlug] ? { [listingSlug]: placeMappings[listingSlug] } : {})
                : placeMappings;

            for (const [slug, mapping] of Object.entries(relevantMappings)) {
                try {
                    const googleReviewsRaw = await fetchGoogleReviews(mapping.placeId, apiKey);
                    const normalized = googleReviewsRaw.map((r) => {
                        const review = normalizeGoogleReview(r, mapping.placeId, mapping.propertyName);
                        review.listing.slug = slug;
                        return review;
                    });
                    googleReviews.push(...normalized);
                } catch (error) {
                    console.warn(`Failed to fetch Google reviews for ${slug}:`, error);
                }
            }
        } catch (error) {
            console.warn("Error fetching Google Reviews:", error);
        }
    }

    const allReviews = [...normalizedHostaway, ...googleReviews];
    const combinedSource: ReviewsApiResponse["source"] = 
        googleReviews.length > 0 ? (normalizedHostaway.length > 0 ? "hostaway" : "google") : hostawaySource;

    const selectionDb = await readSelectionDb();
    const selectedIds = selectionDb.selectedIds;

    const filtered = allReviews.filter((r) => {
        if (listingSlug && r.listing.slug !== listingSlug) {
            return false;
        }
        if (channel && r.channel !== channel) {
            return false;
        }
        return true;
    });

    const categories = Array.from(
        new Set(
            allReviews.flatMap((r) => Object.keys(r.categories ?? {}))
        )
    ).sort();

    const byListing: Record<string, typeof filtered> = {};
    const channels = new Set<string>();
    const slugs = new Set<string>();

    for (const r of filtered) {
        (byListing[r.listing.slug] ??= []).push(r);
        slugs.add(r.listing.slug);
        if (r.channel) channels.add(r.channel);
    }

    const response: ReviewsApiResponse = {
        source: combinedSource,
        count: filtered.length,
        selectedIds,
        reviews: filtered,
        byListing,
        meta: { 
            channels: [...channels].sort(), 
            listingSlugs: [...slugs].sort(), 
            categories: [...categories].sort()  
        },
    };

    return NextResponse.json(response);
}
