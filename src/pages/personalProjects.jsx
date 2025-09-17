import ProjectsGroup from '../components/projectsGroups'


function Personal(){
    const categories = ["Fun","Tool"];

    return (
        <div className="personalProjects">
     <h1>Personal projects</h1>
     <div className='cards'>
       {categories.map((item,index)=>(<ProjectsGroup key={item} groupTitle={categories[index]}/>))}
       </div>
        </div>
    )
}

export default Personal