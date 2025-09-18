import ProjectsGroup from '../components/projectsGroups'
import projects from "../../resources/projectList.json"


function Personal(){
    // const categories = ["Fun","Tool"];
    

    
    return (
        <div className="personalProjects">
        <div className="sectionHeader">
          <h1 className="sectionTitle">Personal Projects</h1>
        </div>
        <div className="cardsGrid">
          {projects.map((item,index) => (
            <ProjectsGroup key={index} item={item} />
          ))}
        </div>
      </div>
      
    )
}

export default Personal