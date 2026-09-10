import { Skeleton } from "@/design-system/components/Skeleton";
import { Card } from "@/design-system/components/Card";

export default function WorkoutDetailLoading() {
  return (
    <div className="flex flex-1 flex-col gap-4 px-4 pt-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-40" />
      </div>
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="flex flex-col gap-3">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-16 w-full rounded-md" />
          </Card>
        ))}
      </div>
    </div>
  );
}
