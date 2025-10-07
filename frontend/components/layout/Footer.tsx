export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      role="contentinfo"
      className="mt-10 border-t border-divider bg-content1"
    >
      <div className="container-app py-6 text-center text-sm text-foreground/60">
        © {year} Rastreia+. Todos os direitos reservados.
      </div>
    </footer>
  );
}
