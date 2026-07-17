import { getForts } from '../api/forts';
import { getFortDistrict } from './fortDistrict';

let cachedForts = null;
let cachePromise = null;

export function clearFortListCache() {
  cachedForts = null;
  cachePromise = null;
}

export async function getAllFortsCached() {
  if (cachedForts) return cachedForts;
  if (!cachePromise) {
    cachePromise = getForts()
      .then(normalizeFortListResponse)
      .then((list) => {
        cachedForts = list;
        return list;
      })
      .catch((err) => {
        cachePromise = null;
        throw err;
      });
  }
  return cachePromise;
}

export function normalizeFortListResponse(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

export function buildDistrictMeta(forts = []) {
  const counts = {};

  for (const fort of forts) {
    const key = getFortDistrict(fort);
    counts[key] = (counts[key] || 0) + 1;
  }

  return {
    total: forts.length,
    districts: Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)),
  };
}

export function filterFortsClientSide(forts = [], { q = '', district = 'all' } = {}) {
  let result = [...forts];

  if (district && district !== 'all') {
    result = result.filter((fort) => getFortDistrict(fort) === district);
  }

  const query = String(q || '').trim().toLowerCase();
  if (query) {
    result = result.filter((fort) => {
      const haystack = [fort.name, fort.location, fort.description, fort.district]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    });
  }

  return result.sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')));
}

export function paginateForts(forts = [], page = 1, limit = 12) {
  const total = forts.length;
  const pages = Math.max(Math.ceil(total / limit), 1);
  const pageNum = Math.min(Math.max(Number(page) || 1, 1), pages);
  const start = (pageNum - 1) * limit;

  return {
    items: forts.slice(start, start + limit),
    total,
    page: pageNum,
    pages,
    limit,
  };
}

export function isPaginatedFortResponse(data) {
  return Boolean(data && !Array.isArray(data) && Array.isArray(data.items));
}
