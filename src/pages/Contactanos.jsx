import { Col, Container, Row } from "react-bootstrap";
import { Link } from "react-router-dom";
import "./Contactanos.css";

function Contactanos() {
  return (
    <>
      <div className="contact-container">
        <Container className="contact-content">
          <h1 className="mb-5">¡Contáctanos!</h1>
          <Row className="d-flex justify-content-center align-items-center">
            <Col md={4} className="mb-4">
              <Link
                variant="outline-light"
                to="https://www.instagram.com/visualdetailing_/"
                target="_blank"
                rel="noopener noreferrer"
                className="contact-link"
              >
                <svg
                  width="30px"
                  height="30px"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  color="#000000"
                >
                  <path
                    d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z"
                    stroke="#000000"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>
                  <path
                    d="M3 16V8C3 5.23858 5.23858 3 8 3H16C18.7614 3 21 5.23858 21 8V16C21 18.7614 18.7614 21 16 21H8C5.23858 21 3 18.7614 3 16Z"
                    stroke="#000000"
                    strokeWidth="1.5"
                  ></path>
                  <path
                    d="M17.5 6.51L17.51 6.49889"
                    stroke="#000000"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>
                </svg>
                Instagram
              </Link>
            </Col>
            <Col md={4} className="mb-4">
              <Link
                variant="outline-light"
                to="https://www.facebook.com/visualdetailin"
                target="_blank"
                rel="noopener noreferrer"
                className="contact-link"
              >
                <svg
                  width="30px"
                  height="30px"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  color="#000000"
                >
                  <path
                    d="M21 8V16C21 18.7614 18.7614 21 16 21H8C5.23858 21 3 18.7614 3 16V8C3 5.23858 5.23858 3 8 3H16C18.7614 3 21 5.23858 21 8Z"
                    stroke="#000000"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>
                  <path
                    d="M11 21C11 18 11 15 11 12C11 9.8125 11.5 8 15 8"
                    stroke="#000000"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>
                  <path
                    d="M9 13H11H15"
                    stroke="#000000"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>
                </svg>
                Facebook
              </Link>
            </Col>
            <Col md={4} className="mb-4">
              <Link
                variant="outline-light"
                to="https://wa.me/+543812026631"
                target="_blank"
                rel="noopener noreferrer"
                className="contact-link"
              >
                <svg
                  width="30px"
                  height="30px"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  color="#000000"
                >
                  <path
                    d="M8 10L12 10L16 10"
                    stroke="#000000"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>
                  <path
                    d="M8 14L10 14L12 14"
                    stroke="#000000"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>
                  <path
                    d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 13.8214 2.48697 15.5291 3.33782 17L2.5 21.5L7 20.6622C8.47087 21.513 10.1786 22 12 22Z"
                    stroke="#000000"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>
                </svg>
                WhatsApp
              </Link>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
}

export default Contactanos;
