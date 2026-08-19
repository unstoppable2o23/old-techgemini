import type { LucideIcon } from "lucide-react";

type PageHeaderProps = {
  icon: LucideIcon;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
};

export function PageHeader({ icon: Icon, title, description, actions, children }: PageHeaderProps) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border p-6 sm:p-8 text-white shadow-sm"
      style={{
        background:
          "linear-gradient(120deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 85% 20%, rgba(255,255,255,0.18) 0%, transparent 45%)",
        }}
      />
      <div className="pointer-events-none absolute -bottom-16 -right-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
      <div className="relative flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25">
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            {description && (
              <p className="mt-0.5 text-sm text-white/75">{description}</p>
            )}
          </div>
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      {children}
    </div>
  );
}
