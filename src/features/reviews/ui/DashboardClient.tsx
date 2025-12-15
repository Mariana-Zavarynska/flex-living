"use client";

import useSWR from "swr";
import { useMemo, useState, useEffect } from "react";
import { 
    Typography, 
    Chip, 
    Divider, 
    Box, 
    Alert, 
    CircularProgress, 
    Stack, 
    Card, 
    CardContent
} from "@mui/material";
import Link from "next/link";
import type { ReviewsApiResponse, NormalizedReview } from "../domain/models";
import { FiltersBar, type FiltersState } from "./FiltersBar";
import { ReviewCard } from "./ReviewCard";
import { buildListingKpis } from "../domain/analytics";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

const fetcher = (url: string) => fetch(url).then((r) => r.json() as Promise<ReviewsApiResponse>);

export function DashboardClient() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const { data, mutate, isLoading, error } = useSWR("/api/reviews", fetcher, {
        refreshInterval: 30_000,
        revalidateOnFocus: true,
    });

    const [filters, setFilters] = useState<FiltersState>({
        listingSlug: "all",
        channel: "all",
        category: "all",
        maxCategory: 10,
        minRating: 0,
        from: "",
        to: "",
    });

    const selectedSet = useMemo(
        () => new Set<number>(data?.selectedIds ?? []),
        [data?.selectedIds]
    );

    const allReviews = data?.reviews ?? [];
    const filtered = useMemo(() => {
        return allReviews.filter((r) => {
            if (filters.listingSlug !== "all" && r.listing.slug !== filters.listingSlug) return false;
            if (filters.channel !== "all" && r.channel !== filters.channel) return false;
            if (typeof r.overallRating === "number" && r.overallRating < filters.minRating) return false;

            if (filters.category !== "all") {
                const v = r.categories[filters.category];
                if (typeof v === "number" && v > filters.maxCategory) return false;
                if (typeof v !== "number") return false;
            }

            if (filters.from && r.submittedAt.slice(0, 10) < filters.from) return false;
            if (filters.to && r.submittedAt.slice(0, 10) > filters.to) return false;

            return true;
        });
    }, [allReviews, filters]);

    const kpis = useMemo(() => buildListingKpis(filtered), [filtered]);

    const categories = useMemo(() => {
        const set = new Set<string>();
        for (const r of (data?.reviews ?? [])) {
            Object.keys(r.categories).forEach((k) => set.add(k));
        }
        return [...set].sort();
    }, [data?.reviews]);

    const reviewsByProperty = useMemo(() => {
        const grouped: Record<string, NormalizedReview[]> = {};
        for (const review of filtered) {
            const slug = review.listing.slug;
            if (!grouped[slug]) {
                grouped[slug] = [];
            }
            grouped[slug].push(review);
        }
        return grouped;
    }, [filtered]);

    async function toggleSelect(r: NormalizedReview) {
        const currentlySelected = selectedSet.has(r.id);
        const newSelectionState = !currentlySelected;

        try {
            const payload = {
                reviewId: r.id,
                listingSlug: r.listing.slug,
                isSelected: newSelectionState,
            };

            console.log("Toggling selection:", payload);

            const response = await fetch("/api/reviews/selections", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const responseData = await response.json().catch(() => ({}));

            if (!response.ok) {
                console.error("API error response:", response.status, responseData);
                throw new Error(responseData.error || `HTTP ${response.status}: Failed to toggle selection`);
            }

            console.log("Selection toggled successfully:", responseData);
        await mutate();
        } catch (error) {
            console.error("Error toggling selection:", error);
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            alert(`Failed to toggle selection: ${errorMessage}`);
        }
    }

    if (!mounted) {
        return null;
    }

    if (isLoading) {
        return (
            <Box 
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100vh',
                    bgcolor: 'grey.50'
                }}
            >
                <Stack spacing={2} alignItems="center">
                    <CircularProgress />
                    <Typography variant="body2" color="text.secondary">
                        Loading reviews...
                    </Typography>
                </Stack>
            </Box>
        );
    }

    if (error || !data) {
        return (
            <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50', p: 3 }}>
                <Alert severity="error">
                    Failed to load reviews. Please refresh the page or check your connection.
                </Alert>
            </Box>
        );
    }

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
                <Box sx={{ mx: 'auto', maxWidth: '1280px', p: 3 }}>
                    <Box>
                        <Typography variant="h4" fontWeight={900} gutterBottom>
                    Reviews Dashboard
                </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Manage and analyze guest reviews across all properties
                        </Typography>
                    </Box>

                    <Box 
                        sx={{ 
                            display: 'grid', 
                            gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, 
                            gap: 2 
                        }}
                    >
                        <Card>
                            <CardContent>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    Total Reviews
                                </Typography>
                                <Typography variant="h4" fontWeight={700}>
                                    {filtered.length}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Source: {data.source}
                                </Typography>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    Approved for Website
                                </Typography>
                                <Typography variant="h4" fontWeight={700} color="primary">
                                    {selectedSet.size}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {data.reviews.length > 0 
                                        ? `${Math.round((selectedSet.size / data.reviews.length) * 100)}% of total`
                                        : "—"
                                    }
                                </Typography>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    Properties
                                </Typography>
                                <Typography variant="h4" fontWeight={700}>
                                    {data.meta.listingSlugs.length}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Active listings
                                </Typography>
                            </CardContent>
                        </Card>
                    </Box>

                    <Card>
                        <CardContent>
                        <FiltersBar
                            listings={data.meta.listingSlugs}
                            channels={data.meta.channels}
                            value={filters}
                            categories={categories}
                            onChange={setFilters}
                        />
                        </CardContent>
                    </Card>

                    {kpis.length > 0 && (
                        <>
                            <Box>
                                <Typography variant="h6" fontWeight={800} gutterBottom>
                                    Per-Property Performance
                                </Typography>
                                <Stack spacing={2}>
                                {kpis.map((k) => (
                                        <Card variant="outlined" key={k.listingSlug}>
                                            <CardContent>
                                                <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2}>
                                                    <Box flex={1} minWidth={200}>
                                                        <Typography variant="h6" fontWeight={600} gutterBottom>
                                                            {k.listingName}
                                                        </Typography>
                                                        <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ mt: 1 }}>
                                                            <Typography variant="body2" color="text.secondary">
                                                                <strong>{k.reviewCount}</strong> reviews
                                                            </Typography>
                                                            {k.avgOverallRating !== null && (
                                                                <Typography variant="body2" color="text.secondary">
                                                                    Avg: <strong>{k.avgOverallRating.toFixed(1)}/10</strong>
                                                                </Typography>
                                                            )}
                                                            {k.avgCategoryRating !== null && (
                                                                <Typography variant="body2" color="text.secondary">
                                                                    Category: <strong>{k.avgCategoryRating.toFixed(1)}/10</strong>
                                                                </Typography>
                                                            )}
                                                        </Stack>
                                                    </Box>
                                                    <Stack direction="row" spacing={1} flexWrap="wrap">
                                                        {k.topIssues.length > 0 ? (
                                                            k.topIssues.map((i) => (
                                                                <Chip 
                                                                    key={i.tag} 
                                                                    size="small" 
                                                                    label={`${i.tag.replace(/-/g, " ")} (${i.count})`}
                                                                    color={i.count > 2 ? "error" : "warning"}
                                                                />
                                                            ))
                                                        ) : (
                                                            <Chip size="small" label="No issues" color="success" />
                                                        )}
                                                    </Stack>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </Stack>
                            </Box>
                            <Divider />
                        </>
                    )}

                    <Box>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                            <Typography variant="h6" fontWeight={800}>
                                Reviews by Property ({filtered.length} total)
                            </Typography>
                            {filtered.length === 0 && (
                                <Typography variant="body2" color="text.secondary">
                                    No reviews match your filters
                                </Typography>
                            )}
                        </Box>

                        {Object.keys(reviewsByProperty).length > 0 ? (
                            <Stack spacing={4}>
                                {Object.entries(reviewsByProperty).map(([propertySlug, propertyReviews]) => {
                                    const propertyName = propertyReviews[0]?.listing.name || propertySlug;
                                    const approvedCount = propertyReviews.filter(r => selectedSet.has(r.id)).length;
                                    const totalCount = propertyReviews.length;

                                    return (
                                        <Card key={propertySlug} variant="outlined" sx={{ borderRadius: 2 }}>
                                            <CardContent>
                                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
                                                    <Box>
                                                        <Typography variant="h6" fontWeight={700} gutterBottom>
                                                            {propertyName}
                                                        </Typography>
                                                        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                                                            <Typography variant="body2" color="text.secondary">
                                                                {totalCount} review{totalCount !== 1 ? 's' : ''}
                                                            </Typography>
                                                            <Chip 
                                                                size="small" 
                                                                label={`${approvedCount} approved`}
                                                                color={approvedCount > 0 ? "success" : "default"}
                                                                variant={approvedCount > 0 ? "filled" : "outlined"}
                                                            />
                                                            <Typography variant="body2" color="text.secondary">
                                                                {totalCount - approvedCount} pending
                                                            </Typography>
                                                        </Stack>
                                                    </Box>
                                                    <Box>
                                                        <Link 
                                                            href={`/properties/${propertySlug}`}
                                                            style={{ 
                                                                textDecoration: 'none',
                                                                fontSize: '0.875rem',
                                                                color: '#1976d2'
                                                            }}
                                                        >
                                                            View Property Page →
                                                        </Link>
                                                    </Box>
                                                </Box>

                                                <Divider sx={{ mb: 2 }} />

                                                <Stack spacing={2}>
                                                    {propertyReviews.map((review) => (
                                    <ReviewCard
                                                            key={review.id}
                                                            review={review}
                                                            isSelected={selectedSet.has(review.id)}
                                        onToggleSelect={toggleSelect}
                                    />
                                ))}
                                                </Stack>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </Stack>
                        ) : (
                            <Card>
                                <CardContent>
                                    <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                                        No reviews found. Try adjusting your filters.
                                    </Typography>
                                </CardContent>
                            </Card>
                        )}
                    </Box>
                </Box>
            </Box>
            </LocalizationProvider>
);
}
