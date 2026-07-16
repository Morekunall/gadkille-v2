import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { createBooking } from '../api/bookings';
import { getTrekBySlug } from '../api/trips';
import { getApiErrorMessage } from '../lib/getApiErrorMessage';
import { resolveMediaUrl } from '../lib/api';
import { useUi } from '../context/UiContext';
import { useAuth } from '../context/AuthContext';
import SeoHead from '../components/seo/SeoHead';
import { breadcrumbJsonLd, getDefaultOgImage, trekJsonLd } from '../lib/seo';
import { formatInr, getOriginalPrice } from '../lib/trekPricing';

const PLACEHOLDER =
  'https://images.pexels.com/photos/1761279/pexels-photo-1761279.jpeg?auto=compress&cs=tinysrgb&w=1200';

const TrekDetailsPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { language, showToast } = useUi();
  const { token } = useAuth();
  const [trek, setTrek] = useState(null);
  const [loading, setLoading] = useState(true);
  const [guests, setGuests] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [loginPrompt, setLoginPrompt] = useState(false);
  const isEnglish = language === 'en';

  useEffect(() => {
    const fetchTrek = async () => {
      setLoading(true);
      try {
        const data = await getTrekBySlug(slug);
        setTrek(data);
      } catch {
        setTrek(null);
      } finally {
        setLoading(false);
      }
    };
    fetchTrek();
  }, [slug]);

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!token) {
      setLoginPrompt(true);
      return;
    }
    if (!trek?.fort?._id) return;

    if (trek.seatsAvailable > 0 && guests > trek.seatsAvailable) {
      showToast(
        'error',
        isEnglish
          ? `Only ${trek.seatsAvailable} seats available.`
          : `फक्त ${trek.seatsAvailable} जागा उपलब्ध आहेत.`
      );
      return;
    }

    setSubmitting(true);
    try {
      await createBooking({
        fortId: trek.fort._id,
        tripId: trek._id,
        bookingType: 'trip',
        date: trek.startDate,
        details: {
          guests,
          trek: {
            title: trek.title,
            slug: trek.slug,
            pricePerPerson: trek.pricePerPerson,
            duration: trek.duration,
            tripType: trek.tripType
          }
        }
      });
      showToast(
        'success',
        isEnglish
          ? 'Trek booking request sent. Check your dashboard.'
          : 'ट्रेक बुकिंग विनंती पाठवली. डॅशबोर्ड पहा.'
      );
    } catch (err) {
      showToast(
        'error',
        getApiErrorMessage(err, isEnglish ? 'Booking failed.' : 'बुकिंग अयशस्वी.')
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <SeoHead
          title="Upcoming Trek"
          description="Book upcoming fort treks and group events on GadKille — Maharashtra's fort tourism website."
          path={`/trek/${slug}`}
        />
        <div className="h-64 animate-pulse rounded-3xl bg-white shadow-soft" />
      </div>
    );
  }

  if (!trek) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center">
        <SeoHead title="Trek Not Found" noindex path={`/trek/${slug}`} />
        <h1 className="text-xl font-semibold text-primaryDark">
          {isEnglish ? 'Trek not found' : 'ट्रेक सापडला नाही'}
        </h1>
        <Link to="/" className="mt-4 inline-block text-sm font-semibold text-primary hover:text-primaryDark">
          {isEnglish ? 'Back to home' : 'होमवर परत'}
        </Link>
      </div>
    );
  }

  const imageUrl =
    resolveMediaUrl(trek.coverImage || '') ||
    resolveMediaUrl(trek.fort?.images?.[0] || '') ||
    PLACEHOLDER;
  const totalPrice = (trek.pricePerPerson || 0) * guests;
  const originalPrice = getOriginalPrice(trek);
  const startDate = new Date(trek.startDate).toLocaleDateString(isEnglish ? 'en-IN' : 'mr-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <SeoHead
        title={`${trek.title} — Upcoming Trek`}
        description={
          trek.description ||
          `Book ${trek.title} on GadKille. ${trek.duration || ''} fort trek with dates, pricing, and seats.`
        }
        path={`/trek/${trek.slug}`}
        image={imageUrl || getDefaultOgImage()}
        type="article"
        jsonLd={[
          trekJsonLd(trek),
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: trek.title, path: `/trek/${trek.slug}` }
          ])
        ]}
      />
      {loginPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-xl">
            <h3 className="text-lg font-semibold text-primaryDark">
              {isEnglish ? 'Login Required' : 'लॉगिन आवश्यक'}
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              {isEnglish ? 'Please login to book this trek.' : 'हा ट्रेक बुक करण्यासाठी लॉगिन करा.'}
            </p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setLoginPrompt(false)}
                className="flex-1 rounded-2xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                {isEnglish ? 'Cancel' : 'रद्द करा'}
              </button>
              <button
                onClick={() => navigate('/login')}
                className="flex-1 rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primaryDark"
              >
                {isEnglish ? 'Login' : 'लॉगिन'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        className="h-56 rounded-3xl bg-cover bg-center shadow-soft sm:h-72"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />

      <div className="mt-6 grid gap-6 md:grid-cols-[1.6fr,1fr]">
        <div className="rounded-3xl bg-white p-5 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            {isEnglish ? 'Upcoming Trek' : 'आगामी ट्रेक'}
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-primaryDark">{trek.title}</h1>
          {trek.fort?.name && (
            <p className="mt-1 text-sm text-gray-600">
              {trek.fort.name}
              {trek.fort.location ? ` · ${trek.fort.location}` : ''}
            </p>
          )}
          <p className="mt-3 text-sm text-gray-700">{trek.description}</p>

          {trek.highlights?.length > 0 && (
            <div className="mt-4">
              <h2 className="text-sm font-semibold text-primaryDark">
                {isEnglish ? 'Highlights' : 'ठळक मुद्दे'}
              </h2>
              <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-gray-600">
                {trek.highlights.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {trek.fort?.slug && (
            <Link
              to={`/fort/${trek.fort.slug}`}
              className="mt-4 inline-block text-sm font-semibold text-primary hover:text-primaryDark"
            >
              {isEnglish ? 'View fort details →' : 'किल्ल्याचे तपशील पहा →'}
            </Link>
          )}
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-soft">
          <h2 className="text-sm font-semibold text-primaryDark">
            {isEnglish ? 'Book this trek' : 'हा ट्रेक बुक करा'}
          </h2>
          <dl className="mt-3 space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <dt>{isEnglish ? 'Date' : 'तारीख'}</dt>
              <dd className="font-medium text-primaryDark">{startDate}</dd>
            </div>
            <div className="flex justify-between">
              <dt>{isEnglish ? 'Duration' : 'कालावधी'}</dt>
              <dd className="font-medium text-primaryDark">{trek.duration}</dd>
            </div>
            <div className="flex justify-between items-baseline">
              <dt>{isEnglish ? 'Price' : 'किंमत'}</dt>
              <dd className="font-medium text-primaryDark text-right">
                {originalPrice ? (
                  <span className="mr-2 text-sm text-red-500 line-through decoration-red-500 decoration-2">
                    ₹{formatInr(originalPrice)}
                  </span>
                ) : null}
                ₹{formatInr(trek.pricePerPerson)}
                {isEnglish ? ' / person' : ' / व्यक्ती'}
              </dd>
            </div>
            {trek.seatsAvailable > 0 && (
              <div className="flex justify-between">
                <dt>{isEnglish ? 'Seats left' : 'उपलब्ध जागा'}</dt>
                <dd className="font-medium text-primaryDark">{trek.seatsAvailable}</dd>
              </div>
            )}
          </dl>

          <form onSubmit={handleBooking} className="mt-4 space-y-3">
            <div>
              <label className="mb-1 block text-xs text-gray-700">
                {isEnglish ? 'Number of travelers' : 'प्रवाशांची संख्या'}
              </label>
              <input
                type="number"
                min={1}
                max={trek.seatsAvailable > 0 ? trek.seatsAvailable : 50}
                value={guests}
                onChange={(e) => setGuests(Math.max(1, Number(e.target.value) || 1))}
                className="w-full rounded-xl border border-gray-200 bg-softBg px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
            </div>
            <p className="text-xs text-gray-500">
              {isEnglish ? 'Estimated total' : 'अंदाजे एकूण'}:{' '}
              <span className="font-semibold text-primaryDark">
                ₹{totalPrice.toLocaleString('en-IN')}
              </span>
            </p>
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primaryDark disabled:opacity-60"
            >
              {submitting
                ? isEnglish
                  ? 'Sending...'
                  : 'पाठवत आहे...'
                : isEnglish
                ? 'Request Booking'
                : 'बुकिंग विनंती करा'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TrekDetailsPage;
