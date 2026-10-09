import { MapPin, Navigation } from "lucide-react";

// Place "Visual Detailing E Automotriz"; the embed needs no API key.
const MAP_EMBED_URL =
  "https://www.google.com/maps?q=-26.8591434,-65.1607417&z=17&output=embed";
const DIRECTIONS_URL = "https://goo.gl/maps/pyTLGSD6mtBn7HvN9";

function Location() {
  return (
    <div className="min-h-screen bg-gray-950 pt-20 lg:pt-24 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-b from-gray-900 to-gray-950 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-3">
            Ubicación
          </h1>
          <p className="text-white/60 max-w-xl mx-auto">
            Visitanos en nuestro local. Te esperamos.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        {/* Map: taller on mobile, 16:9 from sm up */}
        <div className="relative w-full aspect-[4/5] sm:aspect-video overflow-hidden rounded-xl border border-white/5 bg-gray-900/50">
          <iframe
            src={MAP_EMBED_URL}
            title="Mapa de Visual Detailing"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
            className="absolute inset-0 w-full h-full border-0"
          />
        </div>

        <div className="flex flex-col gap-4 p-4 bg-gray-900/50 border border-white/5 rounded-xl sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-12 h-12 shrink-0 bg-yellow-500/10 rounded-xl flex items-center justify-center text-yellow-400">
              <MapPin className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-white/50 text-sm">Visual Detailing</p>
              <p className="text-white font-medium">Tucumán, Argentina</p>
            </div>
          </div>

          <a
            href={DIRECTIONS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-yellow-500 text-gray-900 font-semibold rounded-xl hover:bg-yellow-400 transition-colors"
          >
            <Navigation className="w-5 h-5" />
            Cómo llegar
          </a>
        </div>
      </div>
    </div>
  );
}

export default Location;
