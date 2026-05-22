import { useCallback, useEffect, useState } from 'react';
import axios from '../lib/axiosAuth';

export function useForts() {
  const [forts, setForts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchForts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/forts');
      setForts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setForts([]);
      setError(
        err.response?.data?.message ||
          (err.request
            ? 'Could not load forts. Check your connection or wait for the API to wake up.'
            : 'Could not load forts.')
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchForts();
  }, [fetchForts]);

  return { forts, loading, error, refetch: fetchForts };
}
