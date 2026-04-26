import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useUi } from '../context/UiContext';

const featureData = [
  { icon: '🚌', title: 'Transport', description: 'Smart route options for buses, cabs, and self-drive trips.' },
  { icon: '🍲', title: 'Food', description: 'Discover local food stops and meal recommendations nearby.' },
  { icon: '🏨', title: 'Stay', description: 'Choose curated stays with comfort ratings and amenities.' },
  { icon: '⛽', title: 'Petrol', description: 'Locate fuel stations and travel essentials on your route.' }
];

const groupTours = [
  { title: 'School Trips', image: 'https://images.pexels.com/photos/8423393/pexels-photo-8423393.jpeg' },
  { title: 'Family Trips', image: 'https://images.pexels.com/photos/1287142/pexels-photo-1287142.jpeg' },
  { title: "Friends' Treks", image: 'https://images.pexels.com/photos/1761279/pexels-photo-1761279.jpeg' }
];

const testimonials = [
  { name: 'Aditi M.', text: 'GadKille made fort planning effortless. Routes, food, and stay details were all accurate.', rating: 5 },
  { name: 'Rohan P.', text: 'The group trek booking flow is smooth and quick. Great UI and very responsive.', rating: 5 },
  { name: 'Sneha K.', text: 'Loved the short history videos and recommendations for lesser-known forts.', rating: 4 }
];

