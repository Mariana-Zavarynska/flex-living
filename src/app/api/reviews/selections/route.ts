import { NextResponse } from "next/server";
import { toggleSelection, readSelectionDb } from "@/features/reviews/infra/selection.store";
import type { SelectionTogglePayload } from "@/features/reviews/domain/models";

export const runtime = "nodejs";

export async function GET() {
    const db = await readSelectionDb();
    return NextResponse.json({ selectedIds: db.selectedIds });
}

export async function POST(req: Request) {
    try {
        const body = (await req.json()) as SelectionTogglePayload;
        
        if (typeof body.reviewId !== "number" || typeof body.isSelected !== "boolean") {
            console.error("Invalid payload:", body);
            return NextResponse.json(
                { error: `Invalid payload: reviewId must be number, isSelected must be boolean. Got reviewId: ${typeof body.reviewId}, isSelected: ${typeof body.isSelected}` },
                { status: 400 }
            );
        }

        if (!body.listingSlug || typeof body.listingSlug !== "string") {
            console.error("Missing listingSlug:", body);
            return NextResponse.json(
                { error: "Missing or invalid listingSlug" },
                { status: 400 }
            );
        }

        const selectedIds = await toggleSelection(body);
        
        return NextResponse.json({
            ok: true,
            selectedIds,
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error("Selection toggle error:", errorMessage, error);
        return NextResponse.json(
            { error: `Failed to toggle selection: ${errorMessage}` },
            { status: 500 }
        );
    }
}