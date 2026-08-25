import { FaEnvelope, FaGithub, FaLinkedin, FaPhone } from "react-icons/fa";
import about from "../../resources/aboutLists.json";

const contact = about.find((item) => item.id === "contact") || {};
const CONTACT_TEL = "+15416560636";

function ContactIconLinks({ variant = "hero", showSocial = true }) {
  const isHero = variant === "hero";
  const linkClass = isHero ? "btnOutline btnSm btnIcon" : "askSamirContactIcon";
  const iconSize = isHero ? 13 : 12;

  return (
    <span className={`contactIconLinks contactIconLinks--${variant}`}>
      {showSocial && contact.linkedin && (
        <a
          className={linkClass}
          href={contact.linkedin}
          target="_blank"
          rel="noreferrer"
          aria-label="LinkedIn profile"
          title="LinkedIn"
        >
          <FaLinkedin size={iconSize} aria-hidden="true" />
        </a>
      )}
      {showSocial && contact.github && (
        <a
          className={linkClass}
          href={contact.github}
          target="_blank"
          rel="noreferrer"
          aria-label="GitHub profile"
          title="GitHub"
        >
          <FaGithub size={iconSize} aria-hidden="true" />
        </a>
      )}
      <a
        className={linkClass}
        href={`tel:${CONTACT_TEL}`}
        aria-label="Call Samir"
        title={contact.phone || "Phone"}
      >
        <FaPhone size={iconSize} aria-hidden="true" />
      </a>
      {contact.email && (
        <a
          className={linkClass}
          href={`mailto:${contact.email}`}
          aria-label="Email Samir"
          title={contact.email}
        >
          <FaEnvelope size={iconSize} aria-hidden="true" />
        </a>
      )}
    </span>
  );
}

export default ContactIconLinks;