const HomePage = () => {
  const { language } = useUi();
  const [forts, setForts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFort, setSelectedFort] = useState('');
  const [tripType, setTripType] = useState('Weekend');

  useEffect(() => {
    const fetchForts = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/forts`);
        setForts(res.data || []);
      } finally {
        setLoading(false);
      }
    };
    fetchForts();
  }, []);

  const topForts = useMemo(() => forts.slice(0, 6), [forts]);
  const isEnglish = language === 'en';

  return (
    <div className="bg-softBg text-primaryDark">
      <section className="relative min-h-[72vh] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/hero-fort.png')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primaryDark/85 via-primaryDark/70 to-primary/45" />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-8 px-4 py-20 text-white md:py-24">
          <h1 className="max-w-2xl text-4xl font-bold leading-tight md:text-6xl">
            {isEnglish ? 'Explore Forts Like Never Before' : 'किल्ले यापूर्वी कधीच न पाहिल्यासारखे एक्सप्लोर करा'}
          </h1>
          <p className="max-w-2xl text-sm text-slate-100 md:text-base">
            {isEnglish
              ? 'Plan complete adventures with curated routes, stay options, trusted guides, and group packages in one platform.'
              : 'एकाच प्लॅटफॉर्मवर मार्ग, राहण्याची सोय, विश्वसनीय गाईड आणि ग्रुप पॅकेजेससह संपूर्ण प्रवास प्लॅन करा.'}
          </p>
          <div className="grid max-w-3xl gap-3 rounded-2xl border border-white/25 bg-white/15 p-3 backdrop-blur-md md:grid-cols-[1fr_1fr_auto]">
            <select value={selectedFort} onChange={(e) => setSelectedFort(e.target.value)} className="rounded-xl border border-white/25 bg-black/10 px-3 py-2 text-sm text-white focus:border-accent focus:outline-none">
              <option value="" className="text-primaryDark">{isEnglish ? 'Select Fort' : 'किल्ला निवडा'}</option>
              {forts.map((fort) => <option key={fort._id} value={fort.slug} className="text-primaryDark">{fort.name}</option>)}
            </select>
            <select value={tripType} onChange={(e) => setTripType(e.target.value)} className="rounded-xl border border-white/25 bg-black/10 px-3 py-2 text-sm text-white focus:border-accent focus:outline-none">
              {['Weekend', 'One Day', 'Family', 'School', 'Adventure'].map((type) => <option key={type} value={type} className="text-primaryDark">{isEnglish ? `${type} Trip` : `${type} ट्रिप`}</option>)}
            </select>
            <Link to={selectedFort ? `/fort/${selectedFort}` : '/plan-trip'} className="rounded-xl bg-gradient-to-r from-accent to-[#a8c287] px-5 py-2 text-center text-sm font-semibold text-primaryDark shadow-lg transition hover:brightness-95">
              {isEnglish ? 'Start Planning' : 'प्लॅनिंग सुरू करा'}
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="text-center text-2xl font-semibold text-primaryDark">{isEnglish ? 'Essential Trip Features' : 'महत्त्वाची ट्रिप फीचर्स'}</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          {featureData.map((item) => (
            <article key={item.title} className="rounded-2xl border border-primary/10 bg-white/85 p-5 shadow-soft transition hover:-translate-y-1 hover:border-primary/20">
              <div className="text-2xl">{item.icon}</div>
              <h3 className="mt-3 text-lg font-semibold text-primaryDark">
                {isEnglish
                  ? item.title
                  : item.title === 'Transport'
                  ? 'प्रवास'
                  : item.title === 'Food'
                  ? 'अन्न'
                  : item.title === 'Stay'
                  ? 'राहण्याची सोय'
                  : 'पेट्रोल'}
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                {isEnglish
                  ? item.description
                  : item.title === 'Transport'
                  ? 'बस, कॅब आणि सेल्फ-ड्राईव्हसाठी स्मार्ट रूट पर्याय.'
                  : item.title === 'Food'
                  ? 'स्थानिक फूड स्टॉप्स आणि जेवणाच्या शिफारसी शोधा.'
                  : item.title === 'Stay'
                  ? 'सुविधांसह निवडक राहण्याचे पर्याय निवडा.'
                  : 'तुमच्या मार्गावरील इंधन स्टेशन आणि आवश्यक सेवा शोधा.'}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8">
        <h2 className="text-2xl font-semibold text-primaryDark">{isEnglish ? 'Popular Forts' : 'लोकप्रिय किल्ले'}</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(loading ? Array.from({ length: 6 }) : topForts).map((fort, idx) => (
            <article key={fort?._id || idx} className="overflow-hidden rounded-2xl border border-primary/10 bg-white/90 shadow-soft transition hover:-translate-y-1 hover:border-primary/20">
              <div className="h-44 bg-accent/20 bg-cover bg-center" style={!loading ? { backgroundImage: `url(${fort.images?.[0] || ''})` } : undefined} />
              <div className="p-4">
                <h3 className="text-lg font-semibold text-primaryDark">{loading ? (isEnglish ? 'Loading...' : 'लोड होत आहे...') : fort.name}</h3>
                <p className="mt-1 text-sm text-gray-600">{loading ? (isEnglish ? 'Fetching fort details...' : 'किल्ल्याची माहिती घेत आहे...') : fort.description?.slice(0, 90) || fort.location}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-primary">4.7 ★</span>
                  {!loading && <Link to={`/fort/${fort.slug}`} className="text-sm font-semibold text-primaryDark hover:underline">{isEnglish ? 'View Details' : 'तपशील पहा'}</Link>}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-semibold text-primaryDark">{isEnglish ? 'Group Tours' : 'ग्रुप टूर'}</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {groupTours.map((tour) => (
            <article key={tour.title} className="overflow-hidden rounded-2xl border border-primary/10 bg-white/90 shadow-soft">
              <div className="h-44 bg-cover bg-center" style={{ backgroundImage: `url(${tour.image})` }} />
              <div className="p-4">
                <h3 className="text-lg font-semibold text-primaryDark">
                  {isEnglish ? tour.title : tour.title === 'School Trips' ? 'शाळेच्या सहली' : tour.title === 'Family Trips' ? 'कुटुंब सहली' : 'मित्रांचे ट्रेक'}
                </h3>
                <Link to="/group-tours" className="mt-3 inline-block rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primaryDark">
                  {isEnglish ? 'Book Now' : 'आत्ताच बुक करा'}
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-semibold text-primaryDark">{isEnglish ? 'Short History' : 'संक्षिप्त इतिहास'}</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {topForts.slice(0, 3).map((fort) => (
            <article key={`history-${fort._id}`} className="relative overflow-hidden rounded-2xl border border-primary/10 bg-white/90 shadow-soft">
              <div className="h-44 bg-cover bg-center" style={{ backgroundImage: `url(${fort.images?.[0] || ''})` }} />
              <div className="absolute inset-0 flex items-center justify-center bg-black/35">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-primaryDark">▶</div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-primaryDark">{fort.name}</h3>
                <p className="text-sm text-gray-600">{isEnglish ? "Watch a quick story of this fort's legacy." : 'या किल्ल्याचा थोडक्यात इतिहास पाहा.'}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-semibold text-primaryDark">{isEnglish ? 'What Travelers Say' : 'प्रवासी काय म्हणतात'}</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {testimonials.map((item) => (
            <article key={item.name} className="rounded-2xl border border-primary/10 bg-white/90 p-5 shadow-soft">
              <p className="text-primary">{"★".repeat(item.rating)}</p>
              <p className="mt-2 text-sm text-gray-600">{item.text}</p>
              <p className="mt-4 text-sm font-semibold text-primaryDark">{item.name}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;

