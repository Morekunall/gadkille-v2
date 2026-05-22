import { useUi } from '../../context/UiContext';

const Footer = () => {
  const { language } = useUi();

  return (
    <footer className="mt-10 border-t border-primary/10 bg-gradient-to-b from-white to-[#e1ece7]">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 text-sm text-gray-600 md:grid-cols-4">
        <div>
          <h3 className="text-lg font-bold text-primaryDark">GadKille</h3>
          <p className="mt-2 text-sm text-gray-600">
            {language === 'en'
              ? 'Fort exploration and trip planning platform for modern travelers.'
              : 'आधुनिक प्रवाशांसाठी किल्ले भ्रमंती आणि ट्रिप नियोजन प्लॅटफॉर्म.'}
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-primaryDark">{language === 'en' ? 'Quick Links' : 'जलद दुवे'}</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li><a href="/" className="hover:text-primaryDark">{language === 'en' ? 'Home' : 'मुख्यपृष्ठ'}</a></li>
            <li><a href="/explore" className="hover:text-primaryDark">{language === 'en' ? 'Explore' : 'भ्रमंती'}</a></li>
            <li><a href="/plan-trip" className="hover:text-primaryDark">{language === 'en' ? 'Plan Trip' : 'ट्रिप प्लॅन'}</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-primaryDark">{language === 'en' ? 'Contact' : 'संपर्क'}</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li>{language === 'en' ? 'Email' : 'ई-मेल'}: kunalrmore@gmail.com</li>
            <li>{language === 'en' ? 'Phone' : 'फोन'}: +91 84326 60285</li>
            <li>{language === 'en' ? 'Pune, Maharashtra, India' : 'पुणे, महाराष्ट्र, भारत'}</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-primaryDark">{language === 'en' ? 'Follow Us' : 'आमच्याशी जोडा'}</h4>
          <div className="mt-3 flex gap-3">
            <a href="#" className="rounded-full bg-softBg px-3 py-1 text-xs font-semibold text-primaryDark hover:bg-accent">Instagram</a>
            <a href="#" className="rounded-full bg-softBg px-3 py-1 text-xs font-semibold text-primaryDark hover:bg-accent">YouTube</a>
          </div>
        </div>
      </div>

      <div className="border-t border-primary/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-gray-500 md:flex-row">
          <p>© {new Date().getFullYear()} GadKille. {language === 'en' ? 'All rights reserved.' : 'सर्व हक्क राखीव.'}</p>
          <p>{language === 'en' ? 'Built for seamless fort journeys across India.' : 'भारतभर सहज किल्ले प्रवासासाठी बनवलेले.'}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

