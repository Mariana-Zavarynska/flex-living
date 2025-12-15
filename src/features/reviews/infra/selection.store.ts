import fs from "node:fs/promises";
import path from "node:path";
import type { SelectionDb, SelectionTogglePayload } from "../domain/models";

const FILE_PATH = path.join(process.cwd(), "src", "data", "selections.json");


let inMemoryStore: SelectionDb | null = null;


const isServerless = process.env.VERCEL === "1" || process.env.AWS_LAMBDA_FUNCTION_NAME !== undefined;

async function ensureFile(): Promise<void> {
    if (isServerless) {
        return;
    }

    try {
        await fs.access(FILE_PATH);
    } catch {
        const empty: SelectionDb = { selectedIds: [] };
        await fs.mkdir(path.dirname(FILE_PATH), { recursive: true });
        await fs.writeFile(FILE_PATH, JSON.stringify(empty, null, 2), "utf-8");
    }
}

async function readFromFile(): Promise<SelectionDb> {
    try {
        // Try to read file (works in both local and serverless if file exists)
        const raw = await fs.readFile(FILE_PATH, "utf-8");
        const json = JSON.parse(raw) as Partial<SelectionDb> | null;

        return {
            selectedIds: Array.isArray(json?.selectedIds)
                ? json.selectedIds.filter((x) => typeof x === "number")
                : [],
        };
    } catch (error) {
        // File doesn't exist or can't be read - return empty
        return { selectedIds: [] };
    }
}

// Initialize in-memory store from file if available (one-time read, only in serverless)
async function initializeInMemoryStore(): Promise<void> {
    if (inMemoryStore !== null || !isServerless) {
        return; // Already initialized or not in serverless
    }

    try {
        // Try to read from file (might exist in build, even if read-only)
        const fileData = await readFromFile();
        inMemoryStore = fileData;
    } catch {
        // If file read fails, start with empty store
        inMemoryStore = { selectedIds: [] };
    }
}

export async function readSelectionDb(): Promise<SelectionDb> {
    if (isServerless) {
        await initializeInMemoryStore();
        return inMemoryStore || { selectedIds: [] };
    }

    try {
        return await readFromFile();
    } catch (error) {
        console.error("Error reading selection DB:", error);
        return { selectedIds: [] };
    }
}

export async function toggleSelection(payload: SelectionTogglePayload): Promise<number[]> {
    try {
        if (isServerless) {
            await initializeInMemoryStore();
        }
        const db = isServerless ? (inMemoryStore || { selectedIds: [] }) : await readSelectionDb();
        const set = new Set<number>(db.selectedIds);

        if (payload.isSelected) {
            set.add(payload.reviewId);
        } else {
            set.delete(payload.reviewId);
        }

        const next = Array.from(set).sort((a, b) => a - b);
        const updatedDb: SelectionDb = { selectedIds: next };

        if (isServerless) {
            // Update in-memory store
            inMemoryStore = updatedDb;
        } else {
            // Try to write to file, but don't fail if filesystem is read-only
            try {
                await ensureFile();
                await fs.writeFile(FILE_PATH, JSON.stringify(updatedDb, null, 2), "utf-8");
            } catch (writeError) {
                // If write fails (e.g., read-only filesystem), use in-memory as fallback
                console.warn("Failed to write to file, using in-memory store:", writeError);
                inMemoryStore = updatedDb;
            }
        }

        return next;
    } catch (error) {
        console.error("Error in toggleSelection:", error);
        throw new Error(`Failed to toggle selection: ${error instanceof Error ? error.message : String(error)}`);
    }
}
