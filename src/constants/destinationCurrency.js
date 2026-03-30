/**
 * Destination → Currency mapping
 * Maps destination names (lowercase) to their local currency codes.
 * Add new entries here as you add new destinations.
 */
export const DESTINATION_CURRENCY_MAP = {
  'india': 'INR',
  'thailand': 'THB',
  'malaysia': 'MYR',
  'dubai': 'AED',
  'qatar': 'QAR',
  'europe': 'EUR',
  'america': 'USD',
  'singapore': 'SGD',
  'indonesia': 'IDR',
  'sri lanka': 'LKR',
  'japan': 'JPY',
  'australia': 'AUD',
};

/**
 * Returns the default currency code for a given destination name.
 * Falls back to 'INR' if the destination is not mapped.
 */
export const getDefaultCurrency = (destinationName) => {
  if (!destinationName) return 'INR';
  return DESTINATION_CURRENCY_MAP[destinationName.toLowerCase()] || 'INR';
};
