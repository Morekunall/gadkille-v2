import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { useUi } from '../../context/UiContext';

const Layout = () => {
  const { toast } = useUi();

  return (
    <div className="flex min-h-screen flex-col bg-softBg">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      {toast && (
        <div className="fixed bottom-4 right-4 z-30">
          <div
            className={`rounded-xl px-4 py-2 text-xs shadow-soft ${
              toast.type === 'error'
                ? 'bg-red-50 text-red-700'
                : 'bg-emerald-50 text-emerald-700'
            }`}
          >
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
