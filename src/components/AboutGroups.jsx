
function AboutGroups({item}){
   
    return(
        <div className="groupCard">
          <div className={item.id}>
          <div className="groupHeader">
            <h2 className="groupTitle">{item.title}</h2>
          </div>
          <div className="groupBody">
            <span>{item.info}</span>
            <span>{item.info2}</span>

            <h3>{item.phone}</h3> 


            <h3><a href="mailto:samirrodriguez14@gmail.com">{item.email}</a></h3>
            <h3><a href={item.github} target="_blank">{item.github}</a></h3>
            <h3><a href={item.linkedin} target="_blank">{item.linkedin}</a></h3>
          </div>
            </div>  
            </div>
    )
}
export default AboutGroups