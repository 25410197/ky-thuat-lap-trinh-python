"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { favoritesApi } from "@/features/favorites/api/favorites.api";
import { useAuth } from "@/hooks/useAuth";

interface FavoritesContextValue {
  isFavorited: (rentalPostId: number) => boolean;
  toggleFavorite: (rentalPostId: number) => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    let daHuy = false;

    Promise.resolve()
      .then(() => (isAuthenticated ? favoritesApi.ids() : Promise.resolve<number[]>([])))
      .then((ids) => {
        if (daHuy) return;
        setFavoriteIds(new Set(ids));
      })
      .catch(() => {
        if (daHuy) return;
        setFavoriteIds(new Set());
      });

    return () => {
      daHuy = true;
    };
  }, [isAuthenticated]);

  const isFavorited = useCallback((rentalPostId: number) => favoriteIds.has(rentalPostId), [favoriteIds]);

  const toggleFavorite = useCallback(
    async (rentalPostId: number) => {
      const daYeuThich = favoriteIds.has(rentalPostId);

      setFavoriteIds((truoc) => {
        const moi = new Set(truoc);
        if (daYeuThich) moi.delete(rentalPostId);
        else moi.add(rentalPostId);
        return moi;
      });

      try {
        if (daYeuThich) {
          await favoritesApi.remove(rentalPostId);
        } else {
          await favoritesApi.add(rentalPostId);
        }
      } catch (error) {
        // Gọi API thất bại — hoàn tác lại trạng thái đã cập nhật lạc quan ở trên.
        setFavoriteIds((truoc) => {
          const moi = new Set(truoc);
          if (daYeuThich) moi.add(rentalPostId);
          else moi.delete(rentalPostId);
          return moi;
        });
        throw error;
      }
    },
    [favoriteIds]
  );

  return (
    <FavoritesContext.Provider value={{ isFavorited, toggleFavorite }}>{children}</FavoritesContext.Provider>
  );
}

export function useFavorites(): FavoritesContextValue {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites phải được dùng bên trong FavoritesProvider");
  }
  return context;
}
