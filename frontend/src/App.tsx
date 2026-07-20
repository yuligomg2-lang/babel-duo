import "./App.css";
import { useState } from "react";
import { Auth } from "./components/Auth";
import type { UserProfile } from "./types";

function App() {
  // Inicializar el usuario desde localStorage (persistencia de sesión)
  const [user, setUser] = useState<UserProfile | null>(() => {
    // Obtener el usuario que tiene la sesión iniciada
    const savedUser = localStorage.getItem("babel_duo_user");

    // Si existe, convertirlo nuevamente a objeto
    if (savedUser) {
      return JSON.parse(savedUser);
    }

    // Si no existe, iniciar sin usuario autenticado
    return null;
  });

  return <Auth user={user} onUserUpdate={setUser} />;
}

export default App;
