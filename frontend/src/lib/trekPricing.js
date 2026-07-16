const DEFAULT_ORIGINAL_PRICES = {
  'harishchandragad-fort': 1500,
};

export function getOriginalPrice(trek) {
  const current = Number(trek?.pricePerPerson);
  if (!Number.isFinite(current)) return null;

  const fromDb = Number(trek?.originalPrice);
  if (Number.isFinite(fromDb) && fromDb > current) return fromDb;

  const fallback = Number(DEFAULT_ORIGINAL_PRICES[trek?.slug]);
  if (Number.isFinite(fallback) && fallback > current) return fallback;

  return null;
}

export function formatInr(amount) {
  return Number(amount).toLocaleString('en-IN');
}
