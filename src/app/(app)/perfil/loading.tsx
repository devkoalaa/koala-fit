import { Skeleton } from "@/design-system/components/Skeleton";
import { Card } from "@/design-system/components/Card";

export default function PerfilLoading() {
  return (
    <div className="flex flex-1 flex-col gap-4 px-4 pt-6 pb-4">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-4 w-40" />
      </div>
      <Card className="flex flex-col gap-4">
        <Skeleton className="h-16 w-full rounded-md" />
        <Skeleton className="h-16 w-full rounded-md" />
        <Skeleton className="h-10 w-full rounded-md" />
      </Card>
      <Card className="flex flex-col gap-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-11 w-full rounded-md" />
      </Card>
      <Skeleton className="h-12 w-full rounded-lg" />
      <Skeleton className="h-11 w-full rounded-md" />
    </div>
  );
}
