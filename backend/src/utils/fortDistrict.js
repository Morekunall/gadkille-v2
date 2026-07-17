const MAHARASHTRA_DISTRICTS = [
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

const ALIASES = {
  'chhatrapati sambhajinagar': 'Aurangabad',
  sambhajinagar: 'Aurangabad',
  dharashiv: 'Osmanabad',
  'mumbai city': 'Mumbai',
  'mumbai suburban': 'Mumbai',
  'mumbai sub': 'Mumbai',
};

function extractDistrictFromLocation(location = '') {
  const text = String(location).toLowerCase();
  if (!text.trim()) return 'Other';

  for (const [alias, district] of Object.entries(ALIASES)) {
    if (text.includes(alias)) return district;
  }

  for (const district of MAHARASHTRA_DISTRICTS) {
    if (text.includes(district.toLowerCase())) return district;
  }

  const districtMatch = text.match(/([a-z\s]+)\s+district/);
  if (districtMatch?.[1]) {
    const raw = districtMatch[1].trim();
    const normalized = raw.replace(/\b\w/g, (c) => c.toUpperCase());
    return normalized || 'Other';
  }

  return 'Other';
}

function buildDistrictFilter(district) {
  if (!district || district === 'all' || district === 'Other') return null;
  return { location: { $regex: district, $options: 'i' } };
}

module.exports = {
  MAHARASHTRA_DISTRICTS,
  extractDistrictFromLocation,
  buildDistrictFilter,
};
