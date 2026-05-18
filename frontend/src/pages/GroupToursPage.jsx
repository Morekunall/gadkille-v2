import { useState } from 'react';
import axios from 'axios';
import { useUi } from '../context/UiContext';

const initialForm = {
  tripType: 'group',
  name: '',
  phone: '',
  email: '',
  location: '',
  groupSize: '',
  organization: '',
  purpose: '',
  message: ''
};

const GroupToursPage = () => {
  const { language, showToast } = useUi();
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const isEnglish = language === 'en';

  const onChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.email || !form.location || !form.groupSize) {
      showToast(
        'error',
        isEnglish
          ? 'Name, phone, email, location and group size are required.'
          : 'नाव, फोन, ईमेल, लोकेशन आणि ग्रुप साइज आवश्यक आहे.'
      );
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/inquiries`, {
        category: 'group_tour',
        tripType: form.tripType,
        name: form.name,
        phone: form.phone,
        email: form.email,
        location: form.location,
        groupSize: Number(form.groupSize),
        organization: form.organization,
        purpose: form.purpose,
        message: form.message
      });
      setForm(initialForm);
      showToast('success', isEnglish ? 'Group tour request submitted.' : 'ग्रुप टूर विनंती पाठवली.');
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
          {isEnglish ? 'Group Tours' : 'ग्रुप टूर'}
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          {isEnglish
            ? 'Share your group trip requirements and we will arrange the best package.'
            : 'ग्रुप ट्रिपसाठी आवश्यक माहिती द्या, आम्ही योग्य पॅकेज तयार करू.'}
        </p>

        <form onSubmit={onSubmit} className="mt-6 grid gap-3 md:grid-cols-2">
          <input
            value={form.name}
            onChange={(e) => onChange('name', e.target.value)}
            placeholder={isEnglish ? 'Contact person name' : 'संपर्क व्यक्तीचे नाव'}
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
            value={form.location}
            onChange={(e) => onChange('location', e.target.value)}
            placeholder={isEnglish ? 'Preferred location/fort' : 'पसंतीचे ठिकाण/किल्ला'}
            className="rounded-xl border border-gray-200 bg-softBg px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
          <input
            type="number"
            min={2}
            value={form.groupSize}
            onChange={(e) => onChange('groupSize', e.target.value)}
            placeholder={isEnglish ? 'Group size' : 'ग्रुप साइज'}
            className="rounded-xl border border-gray-200 bg-softBg px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
          <input
            value={form.organization}
            onChange={(e) => onChange('organization', e.target.value)}
            placeholder={isEnglish ? 'School/Company/Organization (optional)' : 'शाळा/कंपनी/संस्था (ऐच्छिक)'}
            className="rounded-xl border border-gray-200 bg-softBg px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
          <input
            value={form.purpose}
            onChange={(e) => onChange('purpose', e.target.value)}
            placeholder={isEnglish ? 'Trip purpose' : 'ट्रिपचा उद्देश'}
            className="md:col-span-2 rounded-xl border border-gray-200 bg-softBg px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
          <textarea
            value={form.message}
            onChange={(e) => onChange('message', e.target.value)}
            rows={4}
            placeholder={isEnglish ? 'Additional requirements (optional)' : 'अतिरिक्त गरजा (ऐच्छिक)'}
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
              ? 'Submit group tour request'
              : 'ग्रुप टूर विनंती पाठवा'}
          </button>
        </form>
      </div>
    </section>
  );
};

export default GroupToursPage;
