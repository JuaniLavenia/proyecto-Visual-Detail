import "../header/Header";
import Visual from "../../assets/img/visual.png";

function Footer() {
  return (
    <>
      <footer className="foot w-100">
        <div className="d-flex justify-content-center text-center pt-1">
          <img src={Visual} className="imgFoot" />
        </div>
        <div className="copy text-white d-flex justify-content-center mt-3">
          <p className="fw-bold me-1">©VisualDetailing 2023</p>
          <i>- Todos los derechos reservados</i>
        </div>
      </footer>
    </>
  );
}

export default Footer;
