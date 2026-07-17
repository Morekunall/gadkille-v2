import { useCallback, useEffect, useMemo, useState } from 'react';
import { getFortDistricts, searchForts } from '../../api/forts';
import { getApiErrorMessage } from '../../lib/getApiErrorMessage';
import {
  buildDistrictMeta,
  filterFortsClientSide,
  getAllFortsCached,
  isPaginatedFortResponse,
  paginateForts,
} from '../../lib/fortSearch';
import FortGrid from './FortGrid';

const PAGE_SIZE = 12;

async function loadDistrictMeta() {
  try {
    const data = await getFortDistricts();
    if (data?.districts?.length) return data;
  } catch {
    // Old backend — build from full fort list
  }

  const all = await getAllFortsCached();
  return buildDistrictMeta(all);
}

async function loadFortPage({ q, district, page, limit }) {
  try {
    const data = await searchForts({ q, district, page, limit });
    if (isPaginatedFortResponse(data)) {
      return data;
    }
  } catch {
    // Fall through to client-side mode for older production API
  }

  const all = await getAllFortsCached();
  const filtered = filterFortsClientSide(all, { q, district });
  return paginateForts(filtered, page, limit);
}

export default function FortExplorer({ language = 'en', compact = false }) {
  const isEnglish = language === 'en';
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [district, setDistrict] = useState('all');
  const [districts, setDistricts] = useState([]);
  const [totalForts, setTotalForts] = useState(0);
  const [forts, setForts] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => window.clearTimeout(id);
  }, [query]);

  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, district]);

  useEffect(() => {
    loadDistrictMeta()
      .then((data) => {
        setDistricts(data?.districts || []);
        setTotalForts(data?.total || 0);
      })
      .catch(() => {
        setDistricts([]);
      });
  }, []);

  const fetchPage = useCallback(
    async (pageNum, append = false) => {
      if (append) setLoadingMore(true);
      else setLoading(true);
      setError('');

      try {
        const data = await loadFortPage({
          q: debouncedQuery,
          district,
          page: pageNum,
          limit: PAGE_SIZE,
        });

        setForts((prev) => (append ? [...prev, ...(data.items || [])] : data.items || []));
        setPage(data.page || pageNum);
        setPages(data.pages || 1);
        if (!append && typeof data.total === 'number') {
          setTotalForts(data.total);
        }
      } catch (err) {
        if (!append) setForts([]);
        setError(
          getApiErrorMessage(
            err,
            isEnglish
              ? 'Could not load forts. Try again in a moment.'
              : 'किल्ले लोड करता आले नाहीत. थोड्या वेळाने पुन्हा प्रयत्न करा.'
          )
        );
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [debouncedQuery, district, isEnglish]
  );

  useEffect(() => {
    fetchPage(1, false);
  }, [fetchPage]);

  const visibleCount = forts.length;
  const hasMore = page < pages;
  const activeDistrictLabel = useMemo(() => {
    if (district === 'all') {
      return isEnglish ? 'All districts' : 'सर्व जिल्हे';
    }
    return district;
  }, [district, isEnglish]);

  return (
    <div className="space-y-4">
      <div className="sticky top-[3.25rem] z-10 -mx-1 space-y-3 rounded-2xl border border-primary/10 bg-white/95 p-3 shadow-soft backdrop-blur-md sm:p-4">
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            ⌕
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              isEnglish
                ? 'Search forts by name or place…'
                : 'नाव किंवा ठिकाणानुसार किल्ला शोधा…'
            }
            className="w-full rounded-xl border border-gray-200 bg-softBg py-2.5 pl-9 pr-3 text-sm text-primaryDark placeholder:text-gray-400 focus:border-primary focus:outline-none"
          />
        </div>

        <div className="relative">
          <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button
              type="button"
              onClick={() => setDistrict('all')}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                district === 'all'
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-softBg text-primaryDark hover:bg-primary/10'
              }`}
            >
              {isEnglish ? 'All' : 'सर्व'}
              {totalForts > 0 ? ` (${totalForts})` : ''}
            </button>
            {districts.map(({ name, count }) => (
              <button
                key={name}
                type="button"
                onClick={() => setDistrict(name)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  district === name
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-softBg text-primaryDark hover:bg-primary/10'
                }`}
              >
                {name} ({count})
              </button>
            ))}
          </div>
        </div>

        <p className="text-[11px] text-gray-500">
          {loading && !loadingMore
            ? isEnglish
              ? 'Loading forts…'
              : 'किल्ले लोड होत आहेत…'
            : isEnglish
            ? `${visibleCount} of ${totalForts} forts · ${activeDistrictLabel}${
                debouncedQuery ? ` · “${debouncedQuery}”` : ''
              }`
            : `${visibleCount} / ${totalForts} किल्ले · ${activeDistrictLabel}${
                debouncedQuery ? ` · “${debouncedQuery}”` : ''
              }`}
        </p>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <FortGrid
        forts={forts}
        loading={loading && !loadingMore}
        language={language}
        compact={compact}
        skeletonCount={PAGE_SIZE}
        emptyMessage={
          debouncedQuery || district !== 'all'
            ? isEnglish
              ? 'No forts match your search. Try another district or keyword.'
              : 'आपल्या शोधाशी जुळणारे किल्ले नाहीत. दुसरा जिल्हा किंवा शब्द वापरा.'
            : isEnglish
            ? 'No forts available yet.'
            : 'अद्याप किल्ले उपलब्ध नाहीत.'
        }
      />

      {hasMore && !loading ? (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            disabled={loadingMore}
            onClick={() => fetchPage(page + 1, true)}
            className="rounded-full border border-primary/25 bg-white px-6 py-2.5 text-sm font-semibold text-primary shadow-soft transition hover:border-primary hover:bg-softBg disabled:opacity-60"
          >
            {loadingMore
              ? isEnglish
                ? 'Loading…'
                : 'लोड होत आहे…'
              : isEnglish
              ? `Load more (${totalForts - visibleCount} left)`
              : `अजून पहा (${totalForts - visibleCount} शिल्लक)`}
          </button>
        </div>
      ) : null}
    </div>
  );
}
