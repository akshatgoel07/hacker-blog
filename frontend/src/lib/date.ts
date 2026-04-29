export function formatPublishedDate(value?: string | Date | null): string {
  if (!value) return "Unpublished";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "Unpublished";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
