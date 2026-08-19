import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type StatCardProps = {
  title: string;
  value: string | number;
  icon: LucideIcon;
  hint?: string;
};

const ICON_GRADIENTS: Record<string, string> = {
  indigo: "from-primary to-accent",
  teal: "from-teal-500 to-emerald-600",
  amber: "from-amber-500 to-orange-600",
  rose: "from-rose-500 to-pink-600",
};

export function StatCard({ title, value, icon: Icon, hint }: StatCardProps) {
  const key = title.match(/student/i)
    ? "indigo"
    : title.match(/test/i)
      ? "amber"
      : title.match(/appointment|university/i)
        ? "teal"
        : title.match(/active|standalone/i)
          ? "rose"
          : "indigo";
  const gradient = ICON_GRADIENTS[key] || ICON_GRADIENTS.indigo;

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-sm`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
}
