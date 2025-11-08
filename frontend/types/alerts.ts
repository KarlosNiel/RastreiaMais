// ...existing code...
export interface AlertProps {
  patient?: {
    user?: {
      first_name?: string;
      last_name?: string;
    };
    cpf?: string;
  };
  risk_level?: "safe" | "moderate" | "critical";
  title?: string;
  description?: string;
  created_at?: string;
}
// ...existing code...