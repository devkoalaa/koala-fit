import { Skeleton } from "@/design-system/components/Skeleton";
import { Card } from "@/design-system/components/Card";

export default function RotinasLoading() {
  return (
    <div className="flex flex-1 flex-col gap-4 px-4 pt-6">
      <Skeleton className="h-7 w-28" />
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="flex items-center justify-between">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-4 w-3" />
          </Card>
        ))}
      </div>
      <Skeleton className="h-14 w-full rounded-md" />
    </div>
  );
}
