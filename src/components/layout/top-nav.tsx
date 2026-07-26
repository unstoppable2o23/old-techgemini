"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useTenant } from "@/providers/tenant-theme-provider";
import { useFeatureFlags } from "@/hooks/use-feature-flags";
import { usePresence } from "@/hooks/use-presence";
import { useNotifications } from "@/hooks/use-notifications";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, Lock, Menu, X } from "lucide-react";

type NavItem = {
  label: string;
  href: string;
  featureKey?: string;
};

const COUNSELOR_NAV_ITEMS: NavItem[] = [
  { label: "Overview", href: "/dashboard" },
  { label: "Student Management", href: "/students" },
  { label: "Feature Flags", href: "/feature-flags" },
  { label: "Calendar", href: "/calendar" },
  { label: "Webinars", href: "/webinars" },
  { label: "Analytics", href: "/analytics" },
];

const STUDENT_NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/dashboard" },
  { label: "College Finder", href: "/college-finder", featureKey: "collegeFinder" },
  { label: "AI Odds Calculator", href: "/odds-calculator", featureKey: "aiOddsCalculator" },
  { label: "Mock Tests", href: "/mock-tests", featureKey: "mockTests" },
  { label: "Scholarships", href: "/scholarships", featureKey: "scholarshipHub" },
  { label: "Appointments", href: "/appointments", featureKey: "appointments" },
];

export function TopNav() {
  const pathname = usePathname();
  const { data: session, status: authStatus } = useSession();
  const tenant = useTenant();
  const { flags } = useFeatureFlags();
  const { status } = usePresence();
  const { notifications, unreadCount } = useNotifications();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const role = session?.user?.role;
  const isCounselor = role === "COUNSELOR" || role === "SUPER_ADMIN";
  const navItems = isCounselor ? COUNSELOR_NAV_ITEMS : STUDENT_NAV_ITEMS;

  const statusConfig: Record<string, { label: string; dot: string }> = {
    ONLINE: { label: "Online", dot: "bg-green-500" },
    IN_TEST: {
      label: `In-Test: ${status.testTitle || "Assessment"}`,
      dot: "bg-orange-500",
    },
    OFFLINE: { label: "Offline", dot: "bg-gray-400" },
  };

  const currentStatus = statusConfig[status.current] || statusConfig.OFFLINE;

  function canShowItem(item: NavItem): boolean {
    if (isCounselor) return true;
    if (!item.featureKey) return true;
    return (flags as any)[item.featureKey] === true;
  }

  function handleNavClick(e: React.MouseEvent, item: NavItem) {
    if (!canShowItem(item)) {
      e.preventDefault();
      window.dispatchEvent(
        new CustomEvent("open-access-denied", { detail: item })
      );
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b backdrop-blur-md bg-white/80 dark:bg-slate-900/80">
      <nav className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          {tenant.logoUrl ? (
            <img
              src={tenant.logoUrl}
              alt={tenant.brandName || "Brand"}
              className="h-8 w-auto object-contain"
            />
          ) : (
            <span className="text-lg font-bold text-foreground">
              {tenant.brandName || "Platform"}
            </span>
          )}
        </div>

        {authStatus === "loading" ? null : authStatus === "authenticated" ? (
          <>
            <ul className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const enabled = canShowItem(item);
                const isActive = pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={enabled ? item.href : "#"}
                      onClick={(e: React.MouseEvent) => handleNavClick(e, item)}
                      className={`relative inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-accent/10 text-accent"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent/5"
                      } ${!enabled ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      {item.label}
                      {!enabled && <Lock className="h-3.5 w-3.5" />}
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1"
              >
                <span className={`h-2 w-2 rounded-full ${currentStatus.dot}`} />
                <span className="text-xs">{currentStatus.label}</span>
              </Badge>

              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-80">
                  <div className="flex items-center justify-between px-4 py-2 border-b">
                    <span className="text-sm font-semibold">Notifications</span>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                        No notifications yet
                      </p>
                    ) : (
                      notifications.slice(0, 10).map((n) => (
                        <Link
                          key={n.id}
                          href={n.linkUrl || "#"}
                          className={`block px-4 py-3 text-sm hover:bg-accent/5 transition-colors ${
                            !n.read ? "bg-accent/5 border-l-2 border-accent" : ""
                          }`}
                        >
                          <p className="font-medium">{n.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                            {n.message}
                          </p>
                        </Link>
                      ))
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar fallback="U" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <div className="px-3 py-2 border-b">
                    <p className="text-sm font-medium">
                      {session?.user?.firstName} {session?.user?.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {session?.user?.email}
                    </p>
                  </div>
                  <DropdownMenuItem>
                    <a href="/settings">Settings</a>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
                Sign out
              </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="default" size="sm">Sign In</Button>
            </Link>
          </div>
        )}
      </nav>

      {session && mobileMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <ul className="space-y-1 px-4 py-3">
            {navItems.map((item) => {
              const enabled = canShowItem(item);
              return (
                <li key={item.href}>
                  <Link
                    href={enabled ? item.href : "#"}
                    onClick={(e: React.MouseEvent) => {
                      handleNavClick(e, item);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${
                      pathname.startsWith(item.href)
                        ? "bg-accent/10 text-accent"
                        : "text-muted-foreground"
                    } ${!enabled ? "opacity-50" : ""}`}
                  >
                    {item.label}
                    {!enabled && <Lock className="h-3.5 w-3.5 ml-auto" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </header>
  );
}
