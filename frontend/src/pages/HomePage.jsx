import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthModal from '../components/auth/AuthModal';
import { getHistories } from '../api/history';
import { getUpcomingTreks } from '../api/trips';
import { resolveMediaUrl } from '../lib/api';
import FortGrid from '../components/forts/FortGrid';
import UpcomingTrekCard from '../components/treks/UpcomingTrekCard';
import { useForts } from '../hooks/useForts';
import { useUi } from '../context/UiContext';
import VideoModal from '../components/VideoModal';
import SeoHead from '../components/seo/SeoHead';
import { DEFAULT_DESCRIPTION, organizationJsonLd, websiteJsonLd } from '../lib/seo';
import heroImage from '../assets/gad-yatra-hero.png';

const groupTours = [
  { title: 'School Trips', image: 'https://images.pexels.com/photos/8423393/pexels-photo-8423393.jpeg' },
  { title: 'Family Trips', image: 'https://res.cloudinary.com/dzp8nhkxa/image/upload/v1781864236/outdoor-photo-asian-family-beautiful-260nw-2557760803_kobqyo.png' },
  { title: "Friends' Treks", image: 'https://res.cloudinary.com/dzp8nhkxa/image/upload/v1781863891/360_F_623491006_8THGbPv1rlNcxKeiF84yPl4MOlogx4mC_ds349v.jpg' }
];

const testimonials = [
  { name: 'Aditi M.', text: 'GadKille made fort planning effortless. Routes, food, and stay details were all accurate.', rating: 5 },
  { name: 'Rohan P.', text: 'The group trek booking flow is smooth and quick. Great UI and very responsive.', rating: 5 },
  { name: 'Sneha K.', text: 'Loved the short history videos and recommendations for lesser-known forts.', rating: 4 }
];

