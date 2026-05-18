import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUi } from '../context/UiContext';
import { useAuth } from '../context/AuthContext';

const FortDetailsPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { language, showToast } = useUi();
  const { token } = useAuth();
  const [fort, setFort] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bookingType, setBookingType] = useState('stay');
  const [date, setDate] = useState('');
  const [guests, setGuests] = useState(2);
  const [submitting, setSubmitting] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedStay, setSelectedStay] = useState(null);
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [stayPhotoModal, setStayPhotoModal] = useState(null);
  const [loginPrompt, setLoginPrompt] = useState(false);
  const [vendors, setVendors] = useState([]);
  const apiOrigin = (import.meta.env.VITE_API_URL || '').replace(/\/api\/?$/i, '');
  const resolveImageUrl = (img) => {
    if (!img) return '';
    if (/^https?:\/\//i.test(img)) return img;
    if (/^\/images\/[^\s]+$/i.test(img) && apiOrigin) return `${apiOrigin}${img}`;
    return img;
  };

  // Auto-change image every 5 seconds if multiple images
  useEffect(() => {
    if (fort?.images?.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % fort.images.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [fort?.images]);

  useEffect(() => {
    const fetchFort = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/forts/${slug}`);
        setFort(res.data);
        const vendorRes = await axios.get(`${import.meta.env.VITE_API_URL}/vendors`, {
          params: { fortId: res.data?._id }
        });
        setVendors(vendorRes.data || []);
      } catch (err) {
        // ignore in starter
      } finally {
        setLoading(false);
      }
    };
    fetchFort();
  }, [slug]);

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!token) {
      setLoginPrompt(true);
      return;
    }
    if (!date) {
      showToast(
        'error',
        language === 'en' ? 'Please select a date.' : 'कृपया तारीख निवडा.'
      );
      return;
    }

    // Validate selection based on booking type
    if (bookingType === 'stay' && !selectedStay) {
      showToast(
        'error',
        language === 'en' ? 'Please select a stay.' : 'कृपया राहण्याची जागा निवडा.'
      );
      return;
    }
    if (bookingType === 'guide' && !selectedGuide) {
      showToast(
        'error',
        language === 'en' ? 'Please select a guide.' : 'कृपया मार्गदर्शक निवडा.'
      );
      return;
    }
    if (bookingType === 'vehicle' && !selectedVehicle) {
      showToast(
        'error',
        language === 'en' ? 'Please select a vehicle.' : 'कृपया वाहन निवडा.'
      );
      return;
    }

    setSubmitting(true);
    try {
      const bookingData = {
        fortId: fort._id,
        bookingType,
        date,
        details: { guests }
      };

      // Add selected item details based on type
      if (bookingType === 'stay' && selectedStay) {
        bookingData.details.stay = {
          name: selectedStay.name,
          pricePerNight: selectedStay.pricePerNight,
          maxGuests: selectedStay.maxGuests
        };
      }
      if (bookingType === 'guide' && selectedGuide) {
        bookingData.details.guide = {
          name: selectedGuide.name,
          language: selectedGuide.language,
          pricing: selectedGuide.pricing,
        };
      }
      if (bookingType === 'vehicle' && selectedVehicle) {
        bookingData.details.vehicle = {
          type: selectedVehicle.type,
          model: selectedVehicle.model,
          driverName: selectedVehicle.driverName,
          pricePerDay: selectedVehicle.pricePerDay
        };
      }

      await axios.post(`${import.meta.env.VITE_API_URL}/bookings`, bookingData);
      showToast(
        'success',
        language === 'en'
          ? 'Booking request created. View it in your dashboard.'
          : 'बुकिंग विनंती तयार झाली. आपल्या डॅशबोर्डमध्ये पहा.'
      );
    } catch (err) {
      showToast(
        'error',
        err.response?.data?.message ||
          (language === 'en' ? 'Booking failed.' : 'बुकिंग अयशस्वी.')
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !fort) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="h-48 animate-pulse rounded-3xl bg-white shadow-soft" />
      </div>
    );
  }

  const routesByType = (type) => fort.routes?.filter((r) => r.type === type) || [];
  const vendorStays = (vendors || [])
    .filter((v) => v.serviceType === 'stay')
    .map((v) => ({
      name: v.name,
      description: v.contactInfo || '',
      pricePerNight: Number(v.pricing) || 0,
      maxGuests: 10,
      availability: v.availability !== false,
      images: fort.images || []
    }));
  const vendorGuides = (vendors || [])
    .filter((v) => v.serviceType === 'guide')
    .map((v) => ({
      name: v.name,
      language: [],
      pricing: Number(v.pricing) || 0,
      rating: 0,
      contactInfo: v.contactInfo || '',
      available: v.availability !== false
    }));
  const vendorVehicles = (vendors || [])
    .filter((v) => v.serviceType === 'vehicle')
    .map((v) => ({
      type: 'vehicle',
      model: v.name,
      driverName: v.contactInfo || '',
      pricePerDay: Number(v.pricing) || 0,
      available: v.availability !== false
    }));
  const stayOptions = vendorStays.length ? vendorStays : fort.stayOptions || [];
  const guideOptions = vendorGuides.length ? vendorGuides : fort.guides || [];
  const vehicleOptions = vendorVehicles.length ? vendorVehicles : fort.vehicleRentals || [];
  const stayImageFallback = resolveImageUrl(fort.images?.[0]) || '/hero-fort.png';
  const getValidStayImages = (stay) =>
    (stay?.images || []).filter(
      (img) =>
        (/^https?:\/\//i.test(img) || /^\/images\/[^\s]+$/i.test(img)) &&
        !/google\.com\/maps|\/maps\/place|data=!/i.test(img)
    );

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      {/* Login Prompt Modal */}
      {loginPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-xl">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-softBg mx-auto">
              <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-primaryDark">
              {language === 'en' ? 'Login Required' : 'लॉगिन आवश्यक'}
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              {language === 'en'
                ? 'Please login to place a booking.'
                : 'बुकिंग करण्यासाठी कृपया लॉगिन करा.'}
            </p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setLoginPrompt(false)}
                className="flex-1 rounded-2xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                {language === 'en' ? 'Cancel' : 'रद्द करा'}
              </button>
              <button
                onClick={() => {
                  setLoginPrompt(false);
                  navigate('/login');
                }}
                className="flex-1 rounded-2xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primaryDark"
              >
                {language === 'en' ? 'Login' : 'लॉगिन'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="overflow-hidden rounded-3xl bg-white shadow-soft">
        <div className="grid gap-4 md:grid-cols-[2fr,1.5fr]">
          <div className="p-5">
            <p className="text-[11px] uppercase tracking-[0.2em] text-accent">
              {language === 'en' ? 'Fort overview' : 'किल्ल्याची माहिती'}
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-primaryDark">{fort.name}</h1>
            <p className="mt-1 text-xs text-gray-500">{fort.location}</p>
            <p className="mt-3 text-xs leading-relaxed text-gray-600">
              {fort.history || fort.description}
            </p>

            <div className="mt-4 grid grid-cols-2 gap-3 text-[11px]">
              <div className="rounded-2xl bg-softBg p-3">
                <p className="font-semibold text-primaryDark">
                  {language === 'en' ? 'Stay options' : 'राहण्याची सोय'}
                </p>
                <p className="mt-1 text-gray-600">
                  {stayOptions.length || 0}{' '}
                  {language === 'en' ? 'curated stays' : 'निवडलेल्या व्यवस्था'}
                </p>
              </div>
              <div className="rounded-2xl bg-softBg p-3">
                <p className="font-semibold text-primaryDark">
                  {language === 'en' ? 'Local guides' : 'स्थानिक मार्गदर्शक'}
                </p>
                <p className="mt-1 text-gray-600">
                  {guideOptions.length || 0}{' '}
                  {language === 'en' ? 'trusted guides' : 'विश्वासार्ह मार्गदर्शक'}
                </p>
              </div>
            </div>
          </div>
          <div className="relative h-48 md:h-full">
            <div
              className="absolute inset-0 bg-cover bg-center transition-all duration-500"
              style={{
                backgroundImage: `url(${resolveImageUrl(
                  fort.images?.[currentImageIndex] || fort.images?.[0] || ''
                )})`
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            {/* Image navigation dots */}
            {fort.images?.length > 1 && (
              <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                {fort.images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImageIndex(i)}
                    className={`h-2 w-2 rounded-full transition-all ${
                      i === currentImageIndex ? 'bg-white w-4' : 'bg-white/50'
                    }`}
                    aria-label={`View image ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Routes + facilities */}
      <div className="mt-5 grid gap-4 md:grid-cols-[2fr,1.4fr]">
        <div className="space-y-4">
          <div className="rounded-3xl bg-white p-4 shadow-soft">
            <h2 className="text-sm font-semibold text-primaryDark">
              {language === 'en' ? 'How to reach' : 'कसे जाल'}
            </h2>
            <div className="mt-3 grid gap-3 text-[11px] md:grid-cols-2">
              {['bus', 'train', 'private', 'trek'].map((type) => {
                const list = routesByType(type);
                if (!list.length) return null;
                const labelMap = {
                  bus: language === 'en' ? 'Bus routes' : 'बस मार्ग',
                  train: language === 'en' ? 'Train routes' : 'रेल्वे मार्ग',
                  private: language === 'en' ? 'Private vehicle' : 'खासगी वाहन',
                  trek: language === 'en' ? 'Trek routes' : 'ट्रेक मार्ग',
                };
                return (
                  <div key={type} className="rounded-2xl bg-softBg p-3">
                    <p className="font-semibold text-primaryDark">{labelMap[type]}</p>
                    <ul className="mt-1 space-y-1">
                      {list.map((r, i) => (
                        <li key={i} className="text-gray-600">
                          {r.description}
                          {r.duration && ` · ${r.duration}`}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl bg-white p-4 shadow-soft text-[11px]">
            <h2 className="text-sm font-semibold text-primaryDark">
              {language === 'en' ? 'Facilities' : 'सुविधा'}
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {fort.facilities?.map((f, i) => (
                <span
                  key={i}
                  className="rounded-full bg-softBg px-3 py-1 text-gray-700"
                >
                  {f.name}
                </span>
              )) || (
                <p className="text-gray-500">
                  {language === 'en' ? 'Facilities coming soon.' : 'सुविधांची माहिती लवकरच.'}
                </p>
              )}
            </div>
          </div>

          {/* Google Maps Embed - Bottom of left column */}
          {fort.mapCoordinates && import.meta.env.VITE_GOOGLE_MAPS_API_KEY && (
            <div className="rounded-3xl bg-white p-4 shadow-soft">
              <h2 className="text-sm font-semibold text-primaryDark">
                {language === 'en' ? 'Location' : 'स्थान'}
              </h2>
              <div className="mt-2 overflow-hidden rounded-2xl">
                <iframe
                  title="Google Map"
                  width="100%"
                  height="200"
                  frameBorder="0"
                  src={`https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&q=${fort.mapCoordinates.lat},${fort.mapCoordinates.lng}`}
                  allowFullScreen
                  loading="lazy"
                />
              </div>
            </div>
          )}
        </div>

        {/* Booking summary */}
        <div className="space-y-4">
          {/* Stay Options Display */}
          {bookingType === 'stay' && stayOptions.length > 0 && (
            <div className="rounded-3xl bg-white p-4 shadow-soft">
              <h2 className="text-sm font-semibold text-primaryDark">
                {language === 'en' ? 'Select Stay' : 'राहण्याची जागा निवडा'}
              </h2>
              <div className="mt-3 space-y-2">
                {stayOptions.map((stay, i) => (
                  (() => {
                    const validImages = getValidStayImages(stay);
                    return (
                  <div
                    key={i}
                    onClick={() => setSelectedStay(stay)}
                    className={`cursor-pointer rounded-2xl border-2 p-3 transition ${
                      selectedStay?.name === stay.name
                        ? 'border-primary bg-softBg'
                        : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={resolveImageUrl(validImages[0] || stayImageFallback)}
                        alt={stay.name}
                        className="h-16 w-20 rounded-xl object-cover"
                        onError={(e) => {
                          e.currentTarget.src = stayImageFallback;
                        }}
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-primaryDark">{stay.name}</p>
                        <p className="text-xs text-gray-600 mt-1">{stay.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {language === 'en' ? 'Max guests:' : 'कमाल जणांची संख्या:'} {stay.maxGuests}
                        </p>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setStayPhotoModal({ ...stay, validImages });
                          }}
                          className="mt-1 text-[10px] font-semibold text-primary hover:text-primaryDark"
                        >
                          {language === 'en' ? 'View Photos' : 'फोटो पहा'}
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-primary">₹{stay.pricePerNight}</p>
                        <p className="text-[10px] text-gray-500">{language === 'en' ? '/night' : '/रात्र'}</p>
                      </div>
                    </div>
                  </div>
                    );
                  })()
                ))}
              </div>
            </div>
          )}

          {/* Guide Options Display */}
          {bookingType === 'guide' && guideOptions.length > 0 && (
            <div className="rounded-3xl bg-white p-4 shadow-soft">
              <h2 className="text-sm font-semibold text-primaryDark">
                {language === 'en' ? 'Select Guide' : 'मार्गदर्शक निवडा'}
              </h2>
              <div className="mt-3 space-y-2">
                {guideOptions.map((guide, i) => (
                  <div
                    key={i}
                    onClick={() => setSelectedGuide(guide)}
                    className={`cursor-pointer rounded-2xl border-2 p-3 transition ${
                      selectedGuide?.name === guide.name
                        ? 'border-primary bg-softBg'
                        : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-primaryDark">{guide.name}</p>
                        <p className="text-xs text-gray-600 mt-1">
                          {guide.language?.join(', ')}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {guide.experienceYears} {language === 'en' ? 'years exp' : 'वर्ष अनुभव'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-primary">₹{guide.pricing}</p>
                        <p className="text-[10px] text-gray-500">{language === 'en' ? 'fixed' : 'निश्चित'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Vehicle Options Display */}
          {bookingType === 'vehicle' && vehicleOptions.length > 0 && (
            <div className="rounded-3xl bg-white p-4 shadow-soft">
              <h2 className="text-sm font-semibold text-primaryDark">
                {language === 'en' ? 'Select Vehicle' : 'वाहन निवडा'}
              </h2>
              <div className="mt-3 space-y-2">
                {vehicleOptions.map((vehicle, i) => (
                  <div
                    key={i}
                    onClick={() => setSelectedVehicle(vehicle)}
                    className={`cursor-pointer rounded-2xl border-2 p-3 transition ${
                      selectedVehicle?.type === vehicle.type
                        ? 'border-primary bg-softBg'
                        : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-primaryDark capitalize">{vehicle.type}</p>
                        <p className="text-xs text-gray-600 mt-1">{vehicle.model}</p>
                        <p className="text-xs text-gray-500 mt-1">{vehicle.driverName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-primary">₹{vehicle.pricePerDay}</p>
                        <p className="text-[10px] text-gray-500">{language === 'en' ? '/day' : '/दिवस'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-3xl bg-white p-4 shadow-soft text-[11px]">
            <h2 className="text-sm font-semibold text-primaryDark">
              {language === 'en' ? 'Quick booking' : 'त्वरित बुकिंग'}
            </h2>
            <p className="mt-2 text-gray-600">
              {language === 'en'
                ? 'Select your experience and date to create a booking request.'
                : 'आपला अनुभव आणि तारीख निवडून बुकिंग विनंती तयार करा.'}
            </p>

            <form onSubmit={handleBooking} className="mt-3 space-y-3">
              <div className="flex gap-2 text-[11px]">
                {['stay', 'guide', 'vehicle'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      setBookingType(type);
                      setSelectedStay(null);
                      setSelectedGuide(null);
                      setSelectedVehicle(null);
                    }}
                    className={`flex-1 rounded-full border px-3 py-1 capitalize transition ${
                      bookingType === type
                        ? 'border-primary bg-primary text-white'
                        : 'border-gray-200 bg-softBg text-gray-700'
                    }`}
                  >
                    {language === 'en'
                      ? type === 'stay'
                        ? 'Stay'
                        : type === 'guide'
                        ? 'Guide'
                        : 'Vehicle'
                      : type === 'stay'
                      ? 'राहण्याची सोय'
                      : type === 'guide'
                      ? 'मार्गदर्शक'
                      : 'वाहन'}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <label className="mb-1 block text-gray-700">
                    {language === 'en' ? 'Date' : 'तारीख'}
                  </label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-softBg px-3 py-1.5 focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-gray-700">
                    {language === 'en' ? 'Guests' : 'जणांची संख्या'}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    className="w-full rounded-xl border border-gray-200 bg-softBg px-3 py-1.5 focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-full bg-primary py-2 text-xs font-semibold text-white shadow-soft hover:bg-primaryDark disabled:opacity-60"
              >
                {submitting
                  ? language === 'en'
                    ? 'Creating booking...'
                    : 'बुकिंग तयार करत आहोत...'
                  : language === 'en'
                  ? 'Create booking request'
                  : 'बुकिंग विनंती तयार करा'}
              </button>
            </form>
          </div>

          <div className="rounded-3xl bg-white p-4 shadow-soft text-[11px]">
            <h2 className="text-sm font-semibold text-primaryDark">
              {language === 'en' ? 'Weather & best season' : 'हवामान व योग्य काळ'}
            </h2>
            <p className="mt-2 text-gray-600">
              {language === 'en'
                ? 'Placeholder section — integrate a weather API like OpenWeather using fort coordinates.'
                : 'ही डमी विभाग आहे — नकाशा स्थानावरून OpenWeather सारखा हवामान API जोडू शकता.'}
            </p>
          </div>
        </div>
      </div>

      {stayPhotoModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-3xl rounded-2xl bg-white p-4 shadow-soft">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-primaryDark">{stayPhotoModal.name}</h3>
              <button
                type="button"
                onClick={() => setStayPhotoModal(null)}
                className="rounded-lg bg-softBg px-3 py-1 text-xs font-semibold text-primaryDark"
              >
                {language === 'en' ? 'Close' : 'बंद करा'}
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {((stayPhotoModal.validImages?.length ? stayPhotoModal.validImages : getValidStayImages(stayPhotoModal)).length
                ? (stayPhotoModal.validImages?.length ? stayPhotoModal.validImages : getValidStayImages(stayPhotoModal))
                : [stayImageFallback]
              ).map((img, idx) => (
                <img
                  key={`${img}-${idx}`}
                  src={resolveImageUrl(img)}
                  alt={`${stayPhotoModal.name} ${idx + 1}`}
                  className="h-48 w-full rounded-xl object-cover"
                  onError={(e) => {
                    e.currentTarget.src = stayImageFallback;
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FortDetailsPage;

