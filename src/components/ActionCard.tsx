import type { ReactNode } from "react";

type ActionCardProps = {
  title: string;
  subtitle: string;
  onClick: () => void;
  icon: ReactNode;
  textColor?: string;               // Colore testo (classe Tailwind)
  borderColor?: string;             // Colore bordo (classe Tailwind)
  backgroundGradient?: string;      // Gradiente sfondo di default (CSS)
  backgroundGradientHover?: string; // Gradiente sfondo hover/focus (CSS)
};

export const ActionCard = ({
  title,
  subtitle,
  onClick,
  icon,
  textColor = "text-white",
  borderColor = "border-transparent",
  backgroundGradient = "linear-gradient(90deg, #003f66, #006aab)",
  backgroundGradientHover = "linear-gradient(90deg, #00518c, #3399dd)",
}: ActionCardProps) => (
  <div
    onClick={onClick}
    className={`${textColor} ${borderColor} shadow-lg rounded-xl p-6 w-[300px] sm:w-[280px] cursor-pointer transition transform flex flex-col items-center text-center border`}
    style={{
      background: backgroundGradient,
      borderColor: borderColor.includes("border-") ? undefined : borderColor,
      
    }}
    onMouseEnter={(e) => (e.currentTarget.style.background = backgroundGradientHover)}
    onMouseLeave={(e) => (e.currentTarget.style.background = backgroundGradient)}
    onFocus={(e) => (e.currentTarget.style.background = backgroundGradientHover)}
    onBlur={(e) => (e.currentTarget.style.background = backgroundGradient)}
    tabIndex={0} 
  >
    <div className="mb-4 text-white text-3xl">{icon}</div>
    <h2 className="text-xl font-bold tracking-wide">{title}</h2>
    <p className="text-sm mt-2 text-blue-100">{subtitle}</p>
  </div>
);