const HomePage = () => {
  const { language } = useUi();
  const navigate = useNavigate();

  const [showAuthModal, setShowAuthModal] = useState(false);
  const { forts, loading: fortsLoading, error: fortsError } = useForts();
  const [histories, setHistories] = useState([]);
  const [upcomingTreks, setUpcomingTreks] = useState([]);
  const [treksLoading, setTreksLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedFort, setSelectedFort] = useState('');
  const [tripType, setTripType] = useState('Weekend');
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const resolveImageUrl = resolveMediaUrl;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        setFetchError('');
        try {
          const historyData = await getHistories();
          setHistories(historyData || []);
        } catch {
          setHistories([]);
        }
        try {
          setTreksLoading(true);
          const trekData = await getUpcomingTreks({ featured: true });
          setUpcomingTreks(trekData || []);
        } catch {
          setUpcomingTreks([]);
        } finally {
          setTreksLoading(false);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setFetchError(
          language === 'en'
            ? 'Could not load forts. Check your connection or try again in a minute (API may be waking up).'
            : 'किल्ले लोड झाले नाहीत. कनेक्शन तपासा किंवा थोड्या वेळाने पुन्हा प्रयत्न करा.'
        );
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [language]);

  const topForts = useMemo(() => forts.slice(0, 6), [forts]);
  const isEnglish = language === 'en';

  return (
    <div className="bg-softBg text-primaryDark">
      <SeoHead
        title="GadKille — Official Website | Maharashtra Fort Tourism & Trek Booking"
        description={DEFAULT_DESCRIPTION}
        path="/"
        jsonLd={[organizationJsonLd(), websiteJsonLd()]}
      />
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
      <section className="relative min-h-[72vh] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primaryDark/85 via-primaryDark/70 to-primary/45" />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-8 px-4 py-20 text-white md:py-24">
          <p className="sr-only">GadKille official website — Maharashtra fort tourism, trek booking, and trip planning</p>
          <h1 className="max-w-2xl text-3xl font-bold leading-tight sm:text-4xl md:text-6xl">
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

      {fetchError && (
        <div className="mx-auto max-w-6xl px-4 pt-6">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {fetchError}
          </div>
        </div>
      )}

      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="text-center text-2xl font-semibold text-primaryDark sm:text-2xl">
          {isEnglish ? 'Upcoming Treks & Events' : 'आगामी ट्रेक आणि इव्हेंट्स'}
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-gray-600">
          {isEnglish
            ? 'Book curated group treks posted by our team — dates, pricing and seats in one place.'
            : 'आमच्या टीमने पोस्ट केलेले ग्रुप ट्रेक बुक करा — तारीख, किंमत आणि जागा एकाच ठिकाणी.'}
        </p>

        <div className="mt-6 grid gap-4 sm:mt-8 sm:grid-cols-2 lg:grid-cols-3">
          {treksLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-72 animate-pulse rounded-2xl bg-white/85 shadow-soft" />
            ))
          ) : upcomingTreks.length > 0 ? (
            upcomingTreks.slice(0, 6).map((trek) => (
              <UpcomingTrekCard key={trek._id} trek={trek} language={language} />
            ))
          ) : (
            <div className="col-span-full rounded-2xl border border-dashed border-primary/20 bg-white/85 px-6 py-10 text-center shadow-soft">
              <p className="text-sm text-gray-600">
                {isEnglish
                  ? 'No upcoming treks right now. Admin can post treks (e.g. Ramshej) from Admin → Upcoming Treks.'
                  : 'सध्या आगामी ट्रेक नाहीत. Admin → Upcoming Treks मधून ट्रेक (उदा. रामशेज) पोस्ट करू शकतो.'}
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-primaryDark">
              {isEnglish ? 'Popular Forts' : 'लोकप्रिय किल्ले'}
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              {isEnglish
                ? forts.length > 6
                  ? `Hand-picked highlights from ${forts.length}+ forts across Maharashtra.`
                  : 'Featured forts to start your next trek.'
                : forts.length > 6
                ? `महाराष्ट्रातील ${forts.length}+ किल्ल्यांपैकी निवडलेले ठळक किल्ले.`
                : 'पुढच्या ट्रेकसाठी निवडलेले किल्ले.'}
            </p>
          </div>
          {forts.length > 6 ? (
            <Link
              to="/explore"
              className="inline-flex shrink-0 items-center justify-center rounded-full border border-primary/20 bg-white px-4 py-2 text-sm font-semibold text-primary shadow-soft transition hover:border-primary hover:bg-softBg"
            >
              {isEnglish ? `Browse all ${forts.length} forts →` : `सर्व ${forts.length} किल्ले पहा →`}
            </Link>
          ) : null}
        </div>
        {(fetchError || fortsError) && (
          <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {fetchError || fortsError}
          </p>
        )}
        <div className="mt-6">
        <FortGrid
          forts={topForts}
          loading={fortsLoading}
          language={language}
          emptyMessage={
            isEnglish ? 'No forts yet. Add forts in Admin → Forts.' : 'अजून किल्ले नाहीत. Admin → Forts मध्ये जोडा.'
          }
        />
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
          {histories.length > 0 ? (
            histories.slice(0, 3).map((history) => (
              <article
                key={`history-${history._id}`}
                className="relative overflow-hidden rounded-2xl border border-primary/10 bg-white/90 shadow-soft cursor-pointer transition hover:-translate-y-1"
                onClick={() => {
                  setSelectedVideo(history);
                  setVideoModalOpen(true);
                }}
              >
                <div
                  className="h-44 bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${history.thumbnail || resolveImageUrl(history.fort?.images?.[0] || '')})`
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/35 transition group-hover:bg-black/45">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-primaryDark hover:scale-110 transition">▶</div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-primaryDark">{history.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{history.description}</p>
                  {history.duration && (
                    <p className="text-xs text-gray-500 mt-2">
                      {history.duration}
                    </p>
                  )}
                </div>
              </article>
            ))
          ) : (
            topForts.slice(0, 3).map((fort) => (
              <article key={`history-${fort._id}`} className="relative overflow-hidden rounded-2xl border border-primary/10 bg-white/90 shadow-soft">
                <div
                  className="h-44 bg-cover bg-center"
                  style={{ backgroundImage: `url(${resolveImageUrl(fort.images?.[0] || '')})` }}
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/35">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-primaryDark">▶</div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-primaryDark">{fort.name}</h3>
                  <p className="text-sm text-gray-600">{isEnglish ? "Watch a quick story of this fort's legacy." : 'या किल्ल्याचा थोडक्यात इतिहास पाहा.'}</p>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      <VideoModal
        isOpen={videoModalOpen}
        onClose={() => {
          setVideoModalOpen(false);
          setSelectedVideo(null);
        }}
        video={selectedVideo}
        language={language}
      />

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

