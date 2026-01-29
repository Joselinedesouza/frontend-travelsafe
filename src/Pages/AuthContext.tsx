import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import { registerLogout } from "../Service/authManager";

interface AuthContextType {
  token: string | null;
  userEmail: string | null;
  role: string | null;
  setToken: (token: string | null) => void;
  setUserEmail: (email: string | null) => void;
  setRole: (role: string | null) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(localStorage.getItem("token"));
  const [userEmail, setUserEmailState] = useState<string | null>(localStorage.getItem("userEmail"));
  const [role, setRoleState] = useState<string | null>(localStorage.getItem("role"));

  const setToken = (t: string | null) => setTokenState(t);
  const setUserEmail = (e: string | null) => setUserEmailState(e);
  const setRole = (r: string | null) => setRoleState(r);

  // logout stabile (useCallback) + rimuove solo chiavi auth
  const logout = useCallback(() => {
    setTokenState(null);
    setUserEmailState(null);
    setRoleState(null);

    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("role");
  }, []);

  //sync localStorage quando cambia stato
  useEffect(() => {
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");

    if (userEmail) localStorage.setItem("userEmail", userEmail);
    else localStorage.removeItem("userEmail");

    if (role) localStorage.setItem("role", role);
    else localStorage.removeItem("role");
  }, [token, userEmail, role]);

  //  registra logout una sola volta (stabile)
  useEffect(() => {
    registerLogout(logout);
  }, [logout]);

  return (
    <AuthContext.Provider value={{ token, userEmail, role, setToken, setUserEmail, setRole, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth deve essere usato dentro AuthProvider");
  return context;
}
