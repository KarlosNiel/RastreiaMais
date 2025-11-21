"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiDelete } from "@/lib/api";

export function useDeleteAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      return apiDelete(`/api/v1/alerts/alerts/${id}/`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
    },
  });
}
