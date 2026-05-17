import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  const { pathname } = useLocation();
  return (
    <nav className="navbar">
      <Link to="/" className="nav-logo">놀러가자</Link>
      <div className="nav-links">
        <Link to="/festivals" className={pathname === "/festivals" ? "active" : ""}>
          축제 지도
        </Link>
        <Link to="/recommend" className={pathname === "/recommend" ? "active" : ""}>
          여행지 추천
        </Link>
      </div>
    </nav>
  );
}
