import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiDelete } from "@/lib/api";

export function useAppointments() {
  const client = useQueryClient();

  const list = useQuery({
    queryKey: ["appointments"],
    queryFn: () => apiGet("/api/v1/appointments/appointments/"),
  });

  const create = useMutation({
    mutationFn: (payload: any) => apiPost("/api/v1/appointments/appointments/", payload),
    onSuccess: () => client.invalidateQueries({ queryKey: ["appointments"] }),
  });

  const remove = useMutation({
    mutationFn: (id: number) => apiDelete(`/api/v1/appointments/appointments/${id}/`),
    onSuccess: () => client.invalidateQueries({ queryKey: ["appointments"] }),
  });

  return { list, create, remove };
}
