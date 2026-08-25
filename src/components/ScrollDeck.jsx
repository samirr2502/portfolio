import { useEffect, useRef } from "react";

function ScrollDeck({ children, onActiveChange }) {
  const deckRef = useRef(null);

  useEffect(() => {
    const deck = deckRef.current;
    if (!deck || !onActiveChange) return undefined;

    const sections = deck.querySelectorAll(".fullScreenSection[id]");
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.id) onActiveChange(visible.target.id);
      },
      { root: deck, threshold: [0.45, 0.6, 0.75] }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [onActiveChange, children]);

  return (
    <div className="scrollDeck" ref={deckRef}>
      {children}
    </div>
  );
}

export const DECK_NAV_EVENT = "deck-section-nav";

export function scrollDeckTo(sectionId) {
  const target = document.getElementById(sectionId);
  if (!target) return;
  window.dispatchEvent(
    new CustomEvent(DECK_NAV_EVENT, { detail: { sectionId } })
  );
  target.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default ScrollDeck;
