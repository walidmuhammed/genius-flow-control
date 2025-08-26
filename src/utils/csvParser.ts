import { isValidLebaneseMobileNumber } from './customerSearch';

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
  isValid: boolean;
}

export interface CSVParseResult {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  orders: ParsedOrderRow[];
  hasErrors: boolean;
}

// Generate correct CSV template based on CreateOrder.tsx fields
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

  // Create governorate lookup maps
  const governorateMap = new Map<string, any>();
  const cityMap = new Map<string, any>();
  
  governoratesData.forEach(gov => {
    governorateMap.set(gov.name.toLowerCase(), gov);
    if (gov.cities) {
      gov.cities.forEach((city: any) => {
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

    // Validate governorate and city existence
    if (governorate && city) {
      const govKey = governorate.toLowerCase();
      const cityKey = `${govKey}:${city.toLowerCase()}`;
      
      if (!governorateMap.has(govKey)) {
        errors.push(`Governorate "${governorate}" not found`);
      } else if (!cityMap.has(cityKey)) {
        errors.push(`City "${city}" not found in ${governorate}`);
      }
    }

    // Validate order type
    const validOrderTypes = ['Shipment', 'Exchange'];
    if (orderType && !validOrderTypes.includes(orderType)) {
      errors.push(`Order Type must be one of: ${validOrderTypes.join(', ')}`);
    }

    // Validate package type
    const validPackageTypes = ['parcel', 'document', 'bulky'];
    if (packageType && !validPackageTypes.includes(packageType.toLowerCase())) {
      errors.push(`Package Type must be one of: ${validPackageTypes.join(', ')}`);
    }

    const isValid = errors.length === 0;
    if (isValid) validCount++;
    else invalidCount++;

    orders.push({
      row: rowNum,
      fullName,
      phone,
      governorate,
      city,
      address,
      itemsCount,
      orderType,
      packageType: packageType.toLowerCase(),
      isWorkAddress,
      packageDescription,
      usdAmount,
      lbpAmount,
      allowInspection,
      orderReference,
      deliveryNotes,
      errors,
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