import { useEffect, useState } from 'react';
import axios from 'axios';
import { useUi } from '../../context/UiContext';

const AdminDashboardPage = () => {
  const { language, showToast } = useUi();
  const [tab, setTab] = useState('overview');
  const [bookings, setBookings] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [forts, setForts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fortForm, setFortForm] = useState({
    _id: null,
    name: '',
    slug: '',
    location: '',
    history: '',
    description: '',
    imagesText: '',
    routes: [],
    facilities: [],
    stayOptions: [],
    guides: [],
    vehicleRentals: [],
    lat: '',
    lng: ''
  });
  const [savingFort, setSavingFort] = useState(false);
  const [uploadingStayIdx, setUploadingStayIdx] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bRes, vRes, fRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/bookings`),
          axios.get(`${import.meta.env.VITE_API_URL}/vendors`),
          axios.get(`${import.meta.env.VITE_API_URL}/forts`)
        ]);
        setBookings(bRes.data);
        setVendors(vRes.data);
        setForts(fRes.data);
      } catch (err) {
        // silent in starter
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const setBookingStatus = async (booking, requestStatus) => {
    try {
      const updated = await axios.put(
        `${import.meta.env.VITE_API_URL}/bookings/${booking._id}/status`,
        { requestStatus }
      );
      setBookings((prev) => prev.map((b) => (b._id === booking._id ? updated.data : b)));
      showToast(
        'success',
        language === 'en' ? 'Booking updated.' : 'बुकिंग अपडेट झाले.'
      );
    } catch (err) {
      showToast(
        'error',
        err.response?.data?.message ||
          (language === 'en' ? 'Unable to update booking.' : 'बुकिंग अपडेट करता आले नाही.')
      );
    }
  };

  const toggleVendorAvailability = async (vendor) => {
    try {
      const updated = await axios.put(
        `${import.meta.env.VITE_API_URL}/vendors/${vendor._id}`,
        { availability: !vendor.availability }
      );
      setVendors((prev) =>
        prev.map((v) => (v._id === vendor._id ? updated.data : v))
      );
    } catch (err) {
      showToast(
        'error',
        err.response?.data?.message ||
          (language === 'en' ? 'Unable to update vendor.' : 'वेंडर अपडेट करता आले नाही.')
      );
    }
  };

  const startEditFort = (fort) => {
    setTab('forts');
    setFortForm({
      _id: fort._id,
      name: fort.name || '',
      slug: fort.slug || '',
      location: fort.location || '',
      history: fort.history || '',
      description: fort.description || '',
      imagesText: (fort.images || []).join('\n'),
      routes: fort.routes || [],
      facilities: fort.facilities || [],
      stayOptions: (fort.stayOptions || []).map((stay) => ({
        ...stay,
        imagesText: (stay.images || []).join('\n')
      })),
      guides: fort.guides || [],
      vehicleRentals: fort.vehicleRentals || [],
      lat: fort.mapCoordinates?.lat ?? '',
      lng: fort.mapCoordinates?.lng ?? ''
    });
  };

  const resetFortForm = () => {
    setFortForm({
      _id: null,
      name: '',
      slug: '',
      location: '',
      history: '',
      description: '',
      imagesText: '',
      routes: [],
      facilities: [],
      stayOptions: [],
      guides: [],
      vehicleRentals: [],
      lat: '',
      lng: ''
    });
  };

  const updateFortArrayItem = (key, idx, patch) => {
    setFortForm((prev) => {
      const next = [...(prev[key] || [])];
      next[idx] = { ...(next[idx] || {}), ...patch };
      return { ...prev, [key]: next };
    });
  };

  const addFortArrayItem = (key, item) => {
    setFortForm((prev) => ({ ...prev, [key]: [...(prev[key] || []), item] }));
  };

  const removeFortArrayItem = (key, idx) => {
    setFortForm((prev) => ({
      ...prev,
      [key]: (prev[key] || []).filter((_, i) => i !== idx)
    }));
  };

  const parseImageUrls = (text) =>
    (text || '')
      .split(/\r?\n/g)
      .map((s) => s.trim())
      .filter(
        (s) =>
          (/^https?:\/\//i.test(s) || /^\/images\/[^\s]+$/i.test(s)) &&
          !/google\.com\/maps|\/maps\/place|data=!/i.test(s)
      );

  const uploadStayImages = async (idx, fileList) => {
    const files = Array.from(fileList || []).slice(0, 8);
    if (!files.length) return;
    setUploadingStayIdx(idx);
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append('images', file));
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/uploads/stay-images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const uploadedUrls = res.data?.urls || [];
      setFortForm((prev) => {
        const current = prev.stayOptions?.[idx] || {};
        const existing = parseImageUrls(current.imagesText || '');
        const merged = [...existing, ...uploadedUrls];
        const next = [...(prev.stayOptions || [])];
        next[idx] = { ...current, imagesText: merged.join('\n') };
        return { ...prev, stayOptions: next };
      });
      showToast(
        'success',
        language === 'en' ? 'Stay photos uploaded.' : 'हॉटेल फोटो अपलोड झाले.'
      );
    } catch (err) {
      showToast(
        'error',
        err.response?.data?.message ||
          (language === 'en' ? 'Photo upload failed.' : 'फोटो अपलोड अयशस्वी.')
      );
    } finally {
      setUploadingStayIdx(null);
    }
  };

  const uploadFortImages = async (fileList) => {
    const files = Array.from(fileList || []).slice(0, 8);
    if (!files.length) return;
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append('images', file));
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/uploads/stay-images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const uploadedUrls = res.data?.urls || [];
      setFortForm((prev) => {
        const existing = parseImageUrls(prev.imagesText || '');
        const merged = [...existing, ...uploadedUrls];
        return { ...prev, imagesText: merged.join('\n') };
      });
      showToast(
        'success',
        language === 'en' ? 'Fort images uploaded.' : 'किल्ल्याचे फोटो अपलोड झाले.'
      );
    } catch (err) {
      showToast(
        'error',
        err.response?.data?.message ||
          (language === 'en' ? 'Photo upload failed.' : 'फोटो अपलोड अयशस्वी.')
      );
    }
  };

  const saveFort = async (e) => {
    e.preventDefault();
    if (!fortForm.name || !fortForm.slug || !fortForm.location) {
      showToast(
        'error',
        language === 'en'
          ? 'Name, slug and location are required.'
          : 'नाव, स्लग आणि लोकेशन आवश्यक आहे.'
      );
      return;
    }

    setSavingFort(true);
    try {
      const images = parseImageUrls(fortForm.imagesText);
      const latNum =
        fortForm.lat === '' || fortForm.lat === null ? null : Number(fortForm.lat);
      const lngNum =
        fortForm.lng === '' || fortForm.lng === null ? null : Number(fortForm.lng);
      const mapCoordinates =
        latNum === null && lngNum === null
          ? undefined
          : { lat: latNum || 0, lng: lngNum || 0 };

      const payload = {
        name: fortForm.name,
        slug: fortForm.slug,
        location: fortForm.location,
        history: fortForm.history,
        description: fortForm.description,
        images,
        routes: fortForm.routes || [],
        facilities: fortForm.facilities || [],
        stayOptions: (fortForm.stayOptions || []).map((stay) => ({
          name: stay.name || '',
          description: stay.description || '',
          pricePerNight: Number(stay.pricePerNight) || 0,
          maxGuests: Number(stay.maxGuests) || 1,
          availability: !!stay.availability,
          images: parseImageUrls(stay.imagesText || '')
        })),
        guides: fortForm.guides || [],
        vehicleRentals: fortForm.vehicleRentals || [],
        mapCoordinates
      };
      const res = fortForm._id
        ? await axios.put(`${import.meta.env.VITE_API_URL}/forts/${fortForm._id}`, payload)
        : await axios.post(`${import.meta.env.VITE_API_URL}/forts`, payload);

      setForts((prev) => {
        const exists = prev.some((f) => f._id === res.data._id);
        if (exists) return prev.map((f) => (f._id === res.data._id ? res.data : f));
        return [res.data, ...prev];
      });
      resetFortForm();
      showToast(
        'success',
        language === 'en' ? 'Fort saved.' : 'किल्ला सेव्ह झाला.'
      );
    } catch (err) {
      showToast(
        'error',
        err.response?.data?.message ||
          (language === 'en' ? 'Unable to save fort.' : 'किल्ला सेव्ह करता आला नाही.')
      );
    } finally {
      setSavingFort(false);
    }
  };

  const deleteFort = async (fort) => {
    // eslint-disable-next-line no-alert
    const ok = window.confirm(
      language === 'en'
        ? `Delete ${fort.name}?`
        : `${fort.name} हटवायचा आहे का?`
    );
    if (!ok) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/forts/${fort._id}`);
      setForts((prev) => prev.filter((f) => f._id !== fort._id));
      if (fortForm._id === fort._id) resetFortForm();
      showToast(
        'success',
        language === 'en' ? 'Fort deleted.' : 'किल्ला हटवला.'
      );
    } catch (err) {
      showToast(
        'error',
        err.response?.data?.message ||
          (language === 'en' ? 'Unable to delete fort.' : 'किल्ला हटवता आला नाही.')
      );
    }
  };

  const stats = {
    totalBookings: bookings.length,
    pendingRequests: bookings.filter((b) => (b.requestStatus || 'pending') === 'pending').length,
    totalForts: forts.length,
    totalVendors: vendors.length
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-4 flex flex-wrap gap-2">
        {[
          { id: 'overview', labelEn: 'Overview', labelMr: 'माहिती' },
          { id: 'requests', labelEn: 'Requests', labelMr: 'विनंत्या' },
          { id: 'forts', labelEn: 'Forts', labelMr: 'किल्ले' },
          { id: 'vendors', labelEn: 'Vendors', labelMr: 'वेंडर' }
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
              tab === t.id
                ? 'bg-primary text-white'
                : 'bg-white text-gray-700 shadow-soft hover:bg-softBg'
            }`}
          >
            {language === 'en' ? t.labelEn : t.labelMr}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-[2fr,1.3fr]">
        <div className="space-y-4">
          <div className="rounded-3xl bg-white p-5 shadow-soft" hidden={tab !== 'overview'}>
            <h1 className="text-lg font-semibold text-primaryDark">
              {language === 'en' ? 'Admin overview' : 'ॲडमिन माहिती'}
            </h1>
            <p className="mt-1 text-xs text-gray-500">
              {language === 'en'
                ? 'Live view of latest bookings across all forts.'
                : 'सर्व किल्ल्यांवरील नवीनतम बुकिंग्सचे थेट दृश्य.'}
            </p>

            <div className="mt-4 grid gap-3 text-[11px] md:grid-cols-4">
              {[
                {
                  labelEn: 'Bookings',
                  labelMr: 'बुकिंग्स',
                  value: stats.totalBookings
                },
                {
                  labelEn: 'Pending',
                  labelMr: 'प्रलंबित',
                  value: stats.pendingRequests
                },
                { labelEn: 'Forts', labelMr: 'किल्ले', value: stats.totalForts },
                { labelEn: 'Vendors', labelMr: 'वेंडर', value: stats.totalVendors }
              ].map((s) => (
                <div key={s.labelEn} className="rounded-2xl bg-softBg p-3">
                  <p className="text-[10px] text-gray-500">
                    {language === 'en' ? s.labelEn : s.labelMr}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-primaryDark">{s.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-2 text-[11px]">
              {loading ? (
                <div className="h-24 animate-pulse rounded-2xl bg-softBg" />
              ) : bookings.length === 0 ? (
                <p className="text-gray-500">
                  {language === 'en'
                    ? 'No bookings yet.'
                    : 'अजून कोणतीही बुकिंग्स नाहीत.'}
                </p>
              ) : (
                bookings.slice(0, 5).map((b) => (
                  <div
                    key={b._id}
                    className="flex items-center justify-between rounded-2xl bg-softBg px-3 py-2"
                  >
                    <div>
                      <p className="font-semibold text-primaryDark">
                        {b.fortId?.name || 'Fort'} · {b.userId?.name || 'User'}
                      </p>
                      <p className="text-[10px] text-gray-600">
                        {new Date(b.date).toLocaleDateString()} · {b.bookingType} ·{' '}
                        {(b.requestStatus || 'pending') === 'accepted'
                          ? language === 'en'
                            ? 'Accepted ✓'
                            : 'स्वीकृत ✓'
                          : (b.requestStatus || 'pending') === 'rejected'
                          ? language === 'en'
                            ? 'Rejected ✗'
                            : 'नाकारले ✗'
                          : language === 'en'
                          ? 'Pending'
                          : 'प्रलंबित'}
                      </p>
                      {/* Show selected item in overview */}
                      {b.bookingType === 'stay' && b.details?.stay && (
                        <p className="text-[10px] text-primary">🏨 {b.details.stay.name}</p>
                      )}
                      {b.bookingType === 'guide' && b.details?.guide && (
                        <p className="text-[10px] text-primary">👤 {b.details.guide.name}</p>
                      )}
                      {b.bookingType === 'vehicle' && b.details?.vehicle && (
                        <p className="text-[10px] text-primary">🚗 {b.details.vehicle.type}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-soft" hidden={tab !== 'requests'}>
            <h2 className="text-sm font-semibold text-primaryDark">
              {language === 'en' ? 'Booking requests' : 'बुकिंग विनंत्या'}
            </h2>
            <p className="mt-2 text-xs text-gray-500">
              {language === 'en'
                ? 'Accept or reject booking requests and contact users.'
                : 'बुकिंग विनंत्या स्वीकारा/नकार द्या आणि युजरशी संपर्क साधा.'}
            </p>

            <div className="mt-3 space-y-2 text-[11px]">
              {loading ? (
                <div className="h-28 animate-pulse rounded-2xl bg-softBg" />
              ) : bookings.length === 0 ? (
                <p className="text-gray-500">
                  {language === 'en' ? 'No bookings yet.' : 'अजून बुकिंग्स नाहीत.'}
                </p>
              ) : (
                bookings.slice(0, 20).map((b) => {
                  const status = b.requestStatus || 'pending';
                  const statusLabel =
                    status === 'accepted'
                      ? language === 'en'
                        ? 'Accepted ✓'
                        : 'स्वीकृत ✓'
                      : status === 'rejected'
                      ? language === 'en'
                        ? 'Rejected ✗'
                        : 'नाकारले ✗'
                      : language === 'en'
                      ? 'Pending'
                      : 'प्रलंबित';
                  const badge =
                    status === 'accepted'
                      ? 'bg-emerald-50 text-emerald-700'
                      : status === 'rejected'
                      ? 'bg-red-50 text-red-700'
                      : 'bg-amber-50 text-amber-700';
                  return (
                    <div
                      key={b._id}
                      className="rounded-2xl bg-softBg px-3 py-2"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-primaryDark">
                            {b.fortId?.name || 'Fort'} · {b.userId?.name || 'User'}
                          </p>
                          <p className="mt-0.5 text-[10px] text-gray-600">
                            {new Date(b.date).toLocaleDateString()} · {b.bookingType} ·{' '}
                            <span className={`rounded-full px-2 py-0.5 ${badge}`}>
                              {statusLabel}
                            </span>
                          </p>
                          {/* Show selected stay/guide/vehicle details */}
                          {b.bookingType === 'stay' && b.details?.stay && (
                            <p className="mt-1 text-[10px] text-primary">
                              🏨 {b.details.stay.name} · ₹{b.details.stay.pricePerNight}/night
                            </p>
                          )}
                          {b.bookingType === 'guide' && b.details?.guide && (
                            <p className="mt-1 text-[10px] text-primary">
                              👤 {b.details.guide.name} · ₹{b.details.guide.pricing}
                            </p>
                          )}
                          {b.bookingType === 'vehicle' && b.details?.vehicle && (
                            <p className="mt-1 text-[10px] text-primary">
                              🚗 {b.details.vehicle.type} ({b.details.vehicle.model}) · ₹{b.details.vehicle.pricePerDay}/day
                            </p>
                          )}
                          {b.userId?.email && (
                            <a
                              className="mt-1 inline-block text-[10px] font-semibold text-primary hover:text-primaryDark"
                              href={`mailto:${b.userId.email}?subject=Gadkille booking request&body=Hi ${encodeURIComponent(
                                b.userId?.name || 'there'
                              )},%0D%0A%0D%0ARegarding your booking for ${
                                encodeURIComponent(b.fortId?.name || 'a fort')
                              } on ${encodeURIComponent(
                                new Date(b.date).toLocaleDateString()
                              )}.`}
                            >
                              {language === 'en' ? 'Contact user' : 'युजरला संपर्क'}
                            </a>
                          )}
                          {(b.userId?.phone || b.userId?.email) && (
                            <p className="mt-1 text-[10px] text-gray-600">
                              {b.userId?.email && (
                                <span className="mr-2">
                                  {language === 'en' ? 'Email' : 'ई-मेल'}: {b.userId.email}
                                </span>
                              )}
                              {b.userId?.phone && (
                                <span>
                                  {language === 'en' ? 'Phone' : 'फोन'}:{' '}
                                  <a
                                    className="font-semibold text-primary hover:text-primaryDark"
                                    href={`tel:${b.userId.phone}`}
                                  >
                                    {b.userId.phone}
                                  </a>
                                </span>
                              )}
                            </p>
                          )}
                        </div>

                        <div className="flex shrink-0 flex-col gap-1">
                          <button
                            onClick={() => setBookingStatus(b, 'accepted')}
                            className="rounded-full bg-emerald-600 px-3 py-1 text-[10px] font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                            disabled={status === 'accepted'}
                          >
                            {language === 'en' ? 'Accept ✓' : 'स्वीकारा ✓'}
                          </button>
                          <button
                            onClick={() => setBookingStatus(b, 'rejected')}
                            className="rounded-full bg-red-600 px-3 py-1 text-[10px] font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                            disabled={status === 'rejected'}
                          >
                            {language === 'en' ? 'Reject ✗' : 'नकार ✗'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-soft" hidden={tab !== 'forts'}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-primaryDark">
                  {language === 'en' ? 'Forts manager' : 'किल्ले व्यवस्थापक'}
                </h2>
                <p className="mt-2 text-xs text-gray-500">
                  {language === 'en'
                    ? 'Add, update, or remove forts shown on the home page.'
                    : 'होम पेजवर दिसणारे किल्ले जोडा, अपडेट करा किंवा हटवा.'}
                </p>
              </div>
              <button
                onClick={resetFortForm}
                className="text-[11px] font-semibold text-primary hover:text-primaryDark"
              >
                {language === 'en' ? 'New fort' : 'नवीन किल्ला'}
              </button>
            </div>

            <form onSubmit={saveFort} className="mt-4 grid gap-3 text-xs md:grid-cols-2">
              <div className="md:col-span-1">
                <label className="mb-1 block text-[11px] text-gray-700">
                  {language === 'en' ? 'Name' : 'नाव'}
                </label>
                <input
                  value={fortForm.name}
                  onChange={(e) => setFortForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full rounded-xl border border-gray-200 bg-softBg px-3 py-2 focus:border-primary focus:outline-none"
                />
              </div>
              <div className="md:col-span-1">
                <label className="mb-1 block text-[11px] text-gray-700">
                  {language === 'en' ? 'Slug' : 'स्लग'}
                </label>
                <input
                  value={fortForm.slug}
                  onChange={(e) => setFortForm((p) => ({ ...p, slug: e.target.value }))}
                  className="w-full rounded-xl border border-gray-200 bg-softBg px-3 py-2 focus:border-primary focus:outline-none"
                />
              </div>
              <div className="md:col-span-1">
                <label className="mb-1 block text-[11px] text-gray-700">
                  {language === 'en' ? 'Location' : 'ठिकाण'}
                </label>
                <input
                  value={fortForm.location}
                  onChange={(e) => setFortForm((p) => ({ ...p, location: e.target.value }))}
                  className="w-full rounded-xl border border-gray-200 bg-softBg px-3 py-2 focus:border-primary focus:outline-none"
                />
              </div>
              <div className="md:col-span-1">
                <label className="mb-1 block text-[11px] text-gray-700">
                  {language === 'en'
                    ? 'Images (one URL per line)'
                    : 'इमेजेस (प्रत्येक ओळीवर 1 URL)'}
                </label>
                <textarea
                  rows={3}
                  value={fortForm.imagesText}
                  onChange={(e) =>
                    setFortForm((p) => ({ ...p, imagesText: e.target.value }))
                  }
                  className="w-full resize-none rounded-xl border border-gray-200 bg-softBg px-3 py-2 focus:border-primary focus:outline-none"
                />
                <div className="mt-2">
                  <label className="mb-1 block text-[11px] text-gray-700">
                    {language === 'en'
                      ? 'Or upload images'
                      : 'किंवा इमेज अपलोड करा'}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={async (e) => {
                      await uploadFortImages(e.target.files);
                      e.target.value = '';
                    }}
                    className="w-full rounded-xl border border-gray-200 bg-softBg px-3 py-2 text-[11px] file:mr-2 file:cursor-pointer file:rounded-full file:border-0 file:bg-primary file:px-3 file:py-1 file:text-xs file:text-white file:font-semibold"
                  />
                  <p className="mt-1 text-[10px] text-gray-500">
                    {language === 'en'
                      ? 'Uploaded files are saved in frontend/public/images/ and URLs are auto-filled.'
                      : 'अपलोड केलेल्या फाइल्स frontend/public/images/ मध्ये सेव्ह होतात आणि URL आपोआप भरले जातात.'}
                  </p>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-[11px] text-gray-700">
                  {language === 'en' ? 'History' : 'इतिहास'}
                </label>
                <textarea
                  rows={3}
                  value={fortForm.history}
                  onChange={(e) => setFortForm((p) => ({ ...p, history: e.target.value }))}
                  className="w-full resize-none rounded-xl border border-gray-200 bg-softBg px-3 py-2 focus:border-primary focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-[11px] text-gray-700">
                  {language === 'en' ? 'Description' : 'वर्णन'}
                </label>
                <textarea
                  rows={3}
                  value={fortForm.description}
                  onChange={(e) =>
                    setFortForm((p) => ({ ...p, description: e.target.value }))
                  }
                  className="w-full resize-none rounded-xl border border-gray-200 bg-softBg px-3 py-2 focus:border-primary focus:outline-none"
                />
              </div>

              <div className="md:col-span-1">
                <label className="mb-1 block text-[11px] text-gray-700">
                  {language === 'en' ? 'Map latitude' : 'नकाशा अक्षांश'}
                </label>
                <input
                  value={fortForm.lat}
                  onChange={(e) => setFortForm((p) => ({ ...p, lat: e.target.value }))}
                  className="w-full rounded-xl border border-gray-200 bg-softBg px-3 py-2 focus:border-primary focus:outline-none"
                />
              </div>
              <div className="md:col-span-1">
                <label className="mb-1 block text-[11px] text-gray-700">
                  {language === 'en' ? 'Map longitude' : 'नकाशा रेखांश'}
                </label>
                <input
                  value={fortForm.lng}
                  onChange={(e) => setFortForm((p) => ({ ...p, lng: e.target.value }))}
                  className="w-full rounded-xl border border-gray-200 bg-softBg px-3 py-2 focus:border-primary focus:outline-none"
                />
              </div>

              <div className="md:col-span-2 rounded-2xl bg-softBg p-3 text-[11px] text-gray-700">
                {language === 'en'
                  ? 'Advanced details (simple form). Add rows as needed.'
                  : 'अतिरिक्त माहिती (सोप्या फॉर्ममध्ये). गरजेनुसार रकाने जोडा.'}
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-[11px] text-gray-700">
                  {language === 'en' ? 'Routes' : 'मार्ग'}
                </label>
                <div className="space-y-2">
                  {(fortForm.routes || []).map((r, idx) => (
                    <div key={idx} className="rounded-2xl bg-softBg p-3">
                      <div className="grid gap-2 md:grid-cols-4">
                        <select
                          value={r.type || 'bus'}
                          onChange={(e) => updateFortArrayItem('routes', idx, { type: e.target.value })}
                          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-[11px] focus:border-primary focus:outline-none"
                        >
                          {['bus', 'train', 'private', 'trek'].map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                        <input
                          value={r.duration || ''}
                          onChange={(e) => updateFortArrayItem('routes', idx, { duration: e.target.value })}
                          placeholder={language === 'en' ? 'Duration' : 'कालावधी'}
                          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-[11px] focus:border-primary focus:outline-none"
                        />
                        <input
                          value={r.distance || ''}
                          onChange={(e) => updateFortArrayItem('routes', idx, { distance: e.target.value })}
                          placeholder={language === 'en' ? 'Distance' : 'अंतर'}
                          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-[11px] focus:border-primary focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => removeFortArrayItem('routes', idx)}
                          className="rounded-full bg-red-50 px-4 py-2 text-[11px] font-semibold text-red-700 hover:bg-red-100"
                        >
                          {language === 'en' ? 'Remove' : 'काढा'}
                        </button>
                      </div>
                      <input
                        value={r.description || ''}
                        onChange={(e) => updateFortArrayItem('routes', idx, { description: e.target.value })}
                        placeholder={language === 'en' ? 'Description' : 'वर्णन'}
                        className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-[11px] focus:border-primary focus:outline-none"
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      addFortArrayItem('routes', {
                        type: 'bus',
                        description: '',
                        duration: '',
                        distance: ''
                      })
                    }
                    className="rounded-full bg-white px-4 py-2 text-[11px] font-semibold text-primary shadow-soft hover:bg-softBg"
                  >
                    {language === 'en' ? '+ Add route' : '+ मार्ग जोडा'}
                  </button>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-[11px] text-gray-700">
                  {language === 'en' ? 'Facilities' : 'सुविधा'}
                </label>
                <div className="space-y-2">
                  {(fortForm.facilities || []).map((f, idx) => (
                    <div key={idx} className="rounded-2xl bg-softBg p-3">
                      <div className="grid gap-2 md:grid-cols-3">
                        <input
                          value={f.name || ''}
                          onChange={(e) => updateFortArrayItem('facilities', idx, { name: e.target.value })}
                          placeholder={language === 'en' ? 'Facility name' : 'सुविधेचे नाव'}
                          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-[11px] focus:border-primary focus:outline-none"
                        />
                        <label className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-[11px]">
                          <input
                            type="checkbox"
                            checked={f.available !== false}
                            onChange={(e) => updateFortArrayItem('facilities', idx, { available: e.target.checked })}
                          />
                          {language === 'en' ? 'Available' : 'उपलब्ध'}
                        </label>
                        <button
                          type="button"
                          onClick={() => removeFortArrayItem('facilities', idx)}
                          className="rounded-full bg-red-50 px-4 py-2 text-[11px] font-semibold text-red-700 hover:bg-red-100"
                        >
                          {language === 'en' ? 'Remove' : 'काढा'}
                        </button>
                      </div>
                      <input
                        value={f.details || ''}
                        onChange={(e) => updateFortArrayItem('facilities', idx, { details: e.target.value })}
                        placeholder={language === 'en' ? 'Details (optional)' : 'तपशील (ऐच्छिक)'}
                        className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-[11px] focus:border-primary focus:outline-none"
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addFortArrayItem('facilities', { name: '', available: true, details: '' })}
                    className="rounded-full bg-white px-4 py-2 text-[11px] font-semibold text-primary shadow-soft hover:bg-softBg"
                  >
                    {language === 'en' ? '+ Add facility' : '+ सुविधा जोडा'}
                  </button>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-[11px] text-gray-700">
                  {language === 'en' ? 'Stay options' : 'राहण्याची सोय'}
                </label>
                <div className="space-y-2">
                  {(fortForm.stayOptions || []).map((s, idx) => (
                    <div key={idx} className="rounded-2xl bg-softBg p-3">
                      <div className="grid gap-2 md:grid-cols-4">
                        <input
                          value={s.name || ''}
                          onChange={(e) => updateFortArrayItem('stayOptions', idx, { name: e.target.value })}
                          placeholder={language === 'en' ? 'Name' : 'नाव'}
                          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-[11px] focus:border-primary focus:outline-none"
                        />
                        <input
                          value={s.pricePerNight ?? ''}
                          onChange={(e) => updateFortArrayItem('stayOptions', idx, { pricePerNight: Number(e.target.value) })}
                          placeholder={language === 'en' ? 'Price/night' : 'किंमत/रात्र'}
                          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-[11px] focus:border-primary focus:outline-none"
                        />
                        <input
                          value={s.maxGuests ?? ''}
                          onChange={(e) => updateFortArrayItem('stayOptions', idx, { maxGuests: Number(e.target.value) })}
                          placeholder={language === 'en' ? 'Max guests' : 'कमाल लोक'}
                          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-[11px] focus:border-primary focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => removeFortArrayItem('stayOptions', idx)}
                          className="rounded-full bg-red-50 px-4 py-2 text-[11px] font-semibold text-red-700 hover:bg-red-100"
                        >
                          {language === 'en' ? 'Remove' : 'काढा'}
                        </button>
                      </div>
                      <div className="mt-2 grid gap-2 md:grid-cols-[1fr,200px]">
                        <input
                          value={s.description || ''}
                          onChange={(e) => updateFortArrayItem('stayOptions', idx, { description: e.target.value })}
                          placeholder={language === 'en' ? 'Description' : 'वर्णन'}
                          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-[11px] focus:border-primary focus:outline-none"
                        />
                        <label className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-[11px]">
                          <input
                            type="checkbox"
                            checked={!!s.availability}
                            onChange={(e) => updateFortArrayItem('stayOptions', idx, { availability: e.target.checked })}
                          />
                          {language === 'en' ? 'Available' : 'उपलब्ध'}
                        </label>
                      </div>
                      <textarea
                        rows={2}
                        value={s.imagesText || ''}
                        onChange={(e) => updateFortArrayItem('stayOptions', idx, { imagesText: e.target.value })}
                        placeholder={language === 'en' ? 'Stay photo URLs (one per line)' : 'राहण्याच्या फोटो URL (प्रत्येक ओळीत एक)'}
                        className="mt-2 w-full resize-none rounded-xl border border-gray-200 bg-white px-3 py-2 text-[11px] focus:border-primary focus:outline-none"
                      />
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <label className="cursor-pointer rounded-full bg-primary px-4 py-2 text-[11px] font-semibold text-white hover:bg-primaryDark">
                          {uploadingStayIdx === idx
                            ? language === 'en'
                              ? 'Uploading...'
                              : 'अपलोड होत आहे...'
                            : language === 'en'
                            ? 'Upload Hotel Photos'
                            : 'हॉटेल फोटो अपलोड करा'}
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            disabled={uploadingStayIdx === idx}
                            onChange={(e) => {
                              uploadStayImages(idx, e.target.files);
                              e.target.value = '';
                            }}
                          />
                        </label>
                        <p className="text-[10px] text-gray-500">
                          {language === 'en'
                            ? 'You can upload 3-4 photos (or more) at once.'
                            : 'तुम्ही एकावेळी 3-4 (किंवा अधिक) फोटो अपलोड करू शकता.'}
                        </p>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      addFortArrayItem('stayOptions', {
                        name: '',
                        description: '',
                        pricePerNight: 0,
                        maxGuests: 1,
                        availability: true,
                        imagesText: ''
                      })
                    }
                    className="rounded-full bg-white px-4 py-2 text-[11px] font-semibold text-primary shadow-soft hover:bg-softBg"
                  >
                    {language === 'en' ? '+ Add stay option' : '+ राहण्याची सोय जोडा'}
                  </button>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-[11px] text-gray-700">
                  {language === 'en' ? 'Guides' : 'मार्गदर्शक'}
                </label>
                <div className="space-y-2">
                  {(fortForm.guides || []).map((g, idx) => (
                    <div key={idx} className="rounded-2xl bg-softBg p-3">
                      <div className="grid gap-2 md:grid-cols-4">
                        <input
                          value={g.name || ''}
                          onChange={(e) => updateFortArrayItem('guides', idx, { name: e.target.value })}
                          placeholder={language === 'en' ? 'Name' : 'नाव'}
                          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-[11px] focus:border-primary focus:outline-none"
                        />
                        <input
                          value={Array.isArray(g.language) ? g.language.join(', ') : g.language || ''}
                          onChange={(e) =>
                            updateFortArrayItem('guides', idx, {
                              language: e.target.value
                                .split(',')
                                .map((s) => s.trim())
                                .filter(Boolean)
                            })
                          }
                          placeholder={language === 'en' ? 'Languages (comma)' : 'भाषा (कॉमा)'}
                          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-[11px] focus:border-primary focus:outline-none"
                        />
                        <input
                          value={g.contactInfo || ''}
                          onChange={(e) => updateFortArrayItem('guides', idx, { contactInfo: e.target.value })}
                          placeholder={language === 'en' ? 'Contact' : 'संपर्क'}
                          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-[11px] focus:border-primary focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => removeFortArrayItem('guides', idx)}
                          className="rounded-full bg-red-50 px-4 py-2 text-[11px] font-semibold text-red-700 hover:bg-red-100"
                        >
                          {language === 'en' ? 'Remove' : 'काढा'}
                        </button>
                      </div>
                      <div className="mt-2 grid gap-2 md:grid-cols-4">
                        <input
                          value={g.pricing ?? ''}
                          onChange={(e) => updateFortArrayItem('guides', idx, { pricing: Number(e.target.value) })}
                          placeholder={language === 'en' ? 'Pricing' : 'किंमत'}
                          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-[11px] focus:border-primary focus:outline-none"
                        />
                        <input
                          value={g.rating ?? ''}
                          onChange={(e) => updateFortArrayItem('guides', idx, { rating: Number(e.target.value) })}
                          placeholder={language === 'en' ? 'Rating' : 'रेटिंग'}
                          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-[11px] focus:border-primary focus:outline-none"
                        />
                        <input
                          value={g.experienceYears ?? ''}
                          onChange={(e) => updateFortArrayItem('guides', idx, { experienceYears: Number(e.target.value) })}
                          placeholder={language === 'en' ? 'Experience years' : 'अनुभव वर्षे'}
                          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-[11px] focus:border-primary focus:outline-none"
                        />
                        <label className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-[11px]">
                          <input
                            type="checkbox"
                            checked={g.available !== false}
                            onChange={(e) => updateFortArrayItem('guides', idx, { available: e.target.checked })}
                          />
                          {language === 'en' ? 'Available' : 'उपलब्ध'}
                        </label>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      addFortArrayItem('guides', {
                        name: '',
                        language: [],
                        pricing: 0,
                        rating: 0,
                        experienceYears: 0,
                        contactInfo: '',
                        available: true
                      })
                    }
                    className="rounded-full bg-white px-4 py-2 text-[11px] font-semibold text-primary shadow-soft hover:bg-softBg"
                  >
                    {language === 'en' ? '+ Add guide' : '+ मार्गदर्शक जोडा'}
                  </button>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-[11px] text-gray-700">
                  {language === 'en' ? 'Vehicle rentals' : 'वाहने'}
                </label>
                <div className="space-y-2">
                  {(fortForm.vehicleRentals || []).map((v, idx) => (
                    <div key={idx} className="rounded-2xl bg-softBg p-3">
                      <div className="grid gap-2 md:grid-cols-4">
                        <select
                          value={v.type || 'cab'}
                          onChange={(e) => updateFortArrayItem('vehicleRentals', idx, { type: e.target.value })}
                          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-[11px] focus:border-primary focus:outline-none"
                        >
                          {['cab', 'car', 'bike'].map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                        <input
                          value={v.model || ''}
                          onChange={(e) => updateFortArrayItem('vehicleRentals', idx, { model: e.target.value })}
                          placeholder={language === 'en' ? 'Model' : 'मॉडेल'}
                          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-[11px] focus:border-primary focus:outline-none"
                        />
                        <input
                          value={v.driverName || ''}
                          onChange={(e) => updateFortArrayItem('vehicleRentals', idx, { driverName: e.target.value })}
                          placeholder={language === 'en' ? 'Driver name' : 'ड्रायव्हर नाव'}
                          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-[11px] focus:border-primary focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => removeFortArrayItem('vehicleRentals', idx)}
                          className="rounded-full bg-red-50 px-4 py-2 text-[11px] font-semibold text-red-700 hover:bg-red-100"
                        >
                          {language === 'en' ? 'Remove' : 'काढा'}
                        </button>
                      </div>
                      <div className="mt-2 grid gap-2 md:grid-cols-3">
                        <input
                          value={v.contactInfo || ''}
                          onChange={(e) => updateFortArrayItem('vehicleRentals', idx, { contactInfo: e.target.value })}
                          placeholder={language === 'en' ? 'Contact' : 'संपर्क'}
                          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-[11px] focus:border-primary focus:outline-none"
                        />
                        <input
                          value={v.pricePerDay ?? ''}
                          onChange={(e) => updateFortArrayItem('vehicleRentals', idx, { pricePerDay: Number(e.target.value) })}
                          placeholder={language === 'en' ? 'Price/day' : 'किंमत/दिवस'}
                          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-[11px] focus:border-primary focus:outline-none"
                        />
                        <label className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-[11px]">
                          <input
                            type="checkbox"
                            checked={v.available !== false}
                            onChange={(e) => updateFortArrayItem('vehicleRentals', idx, { available: e.target.checked })}
                          />
                          {language === 'en' ? 'Available' : 'उपलब्ध'}
                        </label>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      addFortArrayItem('vehicleRentals', {
                        type: 'cab',
                        model: '',
                        driverName: '',
                        contactInfo: '',
                        pricePerDay: 0,
                        available: true
                      })
                    }
                    className="rounded-full bg-white px-4 py-2 text-[11px] font-semibold text-primary shadow-soft hover:bg-softBg"
                  >
                    {language === 'en' ? '+ Add vehicle' : '+ वाहन जोडा'}
                  </button>
                </div>
              </div>

              <div className="md:col-span-2 flex gap-2">
                <button
                  type="submit"
                  disabled={savingFort}
                  className="rounded-full bg-primary px-5 py-2 text-[11px] font-semibold text-white shadow-soft hover:bg-primaryDark disabled:opacity-60"
                >
                  {savingFort
                    ? language === 'en'
                      ? 'Saving...'
                      : 'सेव्ह करत आहे...'
                    : fortForm._id
                    ? language === 'en'
                      ? 'Update fort'
                      : 'अपडेट करा'
                    : language === 'en'
                    ? 'Add fort'
                    : 'जोडा'}
                </button>
                {fortForm._id && (
                  <button
                    type="button"
                    onClick={resetFortForm}
                    className="rounded-full bg-softBg px-5 py-2 text-[11px] font-semibold text-gray-700 hover:bg-gray-100"
                  >
                    {language === 'en' ? 'Cancel edit' : 'रद्द करा'}
                  </button>
                )}
              </div>
            </form>

            <div className="mt-4 space-y-2 text-[11px]">
              {loading ? (
                <div className="h-20 animate-pulse rounded-2xl bg-softBg" />
              ) : forts.length === 0 ? (
                <p className="text-gray-500">
                  {language === 'en' ? 'No forts yet.' : 'अजून किल्ले नाहीत.'}
                </p>
              ) : (
                forts.slice(0, 30).map((f) => (
                  <div
                    key={f._id}
                    className="flex items-center justify-between rounded-2xl bg-softBg px-3 py-2"
                  >
                    <div>
                      <p className="font-semibold text-primaryDark">{f.name}</p>
                      <p className="text-[10px] text-gray-600">{f.slug} · {f.location}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEditFort(f)}
                        className="text-[10px] font-semibold text-primary hover:text-primaryDark"
                      >
                        {language === 'en' ? 'Edit' : 'संपादित'}
                      </button>
                      <button
                        onClick={() => deleteFort(f)}
                        className="text-[10px] font-semibold text-red-600 hover:text-red-700"
                      >
                        {language === 'en' ? 'Delete' : 'हटवा'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl bg-white p-5 shadow-soft" hidden={tab !== 'vendors'}>
            <h2 className="text-sm font-semibold text-primaryDark">
              {language === 'en' ? 'Vendors & guides' : 'वेंडर व मार्गदर्शक'}
            </h2>
            <p className="mt-2 text-xs text-gray-500">
              {language === 'en'
                ? 'Toggle availability for local stays, guides and vehicles.'
                : 'स्थानिक राहण्याची सोय, मार्गदर्शक व वाहनांची उपलब्धता येथे बदलू शकता.'}
            </p>

            <div className="mt-3 space-y-2 text-[11px]">
              {loading ? (
                <div className="h-20 animate-pulse rounded-2xl bg-softBg" />
              ) : vendors.length === 0 ? (
                <p className="text-gray-500">
                  {language === 'en'
                    ? 'No vendors configured yet.'
                    : 'अजून कोणतेही वेंडर जोडलेले नाहीत.'}
                </p>
              ) : (
                vendors.slice(0, 5).map((v) => (
                  <div
                    key={v._id}
                    className="flex items-center justify-between rounded-2xl bg-softBg px-3 py-2"
                  >
                    <div>
                      <p className="font-semibold text-primaryDark">{v.name}</p>
                      <p className="text-[10px] text-gray-600">
                        {v.serviceType} · {v.pricing} ·{' '}
                        {v.availability
                          ? language === 'en'
                            ? 'Available'
                            : 'उपलब्ध'
                          : language === 'en'
                          ? 'Not available'
                          : 'उपलब्ध नाही'}
                      </p>
                    </div>
                    <button
                      onClick={() => toggleVendorAvailability(v)}
                      className="text-[10px] font-semibold text-primary hover:text-primaryDark"
                    >
                      {language === 'en' ? 'Toggle' : 'बदल करा'}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-soft" hidden={tab !== 'overview'}>
            <h2 className="text-sm font-semibold text-primaryDark">
              {language === 'en' ? 'Users & analytics' : 'युजर्स व विश्लेषण'}
            </h2>
            <p className="mt-2 text-xs text-gray-500">
              {language === 'en'
                ? 'Later, plug in charts for top forts, booking trends and peak seasons.'
                : 'पुढे, लोकप्रिय किल्ले, बुकिंग ट्रेन्ड्स आणि गर्दीच्या काळासाठी चार्ट्स जोडा.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;

