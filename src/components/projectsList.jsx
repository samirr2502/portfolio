import projects from "../../resources/projectList.json"
import { FaGithub } from "react-icons/fa";
import { FaExternalLinkAlt } from "react-icons/fa";

function Projects({categoryTitle}){
    
    const filteredProjects = projects.filter((project)=>( 
        project.category.trim().toLowerCase() === categoryTitle.trim().toLowerCase()    ))

    const items = (item)=>{
        return <span className="item">{item}</span>
    }
    return(
        <>
        <ul>
        {filteredProjects.map((item) =>
        (<li className="projectItem" key = {item.id}> 
        <td className="projectItemTitle">
        <h4>{item.name}</h4>
        <a href={item.githubRep} target="_blank"><FaGithub/> </a>

        <a href ={item.webLink} target="_blank"><FaExternalLinkAlt/></a>

        </td>
        <td> Tags: <br/>  <span className="tags">{item.tags.map((item)=>items(item) )}</span></td>

        <td> Languages: <br/> <span class="languages">{item.languages.map((item)=>(items(item)))}</span></td>

        </li>
        )
        )}

        </ul>
        </>
    )
}
export default Projects