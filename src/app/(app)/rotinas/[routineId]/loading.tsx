import { Skeleton } from "@/design-system/components/Skeleton";
import { Card } from "@/design-system/components/Card";

export default function RoutineDetailLoading() {
  return (
    <div className="flex flex-1 flex-col gap-4 px-4 pt-6">
      <Skeleton className="h-11 w-full rounded-md" />
      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-6 w-20" />
            </div>
            <Skeleton className="h-16 w-full rounded-md" />
          </Card>
        ))}
      </div>
      <Skeleton className="h-14 w-full rounded-md" />
    </div>
  );
}
