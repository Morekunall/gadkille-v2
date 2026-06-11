import { useMemo } from 'react';
import FortGrid from '../components/forts/FortGrid';
import { useForts } from '../hooks/useForts';
import { useUi } from '../context/UiContext';

const websiteFeatures = [
  {
    titleEn: 'Complete Fort Planning',
    titleMr: 'संपूर्ण किल्ला प्लॅनिंग',
    textEn: 'Find routes, stay, guides, and vehicle options in one place.',
    textMr: 'मार्ग, राहण्याची सोय, गाईड आणि वाहन पर्याय एकाच ठिकाणी मिळवा.'
  },
  {
    titleEn: 'Trusted Local Support',
    titleMr: 'विश्वसनीय स्थानिक मदत',
    textEn: 'Connect with local services and verified travel support.',
    textMr: 'स्थानिक सेवा आणि पडताळलेल्या ट्रॅव्हल सपोर्टशी जोडा.'
  },
  {
    titleEn: 'Simple Booking Flow',
    titleMr: 'सोपे बुकिंग',
    textEn: 'Quick forms and clear details make planning easy.',
    textMr: 'झटपट फॉर्म आणि स्पष्ट माहितीमुळे नियोजन सोपे होते.'
  }
];

const shivajiInfo = [
  {
    titleEn: 'Why these forts matter',
    titleMr: 'हे किल्ले का महत्त्वाचे आहेत',
    textEn:
      'Chhatrapati Shivaji Maharaj built and protected forts as strategic centers of Swarajya. These forts represent governance, courage, and local identity.',
    textMr:
      'छत्रपती शिवाजी महाराजांनी किल्ल्यांचा वापर स्वराज्याच्या धोरणात्मक केंद्रांप्रमाणे केला. हे किल्ले प्रशासन, शौर्य आणि स्थानिक ओळख दर्शवतात.'
  },
  {
    titleEn: 'Architecture and defense',
    titleMr: 'रचना आणि संरक्षण',
    textEn:
      'Fort layouts used natural terrain, hidden entry points, water storage, and layered defense systems to secure people and resources.',
    textMr:
      'किल्ल्यांमध्ये नैसर्गिक भूप्रदेश, गुप्त दरवाजे, पाण्याची सोय आणि स्तरित संरक्षण रचना वापरली गेली.'
  },
  {
    titleEn: 'Legacy for travelers',
    titleMr: 'प्रवाशांसाठी वारसा',
    textEn:
      'Every visit can become a cultural learning experience when we preserve clean surroundings and respect local communities.',
    textMr:
      'प्रत्येक भेट सांस्कृतिक शिक्षणाचा अनुभव ठरू शकते, जर आपण स्वच्छता राखून स्थानिकांचा सन्मान केला.'
  }
];

const journeyMedia = [
  {
    kind: 'photo',
    title: 'Morning trek snapshots',
    src: 'https://images.pexels.com/photos/1439222/pexels-photo-1439222.jpeg'
  },
  {
    kind: 'photo',
    title: 'Monsoon fort trail',
    src: 'https://images.pexels.com/photos/2132250/pexels-photo-2132250.jpeg'
  },
  {
    kind: 'video',
    title: 'Fort journey video diary',
    src: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
  }
];

const normalizeRegion = (location) => {
  if (!location) return 'Other';
  const text = location.toLowerCase();
  if (text.includes('pune')) return 'Pune Region';
  if (text.includes('visapur') || text.includes('lohgad')) return 'Pune Region';
  if (text.includes('nashik')) return 'Nashik Region';
  if (text.includes('satara')) return 'Satara Region';
  return 'Other';
};

const ExplorePage = () => {
  const { language } = useUi();
  const { forts, loading, error: fetchError } = useForts();
  const isEnglish = language === 'en';

  const groupedForts = useMemo(() => {
    return forts.reduce((acc, fort) => {
      const key = normalizeRegion(fort.location);
      if (!acc[key]) acc[key] = [];
      acc[key].push(fort);
      return acc;
    }, {});
  }, [forts]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      {fetchError && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {fetchError}
        </div>
      )}
      <section className="rounded-3xl bg-white p-6 shadow-soft">
        <h1 className="text-2xl font-semibold text-primaryDark">
          {isEnglish ? 'Explore Forts' : 'किल्ले एक्सप्लोर करा'}
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          {isEnglish
            ? 'Browse forts grouped by region and start your next trip.'
            : 'प्रांतानुसार किल्ले पाहा आणि पुढच्या प्रवासाची सुरुवात करा.'}
        </p>

        <div className="mt-6 space-y-8">
          {Object.entries(groupedForts).map(([region, items]) => (
            <div key={region}>
              <h2 className="text-lg font-semibold text-primaryDark">{region}</h2>
              <div className="mt-3">
                <FortGrid
                  forts={items}
                  loading={loading}
                  language={language}
                  skeletonCount={items.length || 3}
                />
              </div>
            </div>
          ))}
          {!loading && forts.length === 0 && (
            <FortGrid forts={[]} loading={false} language={language} />
          )}
        </div>
      </section>

      <section className="mt-6 rounded-3xl bg-white p-6 shadow-soft">
        <h2 className="text-xl font-semibold text-primaryDark">
          {isEnglish ? 'About our website' : 'आमच्या वेबसाइटबद्दल'}
        </h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {websiteFeatures.map((feature) => (
            <div key={feature.titleEn} className="rounded-2xl bg-softBg p-4">
              <p className="text-sm font-semibold text-primaryDark">
                {isEnglish ? feature.titleEn : feature.titleMr}
              </p>
              <p className="mt-1 text-xs text-gray-600">
                {isEnglish ? feature.textEn : feature.textMr}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-3xl bg-white p-6 shadow-soft">
        <h2 className="text-xl font-semibold text-primaryDark">
          {isEnglish ? 'Shivaji Maharaj Fort Information' : 'शिवाजी महाराज किल्ला माहिती'}
        </h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {shivajiInfo.map((item) => (
            <article key={item.titleEn} className="rounded-2xl bg-softBg p-4">
              <p className="text-sm font-semibold text-primaryDark">
                {isEnglish ? item.titleEn : item.titleMr}
              </p>
              <p className="mt-1 text-xs text-gray-600">
                {isEnglish ? item.textEn : item.textMr}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-3xl bg-white p-6 shadow-soft">
        <h2 className="text-xl font-semibold text-primaryDark">
          {isEnglish ? 'Our journey' : 'आमचा प्रवास'}
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          {isEnglish
            ? 'Snapshots and video logs from our fort visits.'
            : 'किल्ल्यांवरील आमच्या भेटींचे फोटो आणि व्हिडिओ.'}
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {journeyMedia.map((media) => (
            <article key={`${media.kind}-${media.title}`} className="rounded-2xl bg-softBg p-3">
              {media.kind === 'photo' ? (
                <img src={media.src} alt={media.title} className="h-40 w-full rounded-xl object-cover" />
              ) : (
                <a
                  href={media.src}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-40 items-center justify-center rounded-xl border border-primary/20 bg-white text-sm font-semibold text-primary"
                >
                  {isEnglish ? 'Watch video' : 'व्हिडिओ पहा'}
                </a>
              )}
              <p className="mt-2 text-xs font-semibold text-primaryDark">{media.title}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ExplorePage;
