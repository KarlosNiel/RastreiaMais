"use client";

import { useEffect, useState } from "react";

export interface SystemSettings {
  theme: "light" | "dark" | "system";
  density: "compact" | "comfortable";
  audioAlerts: boolean;
  pulsingAlerts: boolean;
  notifyNewPatients: boolean;
  defaultUbs: string;
  defaultMicroarea: string;
  pageSize: number;
  maskCpf: boolean;
}

export const DEFAULT_SETTINGS: SystemSettings = {
  theme: "light",
  density: "comfortable",
  audioAlerts: true,
  pulsingAlerts: true,
  notifyNewPatients: true,
  defaultUbs: "USF Maria Madalena",
  defaultMicroarea: "Jardim Magnólia",
  pageSize: 8,
  maskCpf: false,
};

const STORAGE_KEY = "rastreia:system-settings";

export function getStoredSettings(): SystemSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) return DEFAULT_SETTINGS;

    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveStoredSettings(settings: SystemSettings): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    window.dispatchEvent(
      new CustomEvent("systemSettingsChange", { detail: settings }),
    );
  } catch {
    // quota ou modo anônimo restrito
  }
}

export function useSystemSettings() {
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setSettings(getStoredSettings());

    const handleSync = (e: Event) => {
      const custom = e as CustomEvent<SystemSettings>;

      if (custom.detail) {
        setSettings(custom.detail);
      } else {
        setSettings(getStoredSettings());
      }
    };

    window.addEventListener("systemSettingsChange", handleSync);
    window.addEventListener("storage", handleSync);

    return () => {
      window.removeEventListener("systemSettingsChange", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  const updateSettings = (partial: Partial<SystemSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...partial };

      saveStoredSettings(updated);

      return updated;
    });
  };

  return {
    settings,
    updateSettings,
    mounted,
  };
}
