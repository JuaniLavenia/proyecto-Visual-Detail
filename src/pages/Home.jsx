import "./Home.css";
import "bootstrap/dist/css/bootstrap.css";
import "glider-js/glider.min.css";
import Ternnova from "../assets/img/ternnova-carr.png";
import Fullcar from "../assets/img/fullcar-carr.png";
import Toxic from "../assets/img/toxic-carr.png";
import Drop from "../assets/img/drop-carr.png";
import Dream from "../assets/img/dream-carr.png";
import Megui from "../assets/img/meguiars-carr.png";
import Menzerna from "../assets/img/menzerna-carr.png";
import Vonixx from "../assets/img/vonixx-carr.png";
import Banner from "../components/Banner";

import { useEffect } from "react";
import Glider from "glider-js";

function HomePage() {
  useEffect(() => {
    const carouselContainer = document.querySelector(".carousel__contenedor");
    const carouselElement = carouselContainer.querySelector(".carousel__lista");

    const glider = new Glider(carouselElement, {
      slidesToShow: 1,
      slidesToScroll: 1,
      dots: ".carousel__indicadores",

      responsive: [
        {
          breakpoint: 450,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1,
          },
        },
        {
          breakpoint: 800,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1,
          },
        },
      ],
    });

    let autoplayInterval;

    const startAutoplay = () => {
      autoplayInterval = setInterval(() => {
        glider.scrollItem("next", { duration: 1 });
      }, 5000);
    };

    const stopAutoplay = () => {
      clearInterval(autoplayInterval);
    };

    carouselElement.addEventListener("glider-animated", function () {
      if (glider.slide === glider.slides.length - 1) {
        setTimeout(() => {
          glider.scrollItem(0);
        }, 5000);
      }
    });

    startAutoplay();

    return () => {
      stopAutoplay();

      glider.destroy();
    };
  }, []);
  return (
    <div className="home-page text-light row">
      <h4 className="text-center text-light pt-4">
        Marcas con las que trabajamos
      </h4>
      <div className="carousel">
        <div className="carousel__contenedor">
          <div className="carousel__lista">
            <div className="carousel__elemento">
              <img src={Toxic} alt="TOXIC SHINE" />
              <p>TOXIC SHINE</p>
            </div>
            <div className="carousel__elemento">
              <img src={Fullcar} alt="FULLCAR" />
              <p>FULLCAR</p>
            </div>
            <div className="carousel__elemento">
              <img src={Ternnova} alt="TERNNOVA" />
              <p>TERNNOVA</p>
            </div>
            <div className="carousel__elemento">
              <img src={Menzerna} alt="MENZERNA" />
              <p>MENZERNA</p>
            </div>
            <div className="carousel__elemento">
              <img src={Megui} alt="MEGUIARS" />
              <p>MEGUIARS</p>
            </div>
            <div className="carousel__elemento">
              <img src={Vonixx} alt="VONIXX" />
              <p>VONIXX</p>
            </div>
          </div>
        </div>

        <div role="tablist" className="carousel__indicadores"></div>
      </div>

      <h4 className="text-center text-light pt-4">Categorias</h4>

      <div className="divBan col d-flex text-light">
        <Banner
          imagen="https://static.wixstatic.com/media/5a2c8f_301295c3d8f74fb287c3699812ba9fa9~mv2.jpg/v1/fill/w_1196,h_474,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/5a2c8f_301295c3d8f74fb287c3699812ba9fa9~mv2.jpg"
          categoria="Exteriores"
        />
        <Banner
          imagen="https://static.wixstatic.com/media/5a2c8f_f16fb69ffc1c4805bf10a304f850af93~mv2.jpg/v1/fill/w_1152,h_457,al_c,q_85,enc_auto/5a2c8f_f16fb69ffc1c4805bf10a304f850af93~mv2.jpg"
          categoria="Interiores"
        />
        <Banner
          imagen="https://static.wixstatic.com/media/5a2c8f_b6f242cd8d0042688594f5474f8a3d12~mv2.jpg/v1/fill/w_1196,h_474,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/5a2c8f_b6f242cd8d0042688594f5474f8a3d12~mv2.jpg"
          categoria="Linea Profesional"
        />
        <Banner
          imagen="https://static.wixstatic.com/media/5a2c8f_2491e8debfc54edfb758ef28a9ee2bb0~mv2.jpg/v1/fill/w_1196,h_474,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/5a2c8f_2491e8debfc54edfb758ef28a9ee2bb0~mv2.jpg"
          categoria="Linea Industrial"
        />
        <Banner
          imagen="https://static.wixstatic.com/media/5a2c8f_060fe2e628f74b1fa4eeb7af95569662~mv2.jpg/v1/fill/w_1152,h_457,al_c,q_85,enc_auto/5a2c8f_060fe2e628f74b1fa4eeb7af95569662~mv2.jpg"
          categoria="Perfumes"
        />
      </div>
    </div>
  );
}

export default HomePage;
