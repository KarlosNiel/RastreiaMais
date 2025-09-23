// frontend/app/loading.tsx
export default function Loading() {
  return (
    <main
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="container-app grid min-h-svh md:min-h-dvh place-items-center py-8"
    >
      <div className="flex flex-col items-center gap-3">
        {/* Spinner puro em SVG (sem client libs) */}
        <svg
          className="size-8 animate-spin text-foreground/40"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>

        <p className="ty-meta text-foreground/60">Carregando…</p>
        <span className="sr-only">Conteúdo está sendo carregado</span>
      </div>
    </main>
  );
}
