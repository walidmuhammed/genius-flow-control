import { isValidLebaneseMobileNumber } from './customerSearch';
import { correctOrderType, correctPackageType } from './smartValidation';
import { formatPhoneForStorage } from './phoneNormalization';

export interface ParsedOrderRow {
  row: number;
  fullName: string;
  phone: string;
  governorate: string;
  city: string;
  address: string;
  itemsCount: number;
  orderType: string;
  packageType: string;
  isWorkAddress: boolean;
  packageDescription: string;
  usdAmount: number;
  lbpAmount: number;
  allowInspection: boolean;
  orderReference: string;
  deliveryNotes: string;
  errors: string[];
  suggestions: FieldSuggestion[];
  isValid: boolean;
}

export interface FieldSuggestion {
  field: string;
  original: string;
  suggestions: string[];
  corrected?: string;
}

export interface CSVParseResult {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  orders: ParsedOrderRow[];
  hasErrors: boolean;
}

// Generate correct CSV template based on CreateOrder.tsx fields
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

// Find fuzzy matches for governorates/cities
function findFuzzyMatches(input: string, options: string[], maxDistance: number = 2): string[] {
  const matches = options
    .map(option => ({
      value: option,
      distance: levenshteinDistance(input.toLowerCase(), option.toLowerCase())
    }))
    .filter(match => match.distance <= maxDistance)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 3)
    .map(match => match.value);
    
  return matches;
}

// Common misspelling corrections
const governorateCorrections: Record<string, string> = {
  'berut': 'Beirut',
  'beroth': 'Beirut', 
  'beirot': 'Beirut',
  'shmal': 'North Lebanon',
  'shamal': 'North Lebanon',
  'bekaa': 'Beqaa',
  'beka': 'Beqaa',
  'janub': 'South Lebanon',
  'jnoub': 'South Lebanon',
  'nabatieh': 'Nabatieh',
  'nabatiye': 'Nabatieh'
};

// Auto-correct common misspellings
function autoCorrect(input: string, corrections: Record<string, string>): string | null {
  const lowerInput = input.toLowerCase();
  return corrections[lowerInput] || null;
}

export function generateCSVTemplate(): string {
  const headers = [
    'Full Name*',
    'Phone Number*', 
    'Governorate*',
    'City*',
    'Address Details*',
    'Number of Items',
    'Order Type*',
    'Package Type',
    'Work Address',
    'Package Description',
    'USD Amount',
    'LBP Amount',
    'Allow Inspection',
    'Order Reference',
    'Delivery Notes'
  ];

  const exampleRow = [
    'John Doe',
    '+96170123456',
    'Beirut',
    'Achrafieh', 
    'Street 123 Building 4',
    '1',
    'Shipment',
    'parcel',
    'false',
    'Electronics',
    '100',
    '150000',
    'true',
    'REF001',
    'Handle with care'
  ];

  return [headers.join(','), exampleRow.join(',')].join('\n');
}

