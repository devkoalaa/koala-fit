import { Skeleton } from "@/design-system/components/Skeleton";
import { Card } from "@/design-system/components/Card";

export default function EvolucaoLoading() {
  return (
    <div className="flex flex-1 flex-col gap-5 px-4 pt-6 pb-4">
      <Skeleton className="h-7 w-32" />
      <Skeleton className="h-11 w-full rounded-md" />
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <Skeleton className="mb-3 h-5 w-32" />
          <Skeleton className="h-28 w-full" />
        </Card>
      ))}
    </div>
  );
}
