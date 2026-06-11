import { useEffect, useState } from 'react';
import axios from '../../lib/axiosAuth';
import { useUi } from '../../context/UiContext';
import { useAuth } from '../../context/AuthContext';

const UserDashboardPage = () => {
  const { language, showToast } = useUi();
  const { user, updateProfile, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState('');

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/bookings/my`);
        setBookings(res.data);
      } catch (err) {
        // silent for starter
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  useEffect(() => {
    setPhone(user?.phone || '');
  }, [user?.phone]);

  const cancelBooking = async (id) => {
    try {
      await axios.delete(`/bookings/${id}`);
      setBookings((prev) => prev.map((b) => (b._id === id ? { ...b, paymentStatus: 'cancelled' } : b)));
      showToast(
        'success',
        language === 'en' ? 'Booking cancelled.' : 'बुकिंग रद्द झाले.'
      );
    } catch (err) {
      showToast(
        'error',
        err.response?.data?.message ||
          (language === 'en' ? 'Unable to cancel booking.' : 'बुकिंग रद्द करता आले नाही.')
      );
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="grid gap-4 md:grid-cols-[2fr,1.3fr]">
        <div className="space-y-4">
          <div className="rounded-3xl bg-white p-5 shadow-soft">
            <h1 className="text-lg font-semibold text-primaryDark">
              {language === 'en' ? 'Your journeys' : 'आपले प्रवास'}
            </h1>
            <p className="mt-1 text-xs text-gray-500">
              {language === 'en'
                ? 'All your stays, guides and vehicle bookings in one place.'
                : 'आपली राहण्याची सोय, मार्गदर्शक आणि वाहन बुकिंग्स येथे पहा.'}
            </p>

            <div className="mt-4 space-y-2 text-[11px]">
              {loading ? (
                <div className="h-24 animate-pulse rounded-2xl bg-softBg" />
              ) : bookings.length === 0 ? (
                <p className="text-gray-500">
                  {language === 'en'
                    ? 'No bookings yet. Start from any fort page.'
                    : 'अजून कोणतेही बुकिंग नाही. कोणत्याही किल्ल्याच्या पेजवरून बुकिंग सुरू करा.'}
                </p>
              ) : (
                bookings.map((b) => (
                  <div
                    key={b._id}
                    className="flex items-center justify-between rounded-2xl bg-softBg px-3 py-2"
                  >
                    <div>
                      <p className="font-semibold text-primaryDark">
                        {b.fortId?.name || 'Fort'}
                      </p>
                      <p className="text-[10px] text-gray-600">
                        {new Date(b.date).toLocaleDateString()}{' '}
                        ·{' '}
                        {language === 'en'
                          ? b.bookingType
                          : b.bookingType === 'stay'
                          ? 'राहण्याची सोय'
                          : b.bookingType === 'guide'
                          ? 'मार्गदर्शक'
                          : 'वाहन'}{' '}
                        · {b.paymentStatus}
                      </p>
                    </div>
                    {b.paymentStatus !== 'cancelled' && (
                      <button
                        onClick={() => cancelBooking(b._id)}
                        className="text-[10px] font-semibold text-red-600 hover:text-red-700"
                      >
                        {language === 'en' ? 'Cancel' : 'रद्द करा'}
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-soft">
            <h2 className="text-sm font-semibold text-primaryDark">
              {language === 'en' ? 'Saved forts' : 'जतन केलेले किल्ले'}
            </h2>
            <p className="mt-2 text-xs text-gray-500">
              {language === 'en'
                ? 'Future enhancement: let users bookmark forts for quick access.'
                : 'पुढील सुधारणा: वापरकर्त्यांना किल्ले जतन करण्याची सोय द्या.'}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl bg-white p-5 shadow-soft">
            <h2 className="text-sm font-semibold text-primaryDark">
              {language === 'en' ? 'Contact details' : 'संपर्क माहिती'}
            </h2>
            <p className="mt-2 text-xs text-gray-500">
              {language === 'en'
                ? 'Add your contact number so admins can reach you about bookings.'
                : 'बुकिंग संदर्भात संपर्कासाठी आपला मोबाईल नंबर जोडा.'}
            </p>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const res = await updateProfile({ phone });
                if (!res.success) {
                  showToast('error', res.message);
                  return;
                }
                showToast(
                  'success',
                  language === 'en' ? 'Contact number updated.' : 'मोबाईल नंबर अपडेट झाला.'
                );
              }}
              className="mt-3 flex gap-2 text-xs"
            >
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={language === 'en' ? 'Your contact number' : 'आपला मोबाईल नंबर'}
                className="w-full rounded-xl border border-gray-200 bg-softBg px-3 py-2 focus:border-primary focus:outline-none"
              />
              <button
                type="submit"
                disabled={authLoading}
                className="shrink-0 rounded-full bg-primary px-5 py-2 text-[11px] font-semibold text-white shadow-soft hover:bg-primaryDark disabled:opacity-60"
              >
                {authLoading ? (language === 'en' ? 'Saving...' : 'सेव्ह...') : language === 'en' ? 'Save' : 'सेव्ह'}
              </button>
            </form>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-soft">
            <h2 className="text-sm font-semibold text-primaryDark">
              {language === 'en' ? 'Download receipts' : 'पावत्या डाउनलोड करा'}
            </h2>
            <p className="mt-2 text-xs text-gray-500">
              {language === 'en'
                ? 'Connect each booking to a PDF generator for shareable receipts.'
                : 'प्रत्येक बुकिंगसाठी PDF पावती तयार करून शेअर करण्याची सोय जोडा.'}
            </p>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-soft">
            <h2 className="text-sm font-semibold text-primaryDark">
              {language === 'en' ? 'Support' : 'मदत'}
            </h2>
            <p className="mt-2 text-xs text-gray-500">
              {language === 'en'
                ? 'Add WhatsApp / call support details for on-ground help near forts.'
                : 'किल्ल्यांवरील प्रत्यक्ष मदतीसाठी WhatsApp / कॉल सपोर्ट माहिती जोडा.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboardPage;

