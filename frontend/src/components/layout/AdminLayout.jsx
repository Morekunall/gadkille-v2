import { Outlet } from 'react-router-dom';
import AdminNavbar from './AdminNavbar';
import SeoHead from '../seo/SeoHead';
import { useUi } from '../../context/UiContext';

const AdminLayout = () => {
  const { toast } = useUi();

  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
      <SeoHead title="GadKille Admin" noindex />
      <AdminNavbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-slate-200 bg-white px-4 py-3 text-center text-[11px] text-slate-500">
        GadKille Admin · Internal use only
      </footer>
      {toast && (
        <div className="fixed bottom-4 right-4 z-40">
          <div
            className={`rounded-xl px-4 py-2 text-xs shadow-lg ${
              toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-primary text-white'
            }`}
          >
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLayout;
