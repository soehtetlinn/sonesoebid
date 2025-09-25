import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

interface WatchListContextType {
  watchlist: Set<string>;
  isWatched: (productId: string) => boolean;
  addToWatchlist: (productId: string) => Promise<void>;
  removeFromWatchlist: (productId: string) => Promise<void>;
  loading: boolean;
}

const WatchListContext = createContext<WatchListContextType | undefined>(undefined);

export const WatchListProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [watchlist, setWatchlist] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const fetchWatchlist = useCallback(async () => {
    if (user) {
      setLoading(true);
      const productIds = await api.getWatchlistByUserId(user.id);
      setWatchlist(new Set(productIds));
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchWatchlist();
    } else {
      setWatchlist(new Set());
    }
  }, [isAuthenticated, fetchWatchlist]);

  const isWatched = (productId: string): boolean => {
    return watchlist.has(productId);
  };

  const addToWatchlist = async (productId: string) => {
    if (user) {
      await api.addToWatchlist(user.id, productId);
      setWatchlist(prev => new Set(prev).add(productId));
    }
  };

  const removeFromWatchlist = async (productId: string) => {
    if (user) {
      await api.removeFromWatchlist(user.id, productId);
      setWatchlist(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  return (
    <WatchListContext.Provider value={{ watchlist, isWatched, addToWatchlist, removeFromWatchlist, loading }}>
      {children}
    </WatchListContext.Provider>
  );
};

export const useWatchList = (): WatchListContextType => {
  const context = useContext(WatchListContext);
  if (context === undefined) {
    throw new Error('useWatchList must be used within a WatchListProvider');
  }
  return context;
};
