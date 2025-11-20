"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiJSON, apiPost } from "@/lib/api";

export function useCreateAlert() {
  const queryClient = useQueryClient();

  

  return useMutation({
    mutationFn: async (newAlert: {
      cpf: string;
      risk_level: "safe" | "moderate" | "critical";
      title: string;
      description: string;
    }) => {
        
      return apiPost("/api/v1/alerts/alerts/", newAlert);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
    },
  });
}
