import { NavLink } from "react-router-dom";

function Header() {
  return (
       <nav className="header">
      {/* Logo */}
      <div className="logo">SR2</div>

      {/* Navigation */}
      <ul className="navLinks">
        <li><NavLink to="portfolio/">Home</NavLink></li>
        <li><NavLink to="portfolio/personal">Projects</NavLink></li>
        <li><NavLink to="portfolio/about">About</NavLink></li>
        {/* <li><NavLink to="/admin">Admin</NavLink></li> */}
      </ul>
    </nav>
  );
}

export default Header;
