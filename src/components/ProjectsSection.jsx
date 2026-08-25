import { useEffect, useMemo, useState } from "react";
import {
  FaDesktop,
  FaExternalLinkAlt,
  FaGithub,
  FaMobileAlt,
  FaTabletAlt,
  FaTimes,
} from "react-icons/fa";
import {
  CATEGORY_FILTERS,
  CATEGORY_SURFACE,
  CATEGORY_TYPE,
  PROJECT_GROUPS,
  filterProjects,
  getLanguageTools,
  getPlatformTools,
  getToolById,
  projectCatalog,
} from "../data/projectCatalog";

function toggleInList(list, value) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

const DEVICE_OPTIONS = [
  { id: "desktop", label: "Desktop", Icon: FaDesktop },
  { id: "tablet", label: "Tablet", Icon: FaTabletAlt },
  { id: "phone", label: "Mobile", Icon: FaMobileAlt },
];

function DeviceFrame({ type, src, emptyLabel, orientation = "portrait" }) {
  const landscape = type === "phone" && orientation === "landscape";
  return (
    <div
      className={`deviceFrame deviceFrame--${type}${landscape ? " is-landscape" : ""}`}
    >
      <div className="deviceChrome">
        <span />
        <span />
        <span />
      </div>
      <div className="deviceScreen">
        {src ? (
          <img src={src} alt="" loading="lazy" />
        ) : (
          <div className="devicePlaceholder">{emptyLabel}</div>
        )}
      </div>
    </div>
  );
}

function TechIconButton({
  tool,
  isSelected,
  isPreview,
  isRelated = false,
  onToggle,
  onHover,
  showLabel = false,
  tooltip = true,
}) {
  const label = tool.label;

  return (
    <button
      type="button"
      className={`toolFilterItem ${showLabel ? "toolFilterItem--chip" : "toolFilterItem--iconOnly"} ${isSelected ? "is-selected" : ""} ${isPreview ? "is-preview" : ""} ${isRelated ? "is-related" : ""} ${tooltip ? "has-tooltip" : ""}`}
      onMouseEnter={() => onHover?.(tool.id)}
      onFocus={() => onHover?.(tool.id)}
      onClick={() => onToggle(tool.id)}
      aria-pressed={isSelected}
      aria-label={label}
    >
      {tool.icon ? (
        <span className="toolFilterIcon" dangerouslySetInnerHTML={{ __html: tool.icon }} />
      ) : (
        <span className="toolFilterLabel">{tool.short || tool.label}</span>
      )}
      {showLabel && tool.icon ? <span className="toolFilterLabel">{tool.short || tool.label}</span> : null}
      {tooltip ? (
        <span className="filterTooltip" role="tooltip">
          {label}
        </span>
      ) : null}
    </button>
  );
}

