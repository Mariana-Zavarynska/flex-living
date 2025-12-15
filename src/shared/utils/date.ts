export function hostawayToIso(submittedAt: string): string {
    return new Date(submittedAt.replace(" ", "T") + "Z").toISOString();
}

export function toDayKey(iso: string): string {
    return iso.slice(0, 10);
}

export function toMonthKey(iso: string): string {
    return iso.slice(0, 7);
}
