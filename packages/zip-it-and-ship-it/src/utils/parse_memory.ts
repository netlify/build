// Memory accepts a bare number (interpreted as MB), a numeric string
// (`"2048"`), or a human-friendly size with a unit (`"2gb"`, `"1024mb"`,
// case-insensitive). Everything is normalized to an integer megabyte count.
// Malformed input returns NaN.

const MEMORY_UNIT_TO_MB: Record<string, number> = { mb: 1, gb: 1024 };
const MEMORY_PATTERN = /^(\d+(?:\.\d+)?)\s*(mb|gb)?$/;

export const parseMemoryMB = (input: number | string): number => {
  if (typeof input === "number") {
    return input;
  }

  const match = MEMORY_PATTERN.exec(input.trim().toLowerCase());
  if (!match) {
    return Number.NaN;
  }

  const value = parseFloat(match[1]);
  const unit = match[2] || "mb";

  return Math.round(value * MEMORY_UNIT_TO_MB[unit]);
};
