import { NavLink } from "react-router-dom";

function Header() {
  return (
       <nav className="header">
      {/* Logo */}
      <div className="logo">SR2</div>

      {/* Navigation */}
      <ul className="navLinks">
        <li><NavLink to="/">Home</NavLink></li>
        <li><NavLink to="/personal">Projects</NavLink></li>
        {/* <li><NavLink to="/school">School</NavLink></li> */}
        {/* <li><NavLink to="/admin">Admin</NavLink></li> */}
      </ul>
    </nav>
  );
}

export default Header;
