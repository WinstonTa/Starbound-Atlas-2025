import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

type FavoritesContextType = {
  savedVenueIds: Set<string>;
  toggleFavorite: (venueId: string) => Promise<void>;
  isFavorited: (venueId: string) => boolean;
  loading: boolean;
};

const FavoritesContext = createContext<FavoritesContextType>({
  savedVenueIds: new Set(),
  toggleFavorite: async () => {},
  isFavorited: () => false,
  loading: true,
});

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [savedVenueIds, setSavedVenueIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth().currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    const unsub = firestore()
      .collection('user_data')
      .doc(user.uid)
      .onSnapshot(
        (doc) => {
          const data = doc.data();
          const ids = Array.isArray(data?.savedDeals) ? data.savedDeals : [];
          setSavedVenueIds(new Set(ids));
          setLoading(false);
        },
        (err) => {
          console.warn('Favorites listener error:', err);
          setLoading(false);
        }
      );

    return unsub;
  }, []);

  const toggleFavorite = useCallback(
    async (venueId: string) => {
      const user = auth().currentUser;
      if (!user) return;

      const userRef = firestore().collection('user_data').doc(user.uid);
      const alreadySaved = savedVenueIds.has(venueId);

      // Optimistic UI update
      setSavedVenueIds((prev) => {
        const next = new Set(prev);
        alreadySaved ? next.delete(venueId) : next.add(venueId);
        return next;
      });

      try {
        await userRef.set(
          {
            savedDeals: alreadySaved
              ? firestore.FieldValue.arrayRemove(venueId)
              : firestore.FieldValue.arrayUnion(venueId),
          },
          { merge: true }
        );
      } catch (err) {
        console.error('toggleFavorite failed:', err);
        // Rollback
        setSavedVenueIds((prev) => {
          const next = new Set(prev);
          alreadySaved ? next.add(venueId) : next.delete(venueId);
          return next;
        });
      }
    },
    [savedVenueIds]
  );

  const isFavorited = useCallback(
    (venueId: string) => savedVenueIds.has(venueId),
    [savedVenueIds]
  );

  return React.createElement(
    FavoritesContext.Provider,
    { value: { savedVenueIds, toggleFavorite, isFavorited, loading } },
    children
  );
}

export const useFavorites = () => useContext(FavoritesContext);
