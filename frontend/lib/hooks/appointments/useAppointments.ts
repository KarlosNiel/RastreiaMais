import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiGet, apiPost, apiDelete } from "@/lib/api";

export function useAppointments() {
  const client = useQueryClient();

  const list = useQuery({
    queryKey: ["appointments"],
    queryFn: async () => {
      const resp = await apiGet<any>("/api/v1/appointments/appointments/");

      if (Array.isArray(resp)) return resp;
      if (resp && typeof resp === "object" && Array.isArray(resp.results)) {
        return resp.results;
      }

      return [];
    },
  });

  const create = useMutation({
    mutationFn: (payload: any) =>
      apiPost("/api/v1/appointments/appointments/", payload),
    onSuccess: () => client.invalidateQueries({ queryKey: ["appointments"] }),
  });

  const remove = useMutation({
    mutationFn: (id: number) =>
      apiDelete(`/api/v1/appointments/appointments/${id}/`),
    onSuccess: () => client.invalidateQueries({ queryKey: ["appointments"] }),
  });

  return { list, create, remove };
}
