
import about from "../../resources/aboutLists.json"
import AboutGroups from "../components//AboutGroups"

const aboutMe = about.find((item) => item.id === "aboutme") || {};

function About(){

    return (
        <>
    <span className="homeMessage">
     <h1>Hi, I'm Samir Rodriguez</h1>
     <h3>{aboutMe.tagline || "Web Developer · Software Engineer · AI Automation"}</h3>
     <span> <i className="icon-sm">{aboutMe.education}</i></span>
     </span>
     <div className="cardsGrid aboutGroups">

     {about.map((ab)=>(<AboutGroups item={ab}/>))}
</div>
     

        </>
    )
}

export default About