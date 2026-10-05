// Combining diacritical marks block (U+0300-U+036F), produced by NFD
// decomposition of accented characters. Mirrors the backend slugify util so
// slugs derived here match the ones stored on Brand/Category.
const COMBINING_MARKS_REGEX = /[̀-ͯ]/g;

export const slugify = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(COMBINING_MARKS_REGEX, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export default slugify;
