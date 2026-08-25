import { useEffect, useRef, useState } from "react";
import { FaExternalLinkAlt } from "react-icons/fa";
import ContactIconLinks from "./ContactIconLinks";
import { CHAT_TRANSCRIPT_EVENT, loadChatTranscript } from "../services/chatService";

const CYCLE_MS = 4200;

function featuredPreviewImage(item) {
  return item?.imagesDesktop?.[0] || item?.imagesMobile?.[0] || null;
}

function HeroStage({ featured, onFeaturedProjectClick }) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [entered, setEntered] = useState(false);
  const [mobilePanel, setMobilePanel] = useState(0);
  const [hasChatHistory, setHasChatHistory] = useState(
    () => loadChatTranscript().length > 0
  );
  const featureRef = useRef(null);
  const trackRef = useRef(null);
  const active = featured[index] || featured[0];
  const previewImage = featuredPreviewImage(active);

  useEffect(() => {
    const enter = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(enter);
  }, []);

  useEffect(() => {
    if (featured.length < 2) return undefined;

    const mq = window.matchMedia("(max-width: 900px)");
    if (mq.matches) return undefined;

    const timer = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % featured.length);
        setVisible(true);
      }, 320);
    }, CYCLE_MS);

    return () => clearInterval(timer);
  }, [featured.length]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;

    const syncPanel = () => {
      const width = track.clientWidth;
      if (!width) return;
      setMobilePanel(Math.min(1, Math.round(track.scrollLeft / width)));
    };

    syncPanel();
    track.addEventListener("scroll", syncPanel, { passive: true });
    window.addEventListener("resize", syncPanel);
    return () => {
      track.removeEventListener("scroll", syncPanel);
      window.removeEventListener("resize", syncPanel);
    };
  }, []);

  useEffect(() => {
    const syncChatHistory = () => {
      setHasChatHistory(loadChatTranscript().length > 0);
    };

    window.addEventListener(CHAT_TRANSCRIPT_EVENT, syncChatHistory);
    return () => window.removeEventListener(CHAT_TRANSCRIPT_EVENT, syncChatHistory);
  }, []);

  useEffect(() => {
    const panel = featureRef.current;
    if (!panel) return undefined;

    const onMove = (event) => {
      const rect = panel.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      panel.style.setProperty("--tilt-x", `${(-py * 6).toFixed(2)}deg`);
      panel.style.setProperty("--tilt-y", `${(px * 8).toFixed(2)}deg`);
    };

    const onLeave = () => {
      panel.style.setProperty("--tilt-x", "2deg");
      panel.style.setProperty("--tilt-y", "-4deg");
    };

    panel.addEventListener("pointermove", onMove);
    panel.addEventListener("pointerleave", onLeave);
    return () => {
      panel.removeEventListener("pointermove", onMove);
      panel.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  const goTo = (next) => {
    if (next === index) return;
    setVisible(false);
    setTimeout(() => {
      setIndex(next);
      setVisible(true);
    }, 220);
  };

  const openFeaturedProject = () => {
    if (!active?.id) return;
    onFeaturedProjectClick?.(active.id);
  };

  const swipeHint =
    mobilePanel === 0 ? "Slide for featured projects →" : "← Slide for info";

  return (
    <div className={`heroStage ${entered ? "is-entered" : ""}`}>
      <div className="heroStageTrack" ref={trackRef}>
      <div className="heroCopy">
        <p className="heroKicker">01 — Home · Deployed systems · EC2</p>
        <h1 className="heroName" aria-label="Samir Rodriguez">
          {"Samir Rodriguez".split("").map((char, i) => (
            <span
              key={`${char}-${i}`}
              className="heroLetter"
              style={{ animationDelay: `${0.04 * i + 0.15}s` }}
            >
              {char === " " ? "\u00A0" : char}
            </span>
          ))}
        </h1>
        <p className="heroTagline">Web Developer · Software Engineer · AI Automation</p>
        <p className="heroSupport">
          Building and shipping live apps across ClearView, Construmates, Prometheus, and personal infrastructure.
        </p>
        <div className="heroActions">
          <ContactIconLinks variant="hero" />
        </div>
      </div>

      <aside className="heroFeature" ref={featureRef} aria-live="polite">
        <div className="heroFeatureMeta">
          <span>Featured</span>
          <span>
            {String(index + 1).padStart(2, "0")} / {String(featured.length).padStart(2, "0")}
          </span>
        </div>

        <div className={`heroFeatureCard ${visible ? "is-visible" : ""}`}>
          <div
            className={`heroFeaturePreview${previewImage ? " has-image" : ""}`}
            data-org={active?.org}
          >
            {previewImage ? (
              <>
                <img src={previewImage} alt="" className="heroFeaturePreviewImg" loading="lazy" />
                <span className={`heroFeatureStatusBadge status-${active?.status}`}>
                  <span className="dot" />
                  {active?.status === "healthy" ? "Healthy" : "Issue"}
                </span>
              </>
            ) : (
              <div className="heroFeaturePreviewOverlay">
                <span className="previewOrg">{active?.org}</span>
                <span className="previewName">{active?.name}</span>
                <span className={`previewStatus status-${active?.status}`}>
                  <span className="dot" />
                  {active?.status === "healthy" ? "Healthy" : "Issue"}
                </span>
              </div>
            )}
          </div>

          <div className="heroFeatureBody">
            <span className="heroFeatureOrg">{active?.org}</span>
            <h2>{active?.name}</h2>
            <p>{active?.description}</p>
            <div className="heroFeatureLinks">
              <a href={active?.url} target="_blank" rel="noreferrer" className="btnText">
                Live <FaExternalLinkAlt size={11} />
              </a>
              <button
                type="button"
                className="btnText"
                onClick={openFeaturedProject}
              >
                Details
              </button>
              <span className="envChip">{active?.env}</span>
            </div>
          </div>
        </div>

        <div className="heroFeatureDots" role="tablist" aria-label="Featured projects">
          {featured.map((item, i) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={i === index}
              className={i === index ? "is-active" : ""}
              onClick={() => goTo(i)}
              aria-label={`Show ${item.name}`}
            />
          ))}
        </div>
      </aside>
      </div>

      {!hasChatHistory && (
        <p className="heroStageSwipeHint" aria-hidden="true">
          <span className="heroStageSwipeHintText" key={mobilePanel}>
            {swipeHint}
          </span>
        </p>
      )}
    </div>
  );
}

export default HeroStage;
