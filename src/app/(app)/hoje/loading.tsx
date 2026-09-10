import { Skeleton } from "@/design-system/components/Skeleton";
import { Card } from "@/design-system/components/Card";

export default function HojeLoading() {
  return (
    <div className="flex flex-1 flex-col gap-4 px-4 pt-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-7 w-56" />
      </div>

      <Card className="flex items-center gap-4">
        <Skeleton className="h-[72px] w-[72px] shrink-0 rounded-full" />
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-9 w-full" />
        </div>
      </Card>

      <Skeleton className="h-14 w-full rounded-md" />

      <Card className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-7 w-24" />
        </div>
        <Skeleton className="h-5 w-28" />
      </Card>
    </div>
  );
}
