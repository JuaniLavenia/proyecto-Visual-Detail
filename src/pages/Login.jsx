import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { AuthContext } from "../context/AuthContext";
import "./Login.css";

function Login() {
  const { login } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoginForm, setLoginForm] = useState(true);

  const [values, setValues] = useState({
    email: "",
    password: "",
  });

  const [valuesR, setValuesR] = useState({
    email: "",
    password: "",
    password_confirmation: "",
  });

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      (values.email && values.password) ||
      (valuesR.email &&
        valuesR.password &&
        valuesR.password_confirmation &&
        valuesR.password === valuesR.password_confirmation)
    ) {
      setIsLoading(true);

      let apiUrl = "";

      if (isLoginForm) {
        apiUrl = "https://visual-detail-backend.onrender.com/api/login";
        axios
          .post(apiUrl, values)
          .then((res) => {
            const { token, userId } = res.data;
            localStorage.setItem("token", token);
            login(token, userId);

            Swal.fire({
              position: "center",
              icon: "success",
              title: "Sesión iniciada",
              showConfirmButton: false,
              timer: 1500,
            });
            setValues({ email: "", password: "" });
            setValuesR({ email: "", password: "", password_confirmation: "" });
            navigate("/");
          })
          .catch((err) => {
            Swal.fire({
              icon: "error",
              title: "Oops...",
              text: "Los datos proporcionados no son correctos",
            });
          })
          .finally(() => {
            setIsLoading(false);
          });
      } else {
        apiUrl = "https://visual-detail-backend.onrender.com/api/register";

        axios
          .post(apiUrl, valuesR)
          .then((res) => {
            const { token, userId } = res.data;
            localStorage.setItem("token", token);
            login(token, userId);

            Swal.fire({
              position: "center",
              icon: "success",
              title: "Sesión iniciada",
              showConfirmButton: false,
              timer: 1500,
            });
            setValues({ email: "", password: "" });
            setValuesR({ email: "", password: "", password_confirmation: "" });
            navigate("/");
          })
          .catch((err) => {
            Swal.fire({
              icon: "error",
              title: "Oops...",
              text: "Los datos proporcionados no son correctos",
            });
          })
          .finally(() => {
            setIsLoading(false);
          });
      }
    } else {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Por favor, ingrese un correo y/o contraseña valido",
      });
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (isLoginForm) {
      setValues({
        ...values,
        [name]: value,
      });
    } else {
      setValuesR({
        ...valuesR,
        [name]: value,
      });
    }
  };

  return (
    <>
      <main className="mainDiv pt-5 w-100">
        <div className="col col-lg-4 col-md-8 col-sm-12 login">
          <h1 className="fw-bold text-center py-10 text-black">
            {isLoginForm ? "Bienvenido" : "Registro"}
          </h1>
          {isLoginForm ? (
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="email" className="form-label text-black">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  className="form-control loginInput"
                  id="emailLogin"
                  aria-describedby="emailHelp"
                  required
                  maxLength={40}
                  name="email"
                  value={values.email}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-3">
                <label
                  htmlFor="registerPassword"
                  className="form-label text-black"
                >
                  Contraseña
                </label>
                <input
                  type="password"
                  className="form-control loginInput"
                  id="PasswordLogin"
                  required
                  minLength={6}
                  maxLength={12}
                  name="password"
                  value={values.password}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-3 btnsDiv">
                <button
                  id="iniciarSesion"
                  type="submit"
                  className="btn btn-primary btn-inicio-sesion"
                  onSubmit={handleSubmit}
                  disabled={isLoading}
                >
                  {isLoading ? "Cargando..." : "Iniciar Sesión"}
                </button>
                <button
                  type="button"
                  className="btn btn-warning btn-registrarse"
                  onClick={() => setLoginForm(!isLoginForm)}
                >
                  Quiero registrarme
                </button>
                {/*
                  <button
                  type="button"
                  id="olvideContrasena"
                  className="btn btn-secondary btn-contrasena text-light"
                >
                  Olvidé mi contraseña
                </button>
          */}
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  className="form-control loginInput"
                  id="emailRegister"
                  aria-describedby="emailHelp"
                  maxLength={40}
                  required
                  name="email"
                  value={valuesR.email}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-3">
                <label
                  htmlFor="registerPassword"
                  className="form-label loginInput"
                >
                  Contraseña
                </label>
                <input
                  type="password"
                  className="form-control loginInput"
                  id="passwordRegister"
                  required
                  minLength={6}
                  maxLength={12}
                  name="password"
                  value={valuesR.password}
                  onChange={handleChange}
                />
                <label
                  htmlFor="password_confirmation"
                  className="form-label mt-3"
                >
                  Confirmar contraseña
                </label>
                <input
                  type="password"
                  className="form-control loginInput"
                  id="password_confirmation"
                  required
                  minLength={6}
                  maxLength={12}
                  name="password_confirmation"
                  value={valuesR.password_confirmation}
                  onChange={handleChange}
                />
                <div className="password_comfirmation form-text">
                  La contraseña tiene que tener entre 6 y 12 caracteres
                </div>
              </div>
              <div className="mb-3 btnsDiv">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? "Cargando..." : "Registrarse"}
                </button>
                <button
                  type="button"
                  className="btn btn-warning btn-registrarse"
                  onClick={() => setLoginForm(!isLoginForm)}
                >
                  Iniciar Sesion
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </>
  );
}

export default Login;
