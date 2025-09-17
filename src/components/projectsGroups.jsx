import Projects from "./projectsList"
function ProjectsGroup({groupTitle}){

    return(
        <>
        <div className="groupCard">
            <h3 className="groupTitle">{groupTitle}</h3>
            <Projects className="projectList" categoryTitle = {groupTitle}/>
        </div>
        </>
    )
}
export default ProjectsGroup