import { Check } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RightsGridProps {
  rights: string[];
}

export function RightsGrid({ rights }: RightsGridProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Rights</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2">
          {rights.map((right, index) => (
            <div
              key={index}
              className="flex items-start gap-2 rounded-lg border p-3 transition-colors hover:bg-muted/50"
            >
              <Check className="mt-0.5 h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">{right}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
