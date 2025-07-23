import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface AuthContextType {
  token: string | null;
  userEmail: string | null;
  role: string | null;
  setToken: (token: string | null) => void;
  setUserEmail: (email: string | null) => void;
  setRole: (role: string | null) => void;
  logout: () => void;
}

// Export nominativo AuthContext
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(localStorage.getItem("token"));
  const [userEmail, setUserEmailState] = useState<string | null>(localStorage.getItem("userEmail"));
  const [role, setRoleState] = useState<string | null>(localStorage.getItem("role"));

  useEffect(() => {
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");

    if (userEmail) localStorage.setItem("userEmail", userEmail);
    else localStorage.removeItem("userEmail");

    if (role) localStorage.setItem("role", role);
    else localStorage.removeItem("role");
  }, [token, userEmail, role]);

  const setToken = (token: string | null) => setTokenState(token);
  const setUserEmail = (email: string | null) => setUserEmailState(email);
  const setRole = (role: string | null) => setRoleState(role);

  const logout = () => {
    setTokenState(null);
    setUserEmailState(null);
    setRoleState(null);
    localStorage.clear();
  };

  return (
    <AuthContext.Provider value={{ token, userEmail, role, setToken, setUserEmail, setRole, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook custom per consumare AuthContext più facilmente
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve essere usato dentro AuthProvider");
  }
  return context;
}
