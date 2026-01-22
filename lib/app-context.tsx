import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { trpc } from "./trpc";
import { useAuth } from "@/hooks/use-auth";

type County = {
  id: number;
  name: string;
  state: string;
  protocolVersion: string | null;
};

type Message = {
  id: string;
  type: "user" | "assistant";
  text: string;
  protocolRefs?: string[];
  timestamp: Date;
};

type AppContextType = {
  selectedCounty: County | null;
  setSelectedCounty: (county: County | null) => void;
  messages: Message[];
  addMessage: (message: Omit<Message, "id" | "timestamp">) => void;
  clearMessages: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

const COUNTY_STORAGE_KEY = "protocol_guide_selected_county";

export function AppProvider({ children }: { children: ReactNode }) {
  const [selectedCounty, setSelectedCountyState] = useState<County | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated, user } = useAuth();

  // Load saved county on mount
  useEffect(() => {
    const loadSavedCounty = async () => {
      try {
        const saved = await AsyncStorage.getItem(COUNTY_STORAGE_KEY);
        if (saved) {
          setSelectedCountyState(JSON.parse(saved));
        }
      } catch (error) {
        console.error("Failed to load saved county:", error);
      }
    };
    loadSavedCounty();
  }, []);

  const setSelectedCounty = useCallback(async (county: County | null) => {
    setSelectedCountyState(county);
    // Clear messages when county changes
    setMessages([]);
    
    try {
      if (county) {
        await AsyncStorage.setItem(COUNTY_STORAGE_KEY, JSON.stringify(county));
      } else {
        await AsyncStorage.removeItem(COUNTY_STORAGE_KEY);
      }
    } catch (error) {
      console.error("Failed to save county:", error);
    }
  }, []);

  const addMessage = useCallback((message: Omit<Message, "id" | "timestamp">) => {
    const newMessage: Message = {
      ...message,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return (
    <AppContext.Provider
      value={{
        selectedCounty,
        setSelectedCounty,
        messages,
        addMessage,
        clearMessages,
        isLoading,
        setIsLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