function ProjectsSection({ focusProjectId = null, onFocusHandled }) {
  const languages = getLanguageTools();
  const platforms = getPlatformTools();
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [hoveredTool, setHoveredTool] = useState(null);
  const [selectedTools, setSelectedTools] = useState([]);
  const [hoveredProjectId, setHoveredProjectId] = useState(null);
  const [lockedProjectId, setLockedProjectId] = useState(null);
  const [deviceView, setDeviceView] = useState("desktop");

  const projectLocked = Boolean(lockedProjectId);
  const activeTools =
    selectedTools.length > 0
      ? selectedTools
      : !projectLocked && hoveredTool
        ? [hoveredTool]
        : [];

  const visibleProjects = useMemo(
    () =>
      filterProjects(projectCatalog, {
        toolIds: activeTools,
        categoryIds: selectedCategories,
      }),
    [activeTools, selectedCategories]
  );

  const groupedProjects = useMemo(
    () =>
      PROJECT_GROUPS.map((group) => ({
        ...group,
        projects: visibleProjects.filter((item) => item.group === group.id),
      })).filter((group) => group.projects.length > 0),
    [visibleProjects]
  );

  const activeProjectId = lockedProjectId || hoveredProjectId;
  const activeProject =
    visibleProjects.find((item) => item.id === activeProjectId) || null;

  const availableDeviceViews = activeProject?.devices || [];
  const activeDeviceView = availableDeviceViews.includes(deviceView)
    ? deviceView
    : availableDeviceViews[0] || "desktop";

  useEffect(() => {
    if (!activeProject) return;
    if (!activeProject.devices.includes(deviceView)) {
      setDeviceView(activeProject.devices[0] || "desktop");
    }
  }, [activeProject, deviceView]);

  const relatedCategories = useMemo(
    () => new Set(activeProject?.categories || []),
    [activeProject]
  );
  const relatedTools = useMemo(
    () => new Set(activeProject?.tools || []),
    [activeProject]
  );

  const isToolRelated = (toolId) => {
    if (relatedTools.has(toolId)) return true;
    const platform = platforms.find((item) => item.id === toolId);
    if (platform?.children?.length) {
      return platform.children.some((child) => relatedTools.has(child.id));
    }
    return false;
  };

  useEffect(() => {
    if (!focusProjectId) return undefined;

    const catalogId = `live-${focusProjectId}`;
    setSelectedCategories([]);
    setSelectedTools([]);
    setHoveredTool(null);
    setLockedProjectId(catalogId);

    const timer = window.setTimeout(() => {
      document.getElementById(`project-tile-${catalogId}`)?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
      onFocusHandled?.();
    }, 280);

    return () => window.clearTimeout(timer);
  }, [focusProjectId, onFocusHandled]);

  useEffect(() => {
    if (!activeProjectId) return;
    if (!visibleProjects.some((item) => item.id === activeProjectId)) {
      setHoveredProjectId(null);
      if (lockedProjectId && !visibleProjects.some((item) => item.id === lockedProjectId)) {
        setLockedProjectId(null);
      }
    }
  }, [visibleProjects, activeProjectId, lockedProjectId]);

  const clearTools = () => {
    setSelectedTools([]);
    setHoveredTool(null);
  };

  const clearCategories = () => setSelectedCategories([]);

  const toggleSurface = (surfaceId) => {
    setSelectedCategories((current) => toggleInList(current, surfaceId));
  };

  const toggleType = (typeId) => {
    setSelectedCategories((current) => {
      const withoutTypes = current.filter(
        (id) => !CATEGORY_TYPE.some((item) => item.id === id)
      );
      if (current.includes(typeId)) return withoutTypes;
      return [...withoutTypes, typeId];
    });
  };

  const toggleTool = (toolId) => {
    setSelectedTools((current) => toggleInList(current, toolId));
  };

  const desktopSrc = activeProject?.media?.desktop?.[0] || null;
  const tabletSrc = activeProject?.media?.tablet?.[0] || null;
  const phoneSrc =
    activeProject?.media?.phone?.[0] ||
    activeProject?.media?.desktop?.[0] ||
    null;

  const activeDeviceSrc =
    activeDeviceView === "desktop"
      ? desktopSrc
      : activeDeviceView === "tablet"
        ? tabletSrc
        : phoneSrc;

  const activeDeviceLabel =
    activeDeviceView === "desktop"
      ? "Desktop media soon"
      : activeDeviceView === "tablet"
        ? "Tablet media soon"
        : "Mobile media soon";

  return (
    <div className="projectsStage projectsWorkspace">
      <header className="stageHeader stageHeader--compact">
        <p className="stageKicker">03 — Projects</p>
        <h2>Projects & stack</h2>
      </header>

      <div className="filterRows">
        <div className="filterRow filterRow--centered toolsFilterBar">
          <div className="toolsFilterClearRow">
            {selectedCategories.length > 0 ? (
              <button
                type="button"
                className="toolsClearBtn"
                onClick={clearCategories}
                aria-label="Clear category filters"
              >
                <FaTimes size={9} />
                <span>Categories</span>
              </button>
            ) : (
              <span className="toolsFilterHint">Surface · Type</span>
            )}
          </div>
          <div className="toolsFilterList toolsFilterList--chipRow categoryFilterRow" role="group" aria-label="Project category">
            {CATEGORY_SURFACE.map((filter) => {
              const isActive = selectedCategories.includes(filter.id);
              const isRelated = relatedCategories.has(filter.id);
              return (
                <button
                  key={filter.id}
                  type="button"
                  aria-pressed={isActive}
                  className={`toolFilterItem toolFilterItem--chip ${isActive ? "is-selected" : ""} ${isRelated ? "is-related" : ""}`}
                  onClick={() => toggleSurface(filter.id)}
                  title={filter.label}
                >
                  <span className="toolFilterLabel">{filter.short}</span>
                </button>
              );
            })}
            <span className="categorySeparator" aria-hidden="true">
              |
            </span>
            {CATEGORY_TYPE.map((filter) => {
              const isActive = selectedCategories.includes(filter.id);
              const isRelated = relatedCategories.has(filter.id);
              return (
                <button
                  key={filter.id}
                  type="button"
                  aria-pressed={isActive}
                  className={`toolFilterItem toolFilterItem--chip ${isActive ? "is-selected" : ""} ${isRelated ? "is-related" : ""}`}
                  onClick={() => toggleType(filter.id)}
                  title={filter.label}
                >
                  <span className="toolFilterLabel">{filter.short}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="filterRow toolsFilterBar toolsFilterBar--languages">
          <div className="toolsFilterClearRow">
            {selectedTools.some((id) => languages.some((lang) => lang.id === id)) ? (
              <button
                type="button"
                className="toolsClearBtn"
                onClick={() =>
                  setSelectedTools((current) =>
                    current.filter((id) => !languages.some((lang) => lang.id === id))
                  )
                }
                aria-label="Clear language filters"
              >
                <FaTimes size={9} />
                <span>Languages</span>
              </button>
            ) : (
              <span className="toolsFilterHint">Languages</span>
            )}
          </div>
          <div
            className="toolsFilterList toolsFilterList--singleRow"
            onMouseLeave={() => {
              if (selectedTools.length === 0 && !projectLocked) setHoveredTool(null);
            }}
          >
            {languages.map((tool) => (
              <TechIconButton
                key={tool.id}
                tool={tool}
                isSelected={selectedTools.includes(tool.id)}
                isPreview={
                  !projectLocked && selectedTools.length === 0 && hoveredTool === tool.id
                }
                isRelated={relatedTools.has(tool.id)}
                onToggle={toggleTool}
                onHover={(id) => {
                  if (!projectLocked && selectedTools.length === 0) setHoveredTool(id);
                }}
              />
            ))}
          </div>
        </div>

        <div className="filterRow toolsFilterBar toolsFilterBar--platforms">
          <div className="toolsFilterClearRow">
            {selectedTools.some(
              (id) =>
                platforms.some((platform) => platform.id === id) ||
                getToolById(id)?.parentId
            ) || selectedTools.length > 0 ? (
              <button
                type="button"
                className="toolsClearBtn"
                onClick={clearTools}
                aria-label="Clear stack filters"
              >
                <FaTimes size={9} />
                <span>Stack</span>
              </button>
            ) : (
              <span className="toolsFilterHint">Platforms · hover for services</span>
            )}
          </div>
          <div
            className="toolsFilterList toolsFilterList--platformRow"
            onMouseLeave={() => {
              if (selectedTools.length === 0 && !projectLocked) setHoveredTool(null);
            }}
          >
            {platforms.map((tool) => (
              <div
                key={tool.id}
                className={`platformCluster${tool.children?.length ? " has-services" : ""}`}
              >
                <TechIconButton
                  tool={tool}
                  tooltip={!tool.children?.length}
                  isSelected={
                    selectedTools.includes(tool.id) ||
                    selectedTools.some((id) => getToolById(id)?.parentId === tool.id)
                  }
                  isPreview={
                    !projectLocked && selectedTools.length === 0 && hoveredTool === tool.id
                  }
                  isRelated={isToolRelated(tool.id)}
                  onToggle={toggleTool}
                  onHover={(id) => {
                    if (!projectLocked && selectedTools.length === 0) setHoveredTool(id);
                  }}
                />
                {tool.children?.length > 0 && (
                  <div className="platformServicesTooltip" role="tooltip">
                    <span className="platformServicesTitle">{tool.label}</span>
                    <div className="platformServicesList">
                      {tool.children.map((child) => (
                        <button
                          key={child.id}
                          type="button"
                          className={`platformServiceChip ${selectedTools.includes(child.id) ? "is-selected" : ""} ${relatedTools.has(child.id) ? "is-related" : ""}`}
                          onClick={(event) => {
                            event.stopPropagation();
                            toggleTool(child.id);
                          }}
                          aria-pressed={selectedTools.includes(child.id)}
                        >
                          {child.short || child.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="projectGallery">
        <div className="projectTilePane">
          <div className="projectResultsMeta">
            <span>
              <strong>{visibleProjects.length}</strong> projects
            </span>
          </div>

          {visibleProjects.length === 0 ? (
            <div className="projectEmptyState">No projects match this filter.</div>
          ) : (
            <div
              className="projectGroupList"
              onMouseLeave={() => {
                if (!lockedProjectId) setHoveredProjectId(null);
              }}
            >
              {groupedProjects.map((group) => (
                <section key={group.id} className="projectGroup">
                  <h4 className="projectGroupLabel">{group.label}</h4>
                  <div className="projectTileGrid">
                    {group.projects.map((item) => {
                      const isActive = activeProject?.id === item.id;
                      const isLocked = lockedProjectId === item.id;
                      return (
                        <button
                          key={item.id}
                          id={`project-tile-${item.id}`}
                          type="button"
                          className={`projectTile ${isActive ? "is-active" : ""} ${isLocked ? "is-locked" : ""}`}
                          onMouseEnter={() => setHoveredProjectId(item.id)}
                          onFocus={() => setHoveredProjectId(item.id)}
                          onClick={() =>
                            setLockedProjectId((current) => {
                              const next = current === item.id ? null : item.id;
                              if (next) setHoveredTool(null);
                              return next;
                            })
                          }
                          title={item.name}
                          aria-pressed={isLocked}
                        >
                          {item.thumb ? (
                            <img src={item.thumb} alt="" className="projectTileThumb" loading="lazy" />
                          ) : (
                            <span className="projectTileInitials">{item.initials}</span>
                          )}
                          <span className={`projectTileKind kind-${item.kind}`}>
                            {item.kind === "live" ? "L" : "C"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>

        <aside className="projectPreviewPane" aria-live="polite">
          {activeProject ? (
            <>
              <div className="projectPreviewHeader">
                <div>
                  <span className="deployOrg">
                    {PROJECT_GROUPS.find((group) => group.id === activeProject.group)?.label ||
                      "Project"}{" "}
                    · {activeProject.kind === "live" ? "Live" : "Code"} · {activeProject.org}
                  </span>
                  <h3>{activeProject.name}</h3>
                </div>
                <div className="projectPreviewLinks">
                  {activeProject.url && (
                    <a href={activeProject.url} target="_blank" rel="noreferrer" className="btnOutline btnSm">
                      Live <FaExternalLinkAlt size={9} />
                    </a>
                  )}
                  {activeProject.github && (
                    <a href={activeProject.github} target="_blank" rel="noreferrer" className="btnOutline btnSm">
                      <FaGithub size={11} /> Code
                    </a>
                  )}
                </div>
              </div>

              <p className="projectPreviewDesc">{activeProject.description}</p>

              <div className="projectPreviewMeta">
                {activeProject.kind === "live" && (
                  <span className={`statusBadge status-${activeProject.status}`}>
                    <span className="dot" />
                    {activeProject.status === "healthy" ? "Healthy" : "Issue"}
                  </span>
                )}
                {activeProject.env && <span className="envChip">{activeProject.env}</span>}
                {activeProject.year && <span className="envChip">{activeProject.year}</span>}
                {activeProject.categories.map((id) => (
                  <span key={id} className="envChip">
                    {CATEGORY_FILTERS.find((filter) => filter.id === id)?.short || id}
                  </span>
                ))}
              </div>

              <div className="deviceStage">
                <div
                  className={`deviceViewSwitcher${availableDeviceViews.length > 1 ? "" : " is-empty"}`}
                  role={availableDeviceViews.length > 1 ? "tablist" : undefined}
                  aria-label={availableDeviceViews.length > 1 ? "Preview device" : undefined}
                  aria-hidden={availableDeviceViews.length <= 1 ? true : undefined}
                >
                  {availableDeviceViews.length > 1 &&
                    DEVICE_OPTIONS.filter((option) =>
                      availableDeviceViews.includes(option.id)
                    ).map(({ id, label, Icon }) => {
                      const isActive = activeDeviceView === id;
                      return (
                        <button
                          key={id}
                          type="button"
                          role="tab"
                          aria-selected={isActive}
                          aria-label={label}
                          className={`deviceViewBtn has-tooltip ${isActive ? "is-active" : ""}`}
                          onClick={() => setDeviceView(id)}
                        >
                          <Icon size={16} aria-hidden="true" />
                          <span className="filterTooltip" role="tooltip">
                            {label}
                          </span>
                        </button>
                      );
                    })}
                </div>

                <div className="deviceStageCanvas">
                  <DeviceFrame
                    type={activeDeviceView}
                    src={activeDeviceSrc}
                    emptyLabel={activeDeviceLabel}
                    orientation={
                      activeDeviceView === "phone"
                        ? activeProject.phoneOrientation || "portrait"
                        : "portrait"
                    }
                  />
                </div>
              </div>

              <p className="projectPreviewHint">
                {lockedProjectId
                  ? "Click the tile again to deselect"
                  : "Hover tiles to preview · click to select"}
              </p>
            </>
          ) : (
            <div className="projectEmptyState projectEmptyState--preview">
              Select a project to view details
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

export default ProjectsSection;
