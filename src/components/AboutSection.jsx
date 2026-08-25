import { useEffect, useRef, useState } from "react";
import about from "../../resources/aboutLists.json";
import ContactIconLinks from "./ContactIconLinks";

const aboutMe = about.find((item) => item.id === "aboutme");
const company = about.find((item) => item.id === "company");
const contact = about.find((item) => item.id === "contact");

function AboutSection() {
  const [photoReady, setPhotoReady] = useState(Boolean(aboutMe?.photo));
  const [mobilePanel, setMobilePanel] = useState(0);
  const trackRef = useRef(null);

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

  const swipeHint =
    mobilePanel === 0 ? "Slide for SR2 →" : "← Slide for about me";

  return (
    <div className="aboutStage">
      <header className="aboutIntro">
        <p className="stageKicker">04 — About</p>
        <h2>{aboutMe?.headline || "The person behind SR2"}</h2>
        <p className="aboutLead">
          {aboutMe?.lead ||
            "Caribbean roots, a childhood PC, and years of building things that actually ship."}
        </p>
      </header>

      <figure className="aboutPortrait" aria-label="Portrait of Samir Rodriguez">
        {aboutMe?.photo && photoReady ? (
          <img
            src={aboutMe.photo}
            alt="Samir Rodriguez"
            className="aboutPortraitImage"
            onError={() => setPhotoReady(false)}
          />
        ) : (
          <div className="aboutPortraitPlaceholder">
            <span className="aboutPortraitInitials" aria-hidden="true">
              SR
            </span>
            <span className="aboutPortraitHint">Photo</span>
          </div>
        )}
      </figure>

      <div className="aboutPanelsCarousel">
        <div className="aboutPanelsTrack" ref={trackRef}>
          <div className="aboutPanelSlide">
            <article className="aboutPanel">
              <div className="aboutPanelBody">
                <h3>{aboutMe?.title || "Background"}</h3>
                <p>{aboutMe?.info}</p>
              </div>
              {aboutMe?.education && (
                <p className="aboutPanelMeta">{aboutMe.education}</p>
              )}
            </article>
          </div>

          <div className="aboutPanelSlide">
            <article className="aboutPanel">
              <div className="aboutPanelBody">
                <h3>{company?.title || "SR2"}</h3>
                <p>{company?.info}</p>
                {company?.info2 && <p>{company.info2}</p>}
              </div>
            </article>
          </div>
        </div>

        <p className="aboutStageSwipeHint stageSwipeHint" aria-hidden="true">
          <span className="aboutStageSwipeHintText stageSwipeHintText" key={mobilePanel}>
            {swipeHint}
          </span>
        </p>
      </div>

      <footer className="aboutReach">
        <p className="aboutReachLabel">{contact?.title || "Reach out"}</p>
        <div className="aboutReachLinks">
          {contact?.email && (
            <a href={`mailto:${contact.email}`}>{contact.email}</a>
          )}
          {contact?.phone && <span>{contact.phone}</span>}
        </div>
        <ContactIconLinks variant="compact" />
      </footer>
    </div>
  );
}

export default AboutSection;
