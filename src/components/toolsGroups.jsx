function ToolsGroup({item}){
   
    return(
        <div className="groupCard">
          
          <div className="groupBody">
            <div   dangerouslySetInnerHTML={{ __html: item.description }}/>
          </div>
          <div className="groupHeader">
            <p className="groupTitle">{item.position}</p>
          </div>
            </div>  
    )
}
export default ToolsGroup