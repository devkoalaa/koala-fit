import { Skeleton } from "@/design-system/components/Skeleton";
import { Card } from "@/design-system/components/Card";

export default function ConfiguracoesLoading() {
  return (
    <div className="flex flex-1 flex-col gap-4 px-4 pt-6 pb-4">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-56" />
      </div>
      <Card className="flex flex-col gap-4">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-12 w-full rounded-md" />
        <Skeleton className="h-11 w-full rounded-md" />
      </Card>
    </div>
  );
}
