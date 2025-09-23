// frontend/app/not-found.tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <main
      role="main"
      aria-label="Página não encontrada"
      className="container-app grid min-h-svh md:min-h-dvh place-items-center py-8"
    >
      <div className="w-full max-w-md text-center stack-6">
        <h1 className="ty-h2 md:ty-title">Página não encontrada</h1>
        <p className="ty-meta text-foreground/60">
          O recurso que você tentou acessar não existe ou foi movido.
        </p>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center rounded-xl px-4 py-2 bg-brand-primary text-white"
          >
            Voltar para a Home
          </Link>
        </div>
      </div>
    </main>
  );
}
