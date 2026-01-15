import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ReferralSystem from '../components/ReferralSystem';

const AffiliatesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-theme-primary font-sans">
      <Header />
      <main>
        <section className="py-20 px-6">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-theme-tertiary hover:text-accent-primary transition-colors mb-6"
              >
                <span>←</span>
                <span>Volver al Inicio</span>
              </Link>
              <h1 className="text-5xl font-bold mb-4 text-theme-primary">Programa de Affiliates</h1>
              <p className="text-theme-tertiary text-lg max-w-2xl mx-auto">
                Únete a nuestro programa de affiliates y gana comisiones por cada usuario que traigas a Estable.lat
              </p>
            </div>

            <div className="bg-gradient-to-r from-accent-primary/10 to-blue-500/10 border border-accent-primary/20 rounded-xl p-8 mb-12 shadow-theme-lg">
              <h2 className="text-3xl font-bold mb-6 text-center text-theme-primary">¿Cómo Funciona?</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-theme-card p-6 rounded-xl border border-theme-light shadow-theme-md">
                  <div className="text-4xl mb-4">📊</div>
                  <h3 className="text-xl font-bold mb-3 text-theme-primary">El Protocolo</h3>
                  <p className="text-theme-tertiary mb-4 leading-relaxed">
                    El protocolo cobra una comisión del 15% sobre el rendimiento generado por los usuarios
                  </p>
                  <div className="bg-accent-primary/10 border border-accent-primary/20 p-4 rounded-lg">
                    <p className="text-accent-primary font-bold">15% de fee total</p>
                    <p className="text-xs text-theme-tertiary mt-1">Sobre el rendimiento generado</p>
                  </div>
                </div>

                <div className="bg-theme-card p-6 rounded-xl border border-theme-light shadow-theme-md">
                  <div className="text-4xl mb-4">🤝</div>
                  <h3 className="text-xl font-bold mb-3 text-theme-primary">Para Affiliates</h3>
                  <p className="text-theme-tertiary mb-4 leading-relaxed">
                    Como affiliate, ganas el 5% del rendimiento generado por los usuarios que traigas
                  </p>
                  <div className="bg-accent-primary/10 border border-accent-primary/20 p-4 rounded-lg">
                    <p className="text-accent-primary font-bold">5% para ti</p>
                    <p className="text-xs text-theme-tertiary mt-1">De por vida por cada referido</p>
                  </div>
                </div>

                <div className="bg-theme-card p-6 rounded-xl border border-theme-light shadow-theme-md">
                  <div className="text-4xl mb-4">💰</div>
                  <h3 className="text-xl font-bold mb-3 text-theme-primary">Para el Protocolo</h3>
                  <p className="text-theme-tertiary mb-4 leading-relaxed">
                    El protocolo retiene el 10% restante para desarrollo y operaciones
                  </p>
                  <div className="bg-accent-primary/10 border border-accent-primary/20 p-4 rounded-lg">
                    <p className="text-accent-primary font-bold">10% para el protocolo</p>
                    <p className="text-xs text-theme-tertiary mt-1">Desarrollo y mantenimiento</p>
                  </div>
                </div>
              </div>

              <div className="bg-theme-card p-6 rounded-xl border border-theme-light shadow-theme-md">
                <h4 className="font-semibold text-accent-primary mb-4 text-center">💡 Ejemplo Práctico</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-theme-tertiary mb-4">
                      Supongamos que traes un usuario que deposita $10,000 USDC:
                    </p>
                    <ul className="space-y-2 text-sm text-theme-tertiary">
                      <li>• Depósito del usuario: <strong className="text-theme-primary">$10,000</strong></li>
                      <li>• Rendimiento anual (15% APY): <strong className="text-theme-primary">$1,500</strong></li>
                      <li>• Fee total del protocolo (15%): <strong className="text-theme-primary">$225</strong></li>
                    </ul>
                  </div>
                  <div>
                    <p className="text-theme-tertiary mb-4">
                      Distribución de la comisión:
                    </p>
                    <ul className="space-y-2 text-sm text-theme-tertiary">
                      <li>• Tu comisión como affiliate (5%): <strong className="text-accent-primary">$75/año</strong></li>
                      <li>• Para el protocolo (10%): <strong className="text-theme-primary">$150/año</strong></li>
                      <li>• Usuario recibe net: <strong className="text-theme-primary">$1,275 (12.75% APY)</strong></li>
                    </ul>
                  </div>
                </div>
                <p className="text-xs text-theme-tertiary mt-6 text-center">
                  ¡Mientras tu referido mantenga fondos depositados y genere rendimientos, tú seguirás ganando comisiones!
                </p>
              </div>
            </div>

            <div className="bg-theme-card rounded-xl border border-theme-light p-8 mb-12 shadow-theme-lg">
              <h2 className="text-3xl font-bold mb-6 text-theme-primary">Ventajas del Programa</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-4">
                  <span className="text-3xl">♾️</span>
                  <div>
                    <h3 className="font-semibold mb-2 text-theme-primary">Comisiones de Por Vida</h3>
                    <p className="text-theme-tertiary text-sm leading-relaxed">
                      Gana comisiones mientras tus referidos generen rendimientos. No hay límite de tiempo.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <span className="text-3xl">🚀</span>
                  <div>
                    <h3 className="font-semibold mb-2 text-theme-primary">Referidos Ilimitados</h3>
                    <p className="text-theme-tertiary text-sm leading-relaxed">
                      No hay límite en la cantidad de usuarios que puedes referir al protocolo.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <span className="text-3xl">💵</span>
                  <div>
                    <h3 className="font-semibold mb-2 text-theme-primary">Sin Costo de Entrada</h3>
                    <p className="text-theme-tertiary text-sm leading-relaxed">
                      Gratis unirse al programa. Solo conecta tu wallet y genera tu código único.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <span className="text-3xl">📊</span>
                  <div>
                    <h3 className="font-semibold mb-2 text-theme-primary">Dashboard en Tiempo Real</h3>
                    <p className="text-theme-tertiary text-sm leading-relaxed">
                      Ve tus comisiones acumuladas, referidos activos y estadísticas en tu panel.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <span className="text-3xl">🔒</span>
                  <div>
                    <h3 className="font-semibold mb-2 text-theme-primary">Transparente y On-Chain</h3>
                    <p className="text-theme-tertiary text-sm leading-relaxed">
                      Todas las comisiones son automáticas y verificables en la blockchain.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <span className="text-3xl">🌎</span>
                  <div>
                    <h3 className="font-semibold mb-2 text-theme-primary">Ideal para LATAM</h3>
                    <p className="text-theme-tertiary text-sm leading-relaxed">
                      Ayuda a personas en Latinoamérica a protegerse de la inflación y gana en el proceso.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-12">
              <h2 className="text-3xl font-bold mb-6 text-center text-theme-primary">Estrategias para Maximizar Comisiones</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-theme-card rounded-xl border border-theme-light p-6 shadow-theme-md">
                  <h4 className="font-semibold mb-3 text-theme-primary">📣 Dónde Promocionar</h4>
                  <ul className="space-y-2 text-sm text-theme-tertiary">
                    <li>• Grupos de WhatsApp de cripto y finanzas en LATAM</li>
                    <li>• Canales de Telegram sobre DeFi y ahorro</li>
                    <li>• Comunidades de Facebook sobre inversiones</li>
                    <li>• Twitter/X con hashtags relevantes (#DeFi #LATAM #Cripto)</li>
                    <li>• YouTube y TikTok con contenido educativo</li>
                    <li>• Tu red personal de amigos y familiares</li>
                  </ul>
                </div>

                <div className="bg-theme-card rounded-xl border border-theme-light p-6 shadow-theme-md">
                  <h4 className="font-semibold mb-3 text-theme-primary">💬 Mensaje Efectivo</h4>
                  <ul className="space-y-2 text-sm text-theme-tertiary">
                    <li>• Enfócate en el problema: la inflación en LATAM</li>
                    <li>• Explica cómo Estable.lat protege ahorros en dólares</li>
                    <li>• Destaca la seguridad: Morpho Blue auditado</li>
                    <li>• Menciona las bajas comisiones de Base Network</li>
                    <li>• Comparte testimonios y tus propios resultados</li>
                    <li>• Ofrece ayuda para que empiecen</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        <ReferralSystem />
      </main>
      <Footer />
    </div>
  );
};

export default AffiliatesPage;
