import ProjectsGroup from "../components/projectsGroups";
function School(){

    const categories = ["Fall 2025","Winter 2025","Fall 2024","Winter 2024"];

    return (
        <div className="schoolProjects">
     <h1>School projects</h1>
     <div className='cards'>
       {categories.map((item,index)=>(<ProjectsGroup key={item} groupTitle={categories[index]}/>))}
       </div>
        </div>
    )
}

export default School