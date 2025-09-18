import ResumeGroup from "../components/resumeGroups"
import experiences from "../../resources/experienceList.json"
import tools from "../../resources/toolsList.json"
import ToolsGroup from "../components/toolsGroups"
import projects from "../../resources/projectList.json"

import ProjectsGroup from "../components/projectsGroups"

function Home(){

    return (
        <>
     <h1>Hi, I'm Samir Rodriguez</h1>
     <h3>Web Developer & Software Engineer</h3>
     <h2>Experience:</h2>
     <div className="cardsGrid resumeGroups">

     {experiences.map((exp)=>(<ResumeGroup item={exp}/>))}
</div>
<h2>Projects:</h2>
<div className="cardsGrid">

     {projects.map((tool)=>(<ProjectsGroup item={tool}/>))}
     
     
</div>
<h2>Tools:</h2>
<div className="cardsGrid toolsGroups">

     {tools.map((tool)=>(<ToolsGroup item={tool}/>))}
     
     
</div>

        </>
    )
}

export default Home