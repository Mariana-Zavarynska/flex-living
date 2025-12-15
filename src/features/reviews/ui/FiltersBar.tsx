"use client";

import { Box, FormControl, InputLabel, MenuItem, Select, Slider } from "@mui/material";
import dayjs, { Dayjs } from "dayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

export interface FiltersState {
    listingSlug: string;
    channel: string;
    minRating: number;
    from: string;
    to: string;
    category: string;
    maxCategory: number;
}


interface Props {
    listings: string[];
    channels: string[];
    categories: string[];
    value: FiltersState;
    onChange: (next: FiltersState) => void;
}

const MAX_W = "max-w-[320px]";

export function FiltersBar({ listings, channels, categories, value, onChange }: Props) {
    return (
        <Box className="mx-auto max-w-5xl">
            <Box className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">

                <Box className={`md:col-span-3 ${MAX_W}`}>
                    <FormControl size="small" fullWidth>
                        <InputLabel>Property</InputLabel>
                        <Select
                            label="Property"
                            value={value.listingSlug}
                            onChange={(e) => onChange({ ...value, listingSlug: String(e.target.value) })}
                        >
                            <MenuItem value="all">All properties</MenuItem>
                            {listings.map((s) => (
                                <MenuItem key={s} value={s}>
                                    {s.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>

                <Box className={`md:col-span-5 ${MAX_W}`}>
                    <FormControl size="small" fullWidth>
                        <InputLabel>Channel</InputLabel>
                        <Select
                            label="Channel"
                            value={value.channel}
                            onChange={(e) => onChange({ ...value, channel: String(e.target.value) })}
                        >
                            <MenuItem value="all">All channels</MenuItem>
                            {channels.map((c) => (
                                <MenuItem key={c} value={c}>
                                    {c}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>

                <Box className={`md:col-span-4 ${MAX_W}`}>
                    <div className="text-sm opacity-70 mb-1">Min rating: {value.minRating}</div>
                    <Slider
                        size="small"
                        value={value.minRating}
                        min={0}
                        max={10}
                        step={1}
                        sx={{ maxWidth: 280 }}
                        onChange={(_, v) => onChange({ ...value, minRating: v as number })}
                    />
                </Box>

                <Box className={`md:col-span-4 ${MAX_W}`}>
                    <FormControl size="small" fullWidth>
                        <InputLabel>Category</InputLabel>
                        <Select
                            label="Category"
                            value={value.category}
                            onChange={(e) => {
                                const next = String(e.target.value);
                                onChange({
                                    ...value,
                                    category: next,
                                    maxCategory: next === "all" ? 10 : value.maxCategory,
                                });
                            }}
                        >
                            <MenuItem value="all">All categories</MenuItem>
                            {categories.map((c) => (
                                <MenuItem key={c} value={c}>
                                    {c.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>

                <Box className={`md:col-span-4 ${MAX_W}`}>
                    {value.category !== "all" ? (
                        <>
                            <div className="text-sm opacity-70 mb-1">Category max: {value.maxCategory}</div>
                            <Slider
                                size="small"
                                value={value.maxCategory}
                                min={0}
                                max={10}
                                step={1}
                                sx={{ maxWidth: 280 }}
                                onChange={(_, v) => onChange({ ...value, maxCategory: v as number })}
                            />
                        </>
                    ) : (
                        <div className="opacity-40 text-sm pb-2">Pick a category to set max rating</div>
                    )}
                </Box>

                <Box className={`md:col-span-4 ${MAX_W}`}>
                    <div className="grid grid-cols-2 gap-3">
                        <DatePicker
                            label="From"
                            value={value.from ? dayjs(value.from) : null}
                            onChange={(d: Dayjs | null) =>
                                onChange({ ...value, from: d ? d.format("YYYY-MM-DD") : "" })
                            }
                            slotProps={{
                                textField: { size: "small", fullWidth: true },
                            }}
                        />

                        <DatePicker
                            label="To"
                            value={value.to ? dayjs(value.to) : null}
                            onChange={(d: Dayjs | null) =>
                                onChange({ ...value, to: d ? d.format("YYYY-MM-DD") : "" })
                            }
                            slotProps={{
                                textField: { size: "small", fullWidth: true },
                            }}
                        />
                    </div>
                </Box>
            </Box>
        </Box>
    );
}
