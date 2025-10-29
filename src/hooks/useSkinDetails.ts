import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import type { SkinDetailData } from '../types/skin';

interface UseSkinDetailsResult {
  data: SkinDetailData | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export const useSkinDetails = (skinId: string): UseSkinDetailsResult => {
  const [data, setData] = useState<SkinDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const details = await apiService.fetchSkinDetails(skinId);
      setData(details);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch skin details'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (skinId) {
      fetchData();
    }
  }, [skinId]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  };
};
