"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

/** Dropdown that stores its choice in a URL search param (e.g. ?exercise=…). */
export function SearchParamSelect({
  param,
  options,
  current,
}: {
  param: string;
  options: { id: string; name: string }[];
  current: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function select(id: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set(param, id);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <select
      value={current}
      onChange={(e) => select(e.target.value)}
      className="h-11 w-full rounded-md border border-border bg-bg-elevated px-3 text-base text-text"
    >
      {options.map((o) => (
        <option key={o.id} value={o.id}>
          {o.name}
        </option>
      ))}
    </select>
  );
}
