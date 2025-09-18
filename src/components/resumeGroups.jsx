
function ResumeGroup({item}){
   
    return(
        <div className="groupCard ">
            <div className="resumeGroups">
          <div className="groupHeader">
            <h2 className="groupTitle">{item.position}</h2><i className="icon-sm">{item.startDate}-{item.endDate}</i>
          </div>
          <div className="groupBody">
            <div   dangerouslySetInnerHTML={{ __html: item.description }}/>
            <br/>Tools: <span className="tools">{item.tools.map((tool)=>(<span className="item">{tool}</span>))}</span>
          </div>
          </div>
            </div>  
    )
}
export default ResumeGroup