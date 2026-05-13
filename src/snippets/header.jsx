import { NavLink } from "react-router-dom";

function Header({ theme, toggleTheme }) {
  return (
    <nav className="header">
      <div className="logo">SR2</div>

      <ul className="navLinks">
        <li><NavLink to="/">Home</NavLink></li>
        <li><NavLink to="/personal">Projects</NavLink></li>
        <li><NavLink to="/about">About</NavLink></li>
        {/* <li><NavLink to="/admin">Admin</NavLink></li> */}
      </ul>

      <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
        {theme === 'light' ? 'Dark mode' : 'Light mode'}
      </button>
    </nav>
  );
}

export default Header;
