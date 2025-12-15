import mock from "@/data/mock-reviews.json";
import type { HostawayReview, ReviewSource } from "../domain/models";

interface HostawayResponse {
    status: string;
    result: HostawayReview[];
}

function isHostawayResponse(value: unknown): value is HostawayResponse {
    if (!value || typeof value !== "object") return false;
    const v = value as { status?: unknown; result?: unknown };
    return typeof v.status === "string" && Array.isArray(v.result);
}

export async function fetchHostawayOrMock(): Promise<{
    source: ReviewSource;
    reviews: HostawayReview[];
}> {
    const accessToken = process.env.HOSTAWAY_ACCESS_TOKEN;
    const accountId = process.env.HOSTAWAY_ACCOUNT_ID;

    if (!accessToken) {
        console.warn("HOSTAWAY_ACCESS_TOKEN not set, using mock data");
        return getMockData();
    }

    try {
        const url = new URL("https://api.hostaway.com/v1/reviews");
        if (accountId) {
            url.searchParams.set("accountId", accountId);
        }

        const res = await fetch(url.toString(), {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            cache: "no-store",
            signal: AbortSignal.timeout(10000),
        });

            if (res.ok) {
                const json: unknown = await res.json();
                
                if (isHostawayResponse(json)) {
                    if (json.result && json.result.length > 0) {
                        console.log(`Fetched ${json.result.length} reviews from Hostaway API`);
                        return { source: "hostaway", reviews: json.result };
                    }
                    console.log("Hostaway API returned empty results, using mock data");
                } else {
                    console.warn("Invalid response format from Hostaway API, using mock data");
                }
            } else {
                const errorText = await res.text().catch(() => "");
                console.warn(
                    `Hostaway API error: ${res.status} ${res.statusText}. Using mock data.`,
                    errorText ? `Response: ${errorText.substring(0, 200)}` : ""
                );
            }
        } catch (error) {
            if (error instanceof Error && error.name === "AbortError") {
                console.warn("Hostaway API request timed out, using mock data");
            } else {
                console.warn("Failed to fetch from Hostaway API, using mock data:", error);
            }
        }

    return getMockData();
}

function getMockData(): { source: ReviewSource; reviews: HostawayReview[] } {
    const fallback: unknown = mock;
    if (!isHostawayResponse(fallback)) {
        console.error("Mock data format is invalid");
        return { source: "mock", reviews: [] };
    }

    const reviews = fallback.result ?? [];
    console.log(`Using ${reviews.length} mock reviews`);
    return { source: "mock", reviews };
}
