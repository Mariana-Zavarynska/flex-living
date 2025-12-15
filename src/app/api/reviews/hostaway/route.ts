import { NextResponse } from "next/server";
import { fetchHostawayOrMock } from "@/features/reviews/infra/hostaway.client";
import { normalizeReview } from "@/features/reviews/domain/normalize";
import { readSelectionDb } from "@/features/reviews/infra/selection.store";
import type { ReviewsApiResponse } from "@/features/reviews/domain/models";

export const runtime = "nodejs";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const listingSlug = searchParams.get("listingSlug")?.trim() || undefined;
    const channel = searchParams.get("channel")?.trim() || undefined;

    const { source, reviews } = await fetchHostawayOrMock();
    const normalizedAll = reviews.map((r) => normalizeReview(r, source));

    const selectionDb = await readSelectionDb();
    const selectedIds = selectionDb.selectedIds;

    const filtered = normalizedAll.filter((r) => {
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
            normalizedAll.flatMap((r) => Object.keys(r.categories ?? {}))
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
        source,
        count: filtered.length,
        selectedIds,
        reviews: filtered,
        byListing,
        meta: { channels: [...channels].sort(), listingSlugs: [...slugs].sort(), categories: [...categories].sort()  },
    };

    return NextResponse.json(response);
}
