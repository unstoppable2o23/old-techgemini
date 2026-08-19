import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type StatCardProps = {
  title: string;
  value: string | number;
  icon: LucideIcon;
  hint?: string;
};

const ICON_GRADIENTS: Record<string, string> = {
  blue: "from-blue-500 to-indigo-600",
  green: "from-emerald-500 to-teal-600",
  purple: "from-violet-500 to-purple-600",
  orange: "from-orange-500 to-amber-600",
  pink: "from-pink-500 to-rose-600",
};

export function StatCard({ title, value, icon: Icon, hint }: StatCardProps) {
  const gradient =
    ICON_GRADIENTS[(title.match(/student|college/i) ? "blue" : title.match(/test/i) ? "purple" : title.match(/appointment|university/i) ? "green" : title.match(/active|standalone/i) ? "orange" : "blue")] ||
    ICON_GRADIENTS.blue;

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
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
