'use client';

import React from 'react';
import { WatchlistProvider } from '../context/WatchlistContext';
import { AnalyticsProvider } from '../context/AnalyticsContext';

export const Providers: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <AnalyticsProvider>
      <WatchlistProvider>{children}</WatchlistProvider>
    </AnalyticsProvider>
  );
};
