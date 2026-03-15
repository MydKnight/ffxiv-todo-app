// Helper: Recursively sort object keys for stable stringification
function canonicalStringify(obj: any): string {
  if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
    const sortedKeys = Object.keys(obj).sort();
    return '{' + sortedKeys.map(key => `"${key}":${canonicalStringify(obj[key])}`).join(',') + '}';
  } else if (Array.isArray(obj)) {
    return '[' + obj.map(canonicalStringify).join(',') + ']';
  } else {
    return JSON.stringify(obj);
  }
}

export function generateDataHash(data: any): string {
  const str = canonicalStringify(data);
  // Simple hash: sum char codes (for TDD, replace with real hash later)
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return hash.toString(16);
}

// Compare two version strings (returns 0 if equal, non-zero otherwise)
export function compareVersions(a: string, b: string): number {
  if (a === b) return 0;
  return a < b ? -1 : 1;
}

// Detect if data has changed by comparing its hash to a previous hash
export function hasDataChanged(data: any, previousHash: string): boolean {
  const currentHash = generateDataHash(data);
  return currentHash !== previousHash;
}
