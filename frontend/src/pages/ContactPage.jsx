import { useState } from 'react';
import { submitInquiry } from '../api/inquiries';
import { getApiErrorMessage } from '../lib/getApiErrorMessage';
import { useUi } from '../context/UiContext';
import SeoHead from '../components/seo/SeoHead';

const initialForm = {
  name: '',
  phone: '',
  email: '',
  subject: '',
  message: ''
};

const ContactPage = () => {
  const { language, showToast } = useUi();
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const isEnglish = language === 'en';

  const onChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.email || !form.subject || !form.message) {
      showToast(
        'error',
        isEnglish
          ? 'Please fill all required fields.'
          : 'कृपया सर्व आवश्यक माहिती भरा.'
      );
      return;
    }

    setSubmitting(true);
    try {
      await submitInquiry({
        category: 'contact',
        name: form.name,
        phone: form.phone,
        email: form.email,
        subject: form.subject,
        message: form.message
      });
      setForm(initialForm);
      showToast('success', isEnglish ? 'Message sent successfully.' : 'संदेश यशस्वीरित्या पाठवला.');
    } catch (err) {
      showToast(
        'error',
        getApiErrorMessage(err, isEnglish ? 'Unable to send message.' : 'संदेश पाठवता आला नाही.')
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mx-auto max-w-4xl px-4 py-10">
      <SeoHead
        title="Contact GadKille"
        description="Contact the GadKille team for fort trip support, partnerships, school batches, and custom group tour planning in Maharashtra."
        path="/contact"
      />
      <div className="rounded-3xl bg-white p-6 shadow-soft">
        <h1 className="text-2xl font-semibold text-primaryDark">
          {isEnglish ? 'Contact Us' : 'संपर्क करा'}
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          {isEnglish
            ? 'Share your query and our team will get back to you soon.'
            : 'तुमचा प्रश्न लिहा, आमची टीम लवकरच संपर्क करेल.'}
        </p>

        <form onSubmit={onSubmit} className="mt-6 grid gap-3 md:grid-cols-2">
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
            value={form.subject}
            onChange={(e) => onChange('subject', e.target.value)}
            placeholder={isEnglish ? 'Subject' : 'विषय'}
            className="rounded-xl border border-gray-200 bg-softBg px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
          <textarea
            value={form.message}
            onChange={(e) => onChange('message', e.target.value)}
            rows={5}
            placeholder={isEnglish ? 'Message' : 'संदेश'}
            className="md:col-span-2 rounded-xl border border-gray-200 bg-softBg px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
          <button
            type="submit"
            disabled={submitting}
            className="md:col-span-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primaryDark disabled:opacity-60"
          >
            {submitting
              ? isEnglish
                ? 'Sending...'
                : 'पाठवत आहे...'
              : isEnglish
              ? 'Send message'
              : 'संदेश पाठवा'}
          </button>
        </form>
      </div>
    </section>
  );
};

export default ContactPage;
