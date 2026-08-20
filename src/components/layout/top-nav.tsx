"use client";

import { useState, useEffect } from "react";
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
  color: string;
  grad: string;
};

const COUNSELOR_NAV_ITEMS: NavItem[] = [
  { label: "Student Management", href: "/students", icon: Users, color: "text-emerald-600", grad: "from-emerald-500 to-teal-600" },
  { label: "Universities", href: "/universities", icon: Building2, color: "text-blue-600", grad: "from-blue-500 to-indigo-600" },
  { label: "Indian Colleges and Universities", href: "/indian-colleges", icon: Landmark, color: "text-violet-600", grad: "from-violet-500 to-purple-600" },
  { label: "Career Library", href: "/career-library", icon: Library, color: "text-rose-600", grad: "from-rose-500 to-pink-600" },
  { label: "Calendar", href: "/calendar", icon: CalendarDays, color: "text-orange-600", grad: "from-orange-500 to-red-500" },
  { label: "Messages", href: "/messages", icon: MessageSquare, color: "text-cyan-600", grad: "from-cyan-500 to-teal-600" },
  { label: "Analytics", href: "/analytics", icon: BarChart3, color: "text-teal-600", grad: "from-teal-500 to-emerald-600" },
];

const STUDENT_NAV_ITEMS: NavItem[] = [
  { label: "College Finder", href: "/college-finder", featureKey: "collegeFinder", icon: Search, color: "text-blue-600", grad: "from-blue-500 to-cyan-600" },
  { label: "AI Odds Calculator", href: "/odds-calculator", featureKey: "aiOddsCalculator", icon: Target, color: "text-emerald-600", grad: "from-emerald-500 to-teal-600" },
  { label: "Mock Tests", href: "/mock-tests", featureKey: "mockTests", icon: FileText, color: "text-amber-600", grad: "from-amber-400 to-orange-600" },
  { label: "Scholarships", href: "/scholarships", featureKey: "scholarshipHub", icon: Trophy, color: "text-yellow-600", grad: "from-yellow-400 to-amber-600" },
  { label: "Career Library", href: "/career-library", featureKey: "careerLibrary", icon: Library, color: "text-rose-600", grad: "from-rose-500 to-pink-600" },
  { label: "Indian Colleges and Universities", href: "/indian-colleges", icon: Landmark, color: "text-violet-600", grad: "from-violet-500 to-purple-600" },
  { label: "Appointments", href: "/appointments", featureKey: "appointments", icon: CalendarDays, color: "text-orange-600", grad: "from-orange-500 to-red-500" },
  { label: "Messages", href: "/messages", icon: MessageSquare, color: "text-cyan-600", grad: "from-cyan-500 to-teal-600" },
];

const UNIVERSITY_ADMIN_NAV_ITEMS: NavItem[] = [
  { label: "Universities", href: "/universities", icon: Building2, color: "text-blue-600", grad: "from-blue-500 to-indigo-600" },
  { label: "Indian Colleges and Universities", href: "/indian-colleges", icon: Landmark, color: "text-violet-600", grad: "from-violet-500 to-purple-600" },
];

const SUPER_ADMIN_EXTRA: NavItem = {
  label: "Counselors",
  href: "/admin/counselors",
  icon: Users,
  color: "text-fuchsia-600",
  grad: "from-fuchsia-500 to-pink-600",
};

