import { useState } from "react";
import { FaArrowRight } from "react-icons/fa";
import { scrollDeckTo } from "./ScrollDeck";

const IMPACT_STEPS = [
  { key: "problem", label: "Problem" },
  { key: "solution", label: "Solution" },
  { key: "value", label: "Value" },
];

const MAX_TOOLS = 4;

function experienceKey(item) {
  return `${item.company || "role"}-${item.position}`;
}

function ExperienceSection({ experiences, onFeaturedProjectClick }) {
  const firstKey = experiences[0] ? experienceKey(experiences[0]) : null;
  const [activeId, setActiveId] = useState(firstKey);
  const [stageActive, setStageActive] = useState(false);

  const activeExperience =
    experiences.find((item) => experienceKey(item) === activeId) || experiences[0] || null;

  const openFeatured = (project) => {
    if (onFeaturedProjectClick) {
      onFeaturedProjectClick(project.id);
      return;
    }
    if (project.url) {
      window.open(project.url, "_blank", "noreferrer");
    }
  };

  const selectExperience = (id) => {
    setActiveId(id);
    setStageActive(true);
  };

  return (
    <div
      className={`experienceStage ${stageActive ? "is-active" : ""}`}
      onMouseEnter={() => setStageActive(true)}
      onMouseLeave={() => setStageActive(false)}
    >
      <header className="stageHeader">
        <p className="stageKicker">02 — Experience</p>
        <h2>Experience</h2>
        <p className="stageSupport">
          Roles where I ship product, lead delivery, and turn data into systems people actually use.
        </p>
      </header>

      <div className="experienceGrid">
        {experiences.map((item) => {
          const id = experienceKey(item);
          const isActive = activeId === id;
          const visibleTools = item.tools?.slice(0, MAX_TOOLS) || [];
          const hook = item.hook || item.description;

          return (
            <article
              key={id}
              className={`experienceCard${isActive ? " is-current" : ""}${
                isActive && stageActive ? " is-active" : ""
              }`}
              tabIndex={0}
              onMouseEnter={() => selectExperience(id)}
              onClick={() => selectExperience(id)}
              onFocus={() => selectExperience(id)}
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) {
                  const stage = event.currentTarget.closest(".experienceStage");
                  if (!stage?.contains(event.relatedTarget)) {
                    setStageActive(false);
                  }
                }
              }}
            >
              <div className="experienceCardTop">
                <div className="experienceTitleBlock">
                  {item.company && <p className="experienceCompany">{item.company}</p>}
                  <h3>{item.position}</h3>
                </div>
                <span className="experienceDates">
                  {item.startDate} — {item.endDate}
                </span>
              </div>

              {hook && <p className="experienceHook">{hook}</p>}

              {item.featuredProjects?.length > 0 && (
                <div className="experienceFeatured">
                  <span className="experienceFeaturedLabel">Featured</span>
                  <div className="experienceFeaturedList">
                    {item.featuredProjects.map((project) => (
                      <button
                        key={project.id}
                        type="button"
                        className="experienceFeaturedChip"
                        onClick={(event) => {
                          event.stopPropagation();
                          openFeatured(project);
                          scrollDeckTo("projects");
                        }}
                        title={`View ${project.name} in Projects`}
                      >
                        <span>{project.name}</span>
                        <FaArrowRight size={9} aria-hidden="true" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {visibleTools.length > 0 && (
                <div className="experienceTools">
                  {visibleTools.map((tool) => (
                    <span key={tool} className="item">
                      {tool}
                    </span>
                  ))}
                </div>
              )}
            </article>
          );
        })}
      </div>

      {activeExperience?.impact && (
        <div
          className={`experienceImpact ${stageActive ? "is-visible" : ""}`}
          aria-live="polite"
          key={experienceKey(activeExperience)}
        >
          <div className="experienceImpactHeader">
            <span className="experienceImpactLabel">Impact</span>
            <span className="experienceImpactRole">
              {activeExperience.company} · {activeExperience.position}
            </span>
          </div>
          <div className="experienceImpactGrid">
            {IMPACT_STEPS.map(({ key, label }) => (
              <div key={key} className="experienceImpactStep">
                <span className="experienceImpactStepLabel">{label}</span>
                <p className="experienceImpactCopy">{activeExperience.impact[key]}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ExperienceSection;
