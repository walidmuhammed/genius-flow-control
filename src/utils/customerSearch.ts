
import { CustomerWithLocation } from "@/services/customers";

// Normalize phone number: remove country code, spaces, special chars, leading zeros
export function normalizePhone(phone: string) {
  if (!phone) return '';
  let num = phone.replace(/[^0-9]/g, '');
  // Remove Lebanese country code if present
  if (num.startsWith('961')) num = num.slice(3);
  if (num.startsWith('0')) num = num.slice(1);
  return num;
}

// Simple fuzzy match (substring, ignore case/accents, supports Arabic/English, returns match index or -1)
export function fuzzyMatch(value: string, query: string): number {
  if (!value || !query) return -1;
  // Remove diacritics, ignore case
  const cleanValue = value.normalize("NFD").replace(/[\u064B-\u0652\u0640]/g, '').toLowerCase();
  const cleanQuery = query.normalize("NFD").replace(/[\u064B-\u0652\u0640]/g, '').toLowerCase();
  return cleanValue.indexOf(cleanQuery);
}

// Advanced filter for customers
export function filterCustomers(customers: CustomerWithLocation[], query: string): CustomerWithLocation[] {
  if (!query) return customers;
  const cleanedQuery = query.replace(/\s+/g, ' ').trim();

  return customers
    .map((customer) => {
      const fields = [
        customer.name || "",
        customer.phone || "",
        customer.secondary_phone || "",
        customer.city_name || "",
        customer.governorate_name || "",
      ];

      // Name fuzzy/substring match (any field, case/accents/diacritics-insensitive)
      let nameScore = -1;
      if (customer.name)
        nameScore = fuzzyMatch(customer.name, cleanedQuery);

      // City/Governorate fuzzy
      let cityScore = fuzzyMatch(customer.city_name || '', cleanedQuery);
      let govScore = fuzzyMatch(customer.governorate_name || '', cleanedQuery);

      // Phone normalized substring
      let primaryPhoneNorm = normalizePhone(customer.phone || "");
      let secondaryPhoneNorm = normalizePhone(customer.secondary_phone || "");
      let searchNorm = normalizePhone(cleanedQuery);

      const phoneScore = (searchNorm && searchNorm.length >= 2)
        ? (
            (primaryPhoneNorm.includes(searchNorm) ? 0 : -1) >= 0 ||
            (secondaryPhoneNorm.includes(searchNorm) ? 1 : -1) >= 0
          )
        : false;

      // Result if any score is found
      const found =
        (nameScore >= 0) ||
        (cityScore >= 0) ||
        (govScore >= 0) ||
        phoneScore;

      // Higher relevance to phone matches, then name, then city/gov
      let sortScore = -999;
      if (phoneScore) sortScore = 200 - (primaryPhoneNorm.indexOf(searchNorm) || 0);
      else if (nameScore >= 0) sortScore = 100 - nameScore;
      else if (cityScore >= 0) sortScore = 50 - cityScore;
      else if (govScore >= 0) sortScore = 40 - govScore;

      return found ? { customer, sortScore } : null;
    })
    .filter(Boolean)
    .sort((a, b) => (b!.sortScore - a!.sortScore))
    .map(result => result!.customer);
}