export function TopNav() {
  const pathname = usePathname();
  const { data: session, status: authStatus } = useSession();
  const tenant = useTenant();
  const { flags } = useFeatureFlags();
  const { status } = usePresence();
  const { notifications, unreadCount, refresh: refreshNotifications } = useNotifications();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (pathname.startsWith("/auth")) return null;

  const role = session?.user?.role;
  const isCounselor = role === "COUNSELOR" || role === "SUPER_ADMIN";
  const isSuperAdmin = role === "SUPER_ADMIN";
  const isUniversityAdmin = role === "UNIVERSITY_ADMIN";
  const navItems = isUniversityAdmin
    ? UNIVERSITY_ADMIN_NAV_ITEMS
    : isCounselor
    ? isSuperAdmin
      ? [...COUNSELOR_NAV_ITEMS, SUPER_ADMIN_EXTRA]
      : COUNSELOR_NAV_ITEMS
    : STUDENT_NAV_ITEMS;

  const initials = `${session?.user?.firstName?.[0] || ""}${session?.user?.lastName?.[0] || ""}`.toUpperCase() || "U";

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
    <header className={`fixed top-0 left-0 right-0 z-50 h-16 border-b border-gray-200 transition-all duration-300 ${scrolled ? "bg-white/95 shadow-[0_4px_24px_rgba(15,23,42,0.08)] backdrop-blur" : "bg-white"}`}>
      <nav className="mx-auto flex h-full items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex shrink-0 items-center gap-3">
          <Link href="/dashboard" className="flex items-center">
            {tenant.logoUrl ? (
              <img
                src={tenant.logoUrl}
                alt={tenant.brandName || "Brand"}
                className="h-14 w-auto max-w-[140px] object-contain"
              />
            ) : (
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-900 text-white shadow-sm">
                <LayoutDashboard className="h-5 w-5" />
              </span>
            )}
          </Link>
        </div>

        {authStatus === "authenticated" ? (
          <>
            <ul className="hidden md:flex min-w-0 flex-1 items-center justify-center gap-1 overflow-x-auto no-scrollbar">
              {navItems.map((item) => {
                const enabled = canShowItem(item);
                const isActive = pathname.startsWith(item.href);
                if (isActive) {
                  return (
                    <li key={item.href}>
                      <Link
                        href={enabled ? item.href : "#"}
                        onClick={(e: React.MouseEvent) => handleNavClick(e, item)}
                        title={!enabled ? "Not enabled for you yet" : undefined}
                        className="group relative inline-flex shrink-0 items-center gap-1.5 px-2.5 py-2 text-sm font-semibold text-gray-900 transition-colors"
                      >
                        {item.label}
                        {!enabled && <Lock className="h-3.5 w-3.5 text-gray-400" />}
                        <span className="absolute inset-x-2 bottom-1 h-0.5 rounded-full bg-gray-900" />
                      </Link>
                    </li>
                  );
                }
                return (
                  <li key={item.href}>
                    <Link
                      href={enabled ? item.href : "#"}
                      onClick={(e: React.MouseEvent) => handleNavClick(e, item)}
                      title={!enabled ? "Not enabled for you yet" : undefined}
                      className={`group relative inline-flex shrink-0 items-center gap-1.5 px-2.5 py-2 text-sm font-medium transition-colors ${
                        enabled ? "text-gray-500 hover:text-gray-900" : "cursor-not-allowed text-gray-300"
                      }`}
                    >
                      {item.label}
                      {!enabled && <Lock className="h-3.5 w-3.5 text-gray-300" />}
                      <span className="absolute inset-x-2 bottom-1 h-0.5 scale-x-0 rounded-full bg-gray-900 transition-transform duration-300 group-hover:scale-x-100" />
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="flex shrink-0 items-center gap-2 pl-2">
              {/* Status */}
              <Badge
                variant="outline"
                className="hidden sm:inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-1 border border-gray-200 bg-white text-gray-600"
              >
                <span className="relative flex h-2 w-2">
                  <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 ${currentStatus.dot}`} />
                  <span className={`relative inline-flex h-2 w-2 rounded-full ${currentStatus.dot}`} />
                </span>
                <span className="text-xs font-medium">{currentStatus.label}</span>
              </Badge>

              {/* Notifications */}
              <DropdownMenu onOpenChange={(open) => {
                  if (open && unreadCount > 0) {
                    fetch("/api/notifications", { method: "PATCH" }).then(() => refreshNotifications());
                  }
                }}>
                <DropdownMenuTrigger>
                  <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full text-gray-600 hover:bg-gray-100 hover:text-gray-900">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm">
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

              {/* Profile */}
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <span className="flex h-9 w-9 shrink-0 cursor-pointer select-none items-center justify-center rounded-full bg-gray-900 text-sm font-bold text-white shadow-sm ring-2 ring-white transition-transform hover:scale-105">
                    {initials}
                  </span>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <div className="px-3 py-2 border-b flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-900 text-sm font-bold text-white">
                      {initials}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {session?.user?.firstName} {session?.user?.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {session?.user?.email}
                      </p>
                    </div>
                  </div>
                  {role === "STUDENT" && (
                    <DropdownMenuItem>
                      <a href="/career-preferences" className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-muted-foreground" />
                        Career Profile
                      </a>
                    </DropdownMenuItem>
                  )}
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
                className="md:hidden h-9 w-9 rounded-full text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-6">
            <Link href="/auth/login" className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900">
              Sign in
            </Link>
            <Link href="/auth/register">
              <Button size="sm" className="rounded-full bg-gray-900 px-5 text-white shadow-sm hover:bg-gray-800">
                Get started
              </Button>
            </Link>
          </div>
        )}
      </nav>

      {session && mobileMenuOpen && (
        <div className="md:hidden border-t bg-white/95">
          <ul className="grid grid-cols-2 gap-1 px-4 py-3">
            {navItems.map((item) => {
              const enabled = canShowItem(item);
              const isActive = pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={enabled ? item.href : "#"}
                    onClick={(e: React.MouseEvent) => {
                      handleNavClick(e, item);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-gray-100 text-gray-900"
                        : "text-gray-600 hover:bg-gray-50"
                    } ${!enabled ? "opacity-40" : ""}`}
                  >
                    <span className="truncate">{item.label}</span>
                    {!enabled && <Lock className="h-3.5 w-3.5 ml-auto text-gray-300" />}
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