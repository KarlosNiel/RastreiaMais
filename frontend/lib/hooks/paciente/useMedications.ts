// lib/hooks/paciente/useMedications.ts
import { useQuery } from "@tanstack/react-query";
import { listMedications, type MedicationDto } from "@/lib/api/medications";

export interface MedicationCardItem {
  id: string;
  nome: string;
  obs?: string | null;
  endDate?: string | null;
  active: boolean;
}

/**
 * Transforma os dados crus da API na estrutura usada pelo card de "Medicações Atuais".
 * Aqui já filtramos só medicações ativas (e não vencidas).
 */
function mapToCardItems(items: MedicationDto[]): MedicationCardItem[] {
  const today = new Date();

  return items
    .filter((med) => med.active !== false)
    .filter((med) => {
      if (!med.end_date) return true;
      const end = new Date(med.end_date);
      if (Number.isNaN(end.getTime())) return true;
      return end >= today;
    })
    .map((med) => ({
      id: String(med.id),
      nome: med.name,
      obs: med.description ?? null,
      endDate: med.end_date ?? null,
      active: med.active !== false,
    }));
}

export function useMedications() {
  return useQuery<MedicationCardItem[]>({
    queryKey: ["medications", "current"],
    queryFn: async () => {
      try {
        const meds = await listMedications();
        return mapToCardItems(meds);
      } catch (error) {
        console.error("Erro ao buscar medicações:", error);
        return [];
      }
    },
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
    retry: (failureCount, error: any) => {
      if ((error as any)?.status === 401) return false;
      return failureCount < 2;
    },
  });
}
