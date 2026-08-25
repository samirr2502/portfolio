import { useEffect, useRef } from "react";

function TechBackground({ isHeroChrome = false }) {
  const layerRef = useRef(null);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;

    const onMove = (event) => {
      const x = (event.clientX / window.innerWidth - 0.5) * 2;
      const y = (event.clientY / window.innerHeight - 0.5) * 2;
      layer.style.setProperty("--parallax-x", `${x * 12}px`);
      layer.style.setProperty("--parallax-y", `${y * 10}px`);
      layer.style.setProperty("--spot-x", `${event.clientX}px`);
      layer.style.setProperty("--spot-y", `${event.clientY}px`);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <div
      className={`techBackground ${isHeroChrome ? "is-hero" : "is-scrolled"}`}
      ref={layerRef}
      aria-hidden="true"
    >
      <div className="techGrid" />
      <div className="techCircuit techCircuit--tl" />
      <div className="techCircuit techCircuit--br" />
      <div className="techSpot" />
    </div>
  );
}

export default TechBackground;
