import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

// Images
import Ternnova from "../assets/img/ternnova-carr.png";
import Fullcar from "../assets/img/fullcar-carr.png";
import Toxic from "../assets/img/toxic-carr.png";
import Drop from "../assets/img/drop-carr.png";
import Dream from "../assets/img/dream-carr.png";
import Megui from "../assets/img/meguiars-carr.png";
import Menzerna from "../assets/img/menzerna-carr.png";
import Vonixx from "../assets/img/vonixx-carr.png";

// Categories data
const categories = [
  {
    name: "Exteriores",
    image:
      "https://static.wixstatic.com/media/5a2c8f_301295c3d8f74fb287c3699812ba9fa9~mv2.jpg/v1/fill/w_1196,h_474,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/5a2c8f_301295c3d8f74fb287c3699812ba9fa9~mv2.jpg",
    slug: "Exteriores",
  },
  {
    name: "Interiores",
    image:
      "https://static.wixstatic.com/media/5a2c8f_f16fb69ffc1c4805bf10a304f850af93~mv2.jpg/v1/fill/w_1152,h_457,al_c,q_85,enc_auto/5a2c8f_f16fb69ffc1c4805bf10a304f850af93~mv2.jpg",
    slug: "Interiores",
  },
  {
    name: "Línea Profesional",
    image:
      "https://static.wixstatic.com/media/5a2c8f_b6f242cd8d0042688594f5474f8a3d12~mv2.jpg/v1/fill/w_1196,h_474,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/5a2c8f_b6f242cd8d0042688594f5474f8a3d12~mv2.jpg",
    slug: "Profesional",
  },
  {
    name: "Línea Industrial",
    image:
      "https://static.wixstatic.com/media/5a2c8f_2491e8debfc54edfb758ef28a9ee2bb0~mv2.jpg/v1/fill/w_1196,h_474,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/5a2c8f_2491e8debfc54edfb758ef28a9ee2bb0~mv2.jpg",
    slug: "Industrial",
  },
  {
    name: "Perfumes",
    image:
      "https://static.wixstatic.com/media/5a2c8f_060fe2e628f74b1fa4eeb7af95569662~mv2.jpg/v1/fill/w_1152,h_457,al_c,q_85,enc_auto/5a2c8f_060fe2e628f74b1fa4eeb7af95569662~mv2.jpg",
    slug: "Perfumes",
  },
];

const brands = [
  { name: "TOXIC SHINE", image: Toxic },
  { name: "FULLCAR", image: Fullcar },
  { name: "TERNNOVA", image: Ternnova },
  { name: "MENZERNA", image: Menzerna },
  { name: "MEGUIARS", image: Megui },
  { name: "VONIXX", image: Vonixx },
  { name: "DROP", image: Drop },
  { name: "DREAM", image: Dream },
];

function BrandCard({ brand }) {
  return (
    <div className="group relative flex flex-col items-center justify-center p-6 bg-gray-900/50 rounded-2xl border border-white/5 hover:border-yellow-400/30 transition-all duration-300 hover:shadow-xl hover:shadow-yellow-400/10">
      <div className="relative w-32 h-20 mb-3 flex items-center justify-center">
        <img
          src={brand.image}
          alt={brand.name}
          className="max-w-full max-h-full object-contain grayscale group-hover:grayscale-0 transition-all duration-300 group-hover:scale-110"
        />
      </div>
      <span className="text-sm font-semibold text-white/70 group-hover:text-yellow-400 transition-colors">
        {brand.name}
      </span>
    </div>
  );
}

function CategoryCard({ category }) {
  return (
    <Link
      to={`/productos?categoria=${category.slug}`}
      className="group relative overflow-hidden rounded-2xl aspect-[4/3]"
    >
      <img
        src={category.image}
        alt={category.name}
        className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-transparent" />
      <div className="absolute inset-0 flex items-end justify-center pb-6 px-4">
        <div className="text-center">
          <h3 className="text-xl font-bold text-white mb-1 transform translate-y-0 group-hover:translate-y-0 transition-transform">
            {category.name}
          </h3>
          <span className="inline-block text-sm text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Ver productos →
          </span>
        </div>
      </div>
    </Link>
  );
}

function HomePage() {
  const brandsSwiperRef = useRef(null);

  return (
    <div className="min-h-screen bg-gray-950 pt-20 lg:pt-24">
      {/* Hero Section - Brands Carousel */}
      <section className="py-12 lg:py-16 bg-gradient-to-b from-gray-900 to-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-10">
            <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2">
              Marcas con las que trabajamos
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-yellow-600 mx-auto rounded-full" />
          </div>

          {/* Brands Swiper */}
          <Swiper
            ref={brandsSwiperRef}
            modules={[Autoplay, Navigation, Pagination]}
            slidesPerView={2}
            spaceBetween={16}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
            }}
            navigation
            pagination={{ clickable: true }}
            breakpoints={{
              480: {
                slidesPerView: 3,
                spaceBetween: 20,
              },
              768: {
                slidesPerView: 4,
                spaceBetween: 24,
              },
              1024: {
                slidesPerView: 5,
                spaceBetween: 28,
              },
              1280: {
                slidesPerView: 6,
                spaceBetween: 32,
              },
            }}
            className="brands-swiper"
          >
            {brands.map((brand, index) => (
              <SwiperSlide key={index}>
                <BrandCard brand={brand} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 lg:py-16 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-10">
            <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2">
              Categorías
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-yellow-600 mx-auto rounded-full" />
            <p className="mt-3 text-white/60 max-w-2xl mx-auto">
              Explora nuestra amplia variedad de productos para el cuidado de tu
              vehículo
            </p>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 lg:gap-6">
            {categories.map((category, index) => (
              <CategoryCard key={index} category={category} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-yellow-500/10 via-yellow-600/5 to-yellow-500/10 border-t border-white/5">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl lg:text-3xl font-bold text-white mb-4">
            ¿No encontrás lo que buscás?
          </h2>
          <p className="text-white/70 mb-8 max-w-xl mx-auto">
            Contamos con más productos disponibles. No dudes en contactarnos
            para consultas específicas.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/productos"
              className="inline-flex items-center justify-center px-8 py-3 bg-yellow-500 hover:bg-yellow-400 text-white hover:text-white font-semibold rounded-full transition-all duration-200 hover:shadow-lg hover:shadow-yellow-500/25"
            >
              Ver todos los productos
            </Link>
            <Link
              to="/contactanos"
              className="inline-flex items-center justify-center px-8 py-3 border-2 border-white/20 hover:border-white/40 text-white font-semibold rounded-full transition-all duration-200"
            >
              Contactános
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
