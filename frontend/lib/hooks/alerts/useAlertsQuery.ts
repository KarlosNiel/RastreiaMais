import { useQuery } from "@tanstack/react-query";

import { AlertProps } from "@/types/alerts";
import { apiJSON } from "@/lib/api";

export function useAlertsQuery() {
  return useQuery<AlertProps[]>({
    queryKey: ["alerts"],
    queryFn: async () => {
      const data = await apiJSON("/api/v1/alerts/alerts/", { method: "GET" });

      if (Array.isArray(data)) return data;
      if (
        data &&
        typeof data === "object" &&
        "results" in data &&
        Array.isArray((data as any).results)
      ) {
        return (data as any).results as AlertProps[];
      }

      return [];
    },
    staleTime: 15_000,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });
}
