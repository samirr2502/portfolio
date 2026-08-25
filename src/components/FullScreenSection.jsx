import { scrollDeckTo } from "./ScrollDeck";

function ScrollCue({ nextId, nextLabel }) {
  if (!nextId || !nextLabel) return null;

  return (
    <a
      className="scrollCue"
      href={`#${nextId}`}
      aria-label={`Scroll to ${nextLabel}`}
      onClick={(event) => {
        event.preventDefault();
        scrollDeckTo(nextId);
      }}
    >
      <span className="scrollCueLabel">scroll for {nextLabel}</span>
      <span className="scrollCueArrow" aria-hidden="true">
        ↓
      </span>
    </a>
  );
}

function FullScreenSection({ id, nextId, nextLabel, children, className = "" }) {
  return (
    <section id={id} className={`fullScreenSection ${className}`.trim()}>
      <div className="fullScreenInner">{children}</div>
      <ScrollCue nextId={nextId} nextLabel={nextLabel} />
    </section>
  );
}

export default FullScreenSection;
export { ScrollCue };
