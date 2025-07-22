import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

type LogoutProps = {
  onLogout: () => void;
};

export function Logout({ onLogout }: LogoutProps) {
  const navigate = useNavigate();

  useEffect(() => {
    onLogout();
    navigate("/");
  }, [navigate, onLogout]);

  return null;
}
