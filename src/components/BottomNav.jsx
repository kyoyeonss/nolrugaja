import { NavLink } from 'react-router-dom';
import './BottomNav.css';

const NAV_ITEMS = [
  { to: '/',        end: true,  icon: '⌂',  label: '홈' },
  { to: '/map',     end: false, icon: '◎',  label: '지도' },
  { to: '/ranking', end: false, icon: '★',  label: '인기 순위' },
];

function BottomNav() {
  return (
    <nav className="bottom-nav">
      {NAV_ITEMS.map(({ to, end, icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
        >
          <span className="nav-icon">{icon}</span>
          <span className="nav-label">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

export default BottomNav;
