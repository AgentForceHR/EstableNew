import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-theme-card border-t border-theme-light py-8 sm:py-10 md:py-12 px-4 sm:px-6 shadow-theme-md">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
          <div className="sm:col-span-2 md:col-span-1">
            <div className="flex items-center space-x-2 mb-3 sm:mb-4">
              <div className="w-8 h-8 bg-accent-primary rounded-lg flex items-center justify-center shadow-theme-md">
                <span className="text-theme-primary font-bold text-lg">E</span>
              </div>
              <span className="text-lg sm:text-xl font-bold text-theme-primary">Estable.app</span>
            </div>
            <p className="text-theme-tertiary text-sm leading-relaxed">
              Genera rendimientos estables en dólares digitales y protege tus ahorros de la inflación.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-3 sm:mb-4 text-theme-primary text-sm sm:text-base">Producto</h3>
            <ul className="space-y-2 text-theme-tertiary text-sm">
              <li><a href="#vaults" className="hover:text-accent-primary transition-colors inline-block min-h-[44px] flex items-center">Vaults</a></li>
              <li><a href="#como-funciona" className="hover:text-accent-primary transition-colors inline-block min-h-[44px] flex items-center">Cómo Funciona</a></li>
              <li><a href="#" className="hover:text-accent-primary transition-colors inline-block min-h-[44px] flex items-center">Seguridad</a></li>
              <li><a href="#" className="hover:text-accent-primary transition-colors inline-block min-h-[44px] flex items-center">Documentación</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3 sm:mb-4 text-theme-primary text-sm sm:text-base">Recursos</h3>
            <ul className="space-y-2 text-theme-tertiary text-sm">
              <li><a href="#faq" className="hover:text-accent-primary transition-colors inline-block min-h-[44px] flex items-center">FAQ</a></li>
              <li><a href="#" className="hover:text-accent-primary transition-colors inline-block min-h-[44px] flex items-center">Blog</a></li>
              <li><a href="#" className="hover:text-accent-primary transition-colors inline-block min-h-[44px] flex items-center">Guías</a></li>
              <li><a href="#" className="hover:text-accent-primary transition-colors inline-block min-h-[44px] flex items-center">Soporte</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3 sm:mb-4 text-theme-primary text-sm sm:text-base">Legal</h3>
            <ul className="space-y-2 text-theme-tertiary text-sm">
              <li><a href="#" className="hover:text-accent-primary transition-colors inline-block min-h-[44px] flex items-center">Términos de Uso</a></li>
              <li><a href="#" className="hover:text-accent-primary transition-colors inline-block min-h-[44px] flex items-center">Privacidad</a></li>
              <li><a href="#" className="hover:text-accent-primary transition-colors inline-block min-h-[44px] flex items-center">Disclaimer</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-theme-light pt-6 sm:pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-theme-tertiary text-sm text-center md:text-left">
            © 2024 Estable.app. Todos los derechos reservados.
          </p>
          <div className="flex space-x-6">
            <a
              href="https://x.com/Estable_app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-theme-tertiary hover:text-accent-primary transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Twitter"
            >
              <span className="sr-only">Twitter</span>
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </a>
            <a
              href="#"
              className="text-theme-tertiary hover:text-accent-primary transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Discord"
            >
              <span className="sr-only">Discord</span>
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
              </svg>
            </a>
            <a
              href="#"
              className="text-theme-tertiary hover:text-accent-primary transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Telegram"
            >
              <span className="sr-only">Telegram</span>
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Twitter Handle Section */}
        <div className="border-t border-theme-light pt-4 sm:pt-6 mt-4 sm:mt-6 text-center">
          <p className="text-theme-tertiary text-sm px-2">
            Síguenos en{' '}
            <a
              href="https://x.com/Estable_app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-primary hover:text-accent-hover transition-colors font-medium"
            >
              @Estable_app
            </a>{' '}
            para las últimas actualizaciones y noticias.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
