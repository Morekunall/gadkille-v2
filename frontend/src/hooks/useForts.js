import { useCallback, useEffect, useState } from 'react';
import { getForts } from '../api/forts';
import { getApiErrorMessage } from '../lib/getApiErrorMessage';

export function useForts() {
  const [forts, setForts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchForts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getForts();
      setForts(Array.isArray(data) ? data : []);
    } catch (err) {
      setForts([]);
      setError(
        getApiErrorMessage(
          err,
          'Could not load forts. Check your connection or wait for the API to wake up.'
        )
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
