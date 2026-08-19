"use client";

import { useTenant } from "@/providers/tenant-theme-provider";

export function BrandLogo({ className = "h-14 w-14" }: { className?: string }) {
  const tenant = useTenant();

  if (tenant.logoUrl) {
    return (
      <div
        className={`mx-auto mb-3 flex items-center justify-center overflow-hidden rounded-2xl border border-white/20 bg-white/15 p-2 shadow-lg backdrop-blur-md ${className}`}
      >
        <img
          src={tenant.logoUrl}
          alt={tenant.brandName || "Brand"}
          className="h-full w-full object-contain"
        />
      </div>
    );
  }

  return null;
}