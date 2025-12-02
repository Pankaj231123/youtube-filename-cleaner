const DEFAULT_REMOVE_WORDS = [
  "final", "copy", "new", "v1", "v2", "v3", "v4",
  "edited", "export", "render", "draft", "version", "()"
];

// keep extension safe
function splitExtension(filename) {
  const lastDot = filename.lastIndexOf(".");
  if (lastDot === -1) return { name: filename, ext: "" };
  return {
    name: filename.slice(0, lastDot),
    ext: filename.slice(lastDot)
  };
}

function normalizeToWords(str) {
  return str
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}
function toSnakeCase(str) {
  return normalizeToWords(str).join("_").toLowerCase();
}

function toCamelCase(str) {
  const words = normalizeToWords(str);
  return words
    .map((w, i) =>
      i === 0
        ? w.toLowerCase()
        : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
    )
    .join("");
}

function toTitleCase(str) {
  return normalizeToWords(str)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join("");
}

// remove junk words, duplicates, brackets, etc.
function cleanBaseName(rawName, removeWords = DEFAULT_REMOVE_WORDS) {
  let s = rawName;

  // remove bracketed parts: (2), [final], {copy}
  s = s.replace(/\([^)]*\)/g, " ");
  s = s.replace(/\[[^\]]*\]/g, " ");
  s = s.replace(/\{[^}]*\}/g, " ");

  // normalize separators
  s = s.replace(/[-.]+/g, " ");
  s = s.replace(/_+/g, " ");
  s = s.replace(/\s+/g, " ").trim();

  // remove junk words (case-insensitive)
  const removeSet = new Set(removeWords.map(w => w.toLowerCase()));
  const words = s.split(" ").filter(w => !removeSet.has(w.toLowerCase()));

  // de-duplicate adjacent words
  const deduped = [];
  for (const w of words) {
    if (
      deduped.length === 0 ||
      deduped[deduped.length - 1].toLowerCase() !== w.toLowerCase()
    ) {
      deduped.push(w);
    }
  }

  return deduped.join(" ").trim();
}

function applyTemplate(template, { niche, title, episode, date }) {
  // Use replaceAll when available; fallback keeps same effect
  const replaceAllSafe = (str, find, repl) =>
    typeof str.replaceAll === "function"
      ? str.replaceAll(find, repl)
      : str.split(find).join(repl);

  let out = template;
  out = replaceAllSafe(out, "{niche}", niche || "");
  out = replaceAllSafe(out, "{title}", title || "");
  out = replaceAllSafe(out, "{episode}", episode != null ? String(episode) : "");
  out = replaceAllSafe(out, "{date}", date || "");
  return out;
}

function formatCase(str, caseStyle) {
  if (!str) return str;
  switch (caseStyle) {
    case "snake": return toSnakeCase(str);
    case "camel": return toCamelCase(str);
    case "title": return toTitleCase(str);
    default: return str;
  }
}

function buildCleanFilename({
  rawFilename,
  template = "{title}_{date}",
  caseStyle = "snake",
  removeWords,
  niche,
  title,
  episode,
  date
}) {
  const { name, ext } = splitExtension(rawFilename);

  const cleanedTitle = cleanBaseName(title || name, removeWords);
  const cleanedNiche = cleanBaseName(niche || "", removeWords);

  const templated = applyTemplate(template, {
    niche: cleanedNiche,
    title: cleanedTitle,
    episode,
    date
  });

  const finalBase = cleanBaseName(templated, removeWords);
  const cased = formatCase(finalBase, caseStyle);

  return cased + ext;
}

module.exports = {
  buildCleanFilename,
  cleanBaseName,
  splitExtension
};
