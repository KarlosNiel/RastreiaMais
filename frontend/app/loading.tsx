// frontend/app/loading.tsx
export default function Loading() {
  return (
    <main
      aria-busy="true"
      aria-live="polite"
      className="container-app grid min-h-svh md:min-h-dvh place-items-center py-8"
      role="status"
    >
      <div className="flex flex-col items-center gap-3">
        {/* Spinner puro em SVG (sem client libs) */}
        <svg
          aria-hidden="true"
          className="size-8 animate-spin text-foreground/40"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            fill="none"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            fill="currentColor"
          />
        </svg>

        <p className="ty-meta text-foreground/60">Carregando…</p>
        <span className="sr-only">Conteúdo está sendo carregado</span>
      </div>
    </main>
  );
}
