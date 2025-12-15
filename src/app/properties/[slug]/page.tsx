import Link from "next/link";
import { headers } from "next/headers";
import type { ReviewsApiResponse } from "@/features/reviews/domain/models";
import { PropertyReviews } from "@/features/properties/ui/PropertyReviews";

export const runtime = "nodejs";

async function getBaseUrl() {
    const h = await headers();
    const proto = h.get("x-forwarded-proto") ?? "http";
    const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
    return `${proto}://${host}`;
}

function formatSlug(slug: string | undefined | null): string {
    if (!slug || typeof slug !== "string") {
        return "Property";
    }
    return slug
        .split("-")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

export default async function PropertyPage({ params }: { params: Promise<{ slug: string }> | { slug: string } }) {
    const resolvedParams = params instanceof Promise ? await params : params;
    const slug = resolvedParams?.slug || "";
    
    if (!slug) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="mx-auto max-w-5xl">
                    <h1 className="text-3xl font-bold mb-4">Property Not Found</h1>
                    <p className="text-gray-500 mb-4">Invalid property slug.</p>
                    <Link href="/dashboard" className="text-blue-600 hover:underline">
                        Back to dashboard
                    </Link>
                </div>
            </div>
        );
    }

    let data: ReviewsApiResponse;
    let propertyName: string = formatSlug(slug);
    let allPropertyReviews: ReviewsApiResponse["reviews"] = [];

    try {
        const baseUrl = await getBaseUrl();
        const res = await fetch(`${baseUrl}/api/reviews?listingSlug=${encodeURIComponent(slug)}`, {
            cache: "no-store",
        });

        if (!res.ok) {
            throw new Error(`Failed to fetch reviews: ${res.status}`);
        }

        data = (await res.json()) as ReviewsApiResponse;
        allPropertyReviews = (data.reviews ?? []).filter((r) => r.listing.slug === slug);
        
        if (allPropertyReviews.length > 0 && allPropertyReviews[0]?.listing?.name) {
            propertyName = allPropertyReviews[0].listing.name;
        } else {
            propertyName = formatSlug(slug);
        }
    } catch (error) {
        console.error("Error fetching property data:", error);
        data = {
            source: "mock",
            count: 0,
            selectedIds: [],
            reviews: [],
            byListing: {},
            meta: { channels: [], listingSlugs: [], categories: [] },
        };
        propertyName = formatSlug(slug);
    }

    const selected = new Set(data.selectedIds ?? []);
    const approved = allPropertyReviews.filter((r) => selected.has(r.id));
    
    const extractLocation = (name: string): string => {
        if (!name || typeof name !== "string") return "London";
        const nameLower = name.toLowerCase();
        if (nameLower.includes("shoreditch")) return "Shoreditch, London";
        if (nameLower.includes("camden")) return "Camden, London";
        if (nameLower.includes("soho")) return "Soho, London";
        return "London";
    };

    const getPropertyDetails = (name: string) => {
        if (!name || typeof name !== "string") {
            return { guests: "2-4", bedrooms: "1-2", location: "London" };
        }
        
        const nameLower = name.toLowerCase();
        if (nameLower.includes("studio")) {
            return { guests: "1-2", bedrooms: "Studio", location: extractLocation(name) };
        }
        if (nameLower.includes("1b") || nameLower.includes("1 bed")) {
            return { guests: "2-3", bedrooms: "1", location: extractLocation(name) };
        }
        if (nameLower.includes("2b") || nameLower.includes("2 bed")) {
            return { guests: "2-4", bedrooms: "1-2", location: extractLocation(name) };
        }
        return { guests: "2-4", bedrooms: "1-2", location: extractLocation(name) };
    };

    const finalPropertyName = allPropertyReviews.length > 0 
        ? (allPropertyReviews[0]?.listing?.name || formatSlug(slug))
        : formatSlug(slug);
    
    const propertyDetails = getPropertyDetails(finalPropertyName);

    return (
        <div className="min-h-screen bg-white">
            <header className="border-b bg-white sticky top-0 z-50">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center">
                            <Link href="/" className="text-xl font-bold text-gray-900">
                                Flex Living
                            </Link>
                        </div>
                        <Link 
                            href="/dashboard" 
                            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            Manager Dashboard
                        </Link>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <div className="mb-4">
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">{finalPropertyName}</h1>
                        <p className="text-lg text-gray-600">{propertyDetails.location}</p>
                    </div>

                    <div className="w-full h-96 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl mb-8 flex items-center justify-center">
                        <div className="text-center text-gray-500">
                            <svg className="w-24 h-24 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            <p className="text-sm">Property Image</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                            <div className="text-sm font-medium text-gray-500 mb-1">Guests</div>
                            <div className="text-2xl font-bold text-gray-900">{propertyDetails.guests}</div>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                            <div className="text-sm font-medium text-gray-500 mb-1">Bedrooms</div>
                            <div className="text-2xl font-bold text-gray-900">{propertyDetails.bedrooms}</div>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                            <div className="text-sm font-medium text-gray-500 mb-1">Location</div>
                            <div className="text-2xl font-bold text-gray-900">{propertyDetails.location.split(',')[0]}</div>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                            <div className="text-sm font-medium text-gray-500 mb-1">City</div>
                            <div className="text-2xl font-bold text-gray-900">London</div>
                        </div>
                    </div>
                </div>

                <div className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">About this property</h2>
                    <div className="prose max-w-none">
                        <p className="text-gray-700 leading-relaxed">
                            Experience the best of {propertyDetails.location.split(',')[0]} in this beautifully appointed {propertyDetails.bedrooms.toLowerCase()} property. 
                            Perfect for {propertyDetails.guests}, this space offers modern amenities and a prime location in the heart of London.
                        </p>
                    </div>
                </div>

                <div className="border-t border-gray-200 pt-12">
                    {allPropertyReviews.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-gray-400 mb-4">
                                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No reviews yet</h3>
                            <p className="text-gray-500 mb-4">Be the first to review this property.</p>
                        </div>
                    ) : approved.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-gray-400 mb-4">
                                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No approved reviews yet</h3>
                            <p className="text-gray-500 mb-4">
                                This property has {allPropertyReviews.length} review{allPropertyReviews.length !== 1 ? 's' : ''} pending approval.
                            </p>
                            <p className="text-sm text-gray-400">
                                Reviews must be approved by a manager in the dashboard before they appear here.
                            </p>
                        </div>
                    ) : (
                        <PropertyReviews reviews={approved} />
                    )}
                </div>
            </main>

            <footer className="border-t border-gray-200 mt-16 bg-gray-50">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center text-sm text-gray-500">
                        <p>&copy; {new Date().getFullYear()} Flex Living. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
