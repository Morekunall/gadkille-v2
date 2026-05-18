import { useState } from 'react';
import axios from 'axios';
import { useUi } from '../context/UiContext';

const initialForm = {
  tripType: 'solo',
  name: '',
  phone: '',
  email: '',
  location: '',
  preferredDate: '',
  message: ''
};

const PlanTripPage = () => {
  const { language, showToast } = useUi();
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const isEnglish = language === 'en';

  const onChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.email || !form.location) {
      showToast(
        'error',
        isEnglish
          ? 'Name, phone, email and location are required.'
          : 'नाव, फोन, ईमेल आणि लोकेशन आवश्यक आहे.'
      );
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/inquiries`, {
        category: 'plan_trip',
        tripType: form.tripType,
        name: form.name,
        phone: form.phone,
        email: form.email,
        location: form.location,
        preferredDate: form.preferredDate || undefined,
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
          <input
            value={form.location}
            onChange={(e) => onChange('location', e.target.value)}
            placeholder={isEnglish ? 'Where do you want to go?' : 'तुम्हाला कुठे जायचे आहे?'}
            className="rounded-xl border border-gray-200 bg-softBg px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
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
          <textarea
            value={form.message}
            onChange={(e) => onChange('message', e.target.value)}
            rows={4}
            placeholder={isEnglish ? 'Additional details (optional)' : 'अतिरिक्त माहिती (ऐच्छिक)'}
            className="md:col-span-2 rounded-xl border border-gray-200 bg-softBg px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
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
