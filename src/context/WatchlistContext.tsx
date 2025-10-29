'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface WatchlistItem {
  skinId: string;
  addedAt: string;
  targetPrice?: number;
  notes?: string;
}

interface WatchlistContextType {
  watchlist: WatchlistItem[];
  addToWatchlist: (skinId: string, targetPrice?: number, notes?: string) => void;
  removeFromWatchlist: (skinId: string) => void;
  isInWatchlist: (skinId: string) => boolean;
  updateWatchlistItem: (skinId: string, updates: Partial<WatchlistItem>) => void;
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

export const WatchlistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('skin-watchlist');
      if (stored) {
        setWatchlist(JSON.parse(stored));
      }
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    if (isInitialized && typeof window !== 'undefined') {
      localStorage.setItem('skin-watchlist', JSON.stringify(watchlist));
    }
  }, [watchlist, isInitialized]);

  const addToWatchlist = (skinId: string, targetPrice?: number, notes?: string) => {
    setWatchlist((prev) => {
      if (prev.some((item) => item.skinId === skinId)) {
        return prev;
      }
      return [
        ...prev,
        {
          skinId,
          addedAt: new Date().toISOString(),
          targetPrice,
          notes,
        },
      ];
    });
  };

  const removeFromWatchlist = (skinId: string) => {
    setWatchlist((prev) => prev.filter((item) => item.skinId !== skinId));
  };

  const isInWatchlist = (skinId: string): boolean => {
    return watchlist.some((item) => item.skinId === skinId);
  };

  const updateWatchlistItem = (skinId: string, updates: Partial<WatchlistItem>) => {
    setWatchlist((prev) =>
      prev.map((item) =>
        item.skinId === skinId ? { ...item, ...updates } : item
      )
    );
  };

  return (
    <WatchlistContext.Provider
      value={{
        watchlist,
        addToWatchlist,
        removeFromWatchlist,
        isInWatchlist,
        updateWatchlistItem,
      }}
    >
      {children}
    </WatchlistContext.Provider>
  );
};

export const useWatchlist = () => {
  const context = useContext(WatchlistContext);
  if (context === undefined) {
    throw new Error('useWatchlist must be used within a WatchlistProvider');
  }
  return context;
};
