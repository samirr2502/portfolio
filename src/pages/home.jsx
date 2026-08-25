import { useCallback, useState } from "react";
import deployments from "../../resources/deploymentsList.json";
import experiences from "../../resources/experienceList.json";
import ScrollDeck, { scrollDeckTo } from "../components/ScrollDeck";
import FullScreenSection from "../components/FullScreenSection";
import HeroStage from "../components/HeroStage";
import AskSamirChat from "../components/AskSamirChat";
import ExperienceSection from "../components/ExperienceSection";
import ProjectsSection from "../components/ProjectsSection";
import AboutSection from "../components/AboutSection";

function Home({ onActiveSectionChange }) {
  const featured = deployments.filter((d) => d.featured);
  const [active, setActive] = useState("home");
  const [focusProjectId, setFocusProjectId] = useState(null);

  const handleActive = useCallback(
    (id) => {
      setActive(id);
      onActiveSectionChange?.(id);
    },
    [onActiveSectionChange]
  );

  const handleFeaturedProjectClick = useCallback((projectId) => {
    setFocusProjectId(projectId);
    scrollDeckTo("projects");
  }, []);

  const clearFocusProject = useCallback(() => {
    setFocusProjectId(null);
  }, []);

  return (
    <ScrollDeck onActiveChange={handleActive}>
      <FullScreenSection id="home" nextId="experience" nextLabel="Experience" className="section-home">
        <HeroStage featured={featured} onFeaturedProjectClick={handleFeaturedProjectClick} />
        <AskSamirChat />
      </FullScreenSection>

      <FullScreenSection
        id="experience"
        nextId="projects"
        nextLabel="Projects"
        className="section-experience"
      >
        <ExperienceSection
          experiences={experiences}
          onFeaturedProjectClick={handleFeaturedProjectClick}
        />
      </FullScreenSection>

      <FullScreenSection
        id="projects"
        nextId="about"
        nextLabel="About"
        className="section-projects"
      >
        <ProjectsSection
          focusProjectId={focusProjectId}
          onFocusHandled={clearFocusProject}
        />
      </FullScreenSection>

      <FullScreenSection id="about" className="section-about">
        <AboutSection />
      </FullScreenSection>

      <span className="srOnly" aria-live="polite">
        {active}
      </span>
    </ScrollDeck>
  );
}

export default Home;
