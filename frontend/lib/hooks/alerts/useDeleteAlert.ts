"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiDelete } from "@/lib/api";

export function useDeleteAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      return apiDelete(`/api/v1/alerts/alerts/${id}/`, {});
    },
    onMutate: async (id: number) => {
      await queryClient.cancelQueries({ queryKey: ["alerts"] });
      const previousAlerts = queryClient.getQueryData<any[]>(["alerts"]);

      if (previousAlerts) {
        queryClient.setQueryData<any[]>(["alerts"], (old) =>
          old ? old.filter((a) => Number(a.id) !== Number(id)) : [],
        );
      }

      return { previousAlerts };
    },
    onError: (_err, _id, context) => {
      if (context?.previousAlerts) {
        queryClient.setQueryData(["alerts"], context.previousAlerts);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-kpis"] });
    },
  });
}
