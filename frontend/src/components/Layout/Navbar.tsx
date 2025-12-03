import { Link } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/admin" className="navbar-brand">
          Questionnaire App
        </Link>
        <div className="navbar-links">
          <Link to="/admin">Dashboard</Link>
          <Link to="/admin/create">Create Questionnaire</Link>
        </div>
      </div>
    </nav>
  );
}

