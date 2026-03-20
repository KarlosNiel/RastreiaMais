import { useQuery } from "@tanstack/react-query";

import { meFetch, type MeResponse } from "@/lib/auth";

export function useMe() {
  return useQuery<MeResponse>({
    queryKey: ["me"],
    queryFn: meFetch,
    retry: false,
    refetchOnWindowFocus: false,
  });
}
