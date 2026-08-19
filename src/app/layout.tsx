import type { Metadata } from "next";
import { headers } from "next/headers";
import { SessionProvider } from "@/providers/session-provider";
import { TenantThemeProvider } from "@/providers/tenant-theme-provider";
import { TopNav } from "@/components/layout/top-nav";
import { AccessDeniedModal } from "@/components/access-denied-modal";
import { SessionTimeout } from "@/components/session-timeout";
import { Toaster } from "@/components/ui/toaster";
import { prisma } from "@/lib/prisma";
import "./globals.css";

export const metadata: Metadata = {
  title: "Study Abroad Platform",
  description: "White-labeled educational counseling platform",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const tenantId = headersList.get("x-tenant-id") || "";
  let brandName = "";
  let logoUrl = "";
  let primaryColor = "#0F172A";
  let accentColor = "#4F46E5";

  if (tenantId) {
    const tenant = await prisma.tenant.findFirst({
      where: {
        OR: [{ id: tenantId }, { subdomain: tenantId }, { slug: tenantId }],
      },
    });
    if (tenant) {
      brandName = tenant.brandName || "";
      logoUrl = tenant.logoUrl || "";
      primaryColor = tenant.primaryColor || primaryColor;
      accentColor = tenant.accentColor || accentColor;
    }
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="x-tenant-id" content={tenantId} />
        <meta name="x-tenant-brand" content={brandName} />
        <meta name="x-tenant-logo-url" content={logoUrl} />
        <meta name="x-tenant-primary-color" content={primaryColor} />
        <meta name="x-tenant-accent-color" content={accentColor} />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <SessionProvider>
          <TenantThemeProvider>
            <TopNav />
            <main className="pt-16">{children}</main>
            <SessionTimeout />
            <AccessDeniedModal />
            <Toaster />
          </TenantThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
