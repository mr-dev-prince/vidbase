type ClassValue = string | false | null | undefined;

/** Joins class names, skipping falsy values. */
export function cn(...classes: ClassValue[]) {
  return classes.filter(Boolean).join(" ");
}

/** 75 -> "01:15", 3725 -> "1:02:05" */
export function formatDuration(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");

  return hours > 0
    ? `${hours}:${pad(minutes)}:${pad(seconds)}`
    : `${pad(minutes)}:${pad(seconds)}`;
}

const compactNumber = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
});

/** 12840 -> "12.8K" */
export function formatCount(value: number) {
  return compactNumber.format(value);
}

/** "Juno Park" -> "JP" */
export function initials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function createId() {
  return crypto.randomUUID();
}

export function randomItem<T>(list: readonly T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}
