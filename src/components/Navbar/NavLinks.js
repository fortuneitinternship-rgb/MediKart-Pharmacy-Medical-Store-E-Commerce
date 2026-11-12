import { NavLink } from "react-router-dom";

function NavLinks() {
  const handleHomeClick = () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth", // Use "auto" for instant scrolling
    });
  };

  return (
    <ul className="nav-links">
      <li>
        <NavLink to="/" onClick={handleHomeClick}> Home </NavLink>
      </li>

      <li>
        <NavLink to="/shop" onClick={handleHomeClick}>Shop</NavLink>
      </li>

      <li>
        <NavLink to="/categories" onClick={handleHomeClick}>Categories</NavLink>
      </li>

      <li>
        <NavLink to="/about" onClick={handleHomeClick}>About</NavLink>
      </li>

      <li>
        <NavLink to="/contact" onClick={handleHomeClick}>Contact</NavLink>
      </li>
    </ul>
  );
}

export default NavLinks;