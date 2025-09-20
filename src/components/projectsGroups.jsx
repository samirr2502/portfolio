import { FaGithub } from "react-icons/fa";
import { FaExternalLinkAlt } from "react-icons/fa";
function ProjectsGroup({item}){
   
    return(

        <div className="groupCard">
          <div className="groupHeader">
            <h2 className="groupTitle">{item.name}</h2>
            {item.githubRep && <a href={item.githubRep} target="_blank"><FaGithub/> </a>}
            
                   { item.webLink && <a href ={item.webLink} target="_blank"><FaExternalLinkAlt/></a>}
          </div>
          <div className="groupBody projectItem">
     <span className="tags ">{item.tags.map((item)=><span className="item">{item} </span>)}</span>

 Languages: <br/> <span className="languages">{item.languages.map((item)=>(<span className="item">{  <div   dangerouslySetInnerHTML={{ __html: item}}/>} </span>))}</span>

          </div>
        </div>
              
    )
}
export default ProjectsGroup