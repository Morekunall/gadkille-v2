import { Link } from 'react-router-dom';
import { resolveMediaUrl } from '../../lib/api';

const PLACEHOLDER =
  'https://images.pexels.com/photos/1761279/pexels-photo-1761279.jpeg?auto=compress&cs=tinysrgb&w=800';

const TRIP_TYPE_LABELS = {
  weekend: { en: 'Weekend Trek', mr: 'वीकएंड ट्रेक' },
  'one-day': { en: 'One Day Trek', mr: 'एक दिवसीय ट्रेक' },
  school: { en: 'School Trip', mr: 'शाळेची सहल' },
  family: { en: 'Family Trip', mr: 'कुटुंब सहल' },
  friends: { en: 'Friends Trek', mr: 'मित्रांचा ट्रेक' },
  adventure: { en: 'Adventure Trek', mr: 'साहसी ट्रेक' }
};

function formatDateRange(startDate, endDate, isEnglish) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const opts = { day: 'numeric', month: 'short', year: 'numeric' };
  const startStr = start.toLocaleDateString(isEnglish ? 'en-IN' : 'mr-IN', opts);
  const endStr = end.toLocaleDateString(isEnglish ? 'en-IN' : 'mr-IN', opts);
  if (startStr === endStr) return startStr;
  return `${startStr} – ${endStr}`;
}

export default function UpcomingTrekCard({ trek, language = 'en' }) {
  const isEnglish = language === 'en';
  const imageUrl =
    resolveMediaUrl(trek?.coverImage || '') ||
    resolveMediaUrl(trek?.fort?.images?.[0] || '') ||
    PLACEHOLDER;
  const typeLabel = TRIP_TYPE_LABELS[trek?.tripType] || TRIP_TYPE_LABELS.weekend;

  return (
    <article className="overflow-hidden rounded-2xl border border-primary/10 bg-white shadow-soft transition hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md">
      <div
        className="h-44 bg-cover bg-center"
        style={{ backgroundImage: `url(${imageUrl})` }}
        role="img"
        aria-label={trek?.title}
      />
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-semibold text-primaryDark">{trek?.title}</h3>
          <span className="shrink-0 rounded-full bg-softBg px-2 py-0.5 text-[10px] font-semibold text-primary">
            {isEnglish ? typeLabel.en : typeLabel.mr}
          </span>
        </div>
        {trek?.fort?.name ? (
          <p className="mt-0.5 text-xs font-medium text-primary/80">
            {trek.fort.name}
            {trek.fort.location ? ` · ${trek.fort.location}` : ''}
          </p>
        ) : null}
        <p className="mt-2 text-xs text-gray-600">
          {formatDateRange(trek.startDate, trek.endDate, isEnglish)} · {trek.duration}
        </p>
        <p className="mt-1 text-sm text-gray-600 line-clamp-2">
          {trek?.description || (isEnglish ? 'Join this guided fort trek.' : 'या मार्गदर्शित किल्ला ट्रेकमध्ये सामील व्हा.')}
        </p>
        <div className="mt-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-primaryDark">
              ₹{trek?.pricePerPerson?.toLocaleString('en-IN')}
              <span className="text-xs font-normal text-gray-500">
                {isEnglish ? ' / person' : ' / व्यक्ती'}
              </span>
            </p>
            {trek?.seatsAvailable > 0 && (
              <p className="text-[10px] text-gray-500">
                {isEnglish
                  ? `${trek.seatsAvailable} seats left`
                  : `${trek.seatsAvailable} जागा उपलब्ध`}
              </p>
            )}
          </div>
          <Link
            to={`/trek/${trek?.slug}`}
            className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primaryDark"
          >
            {isEnglish ? 'Book Now' : 'बुक करा'}
          </Link>
        </div>
      </div>
    </article>
  );
}
