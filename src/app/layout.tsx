import type { Metadata } from "next";
import { headers } from "next/headers";
import { SessionProvider } from "@/providers/session-provider";
import { TenantThemeProvider } from "@/providers/tenant-theme-provider";
import { TopNav } from "@/components/layout/top-nav";
import { AccessDeniedModal } from "@/components/access-denied-modal";
import { SessionTimeout } from "@/components/session-timeout";
import { Toaster } from "@/components/ui/toaster";
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
  const brandName = headersList.get("x-tenant-brand") || "";
  const logoUrl = headersList.get("x-tenant-logo-url") || "";
  const primaryColor =
    headersList.get("x-tenant-primary-color") || "#0F172A";
  const accentColor =
    headersList.get("x-tenant-accent-color") || "#4F46E5";

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
