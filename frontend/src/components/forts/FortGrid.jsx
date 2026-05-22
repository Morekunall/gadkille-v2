import FortCard from './FortCard';

export default function FortGrid({
  forts = [],
  loading = false,
  language = 'en',
  emptyMessage,
  skeletonCount = 6,
  compact = false,
}) {
  const isEnglish = language === 'en';

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: skeletonCount }).map((_, idx) => (
          <div
            key={idx}
            className="h-64 animate-pulse rounded-2xl border border-primary/10 bg-softBg"
          />
        ))}
      </div>
    );
  }

  if (!forts.length) {
    return (
      <p className="py-8 text-center text-sm text-gray-500">
        {emptyMessage ||
          (isEnglish ? 'No forts available yet.' : 'अद्याप किल्ले उपलब्ध नाहीत.')}
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {forts.map((fort) => (
        <FortCard key={fort._id} fort={fort} language={language} compact={compact} />
      ))}
    </div>
  );
}
