// Smart validation utilities with fuzzy matching and auto-correction

export interface AutoCorrectionResult {
  corrected: string;
  confidence: number;
  suggestions: string[];
}

// Levenshtein distance for fuzzy matching
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
  
  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,     // deletion
        matrix[j - 1][i] + 1,     // insertion
        matrix[j - 1][i - 1] + indicator  // substitution
      );
    }
  }
  
  return matrix[str2.length][str1.length];
}

// Order Type Auto-Correction
const ORDER_TYPE_CORRECTIONS: Record<string, string> = {
  'shipmnt': 'Shipment',
  'shipment': 'Shipment',
  'ship': 'Shipment',
  'deliver': 'Shipment',
  'delivery': 'Shipment',
  'exchnge': 'Exchange',
  'exchange': 'Exchange',
  'exch': 'Exchange',
  'return': 'Exchange',
  'ret': 'Exchange'
};

const VALID_ORDER_TYPES = ['Shipment', 'Exchange'];

export function correctOrderType(input: string): AutoCorrectionResult {
  if (!input) {
    return {
      corrected: 'Shipment',
      confidence: 0,
      suggestions: VALID_ORDER_TYPES
    };
  }

  const normalized = input.toLowerCase().trim();
  
  // Direct correction match
  const directCorrection = ORDER_TYPE_CORRECTIONS[normalized];
  if (directCorrection) {
    return {
      corrected: directCorrection,
      confidence: 0.9,
      suggestions: [directCorrection]
    };
  }

  // Exact match (case insensitive)
  const exactMatch = VALID_ORDER_TYPES.find(type => 
    type.toLowerCase() === normalized
  );
  if (exactMatch) {
    return {
      corrected: exactMatch,
      confidence: 1.0,
      suggestions: [exactMatch]
    };
  }

  // Fuzzy matching
  const fuzzyMatches = VALID_ORDER_TYPES
    .map(type => ({
      type,
      distance: levenshteinDistance(normalized, type.toLowerCase())
    }))
    .filter(match => match.distance <= 2)
    .sort((a, b) => a.distance - b.distance);

  if (fuzzyMatches.length > 0) {
    const bestMatch = fuzzyMatches[0];
    return {
      corrected: bestMatch.type,
      confidence: Math.max(0.1, 1 - (bestMatch.distance / bestMatch.type.length)),
      suggestions: fuzzyMatches.slice(0, 2).map(m => m.type)
    };
  }

  // No good match found
  return {
    corrected: 'Shipment', // default
    confidence: 0,
    suggestions: VALID_ORDER_TYPES
  };
}

// Package Type Auto-Correction
const PACKAGE_TYPE_CORRECTIONS: Record<string, string> = {
  'parcl': 'parcel',
  'parsel': 'parcel',
  'package': 'parcel',
  'pkg': 'parcel',
  'doc': 'document',
  'docs': 'document',
  'documnt': 'document',
  'letter': 'document',
  'bulk': 'bulky',
  'bulkey': 'bulky',
  'large': 'bulky',
  'big': 'bulky'
};

const VALID_PACKAGE_TYPES = ['parcel', 'document', 'bulky'];

export function correctPackageType(input: string): AutoCorrectionResult {
  if (!input) {
    return {
      corrected: 'parcel',
      confidence: 0,
      suggestions: VALID_PACKAGE_TYPES
    };
  }

  const normalized = input.toLowerCase().trim();
  
  // Direct correction match
  const directCorrection = PACKAGE_TYPE_CORRECTIONS[normalized];
  if (directCorrection) {
    return {
      corrected: directCorrection,
      confidence: 0.9,
      suggestions: [directCorrection]
    };
  }

  // Exact match (case insensitive)
  const exactMatch = VALID_PACKAGE_TYPES.find(type => 
    type.toLowerCase() === normalized
  );
  if (exactMatch) {
    return {
      corrected: exactMatch,
      confidence: 1.0,
      suggestions: [exactMatch]
    };
  }

  // Fuzzy matching
  const fuzzyMatches = VALID_PACKAGE_TYPES
    .map(type => ({
      type,
      distance: levenshteinDistance(normalized, type.toLowerCase())
    }))
    .filter(match => match.distance <= 2)
    .sort((a, b) => a.distance - b.distance);

  if (fuzzyMatches.length > 0) {
    const bestMatch = fuzzyMatches[0];
    return {
      corrected: bestMatch.type,
      confidence: Math.max(0.1, 1 - (bestMatch.distance / bestMatch.type.length)),
      suggestions: fuzzyMatches.slice(0, 2).map(m => m.type)
    };
  }

  // No good match found
  return {
    corrected: 'parcel', // default
    confidence: 0,
    suggestions: VALID_PACKAGE_TYPES
  };
}