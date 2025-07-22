

const GradientTitle = () => (
  <h1
    className="font-bold select-none text-lg sm:text-xl"
    style={{
      background: `
        linear-gradient(100deg,rgb(3, 70, 109),rgb(75, 205, 196)), 
        linear-gradient(135deg, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0) 50%, rgba(255,255,255,0.3) 90%)
      `,
      backgroundBlendMode: "screen",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      textShadow: `
        0 4px 6px rgba(0, 0, 0, 0.4),
        0 8px 12px rgba(0, 0, 0, 0.3)
      `,
    }}
  >
    TravelSafe
  </h1>
);

export default GradientTitle;