export function parseCSVFile(csvContent: string, governoratesData: any[]): CSVParseResult {
  const lines = csvContent.split('\n').filter(line => line.trim());
  const headers = lines[0]?.split(',').map(h => h.trim()) || [];
  
  if (lines.length < 2) {
    throw new Error('CSV file must contain at least a header row and one data row');
  }

  const orders: ParsedOrderRow[] = [];
  let validCount = 0;
  let invalidCount = 0;

  // Create governorate lookup maps and lists for fuzzy matching
  const governorateMap = new Map<string, any>();
  const cityMap = new Map<string, any>();
  const governorateNames = governoratesData.map(g => g.name);
  const allCityNames: string[] = [];
  
  governoratesData.forEach(gov => {
    governorateMap.set(gov.name.toLowerCase(), gov);
    if (gov.cities) {
      gov.cities.forEach((city: any) => {
        allCityNames.push(city.name);
        cityMap.set(`${gov.name.toLowerCase()}:${city.name.toLowerCase()}`, {
          ...city,
          governorate_id: gov.id,
          governorate_name: gov.name
        });
      });
    }
  });

  // Parse data rows (skip header)
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/['"]/g, ''));
    if (values.length === 0 || values.every(v => !v)) continue; // Skip empty rows

    const errors: string[] = [];
    const suggestions: FieldSuggestion[] = [];
    const rowNum = i + 1;

    // Extract and validate required fields
    const fullName = values[0] || '';
    const phone = values[1] || '';
    const governorate = values[2] || '';
    const city = values[3] || '';
    const address = values[4] || '';
    const itemsCount = parseInt(values[5]) || 1;
    const orderType = values[6] || '';
    const packageType = values[7] || 'parcel';
    const isWorkAddress = values[8]?.toLowerCase() === 'true';
    const packageDescription = values[9] || '';
    const usdAmount = parseFloat(values[10]) || 0;
    const lbpAmount = parseFloat(values[11]) || 0;
    const allowInspection = values[12]?.toLowerCase() === 'true';
    const orderReference = values[13] || '';
    const deliveryNotes = values[14] || '';

    // Validation
    if (!fullName.trim()) {
      errors.push('Full Name is required');
    }

    if (!phone.trim()) {
      errors.push('Phone Number is required');
    } else if (!isValidLebaneseMobileNumber(phone)) {
      errors.push('Invalid Lebanese phone number format');
    }

    if (!governorate.trim()) {
      errors.push('Governorate is required');
    }

    if (!city.trim()) {
      errors.push('City is required');
    }

    if (!address.trim()) {
      errors.push('Address Details is required');
    }

    // Validate and suggest corrections for governorate and city
    let correctedGovernorate = governorate;
    let correctedCity = city;
    
    if (governorate && city) {
      const govKey = governorate.toLowerCase();
      const cityKey = `${govKey}:${city.toLowerCase()}`;
      
      if (!governorateMap.has(govKey)) {
        // Try auto-correction first
        const autoCorrection = autoCorrect(governorate, governorateCorrections);
        if (autoCorrection && governorateMap.has(autoCorrection.toLowerCase())) {
          correctedGovernorate = autoCorrection;
          suggestions.push({
            field: 'governorate',
            original: governorate,
            suggestions: [autoCorrection],
            corrected: autoCorrection
          });
        } else {
          // Try fuzzy matching
          const fuzzyMatches = findFuzzyMatches(governorate, governorateNames);
          if (fuzzyMatches.length > 0) {
            suggestions.push({
              field: 'governorate',
              original: governorate,
              suggestions: fuzzyMatches
            });
            errors.push(`Governorate "${governorate}" not found. Did you mean: ${fuzzyMatches.join(', ')}?`);
          } else {
            errors.push(`Governorate "${governorate}" not found`);
          }
        }
      }
      
      // Check city validity with corrected governorate
      const finalGovKey = correctedGovernorate.toLowerCase();
      const finalCityKey = `${finalGovKey}:${city.toLowerCase()}`;
      
      if (governorateMap.has(finalGovKey) && !cityMap.has(finalCityKey)) {
        // Get cities for this governorate
        const govData = governorateMap.get(finalGovKey);
        const govCities = govData?.cities?.map((c: any) => c.name) || [];
        
        // Try fuzzy matching for city
        const cityMatches = findFuzzyMatches(city, govCities);
        if (cityMatches.length > 0) {
          suggestions.push({
            field: 'city',
            original: city,
            suggestions: cityMatches
          });
          errors.push(`City "${city}" not found in ${correctedGovernorate}. Did you mean: ${cityMatches.join(', ')}?`);
        } else {
          errors.push(`City "${city}" not found in ${correctedGovernorate}`);
        }
      }
    }

    // Smart order type validation and correction
    let correctedOrderType = orderType;
    if (orderType) {
      const orderTypeResult = correctOrderType(orderType);
      if (orderTypeResult.confidence > 0.5) {
        correctedOrderType = orderTypeResult.corrected;
        if (orderTypeResult.confidence < 1.0) {
          suggestions.push({
            field: 'orderType',
            original: orderType,
            suggestions: [orderTypeResult.corrected],
            corrected: orderTypeResult.corrected
          });
        }
      } else {
        errors.push(`Order Type "${orderType}" is invalid. Suggestions: ${orderTypeResult.suggestions.join(', ')}`);
        suggestions.push({
          field: 'orderType',
          original: orderType,
          suggestions: orderTypeResult.suggestions
        });
      }
    } else {
      correctedOrderType = 'Shipment'; // default
    }

    // Smart package type validation and correction
    let correctedPackageType = packageType;
    if (packageType) {
      const packageTypeResult = correctPackageType(packageType);
      if (packageTypeResult.confidence > 0.5) {
        correctedPackageType = packageTypeResult.corrected;
        if (packageTypeResult.confidence < 1.0) {
          suggestions.push({
            field: 'packageType',
            original: packageType,
            suggestions: [packageTypeResult.corrected],
            corrected: packageTypeResult.corrected
          });
        }
      } else {
        errors.push(`Package Type "${packageType}" is invalid. Suggestions: ${packageTypeResult.suggestions.join(', ')}`);
        suggestions.push({
          field: 'packageType',
          original: packageType,
          suggestions: packageTypeResult.suggestions
        });
      }
    } else {
      correctedPackageType = 'parcel'; // default
    }

    // Normalize phone number for storage
    let normalizedPhone = phone;
    if (phone) {
      try {
        normalizedPhone = formatPhoneForStorage(phone);
      } catch (phoneError) {
        errors.push(`Invalid phone format: ${phone}. Please use Lebanese mobile format.`);
      }
    }

    const isValid = errors.length === 0;
    if (isValid) validCount++;
    else invalidCount++;

    orders.push({
      row: rowNum,
      fullName,
      phone: normalizedPhone,
      governorate: correctedGovernorate,
      city: correctedCity,
      address,
      itemsCount,
      orderType: correctedOrderType,
      packageType: correctedPackageType,
      isWorkAddress,
      packageDescription,
      usdAmount,
      lbpAmount,
      allowInspection,
      orderReference,
      deliveryNotes,
      errors,
      suggestions,
      isValid
    });
  }

  return {
    totalRows: orders.length,
    validRows: validCount,
    invalidRows: invalidCount,
    orders,
    hasErrors: invalidCount > 0
  };
}

export function downloadCSVTemplate(): void {
  const csvContent = generateCSVTemplate();
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'orders_import_template.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}