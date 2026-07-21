import React, { useState } from "react";
import logo from "../assets/img/logo.png";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import ForgotPasswordForm from "./ForgotPasswordForm";
import { useAuthForm } from "../hooks/useAuthForm";
import type { UserProfile } from "../types";
import { LANGUAGES } from "../types";
import {
  Globe,
  LogIn,
  LogOut,
  User as UserIcon,
  UserPlus,
  Settings as SettingsIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AuthProps {
  user: UserProfile | null;
  onUserUpdate: (user: UserProfile | null) => void;
}

// Custom Babel Duo logo
export const BabelDuoLogo: React.FC<{ className?: string }> = ({
  className = "w-44 h-32",
}) => {
  return <img src={logo} alt="Babel Duo" className={className} />;
};

export const Auth: React.FC<AuthProps> = ({ user, onUserUpdate }) => {
  const [showSettings, setShowSettings] = useState(false);
  const [language, setLanguage] = useState(user?.language || "es");
  const [interests, setInterests] = useState(user?.interests?.join(", ") || "");

  const {
    loading,
    setLoading,
    error,
    setError,
    successMessage,
    setSuccessMessage,
    authMode,
    setAuthMode,
    email,
    setEmail,
    password,
    setPassword,
    displayName,
    setDisplayName,
  } = useAuthForm();

  /**
   * Gestiona el inicio de sesión mediante una cuenta de Google.
   * Actualmente esta función se encuentra pendiente de implementación,
   * ya que la autenticación con Firebase se integrará en una etapa posterior.
   */
  const handleGoogleSignIn = async () => {
    setError("El inicio de sesión con Google estará disponible próximamente.");
  };

  /**
   * Permite el ingreso de un usuario como invitado.
   * Crea una sesión temporal almacenando un usuario en localStorage
   * sin necesidad de registrarse en la aplicación.
   */
  const handleGuestSignIn = async () => {
    // Mostrar indicador de carga
    setLoading(true);

    // Limpiar mensajes
    setError(null);
    setSuccessMessage(null);

    try {
      // Crear un usuario invitado temporal
      const guestUser: UserProfile = {
        id: crypto.randomUUID(),
        displayName: `Invitado_${Math.floor(Math.random() * 10000)}`,
        language: "es",
        interests: [],
        isGuest: true,
        createdAt: new Date(),
      };

      // Guardar la sesión del invitado
      localStorage.setItem("babel_duo_user", JSON.stringify(guestUser));

      // Actualizar el estado de la aplicación
      onUserUpdate(guestUser);

      // Mostrar mensaje de éxito
      setSuccessMessage("Has ingresado como invitado.");
    } catch (err: any) {
      setError(err.message || "Error al ingresar como invitado.");
    } finally {
      // Ocultar indicador de carga
      setLoading(false);
    }
  };

  /**
   * Registra un nuevo usuario.
   * Valida los datos ingresados, verifica que el correo no exista
   * y almacena la información del usuario en localStorage.
   */
  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password || !displayName) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Validar formato del correo
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(email)) {
        throw { code: "auth/invalid-email" };
      }

      // Validar longitud de la contraseña
      if (password.length < 6) {
        throw { code: "auth/weak-password" };
      }

      // Obtener usuarios registrados
      const users: UserProfile[] = JSON.parse(
        localStorage.getItem("babel_duo_users") || "[]",
      );

      console.log("Usuarios registrados:", users);
      console.log("Correo ingresado:", email);

      // Normalizar el correo
      const normalizedEmail = email.trim().toLowerCase();

      // Verificar si el correo ya existe
      const userExists = users.some(
        (user) => user.email?.trim().toLowerCase() === normalizedEmail,
      );

      if (userExists) {
        throw { code: "auth/email-already-in-use" };
      }

      // Crear usuario
      const newUser: UserProfile = {
        id: crypto.randomUUID(),
        displayName,
        email: normalizedEmail,
        password,
        language: "es",
        interests: [],
        isGuest: false,
        createdAt: new Date(),
      };

      // Guardar usuario
      users.push(newUser);

      // Guardar todos los usuarios registrados
      localStorage.setItem("babel_duo_users", JSON.stringify(users));

      // Guardar el usuario que inició sesión
      localStorage.setItem("babel_duo_user", JSON.stringify(newUser));

      // Mostrar mensaje de éxito
      setSuccessMessage(
        "Cuenta creada correctamente. Ya puedes iniciar sesión.",
      );

      // Limpiar los campos del formulario
      setDisplayName("");
      setEmail("");
      setPassword("");

      // Cambiar al formulario de inicio de sesión
      setAuthMode("login");
    } catch (err: any) {
      if (err.code === "auth/email-already-in-use") {
        setError("Este correo electrónico ya está registrado.");
      } else if (err.code === "auth/weak-password") {
        setError("La contraseña debe tener al menos 6 caracteres.");
      } else if (err.code === "auth/invalid-email") {
        setError("El correo electrónico no es válido.");
      } else {
        setError(err.message || "Error al registrar la cuenta.");
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Inicia sesión con un usuario previamente registrado.
   * Valida el correo y la contraseña, comprueba las credenciales
   * y crea la sesión del usuario en localStorage.
   */
  const handleEmailSignIn = async (e: React.FormEvent) => {
    // Evitar que el formulario recargue la página
    e.preventDefault();

    // Validar que el usuario haya ingresado el correo y la contraseña
    if (!email || !password) {
      setError("Por favor ingresa tu correo y contraseña.");
      return;
    }

    // Mostrar el indicador de carga
    setLoading(true);

    // Limpiar mensajes anteriores
    setError(null);
    setSuccessMessage(null);

    try {
      // Normalizar el correo para evitar diferencias por mayúsculas o espacios
      const normalizedEmail = email.trim().toLowerCase();

      // Validar que el formato del correo sea correcto
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(normalizedEmail)) {
        throw { code: "auth/invalid-email" };
      }

      // Obtener todos los usuarios registrados desde localStorage
      const users: UserProfile[] = JSON.parse(
        localStorage.getItem("babel_duo_users") || "[]",
      );

      // Buscar el usuario por su correo electrónico
      const user = users.find(
        (user) => user.email?.trim().toLowerCase() === normalizedEmail,
      );

      // Verificar si el usuario existe
      if (!user) {
        throw { code: "auth/user-not-found" };
      }

      // Verificar que la contraseña sea correcta
      if (user.password !== password) {
        throw { code: "auth/wrong-password" };
      }

      // Guardar la sesión del usuario autenticado
      localStorage.setItem("babel_duo_user", JSON.stringify(user));

      // Actualizar el estado de la aplicación con el usuario autenticado
      onUserUpdate(user);

      // Mostrar mensaje de éxito
      setSuccessMessage("Inicio de sesión exitoso.");
    } catch (err: any) {
      // Mostrar los mensajes de error correspondientes
      if (
        err.code === "auth/user-not-found" ||
        err.code === "auth/wrong-password" ||
        err.code === "auth/invalid-credential"
      ) {
        setError("Correo electrónico o contraseña incorrectos.");
      } else if (err.code === "auth/invalid-email") {
        setError("El correo electrónico no es válido.");
      } else {
        setError(err.message || "Error al iniciar sesión.");
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Gestiona la recuperación de contraseña.
   * Esta funcionalidad se implementará cuando la aplicación
   * cuente con un servicio de autenticación y envío de correos.
   */
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Por favor ingresa tu correo electrónico.");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMessage(
        "Se ha enviado un correo para restablecer tu contraseña. Revisa tu bandeja de entrada.",
      );
      setAuthMode("login");
    } catch (err: any) {
      if (err.code === "auth/user-not-found") {
        setError("No existe una cuenta registrada con este correo.");
      } else if (err.code === "auth/invalid-email") {
        setError("El correo electrónico no es válido.");
      } else {
        setError(err.message || "Error al enviar el correo de recuperación.");
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Actualiza la configuración del perfil del usuario.
   * Guarda el idioma y los intereses seleccionados,
   * actualizando tanto la sesión actual como el listado
   * de usuarios registrados.
   */
  const handleSaveSettings = async () => {
    // Verificar que exista un usuario autenticado
    if (!user) return;

    // Mostrar indicador de carga
    setLoading(true);

    try {
      // Obtener todos los usuarios registrados
      const users: UserProfile[] = JSON.parse(
        localStorage.getItem("babel_duo_users") || "[]",
      );

      // Crear el objeto con los datos actualizados
      const updatedUser: UserProfile = {
        ...user,
        language,
        interests: interests
          .split(",")
          .map((i) => i.trim())
          .filter((i) => i !== ""),
      };

      // Buscar el usuario y actualizarlo dentro del arreglo
      const updatedUsers = users.map((registeredUser) =>
        registeredUser.id === user.id ? updatedUser : registeredUser,
      );

      // Guardar nuevamente el listado de usuarios
      localStorage.setItem("babel_duo_users", JSON.stringify(updatedUsers));

      // Actualizar la sesión del usuario
      onUserUpdate(updatedUser);

      // Cerrar el panel de configuración
      setShowSettings(false);

      // Mostrar mensaje de éxito
      setSuccessMessage("Configuración actualizada correctamente.");
    } catch (error) {
      setError(error.message || "Error al guardar cambios");
    } finally {
      // Ocultar indicador de carga
      setLoading(false);
    }
  };

  /**
   * Cierra la sesión del usuario autenticado.
   * Elimina la información de la sesión del localStorage
   * sin afectar el listado de usuarios registrados.
   */
  const handleSignOut = async () => {
    // Eliminar únicamente la sesión actual
    localStorage.removeItem("babel_duo_user");
    localStorage.removeItem("babel_duo_room_id");

    // Limpiar el estado de la aplicación
    onUserUpdate(null);

    // Volver al formulario de login
    setAuthMode("login");

    // Limpiar formulario
    setEmail("");
    setPassword("");
    setDisplayName("");

    // Limpiar mensajes
    setError(null);
    setSuccessMessage(null);
  };

  // Si no existe un usuario autenticado, mostrar la interfaz de autenticación
  if (!user) {
    return (
      <div className="w-full flex items-center justify-center min-h-[100dvh] md:min-h-0 py-6 px-4">
        {/* Contenedor principal que divide la pantalla en dos paneles */}
        <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-row min-h-[540px] border border-gray-100/90">
          {/* Panel izquierdo: Identidad visual de Babel Duo (logo, nombre y descripción) */}
          <div className="w-1/2 bg-[#071324] bg-gradient-to-br from-[#071324] via-[#0b1e38] to-[#142e54] p-4 sm:p-8 md:p-12 flex flex-col items-center justify-center text-center relative overflow-hidden border-r border-[#152a47]/30">
            {/* Efectos decorativos de fondo */}
            <div className="absolute top-[-40px] left-[-40px] w-60 h-60 rounded-full bg-[#ff6000]/12 blur-[70px] pointer-events-none animate-pulse duration-[6s]" />
            <div className="absolute bottom-[-30px] right-[-30px] w-72 h-72 rounded-full bg-[#1e4f8a]/20 blur-[90px] pointer-events-none animate-pulse duration-[8s]" />

            {/* Logo de la aplicación */}
            <div className="relative group transition-transform duration-500 hover:scale-105">
              <div className="absolute inset-x-0 -bottom-2 bg-[#ff6000]/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 h-10" />
              <BabelDuoLogo className="w-20 h-15 xs:w-24 xs:h-18 sm:w-36 sm:h-28 md:w-48 md:h-36 relative z-10 filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.12)]" />
            </div>

            {/* Nombre de la aplicación */}
            <h1 className="text-xl sm:text-2.5xl md:text-4xl font-black text-white tracking-tight font-display mt-4 mb-2 sm:mt-5 drop-shadow-md">
              Babel Duo
            </h1>

            <p className="text-[#a5b9cc] text-[10px] sm:text-xs md:text-sm max-w-[280px] leading-relaxed font-semibold mt-1">
              Communicate without barriers. Real-time translation for your
              conversations.
            </p>
          </div>

          {/* Panel derecho: Formularios de autenticación */}
          <div className="w-1/2 bg-white p-4 sm:p-8 md:p-12 flex flex-col justify-center relative min-h-[460px]">
            {/* Renderiza el formulario correspondiente según el estado de autenticación */}
            <AnimatePresence mode="wait">
              {/* Formulario de inicio de sesión */}
              {authMode === "login" && (
                <LoginForm
                  email={email}
                  password={password}
                  loading={loading}
                  error={error}
                  successMessage={successMessage}
                  setEmail={setEmail}
                  setPassword={setPassword}
                  handleEmailSignIn={handleEmailSignIn}
                  handleGoogleSignIn={handleGoogleSignIn}
                  handleGuestSignIn={handleGuestSignIn}
                  setAuthMode={setAuthMode}
                  setError={setError}
                  setSuccessMessage={setSuccessMessage}
                />
              )}

              {/* Formulario de registro */}
              {authMode === "register" && (
                <RegisterForm
                  displayName={displayName}
                  email={email}
                  password={password}
                  loading={loading}
                  error={error}
                  successMessage={successMessage}
                  setDisplayName={setDisplayName}
                  setEmail={setEmail}
                  setPassword={setPassword}
                  handleEmailSignUp={handleEmailSignUp}
                  handleGoogleSignIn={handleGoogleSignIn}
                  setAuthMode={setAuthMode}
                  setError={setError}
                  setSuccessMessage={setSuccessMessage}
                />
              )}

              {/* Formulario de recuperación de contraseña */}
              {authMode === "forgot" && (
                <ForgotPasswordForm
                  email={email}
                  loading={loading}
                  error={error}
                  successMessage={successMessage}
                  setEmail={setEmail}
                  handleForgotPassword={handleForgotPassword}
                  setAuthMode={setAuthMode}
                  setError={setError}
                  setSuccessMessage={setSuccessMessage}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar la información del usuario autenticado y las opciones de configuración
  return (
    <div className="relative">
      {/* Encabezado del usuario autenticado */}
      <div className="flex items-center gap-3 bg-white p-2.5 rounded-2xl border border-gray-200/60 shadow-sm transition-shadow hover:shadow-md">
        {/* Avatar del usuario o imagen generada automáticamente */}
        <img
          src={
            user.photoURL ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName)}&background=0a3d70&color=ffffff`
          }
          className="w-9 h-9 rounded-xl border border-gray-100 object-cover"
          alt={user.displayName}
          referrerPolicy="no-referrer"
        />

        {/* Información principal del usuario */}
        <div className="flex-1 min-w-0 text-left">
          {/* Nombre del usuario */}
          <p className="text-sm font-bold text-gray-900 truncate">
            {user.displayName}
          </p>

          {/* Idioma seleccionado y estado de invitado */}
          <div className="flex items-center gap-1.5 mt-0.5">
            {/* Idioma preferido */}
            <span className="text-[9px] bg-[#edf3f8] text-[#0a3d70] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider">
              {user.language}
            </span>

            {/* Etiqueta mostrada únicamente para usuarios invitados */}
            {user.isGuest && (
              <span className="text-[9px] bg-[#fff0eb] text-[#ff6000] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                Guest
              </span>
            )}
          </div>
        </div>

        {/* Botón para abrir o cerrar el panel de configuración */}
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-1.5 text-gray-400 hover:text-[#0a3d70] transition-colors rounded-lg hover:bg-gray-50"
          aria-label="Toggle user settings"
        >
          <SettingsIcon className="w-4.5 h-4.5" />
        </button>

        {/* Botón para cerrar la sesión del usuario */}
        <button
          onClick={handleSignOut}
          className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
          aria-label="Sign out"
        >
          <LogOut className="w-4.5 h-4.5" />
        </button>
      </div>

      {/* Panel desplegable con la configuración del perfil */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="absolute top-full right-0 mt-2.5 w-68 bg-white rounded-2xl shadow-xl border border-gray-200/80 p-4.5 z-50 text-left"
          >
            {/* Título del panel de configuración */}
            <h3 className="font-extrabold text-[#0a3d70] font-display text-sm mb-3">
              Configuración de Perfil
            </h3>

            {/* Formulario de configuración del usuario */}
            <div className="flex flex-col gap-3.5 mb-4">
              {/* Selección del idioma preferido */}
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">
                  Idioma de preferencia
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-xs bg-gray-50 focus:bg-white focus:outline-none focus:border-[#0a3d70] font-semibold text-gray-700"
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Campo para editar los intereses del usuario */}
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">
                  Intereses (Separados por coma)
                </label>
                <input
                  type="text"
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                  placeholder="Tecnología, Cine, Viajes..."
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-xs bg-gray-50/50 focus:bg-white focus:outline-none focus:border-[#0a3d70] font-semibold text-gray-700 placeholder-gray-400"
                />
              </div>
            </div>

            {/* Acciones del formulario */}
            <div className="flex gap-2">
              {/* Cerrar el panel sin guardar cambios */}
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 py-2 border border-gray-200 text-gray-500 rounded-full text-xs font-bold hover:bg-gray-50 active:scale-95 transition-all cursor-pointer text-center block"
              >
                Cancelar
              </button>

              {/* Guardar la configuración del perfil */}
              <button
                onClick={handleSaveSettings}
                disabled={loading}
                className="flex-1 py-2 bg-[#0a3d70] text-white rounded-full text-xs font-bold hover:bg-[#082a4d] active:scale-95 transition-all cursor-pointer text-center block disabled:opacity-50"
              >
                {loading ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
