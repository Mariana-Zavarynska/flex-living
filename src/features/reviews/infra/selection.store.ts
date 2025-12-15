import fs from "node:fs/promises";
import path from "node:path";
import type { SelectionDb, SelectionTogglePayload } from "../domain/models";

const FILE_PATH = path.join(process.cwd(), "src", "data", "selections.json");

async function ensureFile(): Promise<void> {
    try {
        await fs.access(FILE_PATH);
    } catch {
        const empty: SelectionDb = { selectedIds: [] };
        await fs.mkdir(path.dirname(FILE_PATH), { recursive: true });
        await fs.writeFile(FILE_PATH, JSON.stringify(empty, null, 2), "utf-8");
    }
}

export async function readSelectionDb(): Promise<SelectionDb> {
    try {
        await ensureFile();
        const raw = await fs.readFile(FILE_PATH, "utf-8");
        const json = JSON.parse(raw) as Partial<SelectionDb> | null;

        return {
            selectedIds: Array.isArray(json?.selectedIds)
                ? json.selectedIds.filter((x) => typeof x === "number")
                : [],
        };
    } catch (error) {
        console.error("Error reading selection DB:", error);
        return { selectedIds: [] };
    }
}

export async function toggleSelection(payload: SelectionTogglePayload): Promise<number[]> {
    try {
        await ensureFile();
        const db = await readSelectionDb();
        const set = new Set<number>(db.selectedIds);

        if (payload.isSelected) {
            set.add(payload.reviewId);
        } else {
            set.delete(payload.reviewId);
        }

        const next = Array.from(set).sort((a, b) => a - b);
        const updatedDb: SelectionDb = { selectedIds: next };
        
        await fs.writeFile(FILE_PATH, JSON.stringify(updatedDb, null, 2), "utf-8");
        return next;
    } catch (error) {
        console.error("Error in toggleSelection:", error);
        throw new Error(`Failed to toggle selection: ${error instanceof Error ? error.message : String(error)}`);
    }
}
