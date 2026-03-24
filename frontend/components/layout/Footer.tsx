// frontend/components/layout/Footer.tsx
import Image from "next/image";
import Link from "next/link";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
      id="sobre"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl font-bold text-primary tracking-tight">
                RastreiaCardio
              </span>
            </div>
            <div className="w-[80%]">
              <p className="text-md text-gray-600 dark:text-gray-400">
                Gestão inteligente de saúde para UBS e APS
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3 text-gray-800 dark:text-gray-100">
              Plataforma
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  className="text-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                  href="#"
                >
                  Recursos
                </Link>
              </li>
              <li>
                <Link
                  className="text-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                  href="#"
                >
                  Segurança
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3 text-gray-800 dark:text-gray-100">
              Suporte
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  className="text-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                  href="#"
                >
                  Documentação
                </Link>
              </li>
              <li>
                <Link
                  className="text-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                  href="#"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  className="text-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                  href="#"
                >
                  Contato
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3 text-gray-800 dark:text-gray-100">
              Legal
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  className="text-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                  href="#"
                >
                  Privacidade
                </Link>
              </li>
              <li>
                <Link
                  className="text-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                  href="#"
                >
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link
                  className="text-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                  href="#"
                >
                  LGPD
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            © {currentYear} Rastreia+. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};
