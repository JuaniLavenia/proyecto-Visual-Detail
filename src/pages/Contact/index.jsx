import { useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { Phone, Mail, Location, Instagram, Facebook, WhatsApp, Spinner, Check } from "../../components/common/Icons";
import "./index.css";

function Contactanos() {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    mensaje: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nombre || !formData.email || !formData.mensaje) {
      Swal.fire({
        icon: "warning",
        title: "Campos obligatorios",
        text: "Por favor completá nombre, email y mensaje",
        confirmButtonColor: "#eab308",
      });
      return;
    }

    setIsSubmitting(true);

    // Simular envío (aquí conectarías con tu backend)
    setTimeout(() => {
      Swal.fire({
        icon: "success",
        title: "Mensaje enviado",
        text: "Gracias por contactarnos. Te responderemos pronto.",
        confirmButtonColor: "#eab308",
      });
      setFormData({ nombre: "", email: "", telefono: "", mensaje: "" });
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-950 pt-20 lg:pt-24 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-b from-gray-900 to-gray-950 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-3">
            ¡Contactanos!
          </h1>
          <p className="text-white/60 max-w-xl mx-auto">
            Estamos disponibles para ayudarte. Escribinos o llamanos.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 gap-12">
          {/*lg:grid-cols-2*/}
          {/* Left Column - Contact Info & Social */}
          <div className="space-y-8">
            {/* Contact Cards */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white mb-4">
                Información de contacto
              </h2>

              {/* Phone */}
              <a
                href="tel:+543812026631"
                className="flex items-center gap-4 p-4 bg-gray-900/50 border border-white/5 rounded-xl hover:border-yellow-500/30 hover:bg-gray-800/50 transition-all group"
              >
                <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center text-yellow-400 group-hover:bg-yellow-500/20 transition-colors">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-white/50 text-sm">Teléfono</p>
                  <p className="text-white font-medium">+54 381 202 6631</p>
                </div>
              </a>

              {/* Email */}
              <a
                href="mailto:visualdetailing@gmail.com"
                className="flex items-center gap-4 p-4 bg-gray-900/50 border border-white/5 rounded-xl hover:border-yellow-500/30 hover:bg-gray-800/50 transition-all group"
              >
                <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center text-yellow-400 group-hover:bg-yellow-500/20 transition-colors">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-white/50 text-sm">Email</p>
                  <p className="text-white font-medium">
                    visualdetailing@gmail.com
                  </p>
                </div>
              </a>

              {/* Location */}
              <div className="flex items-center gap-4 p-4 bg-gray-900/50 border border-white/5 rounded-xl">
                <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center text-yellow-400">
                  <Location className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-white/50 text-sm">Ubicación</p>
                  <p className="text-white font-medium">Tucumán, Argentina</p>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">
                Nuestras redes
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Instagram */}
                <a
                  href="https://www.instagram.com/visualdetailing_/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-3 p-5 bg-gray-900/50 border border-white/5 rounded-xl hover:border-pink-500/30 hover:bg-gray-800/50 transition-all group"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center text-white">
                    <Instagram className="w-6 h-6" />
                  </div>
                  <span className="text-white font-medium">Instagram</span>
                </a>

                {/* Facebook */}
                <a
                  href="https://www.facebook.com/visualdetailin"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-3 p-5 bg-gray-900/50 border border-white/5 rounded-xl hover:border-blue-500/30 hover:bg-gray-800/50 transition-all group"
                >
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                    <Facebook className="w-6 h-6" />
                  </div>
                  <span className="text-white font-medium">Facebook</span>
                </a>

                {/* WhatsApp */}
                <a
                  href="https://wa.me/+543812026631"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-3 p-5 bg-gray-900/50 border border-white/5 rounded-xl hover:border-green-500/30 hover:bg-gray-800/50 transition-all group"
                >
                  <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center text-white">
                    <WhatsApp className="w-6 h-6" />
                  </div>
                  <span className="text-white font-medium">WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
          {/* Right Column - Contact Form */}
          {/* <div className="bg-gray-900/50 border border-white/5 rounded-2xl p-8">
            <h2 className="text-xl font-semibold text-white mb-6">
              Envianos un mensaje
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-white/70 text-sm mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  placeholder="Tu nombre"
                  className="w-full px-4 py-3 bg-gray-800/50 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-yellow-500/50 focus:bg-gray-800 transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/70 text-sm mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="tu@email.com"
                    className="w-full px-4 py-3 bg-gray-800/50 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-yellow-500/50 focus:bg-gray-800 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-white/70 text-sm mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    placeholder="+54 9..."
                    className="w-full px-4 py-3 bg-gray-800/50 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-yellow-500/50 focus:bg-gray-800 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/70 text-sm mb-2">
                  Mensaje *
                </label>
                <textarea
                  name="mensaje"
                  value={formData.mensaje}
                  onChange={handleChange}
                  rows={5}
                  placeholder="¿En qué podemos ayudarte?"
                  className="w-full px-4 py-3 bg-gray-800/50 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-yellow-500/50 focus:bg-gray-800 transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-semibold rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-yellow-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Spinner className="w-5 h-5" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Enviar Mensaje
                  </>
                )}
                        d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                      />
                    </svg>
                    Enviar mensaje
                  </>
                )}
              </button>
            </form>
          </div> */}
        </div>
      </div>
    </div>
  );
}

export default Contactanos;
