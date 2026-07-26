"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export interface TenantConfig {
  tenantId: string;
  brandName: string;
  logoUrl: string;
  primaryColor: string;
  accentColor: string;
}

const defaultConfig: TenantConfig = {
  tenantId: "",
  brandName: "",
  logoUrl: "",
  primaryColor: "#0F172A",
  accentColor: "#3B82F6",
};

const TenantContext = createContext<TenantConfig>(defaultConfig);

export function useTenant() {
  return useContext(TenantContext);
}

export function TenantThemeProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<TenantConfig>(defaultConfig);

  useEffect(() => {
    const headers = {
      tenantId: getMeta("x-tenant-id"),
      brandName: getMeta("x-tenant-brand"),
      logoUrl: getMeta("x-tenant-logo-url"),
      primaryColor: getMeta("x-tenant-primary-color"),
      accentColor: getMeta("x-tenant-accent-color"),
    };

    const tenantConfig: TenantConfig = {
      tenantId: headers.tenantId || defaultConfig.tenantId,
      brandName: headers.brandName || defaultConfig.brandName,
      logoUrl: headers.logoUrl || defaultConfig.logoUrl,
      primaryColor: headers.primaryColor || defaultConfig.primaryColor,
      accentColor: headers.accentColor || defaultConfig.accentColor,
    };

    setConfig(tenantConfig);
    applyTheme(tenantConfig);
  }, []);

  return (
    <TenantContext.Provider value={config}>{children}</TenantContext.Provider>
  );
}

function getMeta(key: string): string {
  return (
    document.querySelector(`meta[name="${key}"]`)?.getAttribute("content") || ""
  );
}

function applyTheme(config: TenantConfig) {
  document.documentElement.style.setProperty("--primary", config.primaryColor);
  document.documentElement.style.setProperty("--accent", config.accentColor);
}
