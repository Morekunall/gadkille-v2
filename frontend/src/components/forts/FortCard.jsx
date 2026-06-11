import { Link } from 'react-router-dom';
import { resolveMediaUrl } from '../../lib/api';

const PLACEHOLDER =
  'https://images.pexels.com/photos/2132250/pexels-photo-2132250.jpeg?auto=compress&cs=tinysrgb&w=800';

export default function FortCard({ fort, language = 'en', compact = false }) {
  const isEnglish = language === 'en';
  const imageUrl = resolveMediaUrl(fort?.images?.[0] || '') || PLACEHOLDER;
  const subtitle =
    fort?.description?.slice(0, compact ? 70 : 90) || fort?.location || '';

  return (
    <article className="overflow-hidden rounded-2xl border border-primary/10 bg-white shadow-soft transition hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md">
      <div
        className={`bg-cover bg-center ${compact ? 'h-36' : 'h-44'}`}
        style={{ backgroundImage: `url(${imageUrl})` }}
        role="img"
        aria-label={fort?.name}
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold text-primaryDark">{fort?.name}</h3>
        {fort?.location ? (
          <p className="mt-0.5 text-xs font-medium text-primary/80">{fort.location}</p>
        ) : null}
        <p className="mt-1 text-sm text-gray-600 line-clamp-2">{subtitle}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-gray-500">{isEnglish ? 'Fort trek' : 'किल्ला ट्रेक'}</span>
          <Link
            to={`/fort/${fort?.slug}`}
            className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primaryDark"
          >
            {isEnglish ? 'View details' : 'तपशील पहा'}
          </Link>
        </div>
      </div>
    </article>
  );
}
