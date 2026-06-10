export const SECTION_ORDER = ['REPUTATION', 'PRODUCT', 'GROWTH', 'PRESS', 'STRATEGIC TAKE', 'THREAT LEVEL'];

export const SECTION_LABELS = {
  REPUTATION: 'Reputation',
  PRODUCT: 'Product',
  GROWTH: 'Growth',
  PRESS: 'Press',
  'STRATEGIC TAKE': 'Strategic Take',
};

export const THREAT_SEVERITY = { LOW: 0, MEDIUM: 1, HIGH: 2, CRITICAL: 3 };

// We split on the section headers because the Claude system prompt guarantees this
// exact structure. If the system prompt ever changes, this parser breaks — that's
// intentional coupling, same as BriefingCard's parseSections.
export function parseSections(text) {
  const sections = {};
  if (!text) return sections;

  const regex = new RegExp(`(${SECTION_ORDER.join('|')})\\s*\\n+`, 'g');
  const parts = text.split(regex);

  for (let i = 1; i < parts.length; i += 2) {
    const key = parts[i];
    sections[key] = parts[i + 1] ? parts[i + 1].trim() : '';
  }
  return sections;
}

export function extractThreatLevel(text) {
  if (!text) return null;
  const match = text.toUpperCase().match(/\b(LOW|MEDIUM|HIGH|CRITICAL)\b/);
  return match ? match[1] : null;
}

export const THREAT_COLORS = {
  LOW: 'var(--accent-green)',
  MEDIUM: 'var(--accent-yellow)',
  HIGH: '#FF9F4D',
  CRITICAL: 'var(--accent-red)',
};

export function getThreatSeverity(report) {
  const level = extractThreatLevel(parseSections(report)['THREAT LEVEL']);
  return level ? THREAT_SEVERITY[level] : null;
}

export function truncate(str, max) {
  if (!str) return '';
  return str.length > max ? str.slice(0, max) + '…' : str;
}

// Trailing punctuation is excluded so a URL at the end of a sentence doesn't
// swallow the period/comma that follows it.
export const URL_REGEX = /(https?:\/\/[^\s)]*[^\s).,;:!?])/g;

// The model inlines citations like "(Source 1: https://...)" or
// "(Source 1: https://... Source 2: https://...)" even though the same links
// are already rendered as a source list below each section, and sometimes
// leaves a trailing "##" when a section gets cut off at the token limit.
// Strip both so the prose reads cleanly.
export function cleanText(text) {
  if (!text) return '';

  return text
    // Inline citation parentheticals containing one or more "Source N: https://..."
    .replace(/\([^()]*\bSource\s*\d+\s*:\s*https?:\/\/[^()]*\)/gi, '')
    // Leftover markdown heading markers
    .replace(/#+/g, '')
    // Citations cut off mid-URL at the end of a truncated section
    .replace(/\(?\s*Source\s*\d+\s*:\s*https?:\/\/\S*\s*$/gi, '')
    // Empty parens left behind after removing a citation
    .replace(/\(\s*\)/g, '')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\s+([.,;:])/g, '$1')
    .trim();
}

export function hostnameOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}
