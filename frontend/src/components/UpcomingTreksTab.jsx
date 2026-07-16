import { useEffect, useState } from 'react';
import {
  createTrek,
  deleteTrek,
  getAllTreksAdmin,
  updateTrek,
} from '../api/trips';
import { getApiErrorMessage } from '../lib/getApiErrorMessage';
import { isUsingProductionApi, resolveMediaUrl } from '../lib/api';
import { formatInr, getOriginalPrice } from '../lib/trekPricing';

const TRIP_TYPES = ['weekend', 'one-day', 'school', 'family', 'friends', 'adventure'];

const initialForm = {
  _id: null,
  title: '',
  slug: '',
  fort: '',
  tripType: 'weekend',
  duration: '',
  pricePerPerson: '',
  originalPrice: '',
  seatsAvailable: '',
  startDate: '',
  endDate: '',
  description: '',
  highlightsText: '',
  coverImage: '',
  isPublished: true,
  isFeatured: false,
  featuredOrder: 0,
};

const toSlug = (value) =>
  (value || '')
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const UpcomingTreksTab = ({ language, showToast, forts }) => {
  const [treks, setTreks] = useState([]);
  const [trekForm, setTrekForm] = useState(initialForm);
  const [loadingTreks, setLoadingTreks] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchTreks = async () => {
    try {
      setLoadingTreks(true);
      const data = await getAllTreksAdmin();
      setTreks(data || []);
    } catch (err) {
      showToast(
        'error',
        getApiErrorMessage(
          err,
          language === 'en' ? 'Unable to load treks.' : 'ट्रेक लोड करता आले नाहीत.'
        )
      );
    } finally {
      setLoadingTreks(false);
    }
  };

  useEffect(() => {
    fetchTreks();
  }, []);

  const resetForm = () => setTrekForm(initialForm);

  const startEdit = (trek) => {
    setTrekForm({
      _id: trek._id,
      title: trek.title || '',
      slug: trek.slug || '',
      fort: trek.fort?._id || trek.fort || '',
      tripType: trek.tripType || 'weekend',
      duration: trek.duration || '',
      pricePerPerson: trek.pricePerPerson ?? '',
      originalPrice: trek.originalPrice ?? '',
      seatsAvailable: trek.seatsAvailable ?? '',
      startDate: trek.startDate ? String(trek.startDate).slice(0, 10) : '',
      endDate: trek.endDate ? String(trek.endDate).slice(0, 10) : '',
      description: trek.description || '',
      highlightsText: (trek.highlights || []).join('\n'),
      coverImage: trek.coverImage || '',
      isPublished: trek.isPublished !== false,
      isFeatured: !!trek.isFeatured,
      featuredOrder: trek.featuredOrder ?? 0,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const applySavedTrekToForm = (trek) => {
    setTrekForm({
      _id: trek._id,
      title: trek.title || '',
      slug: trek.slug || '',
      fort: trek.fort?._id || trek.fort || '',
      tripType: trek.tripType || 'weekend',
      duration: trek.duration || '',
      pricePerPerson: trek.pricePerPerson ?? '',
      originalPrice: trek.originalPrice ?? '',
      seatsAvailable: trek.seatsAvailable ?? '',
      startDate: trek.startDate ? String(trek.startDate).slice(0, 10) : '',
      endDate: trek.endDate ? String(trek.endDate).slice(0, 10) : '',
      description: trek.description || '',
      highlightsText: (trek.highlights || []).join('\n'),
      coverImage: trek.coverImage || '',
      isPublished: trek.isPublished !== false,
      isFeatured: !!trek.isFeatured,
      featuredOrder: trek.featuredOrder ?? 0,
    });
  };

  const saveTrek = async (e) => {
    e.preventDefault();
    const normalizedSlug = toSlug(trekForm.slug || trekForm.title);
    if (
      !trekForm.title ||
      !trekForm.fort ||
      !trekForm.duration ||
      !trekForm.pricePerPerson ||
      !trekForm.startDate ||
      !trekForm.endDate
    ) {
      showToast(
        'error',
        language === 'en'
          ? 'Title, fort, duration, price and dates are required.'
          : 'शीर्षक, किल्ला, कालावधी, किंमत आणि तारखा आवश्यक आहेत.'
      );
      return;
    }

    setSaving(true);
    try {
      const requestedOriginalPrice =
        trekForm.originalPrice !== '' && trekForm.originalPrice != null
          ? Number(trekForm.originalPrice)
          : null;

      const payload = {
        title: trekForm.title.trim(),
        slug: normalizedSlug,
        fort: trekForm.fort,
        tripType: trekForm.tripType,
        duration: trekForm.duration.trim(),
        pricePerPerson: Number(trekForm.pricePerPerson) || 0,
        seatsAvailable: Number(trekForm.seatsAvailable) || 0,
        startDate: trekForm.startDate,
        endDate: trekForm.endDate,
        description: trekForm.description.trim(),
        highlights: (trekForm.highlightsText || '')
          .split(/\r?\n/g)
          .map((s) => s.trim())
          .filter(Boolean),
        coverImage: trekForm.coverImage.trim(),
        isPublished: !!trekForm.isPublished,
        isFeatured: !!trekForm.isFeatured,
        featuredOrder: Number(trekForm.featuredOrder) || 0,
      };

      if (requestedOriginalPrice) {
        payload.originalPrice = requestedOriginalPrice;
      } else if (trekForm._id) {
        payload.originalPrice = null;
      }

      const saved = trekForm._id
        ? await updateTrek(String(trekForm._id), payload)
        : await createTrek(payload);

      if (trekForm._id) {
        applySavedTrekToForm(saved);
        if (payload.coverImage && !saved.coverImage && isUsingProductionApi()) {
          showToast(
            'error',
            language === 'en'
              ? 'Cover image was not saved. Deploy the latest backend on Render, then update again.'
              : 'कव्हर इमेज सेव्ह झाली नाही. Render वर नवीन backend deploy करा आणि पुन्हा अपडेट करा.'
          );
          return;
        }
        if (
          requestedOriginalPrice &&
          Number(saved.originalPrice) !== requestedOriginalPrice
        ) {
          showToast(
            'error',
            language === 'en'
              ? 'Original price was not saved. Deploy the latest backend on Render (with originalPrice support), then save again.'
              : 'मूळ किंमत सेव्ह झाली नाही. Render वर नवीन backend deploy करा आणि पुन्हा सेव्ह करा.'
          );
          return;
        }
      } else {
        resetForm();
      }

      await fetchTreks();
      showToast(
        'success',
        language === 'en' ? 'Trek saved.' : 'ट्रेक सेव्ह झाला.'
      );
    } catch (err) {
      showToast(
        'error',
        getApiErrorMessage(err, language === 'en' ? 'Unable to save trek.' : 'ट्रेक सेव्ह करता आला नाही.')
      );
    } finally {
      setSaving(false);
    }
  };

  const removeTrek = async (trek) => {
    // eslint-disable-next-line no-alert
    const ok = window.confirm(
      language === 'en'
        ? `Delete trek "${trek.title}"?`
        : `"${trek.title}" ट्रेक हटवायचा आहे का?`
    );
    if (!ok) return;
    try {
      await deleteTrek(trek._id);
      setTreks((prev) => prev.filter((t) => t._id !== trek._id));
      if (trekForm._id === trek._id) resetForm();
      showToast('success', language === 'en' ? 'Trek deleted.' : 'ट्रेक हटवला.');
    } catch (err) {
      showToast(
        'error',
        getApiErrorMessage(err, language === 'en' ? 'Unable to delete trek.' : 'ट्रेक हटवता आला नाही.')
      );
    }
  };

  const toggleFeatured = async (trek) => {
    try {
      const updated = await updateTrek(trek._id, { isFeatured: !trek.isFeatured });
      setTreks((prev) => prev.map((t) => (t._id === trek._id ? updated : t)));
      showToast(
        'success',
        updated.isFeatured
          ? language === 'en'
            ? 'Trek will show on homepage.'
            : 'ट्रेक होमपेजवर दिसेल.'
          : language === 'en'
          ? 'Trek removed from homepage.'
          : 'ट्रेक होमपेजवरून काढला.'
      );
    } catch (err) {
      showToast(
        'error',
        getApiErrorMessage(err, language === 'en' ? 'Unable to update trek.' : 'ट्रेक अपडेट करता आला नाही.')
      );
    }
  };

  return (
    <div className="rounded-3xl bg-white p-5 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-primaryDark">
            {language === 'en' ? 'Upcoming treks & events' : 'आगामी ट्रेक आणि इव्हेंट्स'}
          </h2>
          <p className="mt-2 text-xs text-gray-500">
            {language === 'en'
              ? 'Post treks here (e.g. Ramshej). Toggle "Show on homepage" so users see them in Upcoming Events and can book.'
              : 'येथे ट्रेक पोस्ट करा (उदा. रामशेज). "होमपेजवर दाखवा" चालू केल्यास वापरकर्त्यांना आगामी इव्हेंटमध्ये दिसेल आणि बुकिंग करता येईल.'}
          </p>
          {isUsingProductionApi() && (
            <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-950">
              {language === 'en'
                ? 'Live API (Render): cover image, original price & homepage toggle need the latest backend deployed. Push backend changes and redeploy Render, then save the trek again.'
                : 'लाइव API (Render): कव्हर इमेज, मूळ किंमत आणि होमपेज टॉगलसाठी नवीन backend deploy करावा लागेल.'}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={resetForm}
          className="text-[11px] font-semibold text-primary hover:text-primaryDark"
        >
          {language === 'en' ? 'New trek' : 'नवीन ट्रेक'}
        </button>
      </div>

      <form onSubmit={saveTrek} className="mt-4 grid gap-3 text-xs md:grid-cols-2">
        <div>
          <label className="mb-1 block text-[11px] text-gray-700">
            {language === 'en' ? 'Trek title' : 'ट्रेक शीर्षक'}
          </label>
          <input
            value={trekForm.title}
            onChange={(e) => setTrekForm((p) => ({ ...p, title: e.target.value }))}
            placeholder={language === 'en' ? 'Ramshej Weekend Trek' : 'रामशेज वीकएंड ट्रेक'}
            className="w-full rounded-xl border border-gray-200 bg-softBg px-3 py-2 focus:border-primary focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-[11px] text-gray-700">
            {language === 'en' ? 'Slug' : 'स्लग'}
          </label>
          <input
            value={trekForm.slug}
            onChange={(e) => setTrekForm((p) => ({ ...p, slug: e.target.value }))}
            className="w-full rounded-xl border border-gray-200 bg-softBg px-3 py-2 focus:border-primary focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-[11px] text-gray-700">
            {language === 'en' ? 'Fort' : 'किल्ला'}
          </label>
          <select
            value={trekForm.fort}
            onChange={(e) => setTrekForm((p) => ({ ...p, fort: e.target.value }))}
            className="w-full rounded-xl border border-gray-200 bg-softBg px-3 py-2 focus:border-primary focus:outline-none"
          >
            <option value="">{language === 'en' ? 'Select fort' : 'किल्ला निवडा'}</option>
            {forts.map((f) => (
              <option key={f._id} value={f._id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-[11px] text-gray-700">
            {language === 'en' ? 'Trip type' : 'ट्रिप प्रकार'}
          </label>
          <select
            value={trekForm.tripType}
            onChange={(e) => setTrekForm((p) => ({ ...p, tripType: e.target.value }))}
            className="w-full rounded-xl border border-gray-200 bg-softBg px-3 py-2 focus:border-primary focus:outline-none"
          >
            {TRIP_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-[11px] text-gray-700">
            {language === 'en' ? 'Duration' : 'कालावधी'}
          </label>
          <input
            value={trekForm.duration}
            onChange={(e) => setTrekForm((p) => ({ ...p, duration: e.target.value }))}
            placeholder={language === 'en' ? '1 Day / 2 Days 1 Night' : '१ दिवस / २ दिवस १ रात्र'}
            className="w-full rounded-xl border border-gray-200 bg-softBg px-3 py-2 focus:border-primary focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-[11px] text-gray-700">
            {language === 'en' ? 'Price per person (₹)' : 'प्रति व्यक्ती किंमत (₹)'}
          </label>
          <input
            type="number"
            min={0}
            value={trekForm.pricePerPerson}
            onChange={(e) => setTrekForm((p) => ({ ...p, pricePerPerson: e.target.value }))}
            className="w-full rounded-xl border border-gray-200 bg-softBg px-3 py-2 focus:border-primary focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-[11px] text-gray-700">
            {language === 'en' ? 'Original price (₹, optional)' : 'मूळ किंमत (₹, ऐच्छिक)'}
          </label>
          <input
            type="number"
            min={0}
            value={trekForm.originalPrice}
            onChange={(e) => setTrekForm((p) => ({ ...p, originalPrice: e.target.value }))}
            placeholder={language === 'en' ? 'e.g. 1500 — shown crossed out' : 'उदा. 1500 — ओलसर रेषेसह'}
            className="w-full rounded-xl border border-gray-200 bg-softBg px-3 py-2 focus:border-primary focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-[11px] text-gray-700">
            {language === 'en' ? 'Seats available' : 'उपलब्ध जागा'}
          </label>
          <input
            type="number"
            min={0}
            value={trekForm.seatsAvailable}
            onChange={(e) => setTrekForm((p) => ({ ...p, seatsAvailable: e.target.value }))}
            className="w-full rounded-xl border border-gray-200 bg-softBg px-3 py-2 focus:border-primary focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-[11px] text-gray-700">
            {language === 'en' ? 'Homepage order' : 'होमपेज क्रम'}
          </label>
          <input
            type="number"
            min={0}
            value={trekForm.featuredOrder}
            onChange={(e) => setTrekForm((p) => ({ ...p, featuredOrder: e.target.value }))}
            className="w-full rounded-xl border border-gray-200 bg-softBg px-3 py-2 focus:border-primary focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-[11px] text-gray-700">
            {language === 'en' ? 'Start date' : 'सुरुवातीची तारीख'}
          </label>
          <input
            type="date"
            value={trekForm.startDate}
            onChange={(e) => setTrekForm((p) => ({ ...p, startDate: e.target.value }))}
            className="w-full rounded-xl border border-gray-200 bg-softBg px-3 py-2 focus:border-primary focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-[11px] text-gray-700">
            {language === 'en' ? 'End date' : 'शेवटची तारीख'}
          </label>
          <input
            type="date"
            value={trekForm.endDate}
            onChange={(e) => setTrekForm((p) => ({ ...p, endDate: e.target.value }))}
            className="w-full rounded-xl border border-gray-200 bg-softBg px-3 py-2 focus:border-primary focus:outline-none"
          />
        </div>
        <div className="md:col-span-2">
          <label className="mb-1 block text-[11px] text-gray-700">
            {language === 'en' ? 'Cover image URL (optional)' : 'कव्हर इमेज URL (ऐच्छिक)'}
          </label>
          <input
            value={trekForm.coverImage}
            onChange={(e) => setTrekForm((p) => ({ ...p, coverImage: e.target.value }))}
            placeholder={language === 'en' ? 'Paste full image URL (https://...)' : 'पूर्ण इमेज URL चिकटवा (https://...)'}
            className="w-full rounded-xl border border-gray-200 bg-softBg px-3 py-2 focus:border-primary focus:outline-none"
          />
          {trekForm.coverImage ? (
            <div className="mt-2 overflow-hidden rounded-xl border border-primary/10">
              <img
                src={resolveMediaUrl(trekForm.coverImage)}
                alt={language === 'en' ? 'Cover preview' : 'कव्हर पूर्वावलोकन'}
                className="h-32 w-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          ) : null}
        </div>
        <div className="md:col-span-2">
          <label className="mb-1 block text-[11px] text-gray-700">
            {language === 'en' ? 'Description' : 'वर्णन'}
          </label>
          <textarea
            rows={3}
            value={trekForm.description}
            onChange={(e) => setTrekForm((p) => ({ ...p, description: e.target.value }))}
            className="w-full resize-none rounded-xl border border-gray-200 bg-softBg px-3 py-2 focus:border-primary focus:outline-none"
          />
        </div>
        <div className="md:col-span-2">
          <label className="mb-1 block text-[11px] text-gray-700">
            {language === 'en' ? 'Highlights (one per line)' : 'ठळक मुद्दे (प्रत्येक ओळीत एक)'}
          </label>
          <textarea
            rows={3}
            value={trekForm.highlightsText}
            onChange={(e) => setTrekForm((p) => ({ ...p, highlightsText: e.target.value }))}
            className="w-full resize-none rounded-xl border border-gray-200 bg-softBg px-3 py-2 focus:border-primary focus:outline-none"
          />
        </div>
        <label className="flex items-center gap-2 rounded-xl border border-gray-200 bg-softBg px-3 py-2 text-[11px]">
          <input
            type="checkbox"
            checked={!!trekForm.isPublished}
            onChange={(e) => setTrekForm((p) => ({ ...p, isPublished: e.target.checked }))}
          />
          {language === 'en' ? 'Published (users can book)' : 'प्रकाशित (वापरकर्ते बुक करू शकतात)'}
        </label>
        <label className="flex items-center gap-2 rounded-xl border border-gray-200 bg-softBg px-3 py-2 text-[11px]">
          <input
            type="checkbox"
            checked={!!trekForm.isFeatured}
            onChange={(e) => setTrekForm((p) => ({ ...p, isFeatured: e.target.checked }))}
          />
          {language === 'en' ? 'Show on homepage (Upcoming Events)' : 'होमपेजवर दाखवा (आगामी इव्हेंट्स)'}
        </label>
        <div className="md:col-span-2 flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-primary px-5 py-2 text-[11px] font-semibold text-white hover:bg-primaryDark disabled:opacity-60"
          >
            {saving
              ? language === 'en'
                ? 'Saving...'
                : 'सेव्ह करत आहे...'
              : trekForm._id
              ? language === 'en'
                ? 'Update trek'
                : 'ट्रेक अपडेट करा'
              : language === 'en'
              ? 'Post trek'
              : 'ट्रेक पोस्ट करा'}
          </button>
          {trekForm._id && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-full bg-softBg px-5 py-2 text-[11px] font-semibold text-gray-700 hover:bg-gray-100"
            >
              {language === 'en' ? 'Cancel edit' : 'रद्द करा'}
            </button>
          )}
        </div>
      </form>

      <div className="mt-4 space-y-2 text-[11px]">
        {loadingTreks ? (
          <div className="h-20 animate-pulse rounded-2xl bg-softBg" />
        ) : treks.length === 0 ? (
          <p className="text-gray-500">
            {language === 'en'
              ? 'No treks posted yet. Add Ramshej or any upcoming trek above.'
              : 'अजून ट्रेक पोस्ट केलेले नाहीत. वर रामशेज किंवा इतर ट्रेक जोडा.'}
          </p>
        ) : (
          treks.map((trek) => (
            <div
              key={trek._id}
              className="flex items-center justify-between gap-3 rounded-2xl bg-softBg px-3 py-2"
            >
              <div>
                <p className="font-semibold text-primaryDark">{trek.title}</p>
                <p className="text-[10px] text-gray-600">
                  {trek.fort?.name || 'Fort'} · {new Date(trek.startDate).toLocaleDateString()} ·{' '}
                  {getOriginalPrice(trek) ? (
                    <span className="text-red-500 line-through">₹{formatInr(getOriginalPrice(trek))}</span>
                  ) : null}{' '}
                  ₹{formatInr(trek.pricePerPerson)}
                </p>
                <p className="text-[10px] text-gray-500">
                  {trek.isPublished
                    ? language === 'en'
                      ? 'Published'
                      : 'प्रकाशित'
                    : language === 'en'
                    ? 'Draft'
                    : 'मसुदा'}
                  {' · '}
                  {trek.isFeatured
                    ? language === 'en'
                      ? 'On homepage ✓'
                      : 'होमपेजवर ✓'
                    : language === 'en'
                    ? 'Not on homepage'
                    : 'होमपेजवर नाही'}
                </p>
              </div>
              <div className="flex shrink-0 flex-col gap-1">
                <button
                  type="button"
                  onClick={() => toggleFeatured(trek)}
                  className="rounded-full bg-white px-3 py-1 text-[10px] font-semibold text-primary hover:bg-gray-50"
                >
                  {trek.isFeatured
                    ? language === 'en'
                      ? 'Remove from home'
                      : 'होमवरून काढा'
                    : language === 'en'
                    ? 'Show on home'
                    : 'होमवर दाखवा'}
                </button>
                <button
                  type="button"
                  onClick={() => startEdit(trek)}
                  className="rounded-full bg-white px-3 py-1 text-[10px] font-semibold text-primary hover:bg-gray-50"
                >
                  {language === 'en' ? 'Edit' : 'संपादित'}
                </button>
                <button
                  type="button"
                  onClick={() => removeTrek(trek)}
                  className="rounded-full bg-red-50 px-3 py-1 text-[10px] font-semibold text-red-700 hover:bg-red-100"
                >
                  {language === 'en' ? 'Delete' : 'हटवा'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UpcomingTreksTab;
