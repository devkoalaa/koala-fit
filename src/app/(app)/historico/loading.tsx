import { Skeleton } from "@/design-system/components/Skeleton";
import { Card } from "@/design-system/components/Card";

export default function HistoricoLoading() {
  return (
    <div className="flex flex-1 flex-col gap-4 px-4 pt-6">
      <Skeleton className="h-7 w-36" />
      <Skeleton className="h-11 w-full rounded-md" />
      <div className="flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="flex items-center justify-between">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-40" />
            </div>
            <Skeleton className="h-6 w-6 rounded-full" />
          </Card>
        ))}
      </div>
    </div>
  );
}
