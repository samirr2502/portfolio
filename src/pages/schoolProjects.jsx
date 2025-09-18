import ProjectsGroup from "../components/projectsGroups";
function School(){

    const categories = ["Fall 2025","Winter 2025","Fall 2024"];

    return (
        <div className="schoolProjects">
        <div className="sectionHeader">
          <h1 className="sectionTitle">School Projects</h1>
        </div>
        <div className="cardsGrid">
          {categories.map((item, index) => (
            <ProjectsGroup key={item} groupTitle={categories[index]} />
          ))}
        </div>
      </div>
    )
}

export default School