"use client";

import {
    Card,
    CardContent,
    Typography,
    Chip,
    Button,
    Stack,
    Box,
} from "@mui/material";
import type { NormalizedReview } from "../domain/models";

interface Props {
    review: NormalizedReview;
    isSelected: boolean;
    onToggleSelect: (review: NormalizedReview) => void;
}

export function ReviewCard({ review, isSelected, onToggleSelect }: Props) {
    return (
        <Card className="rounded-2xl">
            <CardContent className="flex justify-between gap-4">
                <div className="min-w-0">
                    <Typography fontWeight={800} noWrap>
                        {review.listing.name}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                        {new Date(review.submittedAt).toLocaleDateString()} •{" "}
                        {review.channel ?? "unknown"} • {review.type}
                    </Typography>

                    <Stack direction="row" spacing={1} sx={{ mt: 2 }} flexWrap="wrap">
                        {typeof review.overallRating === "number" && (
                            <Chip 
                                size="small" 
                                label={`Rating: ${review.overallRating}/10`}
                                color="primary"
                                variant="outlined"
                            />
                        )}

                        {isSelected && (
                            <Chip
                                size="small"
                                color="success"
                                label="Approved for website"
                                variant="filled"
                            />
                        )}

                        {review.tags.map((t) => (
                            <Chip 
                                key={t} 
                                size="small" 
                                label={t.replace(/-/g, " ")}
                                color={t.includes("issue") ? "error" : "default"}
                            />
                        ))}
                    </Stack>

                    <Typography variant="body2" sx={{ mt: 2, whiteSpace: "pre-wrap" }}>
                        {review.publicReview}
                    </Typography>

                    {review.channel && (
                        <Box sx={{ mt: 2 }}>
                            <Chip 
                                size="small" 
                                label={review.channel} 
                                variant="outlined"
                                sx={{ fontSize: "0.75rem" }}
                            />
                        </Box>
                    )}
                </div>

                <div className="shrink-0 flex flex-col items-end gap-2">
                    <Button
                        variant={isSelected ? "outlined" : "contained"}
                        onClick={() => onToggleSelect(review)}
                        sx={{ textTransform: "none", fontWeight: 700, borderRadius: 999 }}
                        color={isSelected ? "success" : "primary"}
                    >
                        {isSelected ? "Unapprove" : "Approve"}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
