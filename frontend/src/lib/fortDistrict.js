export const MAHARASHTRA_DISTRICTS = [
  'Ahmednagar',
  'Akola',
  'Amravati',
  'Aurangabad',
  'Beed',
  'Bhandara',
  'Buldhana',
  'Chandrapur',
  'Dhule',
  'Gadchiroli',
  'Gondia',
  'Hingoli',
  'Jalgaon',
  'Jalna',
  'Kolhapur',
  'Latur',
  'Mumbai',
  'Nagpur',
  'Nanded',
  'Nandurbar',
  'Nashik',
  'Osmanabad',
  'Palghar',
  'Parbhani',
  'Pune',
  'Raigad',
  'Ratnagiri',
  'Sangli',
  'Satara',
  'Sindhudurg',
  'Solapur',
  'Thane',
  'Wardha',
  'Washim',
  'Yavatmal',
];

export function getFortDistrict(fort) {
  if (fort?.district?.trim()) return fort.district.trim();
  return extractDistrictFromLocation(fort?.location || '');
}

export function extractDistrictFromLocation(location = '') {
  const text = String(location).toLowerCase();
  if (!text.trim()) return 'Other';

  const aliases = {
    'chhatrapati sambhajinagar': 'Aurangabad',
    sambhajinagar: 'Aurangabad',
    dharashiv: 'Osmanabad',
    'mumbai city': 'Mumbai',
    'mumbai suburban': 'Mumbai',
  };

  for (const [alias, district] of Object.entries(aliases)) {
    if (text.includes(alias)) return district;
  }

  for (const district of MAHARASHTRA_DISTRICTS) {
    if (text.includes(district.toLowerCase())) return district;
  }

  const match = text.match(/([a-z\s]+)\s+district/);
  if (match?.[1]) {
    return match[1].trim().replace(/\b\w/g, (c) => c.toUpperCase());
  }

  return 'Other';
}
