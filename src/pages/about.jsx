
import about from "../../resources/aboutLists.json"
import AboutGroups from "../components//AboutGroups"

function About(){

    return (
        <>
    <span className="homeMessage">
     <h1>Hi, I'm Samir Rodriguez</h1>
     <h3>Web Developer & Software Engineer</h3>
     <span> <i className="icon-sm">Senior Computer Science Major at BYU-Provo</i></span>
     </span>
     <div className="cardsGrid aboutGroups">

     {about.map((ab)=>(<AboutGroups item={ab}/>))}
</div>
     

        </>
    )
}

export default About