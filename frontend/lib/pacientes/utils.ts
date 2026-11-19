// frontend/lib/pacientes/utils.ts

/**
 * Converte "sim" / "nao" / outro em boolean | null
 */
export function yesNoMaybeToBool(v?: string | null): boolean | null {
  if (!v) return null;
  if (v === "sim") return true;
  if (v === "nao") return false;

  return null;
}

/**
 * Converte boolean em "sim" | "nao" | "nao_sabe"
 */
export function boolToYesNoMaybe(
  b?: boolean | null,
): "sim" | "nao" | "nao_sabe" | undefined {
  if (b === true) return "sim";
  if (b === false) return "nao";

  return "nao_sabe";
}

/**
 * Converte boolean em "sim" | "nao" (ou undefined se nulo/indefinido)
 * Útil para campos que usam o schema SimNaoZ ("sim" | "nao").
 */
export function boolToSimNao(b?: boolean | null): "sim" | "nao" | undefined {
  if (b === true) return "sim";
  if (b === false) return "nao";

  return undefined;
}

/**
 * Mantém apenas dígitos (CPF, telefone, etc.)
 */
export function onlyDigits(s?: string | null): string {
  return (s ?? "").replace(/\D+/g, "");
}

// Gera senha no formato: LLDDDDD# (2 letras + 5 dígitos + símbolo)
// Ex.: "ba27412#", "de59023#", "li83704#", "so19485#"
const PASSWORD_SYMBOL = "#";
const PASSWORD_DIGITS = 5;

export function generateSimplePassword(): string {
  const letters = "abcdefghijklmnopqrstuvwxyz";
  const digits = "0123456789";

  // 2 letras + N dígitos
  const totalRandomSlots = 2 + PASSWORD_DIGITS;

  if (typeof window !== "undefined" && window.crypto?.getRandomValues) {
    const array = new Uint32Array(totalRandomSlots);

    window.crypto.getRandomValues(array);

    const l1 = letters[array[0] % letters.length];
    const l2 = letters[array[1] % letters.length];

    let numPart = "";

    for (let i = 2; i < totalRandomSlots; i++) {
      numPart += digits[array[i] % digits.length];
    }

    return `${l1}${l2}${numPart}${PASSWORD_SYMBOL}`;
  }

  // fallback: Math.random
  const randIndex = (max: number) => Math.floor(Math.random() * max);

  const l1 = letters[randIndex(letters.length)];
  const l2 = letters[randIndex(letters.length)];

  let numPart = "";

  for (let i = 0; i < PASSWORD_DIGITS; i++) {
    numPart += digits[randIndex(digits.length)];
  }

  return `${l1}${l2}${numPart}${PASSWORD_SYMBOL}`;
}

/**
 * Converte Date/string para "yyyy-mm-dd" (ou null se inválido)
 */
export function toDateISO(d?: Date | string | null): string | null {
  if (!d) return null;
  const dt = typeof d === "string" ? new Date(d) : d;

  if (Number.isNaN(dt.getTime())) return null;

  return dt.toISOString().slice(0, 10);
}

/**
 * Calcula idade aproximada a partir da data de nascimento
 */
export function calcAgeFromBirth(d?: Date | string | null): number | null {
  if (!d) return null;

  const dt = typeof d === "string" ? new Date(d) : d;

  if (Number.isNaN(dt.getTime())) return null;

  const now = new Date();
  let years = now.getFullYear() - dt.getFullYear();
  const m = now.getMonth() - dt.getMonth();

  if (m < 0 || (m === 0 && now.getDate() < dt.getDate())) {
    years--;
  }

  return years >= 0 ? years : 0;
}

/**
 * String opcional: trim e undefined se vazio
 */
export function optString(v: unknown): string | undefined {
  if (typeof v !== "string") return undefined;
  const s = v.trim();

  return s === "" ? undefined : s;
}

/**
 * Boolean tri-state: true/false/null
 */
export function nullableBool(v: unknown): boolean | null {
  return typeof v === "boolean" ? v : null;
}

/**
 * Converte números em formato pt-BR ("6,8", "1.500,50") ou en-US ("6.8", "1,500.50")
 * para number, retornando null quando vazio ou inválido.
 */
export function parseLocaleNumber(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value !== "string") return null;

  const trimmed = value.trim();

  if (!trimmed || !/\d/.test(trimmed)) return null;
  if (!/^[+-]?[\d.,]+$/.test(trimmed)) return null;

  const hasDot = trimmed.includes(".");
  const hasComma = trimmed.includes(",");
  let normalized = trimmed;

  if (hasDot && hasComma) {
    normalized =
      trimmed.lastIndexOf(",") > trimmed.lastIndexOf(".")
        ? trimmed.replace(/\./g, "").replace(",", ".")
        : trimmed.replace(/,/g, "");
  } else if (hasComma) {
    const commaCount = (trimmed.match(/,/g) ?? []).length;

    normalized =
      commaCount > 1 ? trimmed.replace(/,/g, "") : trimmed.replace(",", ".");
  } else if (hasDot) {
    const dotCount = (trimmed.match(/\./g) ?? []).length;

    if (dotCount > 1) {
      normalized = trimmed.replace(/\./g, "");
    }
  }

  const num = Number(normalized);

  return Number.isFinite(num) ? num : null;
}
