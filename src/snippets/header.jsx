import { NavLink } from "react-router-dom";

function Header() {
    return (
        <>
        My Portfolio
        <div className="navLinks">
        <NavLink to="/personal">Personal Projects</NavLink>
        <NavLink to="/">Home</NavLink>
        <NavLink to="/school">School Projects</NavLink>
        </div>
        </>
    )
}


export default Header;