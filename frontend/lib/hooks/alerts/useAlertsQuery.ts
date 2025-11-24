import { useQuery } from "@tanstack/react-query";

import { AlertProps } from "@/types/alerts";
import { apiJSON } from "@/lib/api";

export function useAlertsQuery() {
  return useQuery<AlertProps[]>({
    queryKey: ["alerts"],
    queryFn: async () => {
      const data = await apiJSON("/api/v1/alerts/alerts/", { method: "GET" });

      return data as AlertProps[];
    },
  });
}
