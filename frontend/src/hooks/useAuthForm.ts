import { useState } from "react";

export function useAuthForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [authMode, setAuthMode] = useState<"login" | "register" | "forgot">(
    "login",
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");

  return {
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
  };
}
