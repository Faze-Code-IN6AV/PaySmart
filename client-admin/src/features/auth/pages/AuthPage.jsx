import { useState } from "react";
import { LoginForm } from "../components/LoginForm.jsx";
import { ForgotPassword } from "../components/ForgotPassword.jsx";
import { RegisterForm } from "../components/Register.jsx";

export const AuthPage = () => {
  const [view, setView] = useState("login"); 

  const titles = {
    login: "Iniciar Sesión",
    forgot: "Recuperar contraseña",
    register: "Crear cuenta",
  };

  const subtitles = {
    login: "Ingresa tus credenciales de Admin",
    forgot: "Ingresa tu correo para recuperar la contraseña",
    register: "Completa los datos para registrarte",
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "#0B1830" }}>
      <div className="w-full max-w-xl rounded-xl shadow-lg p-6 md:p-10" style={{ backgroundColor: "#162C5F", border: "1px solid #41D2F2" }}>
        <div className="flex justify-center mb-6">
          <img
            src="/src/assets/img/paysmart_logo.png"
            alt="Logo"
            className="h-20 w-auto"
          />
        </div>

        <div className="text-center mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold mb-2" style={{ color: "#FFFFFF" }}>
            {titles[view]}
          </h1>
          <p className="text-base max-w-md mx-auto" style={{ color: "#41D2F2" }}>
            {subtitles[view]}
          </p>
        </div>

        {view === "login" && (
          <>
            <LoginForm onForgot={() => setView("forgot")} />
            <p className="text-center text-sm text-white mt-4">
              ¿No tienes usuario?{" "}
              <button
                type="button"
                onClick={() => setView("register")}
                className="text-center hover:underline hover:cursor-pointer text-sm text-white mt-4"
              >
                
                Regístrate aquí
              </button>
            </p>
          </>
        )}

        {view === "forgot" && (
          <ForgotPassword onSwitch={() => setView("login")} />
        )}

        {view === "register" && (
          <RegisterForm onSwitch={() => setView("login")} />
        )}
      </div>
    </div>
  );
};