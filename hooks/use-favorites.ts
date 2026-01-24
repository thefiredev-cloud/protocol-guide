import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const FAVORITES_KEY = "protocol_guide_favorites";

export interface FavoriteProtocol {
  id: number;
  protocolNumber: string;
  protocolTitle: string;
  section: string | null;
  content: string;
  agencyName?: string;
  savedAt: string;
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteProtocol[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load favorites on mount
  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const stored = await AsyncStorage.getItem(FAVORITES_KEY);
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Error loading favorites:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addFavorite = useCallback(async (protocol: Omit<FavoriteProtocol, "savedAt">) => {
    try {
      setFavorites(prevFavorites => {
        const newFavorite: FavoriteProtocol = {
          ...protocol,
          savedAt: new Date().toISOString(),
        };

        const updated = [newFavorite, ...prevFavorites.filter((f) => f.id !== protocol.id)];
        AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updated)).catch(console.error);
        return updated;
      });
    } catch (error) {
      console.error("Error adding favorite:", error);
    }
  }, []);

  const removeFavorite = useCallback(async (protocolId: number) => {
    try {
      setFavorites(prevFavorites => {
        const updated = prevFavorites.filter((f) => f.id !== protocolId);
        AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updated)).catch(console.error);
        return updated;
      });
    } catch (error) {
      console.error("Error removing favorite:", error);
    }
  }, []);

  const isFavorite = useCallback((protocolId: number) => {
    return favorites.some((f) => f.id === protocolId);
  }, [favorites]);

  const toggleFavorite = useCallback(async (protocol: Omit<FavoriteProtocol, "savedAt">) => {
    if (isFavorite(protocol.id)) {
      await removeFavorite(protocol.id);
    } else {
      await addFavorite(protocol);
    }
  }, [isFavorite, addFavorite, removeFavorite]);

  return {
    favorites,
    isLoading,
    addFavorite,
    removeFavorite,
    isFavorite,
    toggleFavorite,
    refreshFavorites: loadFavorites,
  };
}
