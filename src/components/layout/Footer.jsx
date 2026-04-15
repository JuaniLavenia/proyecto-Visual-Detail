import { Link } from "react-router-dom";
import Visual from "../../assets/img/visual.png";
import { Instagram, Facebook, WhatsApp, Location, Mail, Phone, CreditCard } from "../common/Icons";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-gradient-to-b from-gray-950 to-gray-900 border-t border-white/5">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link to="/" className="inline-block mb-4">
              <img
                src={Visual}
                alt="Visual Detailing"
                className="h-12 lg:h-14"
              />
            </Link>
            <p className="text-white/50 text-sm leading-relaxed mb-4">
              Tu tienda de confianza para productos de detallado automotriz.
              Calidad premium para tu vehículo.
            </p>
            <div className="flex items-center gap-3">
              {/* Instagram */}
              <a
                href="https://www.instagram.com/visualdetailing_/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center text-white/60 hover:bg-yellow-500/20 hover:text-yellow-400 transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              {/* Facebook */}
              <a
                href="https://www.facebook.com/visualdetailin"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center text-white/60 hover:bg-blue-500/20 hover:text-blue-400 transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              {/* WhatsApp */}
              <a
                href="https://wa.me/+543812026631"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center text-white/60 hover:bg-green-500/20 hover:text-green-400 transition-colors"
              >
                <WhatsApp className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Navegación</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/"
                  className="text-white/50 hover:text-yellow-400 transition-colors text-sm"
                >
                  Inicio
                </Link>
              </li>
              <li>
                <Link
                  to="/productos"
                  className="text-white/50 hover:text-yellow-400 transition-colors text-sm"
                >
                  Productos
                </Link>
              </li>
              <li>
                <Link
                  to="/favoritos"
                  className="text-white/50 hover:text-yellow-400 transition-colors text-sm"
                >
                  Favoritos
                </Link>
              </li>
              <li>
                <Link
                  to="/contactanos"
                  className="text-white/50 hover:text-yellow-400 transition-colors text-sm"
                >
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white font-semibold mb-4">Categorías</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/productos?category=Exteriores"
                  className="text-white/50 hover:text-yellow-400 transition-colors text-sm"
                >
                  Exteriores
                </Link>
              </li>
              <li>
                <Link
                  to="/productos?category=Interiores"
                  className="text-white/50 hover:text-yellow-400 transition-colors text-sm"
                >
                  Interiores
                </Link>
              </li>
              <li>
                <Link
                  to="/productos?category=Profesional"
                  className="text-white/50 hover:text-yellow-400 transition-colors text-sm"
                >
                  Línea Profesional
                </Link>
              </li>
              <li>
                <Link
                  to="/productos?category=Perfumes"
                  className="text-white/50 hover:text-yellow-400 transition-colors text-sm"
                >
                  Perfumes
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contacto</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Location className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <span className="text-white/50 text-sm">
                  Tucumán, Argentina
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                <a
                  href="mailto:visualdetailing@gmail.com"
                  className="text-white/50 hover:text-yellow-400 transition-colors text-sm"
                >
                  visualdetailing@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                <a
                  href="tel:+543812026631"
                  className="text-white/50 hover:text-yellow-400 transition-colors text-sm"
                >
                  +54 381 202 6631
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/30 text-sm">
              © {currentYear}{" "}
              <span className="text-white/50">Visual Detailing</span>. Todos los
              derechos reservados.
            </p>
            <div className="flex items-center gap-6">
              <span className="text-white/30 text-sm flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Todos los medios de pago
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
