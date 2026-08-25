const SECTIONS = [
  { id: "home", label: "Home" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "about", label: "About" },
];

function Header({ theme, toggleTheme, isDeck, activeSection, onSectionNav }) {
  const isHeroChrome = isDeck && activeSection === "home";

  const handleSection = (sectionId) => {
    onSectionNav?.(sectionId);
  };

  return (
    <header className={`labHeaderWrap ${isHeroChrome ? "is-hero" : "is-scrolled"}`}>
      <button
        type="button"
        className={`logo labLogo ${isHeroChrome ? "is-hero" : "is-compact"}`}
        onClick={() => handleSection("home")}
      >
        SR2
      </button>

      <nav className={`header labHeader ${isHeroChrome ? "is-hero" : "is-scrolled"}`}>
        <ul className="navLinks labHeaderNav">
          {SECTIONS.map((section) => (
            <li key={section.id}>
              <button
                type="button"
                className={isDeck && activeSection === section.id ? "is-active" : ""}
                onClick={() => handleSection(section.id)}
              >
                {section.label}
              </button>
            </li>
          ))}
        </ul>

        <div className="labHeaderActions">
          <button className="theme-toggle btnSm" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === "light" ? "Dark" : "Light"}
          </button>
        </div>
      </nav>
    </header>
  );
}

export default Header;
