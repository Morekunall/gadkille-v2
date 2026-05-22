import { useEffect, useMemo, useState } from 'react';
import axios from '../lib/axiosAuth';
import { useUi } from '../context/UiContext';

const initialForm = {
  tripType: 'solo',
  name: '',
  phone: '',
  email: '',
  location: '',
  otherLocation: '',
  preferredDate: '',
  groupSize: '',
  organization: '',
  purpose: '',
  message: ''
};

const PlanTripPage = () => {
  const { language, showToast } = useUi();
  const [form, setForm] = useState(initialForm);
  const [forts, setForts] = useState([]);
  const [fetchError, setFetchError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [fortSearch, setFortSearch] = useState('');
  const isEnglish = language === 'en';
  const isGroupTrip = form.tripType === 'group';
  const isOtherLocation = form.location === '__other__';
  const selectedLocationLabel = isOtherLocation
    ? (form.otherLocation || '').trim()
    : form.location;

  const sortedFilteredForts = useMemo(() => {
    const query = fortSearch.trim().toLowerCase();
    return [...forts]
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
      .filter((fort) => !query || (fort.name || '').toLowerCase().includes(query));
  }, [forts, fortSearch]);

  useEffect(() => {
    const fetchForts = async () => {
      try {
        const res = await axios.get(`/forts`);
        setForts(Array.isArray(res.data) ? res.data : []);
        setFetchError('');
      } catch (error) {
        console.error('Plan trip load error:', error);
        setForts([]);
        setFetchError('Unable to load fort list. Please check your backend connection.');
      }
    };
    fetchForts();
  }, []);

  const onChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    const finalLocation =
      form.location === '__other__' ? (form.otherLocation || '').trim() : form.location;

    if (!form.name || !form.phone || !form.email || !finalLocation) {
      showToast(
        'error',
        isEnglish
          ? 'Name, phone, email and location are required.'
          : 'नाव, फोन, ईमेल आणि लोकेशन आवश्यक आहे.'
      );
      return;
    }
    if (isGroupTrip && !form.groupSize) {
      showToast(
        'error',
        isEnglish ? 'Please enter number of members for group trip.' : 'ग्रुप ट्रिपसाठी सदस्य संख्या भरा.'
      );
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(`/inquiries`, {
        category: 'plan_trip',
        tripType: form.tripType,
        name: form.name,
        phone: form.phone,
        email: form.email,
        location: finalLocation,
        preferredDate: form.preferredDate || undefined,
        groupSize: isGroupTrip ? Number(form.groupSize) : undefined,
        organization: form.organization || undefined,
        purpose: form.purpose || undefined,
        message: form.message
      });
      setForm(initialForm);
      showToast(
        'success',
        isEnglish ? 'Plan trip request submitted.' : 'ट्रिप प्लॅन विनंती पाठवली.'
      );
    } catch (err) {
      showToast(
        'error',
        err.response?.data?.message ||
          (isEnglish ? 'Unable to submit request.' : 'विनंती पाठवता आली नाही.')
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mx-auto max-w-4xl px-4 py-10">
      {fetchError && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {fetchError}
        </div>
      )}
      <div className="rounded-3xl bg-white p-6 shadow-soft">
        <h1 className="text-2xl font-semibold text-primaryDark">
          {isEnglish ? 'Plan Your Trip' : 'तुमची ट्रिप प्लॅन करा'}
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          {isEnglish
            ? 'Tell us your travel type and destination, and our team will help you plan.'
            : 'तुमचा प्रवास प्रकार आणि ठिकाण सांगा, आम्ही नियोजनात मदत करू.'}
        </p>

        <form onSubmit={onSubmit} className="mt-6 grid gap-3 md:grid-cols-2">
          <select
            value={form.tripType}
            onChange={(e) => onChange('tripType', e.target.value)}
            className="rounded-xl border border-gray-200 bg-softBg px-3 py-2 text-sm focus:border-primary focus:outline-none"
          >
            <option value="solo">{isEnglish ? 'Solo' : 'एकट्याने'}</option>
            <option value="group">{isEnglish ? 'Group' : 'ग्रुप'}</option>
            <option value="family">{isEnglish ? 'Family' : 'कुटुंब'}</option>
          </select>
          <select
            value={form.location}
            onChange={(e) => onChange('location', e.target.value)}
            className="rounded-xl border border-gray-200 bg-softBg px-3 py-2 text-sm focus:border-primary focus:outline-none"
          >
            <option value="">
              {isEnglish ? 'Select fort' : 'किल्ला निवडा'}
            </option>
            {sortedFilteredForts.map((fort) => (
              <option key={fort._id} value={fort.name}>
                {fort.name}
              </option>
            ))}
            <option value="__other__">{isEnglish ? 'Other' : 'इतर'}</option>
          </select>
          <input
            value={fortSearch}
            onChange={(e) => setFortSearch(e.target.value)}
            placeholder={isEnglish ? 'Search fort in list' : 'यादीतील किल्ला शोधा'}
            className="rounded-xl border border-gray-200 bg-softBg px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
          {isOtherLocation && (
            <input
              value={form.otherLocation || ''}
              onChange={(e) => onChange('otherLocation', e.target.value)}
              placeholder={isEnglish ? 'Enter location/fort name' : 'ठिकाण/किल्ल्याचे नाव लिहा'}
              className="rounded-xl border border-gray-200 bg-softBg px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          )}
          {isGroupTrip && (
            <input
              type="number"
              min={2}
              value={form.groupSize}
              onChange={(e) => onChange('groupSize', e.target.value)}
              placeholder={isEnglish ? 'How many members?' : 'किती सदस्य आहेत?'}
              className="rounded-xl border border-gray-200 bg-softBg px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          )}
          {isGroupTrip && (
            <input
              value={form.organization}
              onChange={(e) => onChange('organization', e.target.value)}
              placeholder={isEnglish ? 'School/Company/Organization (optional)' : 'शाळा/कंपनी/संस्था (ऐच्छिक)'}
              className="rounded-xl border border-gray-200 bg-softBg px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          )}
          <input
            value={form.name}
            onChange={(e) => onChange('name', e.target.value)}
            placeholder={isEnglish ? 'Your name' : 'तुमचे नाव'}
            className="rounded-xl border border-gray-200 bg-softBg px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
          <input
            value={form.phone}
            onChange={(e) => onChange('phone', e.target.value)}
            placeholder={isEnglish ? 'Contact number' : 'संपर्क क्रमांक'}
            className="rounded-xl border border-gray-200 bg-softBg px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
          <input
            type="email"
            value={form.email}
            onChange={(e) => onChange('email', e.target.value)}
            placeholder={isEnglish ? 'Email id' : 'ईमेल आयडी'}
            className="rounded-xl border border-gray-200 bg-softBg px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
          <input
            type="date"
            value={form.preferredDate}
            onChange={(e) => onChange('preferredDate', e.target.value)}
            className="rounded-xl border border-gray-200 bg-softBg px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
          {isGroupTrip && (
            <input
              value={form.purpose}
              onChange={(e) => onChange('purpose', e.target.value)}
              placeholder={isEnglish ? 'Trip purpose (optional)' : 'ट्रिपचा उद्देश (ऐच्छिक)'}
              className="md:col-span-2 rounded-xl border border-gray-200 bg-softBg px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          )}
          <textarea
            value={form.message}
            onChange={(e) => onChange('message', e.target.value)}
            rows={4}
            placeholder={isEnglish ? 'Additional details (optional)' : 'अतिरिक्त माहिती (ऐच्छिक)'}
            className="md:col-span-2 rounded-xl border border-gray-200 bg-softBg px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
          {selectedLocationLabel && (
            <div className="md:col-span-2 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-primaryDark">
              {isEnglish ? 'Selected destination:' : 'निवडलेले ठिकाण:'} {selectedLocationLabel}
            </div>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="md:col-span-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primaryDark disabled:opacity-60"
          >
            {submitting
              ? isEnglish
                ? 'Submitting...'
                : 'पाठवत आहे...'
              : isEnglish
              ? 'Submit plan request'
              : 'ट्रिप प्लॅन विनंती पाठवा'}
          </button>
        </form>
      </div>
    </section>
  );
};

export default PlanTripPage;
