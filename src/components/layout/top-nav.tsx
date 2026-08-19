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
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bell,
  Lock,
  Menu,
  X,
  User,
  LayoutDashboard,
  Search,
  Target,
  FileText,
  Trophy,
  Library,
  Landmark,
  CalendarDays,
  MessageSquare,
  BarChart3,
  Users,
  Flag,
  Building2,
  Settings,
  LogOut,
  type LucideIcon,
} from "lucide-react";

type NavItem = {
  label: string;
  href: string;
  featureKey?: string;
  icon: LucideIcon;
};

const COUNSELOR_NAV_ITEMS: NavItem[] = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Student Management", href: "/students", icon: Users },
  { label: "Feature Flags", href: "/feature-flags", icon: Flag },
  { label: "Universities", href: "/universities", icon: Building2 },
  { label: "Indian Colleges and Universities", href: "/indian-colleges", icon: Landmark },
  { label: "Career Library", href: "/career-library", icon: Library },
  { label: "Calendar", href: "/calendar", icon: CalendarDays },
  { label: "Messages", href: "/messages", icon: MessageSquare },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
];

const STUDENT_NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/dashboard", icon: LayoutDashboard },
  { label: "College Finder", href: "/college-finder", featureKey: "collegeFinder", icon: Search },
  { label: "AI Odds Calculator", href: "/odds-calculator", featureKey: "aiOddsCalculator", icon: Target },
  { label: "Mock Tests", href: "/mock-tests", featureKey: "mockTests", icon: FileText },
  { label: "Scholarships", href: "/scholarships", featureKey: "scholarshipHub", icon: Trophy },
  { label: "Career Library", href: "/career-library", featureKey: "careerLibrary", icon: Library },
  { label: "Indian Colleges and Universities", href: "/indian-colleges", icon: Landmark },
  { label: "Appointments", href: "/appointments", featureKey: "appointments", icon: CalendarDays },
  { label: "Messages", href: "/messages", icon: MessageSquare },
];

const UNIVERSITY_ADMIN_NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Universities", href: "/universities", icon: Building2 },
  { label: "Indian Colleges and Universities", href: "/indian-colleges", icon: Landmark },
];

export function TopNav() {
  const pathname = usePathname();
  const { data: session, status: authStatus } = useSession();
  const tenant = useTenant();
  const { flags } = useFeatureFlags();
  const { status } = usePresence();
  const { notifications, unreadCount, refresh: refreshNotifications } = useNotifications();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (pathname.startsWith("/auth")) return null;

  const role = session?.user?.role;
  const isCounselor = role === "COUNSELOR" || role === "SUPER_ADMIN";
  const isSuperAdmin = role === "SUPER_ADMIN";
  const isUniversityAdmin = role === "UNIVERSITY_ADMIN";
  const navItems = isUniversityAdmin ? UNIVERSITY_ADMIN_NAV_ITEMS : isCounselor ? (isSuperAdmin ? [...COUNSELOR_NAV_ITEMS, { label: "Counselors", href: "/admin/counselors", icon: Users }] : COUNSELOR_NAV_ITEMS) : STUDENT_NAV_ITEMS;

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
    if (isUniversityAdmin) return true;
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
    <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-border/60 bg-background/85 backdrop-blur-xl shadow-sm">
      <nav className="mx-auto flex h-full items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex shrink-0 items-center gap-3">
          {tenant.logoUrl ? (
            <img
              src={tenant.logoUrl}
              alt={tenant.brandName || "Brand"}
              className="h-14 w-auto max-w-[140px] object-contain"
            />
          ) : (
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-white">
              <LayoutDashboard className="h-5 w-5" />
            </span>
          )}
        </div>

        {authStatus === "authenticated" ? (
          <>
            <ul className="hidden md:flex min-w-0 flex-1 items-center justify-center gap-1 overflow-x-auto no-scrollbar">
              {navItems.map((item) => {
                const enabled = canShowItem(item);
                const isActive = pathname.startsWith(item.href);
                const Icon = item.icon;
                if (isActive) {
                  return (
                    <li key={item.href}>
                      <Link
                        href={enabled ? item.href : "#"}
                        onClick={(e: React.MouseEvent) => handleNavClick(e, item)}
                        className="relative inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium bg-gradient-to-r from-primary to-accent text-white shadow-sm"
                      >
                        <Icon className="h-4 w-4 text-white" />
                        <span className="hidden xl:inline">{item.label}</span>
                        {!enabled && <Lock className="h-3.5 w-3.5" />}
                      </Link>
                    </li>
                  );
                }
                return (
                  <li key={item.href}>
                    <Link
                      href={enabled ? item.href : "#"}
                      onClick={(e: React.MouseEvent) => handleNavClick(e, item)}
                      className={`group relative inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-all hover:shadow-sm text-muted-foreground hover:text-foreground ${
                        !enabled ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/10 text-accent transition-colors group-hover:bg-accent/20">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="hidden xl:inline">{item.label}</span>
                      {!enabled && <Lock className="h-3.5 w-3.5" />}
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="flex shrink-0 items-center gap-3 pl-2">
              <Badge
                variant="outline"
                className="hidden sm:inline-flex shrink-0 items-center gap-1.5 px-3 py-1"
              >
                <span className={`h-2 w-2 rounded-full ${currentStatus.dot}`} />
                <span className="text-xs">{currentStatus.label}</span>
              </Badge>

              <DropdownMenu onOpenChange={(open) => {
                  if (open && unreadCount > 0) {
                    fetch("/api/notifications", { method: "PATCH" }).then(() => refreshNotifications());
                  }
                }}>
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
                    {unreadCount > 0 && <span className="text-xs text-muted-foreground">{unreadCount} new</span>}
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
                          onClick={() => {
                            if (!n.read) {
                              fetch(`/api/notifications/${n.id}`, { method: "PATCH" }).then(() => refreshNotifications());
                            }
                          }}
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
                    <User className="h-5 w-5" />
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
                    <a href="/settings" className="flex items-center gap-2">
                      <Settings className="h-4 w-4 text-muted-foreground" />
                      Settings
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
                      <span className="flex items-center gap-2 text-destructive">
                        <LogOut className="h-4 w-4" />
                        Sign out
                      </span>
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
          <ul className="grid grid-cols-2 gap-2 px-4 py-3">
            {navItems.map((item) => {
              const enabled = canShowItem(item);
              const isActive = pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={enabled ? item.href : "#"}
                    onClick={(e: React.MouseEvent) => {
                      handleNavClick(e, item);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium border transition-colors ${
                      isActive
                        ? "bg-gradient-to-r from-primary to-accent text-white border-transparent shadow-sm"
                        : "border-border text-muted-foreground bg-card hover:bg-accent/5"
                    } ${!enabled ? "opacity-50" : ""}`}
                  >
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                        isActive ? "bg-white/20" : "bg-accent/10"
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-accent"}`} />
                    </span>
                    <span className="truncate">{item.label}</span>
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
