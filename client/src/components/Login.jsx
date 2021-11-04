import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
//import styles from "../components/styles/styles.modules.css";
import "../components/styles/login.css"
import axios from 'axios'
import swal from "sweetalert";
import { useHistory, Link } from "react-router-dom";

export function validate(input) {
  let errors = {};
  if (!input.email) {
    errors.email = "Se Requiere un Email";
  } else if (/\S+@\S+\.\S+/.test(input.mail)) {
    errors.email = "Email inválido";
  }
  if (!input.password) {
    errors.password = "Se requiere una contraseña";
  }

  return errors;
}

const Login = () => {
  
  let history = useHistory();
  

  const [input, setInput] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({});
  const handleChange = function (e) {
    e.persist();
    setInput({
      ...input,
      [e.target.id]: e.target.value,
    });
    setErrors(
      validate({
        ...input,
        [e.target.id]: e.target.value,
      })
    );
  };

  async function handleSubmit(e) {
    e.preventDefault();
    console.log(input);
    try{
    const response = await axios.post(`http://localhost:3001/login/api/signin`,input)
    console.log("asdadsasdqwasa",response.status)
    switch (response.status) {
        case 200:
          localStorage.setItem("userInfo", JSON.stringify(response.data));
          window.location.href = "/home";
          swal("Inicio de sesion exitoso", { icon: "success" });
          break;
        case 401:
            alert("Contraseña incorrecta")
          console.log(response.data)
          swal("Not allow", { icon: "warning" });
          break;
        case 500:
          swal("Internal server error", { icon: "warning" });
          break;
        default:
          break;
    }
   }catch (error){
    swal("Credenciales Incorrectas", { icon: "warning" });
   }
    setLoading(true);
  }

  return (
    <div className="container">
      <form action="" onSubmit={handleSubmit} className="form">
        <div className="inputGroup">
          <label className="labels" htmlFor="email"></label>
          <input
            placeholder="email@yoagronomo.com"
            className="loginInput"
            type="email"
            id="email"
            value={input.email}
            onChange={handleChange}
          />
          {errors.email && <p className="error">{errors.email}</p>}
        </div>
        <div className="inputGroup">
          <label className="labels" htmlFor="password"></label>
          <input
            placeholder="Contraseña"
            className="loginInput"
            type="password"
            id="password"
            value={input.password}
            onChange={handleChange}
          />
          {errors.password && <p className="error">{errors.password}</p>}
        </div>
        <div>
          {input.password ? (
            <button type="submit" className="loginBtn">
              Login
            </button>
          ) : (
            <button type="button" className="disabledLogin">
              Login
            </button>
          )}
        </div>
        <div>
          {loading ? (
            <div>
              <img
                alt="#"
                className="loader"
                src="http://www.hadecoration.gift/public/images/ajax-loader-green.gif"
              />
              <Link to="/home">
              </Link>
            </div>
          ) : (
            <div></div>
          )}
        </div>
        <Link to="/resetpassword">
         
        </Link>
      </form>
    </div>
  );
};

export default Login;
