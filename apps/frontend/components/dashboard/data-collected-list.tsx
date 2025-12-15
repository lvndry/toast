import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DataCollectedListProps {
  dataCollected: string[];
  purposes: string[];
}

export function DataCollectedList({
  dataCollected,
  purposes,
}: DataCollectedListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Collection</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="mb-2 text-sm font-semibold text-muted-foreground">
            What they collect
          </h4>
          <div className="flex flex-wrap gap-2">
            {dataCollected.map((item, index) => (
              <Badge key={index} variant="secondary">
                {item}
              </Badge>
            ))}
          </div>
        </div>
        <div>
          <h4 className="mb-2 text-sm font-semibold text-muted-foreground">
            Why they collect it
          </h4>
          <div className="flex flex-wrap gap-2">
            {purposes.map((item, index) => (
              <Badge key={index} variant="outline">
                {item}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
