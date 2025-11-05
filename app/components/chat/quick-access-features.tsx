"use client";

import { Bookmark, Clock, Plus, Star, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

/**
 * Storage keys for recent and favorite protocols
 */
const STORAGE_KEY_RECENT = "medic-bot-recent-protocols";
const STORAGE_KEY_FAVORITES = "medic-bot-favorite-protocols";

/**
 * Maximum number of recent protocols to store
 */
const MAX_RECENT_PROTOCOLS = 10;

export interface QuickAccessProtocol {
  name: string;
  description: string;
  timestamp?: number;
}

interface QuickAccessFeaturesProps {
  onSelectProtocol: (protocol: string) => void;
  className?: string;
}

/**
 * QuickAccessFeatures - Floating action button and sidebar for quick protocol access
 * Features:
 * - Floating action button for quick access
 * - Recent protocols history
 * - Favorite protocols
 * - Emergency contact information always visible
 */
export function QuickAccessFeatures({
  onSelectProtocol,
  className = "",
}: QuickAccessFeaturesProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [recentProtocols, setRecentProtocols] = useState<QuickAccessProtocol[]>([]);
  const [favoriteProtocols, setFavoriteProtocols] = useState<QuickAccessProtocol[]>([]);
  const [activeTab, setActiveTab] = useState<"recent" | "favorites">("recent");

  // Load recent and favorite protocols from localStorage
  useEffect(() => {
    try {
      const recentStr = localStorage.getItem(STORAGE_KEY_RECENT);
      const favoritesStr = localStorage.getItem(STORAGE_KEY_FAVORITES);

      if (recentStr) {
        const recent = JSON.parse(recentStr) as QuickAccessProtocol[];
        setRecentProtocols(recent);
      }

      if (favoritesStr) {
        const favorites = JSON.parse(favoritesStr) as QuickAccessProtocol[];
        setFavoriteProtocols(favorites);
      }
    } catch (error) {
      console.error("Error loading quick access protocols:", error);
    }
  }, []);

  // Save recent protocols to localStorage
  const saveRecentProtocol = useCallback((protocol: QuickAccessProtocol) => {
    setRecentProtocols((prev) => {
      // Remove if already exists
      const filtered = prev.filter((p) => p.name !== protocol.name);
      // Add to beginning
      const updated = [{ ...protocol, timestamp: Date.now() }, ...filtered].slice(
        0,
        MAX_RECENT_PROTOCOLS
      );
      try {
        localStorage.setItem(STORAGE_KEY_RECENT, JSON.stringify(updated));
      } catch (error) {
        console.error("Error saving recent protocols:", error);
      }
      return updated;
    });
  }, []);

  // Toggle favorite protocol
  const toggleFavorite = useCallback(
    (protocol: QuickAccessProtocol) => {
      setFavoriteProtocols((prev) => {
        const isFavorite = prev.some((p) => p.name === protocol.name);
        let updated: QuickAccessProtocol[];

        if (isFavorite) {
          updated = prev.filter((p) => p.name !== protocol.name);
        } else {
          updated = [...prev, protocol];
        }

        try {
          localStorage.setItem(STORAGE_KEY_FAVORITES, JSON.stringify(updated));
        } catch (error) {
          console.error("Error saving favorite protocols:", error);
        }

        return updated;
      });
    },
    []
  );

  // Handle protocol selection
  const handleProtocolSelect = useCallback(
    (protocol: QuickAccessProtocol) => {
      saveRecentProtocol(protocol);
      onSelectProtocol(protocol.name);
      setIsOpen(false);
    },
    [onSelectProtocol, saveRecentProtocol]
  );

  // Check if protocol is favorited
  const isFavorite = useCallback(
    (protocolName: string) => {
      return favoriteProtocols.some((p) => p.name === protocolName);
    },
    [favoriteProtocols]
  );

  // Get common protocols for quick access
  const commonProtocols: QuickAccessProtocol[] = [
    { name: "Protocol 1210", description: "Cardiac Arrest" },
    { name: "Protocol 1211", description: "Cardiac Chest Pain" },
    { name: "Protocol 1231", description: "Airway Obstruction" },
    { name: "Protocol 1233", description: "Respiratory Distress - Bronchospasm" },
    { name: "Protocol 1219", description: "Allergy/Anaphylaxis" },
  ];

  const currentProtocols =
    activeTab === "recent" ? recentProtocols : favoriteProtocols;
  const hasProtocols = currentProtocols.length > 0;

  return (
    <>
      {/* Floating Action Button */}
      <button
        type="button"
        className={`quick-access-fab ${className}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close quick access" : "Open quick access"}
        aria-expanded={isOpen}
        title="Quick Access Protocols"
      >
        {isOpen ? <X size={24} /> : <Plus size={24} />}
      </button>

      {/* Quick Access Sidebar */}
      {isOpen && (
        <div
          className="quick-access-sidebar"
          role="dialog"
          aria-modal="true"
          aria-label="Quick access protocols"
        >
          {/* Header */}
          <div className="quick-access-header">
            <h3 className="quick-access-title">Quick Access</h3>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="quick-access-close"
              aria-label="Close quick access"
            >
              <X size={20} />
            </button>
          </div>

          {/* Tabs */}
          <div className="quick-access-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "recent"}
              aria-controls="recent-protocols"
              className={`quick-access-tab ${
                activeTab === "recent" ? "active" : ""
              }`}
              onClick={() => setActiveTab("recent")}
            >
              <Clock size={16} />
              Recent ({recentProtocols.length})
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "favorites"}
              aria-controls="favorite-protocols"
              className={`quick-access-tab ${
                activeTab === "favorites" ? "active" : ""
              }`}
              onClick={() => setActiveTab("favorites")}
            >
              <Star size={16} />
              Favorites ({favoriteProtocols.length})
            </button>
          </div>

          {/* Protocol Lists */}
          <div className="quick-access-content">
            {activeTab === "recent" && (
              <div
                id="recent-protocols"
                role="tabpanel"
                aria-labelledby="recent-tab"
              >
                {hasProtocols ? (
                  <ul className="quick-access-list" role="list">
                    {currentProtocols.map((protocol) => (
                      <li key={protocol.name} role="listitem">
                        <button
                          type="button"
                          className="quick-access-protocol-item"
                          onClick={() => handleProtocolSelect(protocol)}
                          aria-label={`Select ${protocol.name}: ${protocol.description}`}
                        >
                          <div className="quick-access-protocol-name">
                            {protocol.name}
                          </div>
                          <div className="quick-access-protocol-description">
                            {protocol.description}
                          </div>
                        </button>
                        <button
                          type="button"
                          className="quick-access-favorite-btn"
                          onClick={() => toggleFavorite(protocol)}
                          aria-label={
                            isFavorite(protocol.name)
                              ? `Remove ${protocol.name} from favorites`
                              : `Add ${protocol.name} to favorites`
                          }
                          aria-pressed={isFavorite(protocol.name)}
                        >
                          <Star
                            size={16}
                            fill={isFavorite(protocol.name) ? "currentColor" : "none"}
                          />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="quick-access-empty">
                    <Clock size={32} />
                    <p>No recent protocols</p>
                    <p className="quick-access-empty-hint">
                      Protocols you access will appear here
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "favorites" && (
              <div
                id="favorite-protocols"
                role="tabpanel"
                aria-labelledby="favorites-tab"
              >
                {hasProtocols ? (
                  <ul className="quick-access-list" role="list">
                    {currentProtocols.map((protocol) => (
                      <li key={protocol.name} role="listitem">
                        <button
                          type="button"
                          className="quick-access-protocol-item"
                          onClick={() => handleProtocolSelect(protocol)}
                          aria-label={`Select ${protocol.name}: ${protocol.description}`}
                        >
                          <div className="quick-access-protocol-name">
                            {protocol.name}
                          </div>
                          <div className="quick-access-protocol-description">
                            {protocol.description}
                          </div>
                        </button>
                        <button
                          type="button"
                          className="quick-access-favorite-btn"
                          onClick={() => toggleFavorite(protocol)}
                          aria-label={`Remove ${protocol.name} from favorites`}
                          aria-pressed={true}
                        >
                          <Star size={16} fill="currentColor" />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="quick-access-empty">
                    <Star size={32} />
                    <p>No favorite protocols</p>
                    <p className="quick-access-empty-hint">
                      Tap the star icon to add protocols to favorites
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Common Protocols Footer */}
          <div className="quick-access-footer">
            <div className="quick-access-footer-title">Common Protocols</div>
            <div className="quick-access-common-protocols">
              {commonProtocols.map((protocol) => (
                <button
                  key={protocol.name}
                  type="button"
                  className="quick-access-chip"
                  onClick={() => handleProtocolSelect(protocol)}
                  aria-label={`Quick access ${protocol.name}`}
                >
                  {protocol.name.split(" ")[1]}
                </button>
              ))}
            </div>
          </div>

          {/* Emergency Contact Info */}
          <div className="quick-access-emergency" role="region" aria-label="Emergency contact">
            <div className="quick-access-emergency-title">
              <Bookmark size={16} />
              Emergency Contact
            </div>
            <div className="quick-access-emergency-info">
              <div>Base Hospital: (323) 881-2411</div>
              <div>Medical Control: Available 24/7</div>
            </div>
          </div>
        </div>
      )}

      {/* Overlay */}
      {isOpen && (
        <div
          className="quick-access-overlay"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}

/**
 * Hook to track protocol usage for recent protocols
 */
export function useProtocolTracker(onSelectProtocol: (protocol: string) => void) {
  const trackProtocol = useCallback(
    (protocolName: string, description?: string) => {
      const protocol: QuickAccessProtocol = {
        name: protocolName,
        description: description || protocolName,
        timestamp: Date.now(),
      };

      try {
        const recentStr = localStorage.getItem(STORAGE_KEY_RECENT);
        const recent = recentStr ? (JSON.parse(recentStr) as QuickAccessProtocol[]) : [];
        const filtered = recent.filter((p) => p.name !== protocolName);
        const updated = [protocol, ...filtered].slice(0, MAX_RECENT_PROTOCOLS);
        localStorage.setItem(STORAGE_KEY_RECENT, JSON.stringify(updated));
      } catch (error) {
        console.error("Error tracking protocol:", error);
      }

      onSelectProtocol(protocolName);
    },
    [onSelectProtocol]
  );

  return { trackProtocol };
}

