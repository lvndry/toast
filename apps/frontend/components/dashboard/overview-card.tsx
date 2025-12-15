import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getVerdictConfig } from "@/lib/verdict";

interface OverviewCardProps {
  verdict:
    | "very_user_friendly"
    | "user_friendly"
    | "moderate"
    | "pervasive"
    | "very_pervasive";
  riskScore: number;
  summary: string;
}

export function OverviewCard({
  verdict,
  riskScore,
  summary,
}: OverviewCardProps) {
  const config = getVerdictConfig(verdict);
  const Icon = config.overviewIcon;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Privacy Analysis</CardTitle>
        <Icon className={`h-4 w-4 ${config.overviewColor}`} />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className={`text-2xl font-bold ${config.overviewColor}`}>
              {config.label}
            </div>
            <Badge
              variant="outline"
              className={`${config.overviewBg} ${config.overviewColor} border-0`}
            >
              Risk: {riskScore}/10
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">{config.description}</p>
        </div>
        <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
          {summary}
        </p>
      </CardContent>
    </Card>
  );
}
