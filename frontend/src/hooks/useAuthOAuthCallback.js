import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUi } from '../context/UiContext';
import { getGoogleErrorMessage } from '../lib/oauthErrors';

/**
 * Handles ?token= and ?error= from Google OAuth redirect on any page.
 */
export function useAuthOAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { authenticateWithToken } = useAuth();
  const { showToast, language } = useUi();
  const handled = useRef(false);

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if ((!token && !error) || handled.current) return;
    handled.current = true;

    if (error) {
      showToast('error', getGoogleErrorMessage(error, language));
      navigate('/login', { replace: true });
      return;
    }

    (async () => {
      const user = await authenticateWithToken(token);
      if (user) {
        if (user.needsPhone) {
          const q = new URLSearchParams({ token });
          if (searchParams.get('new') === '1') q.set('new', '1');
          navigate(`/complete-profile?${q.toString()}`, { replace: true });
          return;
        }
        navigate(user.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
        return;
      }
      const hint =
        import.meta.env.DEV
          ? ' Set VITE_API_URL to your Render API (see frontend/.env).'
          : '';
      showToast('error', `Google sign-in could not be completed.${hint} Please try again.`);
      navigate('/login', { replace: true });
    })();
  }, [searchParams, navigate, authenticateWithToken, showToast, language]);
}
