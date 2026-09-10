import { Skeleton } from "@/design-system/components/Skeleton";
import { Card } from "@/design-system/components/Card";

export default function ExportarLoading() {
  return (
    <div className="flex flex-1 flex-col gap-4 px-4 pt-6 pb-4">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-7 w-28" />
        <Skeleton className="h-4 w-52" />
      </div>
      <Skeleton className="h-11 w-full rounded-md" />
      <Card>
        <Skeleton className="h-4 w-full" />
      </Card>
      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-11 w-full rounded-md" />
        ))}
      </div>
    </div>
  );
}
