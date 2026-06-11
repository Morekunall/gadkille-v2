import { Link } from 'react-router-dom';
import { useUi } from '../context/UiContext';

const contentMap = {
  explore: {
    title: 'Explore Forts',
    description: 'Browse all forts, routes, and curated historical highlights for your next adventure.'
  },
  plan: {
    title: 'Plan Your Trip',
    description: 'Build custom itineraries with travel type, budget preferences, and group details.'
  },
  group: {
    title: 'Group Tours',
    description: 'Organize school batches, family outings, and friends trekking experiences with easy bookings.'
  },
  contact: {
    title: 'Contact Us',
    description: 'Connect with the GadKille team for support, partnerships, and custom tour assistance.'
  }
};

const SimpleInfoPage = ({ type }) => {
  const { language } = useUi();
  const item = contentMap[type] || contentMap.explore;

  return (
    <section className="mx-auto flex min-h-[60vh] max-w-4xl flex-col items-start justify-center px-4 py-14">
      <p className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-primaryDark">GadKille</p>
      <h1 className="mt-4 text-4xl font-bold text-primaryDark">
        {language === 'en'
          ? item.title
          : type === 'explore'
          ? 'किल्ले एक्सप्लोर करा'
          : type === 'plan'
          ? 'तुमची ट्रिप प्लॅन करा'
          : type === 'group'
          ? 'ग्रुप टूर'
          : 'संपर्क करा'}
      </h1>
      <p className="mt-4 max-w-2xl text-sm text-gray-700">
        {language === 'en'
          ? item.description
          : type === 'explore'
          ? 'तुमच्या पुढील प्रवासासाठी सर्व किल्ले, मार्ग आणि निवडक ऐतिहासिक माहिती पहा.'
          : type === 'plan'
          ? 'प्रवास प्रकार, बजेट आणि ग्रुप तपशीलांसह तुमचा कस्टम प्लॅन तयार करा.'
          : type === 'group'
          ? 'शाळा, कुटुंब आणि मित्रांच्या ट्रेकसाठी सहज बुकिंग करा.'
          : 'सपोर्ट, पार्टनरशिप आणि कस्टम टूरसाठी GadKille टीमशी संपर्क साधा.'}
      </p>
      <div className="mt-8 flex gap-3">
        <Link to="/" className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primaryDark">
          {language === 'en' ? 'Back to Home' : 'मुख्यपृष्ठावर जा'}
        </Link>
        <Link to="/register" className="rounded-full border border-primary px-5 py-2 text-sm font-semibold text-primaryDark hover:bg-white">
          {language === 'en' ? 'Create Account' : 'खाते तयार करा'}
        </Link>
      </div>
    </section>
  );
};

export default SimpleInfoPage;
