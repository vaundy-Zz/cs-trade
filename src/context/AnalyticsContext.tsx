'use client';

import React, { createContext, useContext, useCallback, useMemo, useRef, useEffect, ReactNode } from 'react';

interface AnalyticsEvent {
  id: string;
  skinId: string;
  action: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

interface AnalyticsContextType {
  events: AnalyticsEvent[];
  track: (event: Omit<AnalyticsEvent, 'id' | 'timestamp'> & { metadata?: Record<string, any> }) => void;
  clear: () => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

const STORAGE_KEY = 'skin-analytics-events';

export const AnalyticsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const eventsRef = useRef<AnalyticsEvent[]>([]);
  const [, forceUpdate] = React.useState({});

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed: AnalyticsEvent[] = JSON.parse(stored);
        eventsRef.current = parsed;
        forceUpdate({});
      } catch (error) {
        console.error('Failed to parse stored analytics events', error);
      }
    }
  }, []);

  const persist = useCallback(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(eventsRef.current));
  }, []);

  const track = useCallback<AnalyticsContextType['track']>(({ skinId, action, metadata }) => {
    const event: AnalyticsEvent = {
      id: `${skinId}-${action}-${Date.now()}`,
      skinId,
      action,
      metadata,
      timestamp: new Date().toISOString(),
    };
    eventsRef.current = [event, ...eventsRef.current].slice(0, 200);
    persist();
    forceUpdate({});
  }, [persist]);

  const clear = useCallback(() => {
    eventsRef.current = [];
    persist();
    forceUpdate({});
  }, [persist]);

  const value = useMemo(
    () => ({
      events: eventsRef.current,
      track,
      clear,
    }),
    [track, clear]
  );

  return <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>;
};

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};
