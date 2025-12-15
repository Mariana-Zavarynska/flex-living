import type { NormalizedReview } from "@/features/reviews/domain/models";
import { 
    Typography, 
    Stack, 
    Card, 
    CardContent, 
    Chip, 
    Divider,
    Box,
    Rating 
} from "@mui/material";

interface Props {
    reviews: NormalizedReview[];
}

function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December'];
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
}

export function PropertyReviews({ reviews }: Props) {
    const ratings = reviews
        .map((r) => r.overallRating ?? r.categoryAverage)
        .filter((r): r is number => r !== null && r > 0);
    
    const avgRating = ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
        : 0;

    if (reviews.length === 0) {
        return (
            <Box component="section">
                <Typography variant="h5" fontWeight={700} gutterBottom>
                    Guest Reviews
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                    No approved reviews yet. Check back soon!
                </Typography>
            </Box>
        );
    }

    return (
        <Box component="section">
            <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box>
                        <Typography variant="h3" fontWeight={700} sx={{ mb: 1 }}>
                            Guest Reviews
                        </Typography>
                        {avgRating > 0 && (
                            <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 1 }}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Rating 
                                        value={avgRating / 2} 
                                        precision={0.1} 
                                        readOnly 
                                        size="large"
                                        sx={{ fontSize: '1.5rem' }}
                                    />
                                    <Typography variant="h6" fontWeight={600} sx={{ ml: 1 }}>
                                        {avgRating.toFixed(1)}
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary">
                                        / 10
                                    </Typography>
                                </Stack>
                                <Typography variant="body1" color="text.secondary">
                                    • {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                                </Typography>
                            </Stack>
                        )}
                    </Box>
                </Box>
            </Box>

            <Stack spacing={3}>
                {reviews.map((review) => (
                    <Card 
                        key={review.id} 
                        variant="outlined" 
                        sx={{ 
                            borderRadius: 2,
                            borderColor: 'rgba(0, 0, 0, 0.12)',
                            boxShadow: 'none',
                            '&:hover': {
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                                transition: 'box-shadow 0.2s ease-in-out'
                            }
                        }}
                    >
                        <CardContent sx={{ p: 3 }}>
                            <Stack 
                                direction="row" 
                                justifyContent="space-between" 
                                alignItems="flex-start" 
                                sx={{ mb: 2 }}
                                flexWrap="wrap"
                                spacing={2}
                            >
                                <Box flex={1}>
                                    <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>
                                        {review.guestName ?? "Anonymous Guest"}
                                    </Typography>
                                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                                        <Typography variant="body2" color="text.secondary">
                                            {formatDate(review.submittedAt)}
                                        </Typography>
                                        {review.channel && (
                                            <>
                                                <Typography variant="body2" color="text.secondary">•</Typography>
                                                <Chip 
                                                    label={review.channel} 
                                                    size="small" 
                                                    variant="outlined"
                                                    sx={{ height: 20, fontSize: '0.75rem' }}
                                                />
                                            </>
                                        )}
                                    </Stack>
                                </Box>
                                {typeof review.overallRating === "number" && (
                                    <Box sx={{ 
                                        bgcolor: 'primary.main', 
                                        color: 'primary.contrastText',
                                        borderRadius: 2,
                                        px: 2,
                                        py: 1,
                                        minWidth: 60,
                                        textAlign: 'center'
                                    }}>
                                        <Typography variant="h5" fontWeight={700}>
                                            {review.overallRating}
                                        </Typography>
                                        <Typography variant="caption" sx={{ opacity: 0.9 }}>
                                            / 10
                                        </Typography>
                                    </Box>
                                )}
                            </Stack>

                            <Typography 
                                variant="body1" 
                                sx={{ 
                                    whiteSpace: "pre-wrap",
                                    lineHeight: 1.7,
                                    color: 'text.primary',
                                    mb: 2
                                }}
                            >
                                {review.publicReview}
                            </Typography>

                            {Object.keys(review.categories).length > 0 && (
                                <>
                                    <Divider sx={{ my: 2 }} />
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                                            Category Ratings:
                                        </Typography>
                                        <Stack direction="row" spacing={1} flexWrap="wrap">
                                            {Object.entries(review.categories).map(([category, rating]) => (
                                                <Chip
                                                    key={category}
                                                    size="small"
                                                    label={`${category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}: ${rating}/10`}
                                                    variant="outlined"
                                                    sx={{ 
                                                        borderColor: rating >= 8 ? 'success.main' : rating >= 6 ? 'warning.main' : 'error.main',
                                                        color: rating >= 8 ? 'success.main' : rating >= 6 ? 'warning.main' : 'error.main'
                                                    }}
                                                />
                                            ))}
                                        </Stack>
                                    </Box>
                                </>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </Stack>
        </Box>
    );
}
