import { toMonthKey } from "@/shared/utils/date";
import type { NormalizedReview } from "./models";

export interface ListingKpi {
    listingSlug: string;
    listingName: string;
    reviewCount: number;
    avgOverallRating: number | null;
    avgCategoryRating: number | null;
    topIssues: { tag: string; count: number }[];
}

export interface TrendPoint {
    month: string; // YYYY-MM
    avgOverallRating: number | null;
    reviewCount: number;
}

function avg(values: number[]): number | null {
    if (!values.length) return null;
    return values.reduce((a, b) => a + b, 0) / values.length;
}

export function buildListingKpis(reviews: NormalizedReview[]): ListingKpi[] {
    const by = new Map<string, NormalizedReview[]>();
    for (const r of reviews) {
        const key = r.listing.slug;
        by.set(key, [...(by.get(key) ?? []), r]);
    }

    const kpis: ListingKpi[] = [];
    for (const [slug, items] of by.entries()) {
        const overall = items.map((r) => r.overallRating).filter((v): v is number => typeof v === "number");
        const catAvg = items.map((r) => r.categoryAverage).filter((v): v is number => typeof v === "number");

        const tagCounts = new Map<string, number>();
        for (const r of items) {
            for (const t of r.tags) tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1);
        }

        const topIssues = [...tagCounts.entries()]
            .sort((a, b) => b[1] - a[1])
            .slice(0, 4)
            .map(([tag, count]) => ({ tag, count }));

        kpis.push({
            listingSlug: slug,
            listingName: items[0]?.listing.name ?? slug,
            reviewCount: items.length,
            avgOverallRating: avg(overall),
            avgCategoryRating: avg(catAvg),
            topIssues,
        });
    }

    return kpis.sort((a, b) => (b.avgOverallRating ?? -1) - (a.avgOverallRating ?? -1));
}

export function buildRatingTrend(reviews: NormalizedReview[], listingSlug?: string): TrendPoint[] {
    const filtered = listingSlug ? reviews.filter((r) => r.listing.slug === listingSlug) : reviews;

    const byMonth = new Map<string, NormalizedReview[]>();
    for (const r of filtered) {
        const m = toMonthKey(r.submittedAt);
        byMonth.set(m, [...(byMonth.get(m) ?? []), r]);
    }

    return [...byMonth.entries()]
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([month, items]) => {
            const vals = items.map((r) => r.overallRating).filter((v): v is number => typeof v === "number");
            return { month, avgOverallRating: avg(vals), reviewCount: items.length };
        });
}
