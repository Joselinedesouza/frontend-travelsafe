import { createContext, useState } from "react";
import type { ReactNode } from "react";

interface AuthContextType {
  token: string | null;
  setToken: (token: string | null) => void;
  userEmail: string | null;
  setUserEmail: (email: string | null) => void;
  role: string | null;
  setRole: (role: string | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [userEmail, setUserEmail] = useState<string | null>(localStorage.getItem("userEmail"));
  const [role, setRole] = useState<string | null>(localStorage.getItem("role"));

  const logout = () => {
    setToken(null);
    setUserEmail(null);
    setRole(null);
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider value={{ token, setToken, userEmail, setUserEmail, role, setRole, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; // esporta solo context qui
